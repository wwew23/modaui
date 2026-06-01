import Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true })

const templateSchema = {
  type: 'object',
  properties: {
    content: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          props: { type: 'object' },
          style: { type: 'object' },
          sectionId: { type: 'string' },
          sourceFile: { type: 'string' }
        },
        required: ['type', 'props']
      }
    },
    root: {
      type: 'object',
      properties: {
        props: { type: 'object' }
      },
      required: ['props']
    },
    tokens: { type: 'object' }
  },
  required: ['content', 'root']
}

const validate = ajv.compile(templateSchema)

const KNOWN_COMPONENTS = new Set([
  'Navbar', 'MinimalHero', 'FeatureSection', 'ProductGrid', 'Testimonials', 'Footer'
])

function scanForHtmlStrings(obj: any) {
  const findings: { path: string; value: string }[] = []
  function walk(o: any, p: string) {
    if (o == null) return
    if (typeof o === 'string') {
      const s = o.toLowerCase()
      if (s.includes('<script') || s.includes('<div') || s.includes('<html') || s.includes('<svg')) {
        findings.push({ path: p, value: o })
      }
    } else if (Array.isArray(o)) {
      o.forEach((v, i) => walk(v, `${p}[${i}]`))
    } else if (typeof o === 'object') {
      for (const k of Object.keys(o)) walk(o[k], p ? `${p}.${k}` : k)
    }
  }
  walk(obj, '')
  return findings
}

function colorDistance(a: string, b: string) {
  try {
    const pa = a.replace('#', '')
    const pb = b.replace('#', '')
    const ra = parseInt(pa.substring(0,2),16)
    const ga = parseInt(pa.substring(2,4),16)
    const ba_ = parseInt(pa.substring(4,6),16)
    const rb = parseInt(pb.substring(0,2),16)
    const gb = parseInt(pb.substring(2,4),16)
    const bb = parseInt(pb.substring(4,6),16)
    return Math.sqrt((ra-rb)**2 + (ga-gb)**2 + (ba_-bb)**2)
  } catch (e) { return 1e9 }
}

export function validateTemplate(template: any) {
  const valid = validate(template)
  const errors: any[] = []
  if (!valid) {
    // map ajv errors to unified format
    for (const e of validate.errors || []) {
      errors.push({
        type: 'INVALID_SCHEMA',
        section: null,
        file: null,
        line: null,
        field: e.instancePath || e.dataPath || '',
        message: e.message,
        severity: 'fatal'
      })
    }
  }

  // check components
  if (Array.isArray(template.content)) {
    template.content.forEach((c: any, idx: number) => {
      const sectionName = c.type || `section[${idx}]`
      const sourceFile = c.sourceFile || null
      if (!KNOWN_COMPONENTS.has(c.type)) {
        errors.push({ type: 'UNKNOWN_COMPONENT', section: sectionName, file: sourceFile, line: null, field: 'type', message: `Unknown component: ${c.type}`, severity: 'warning' })
      }
      // ensure props is object
      if (typeof c.props !== 'object') {
        errors.push({ type: 'INVALID_PROPS', section: sectionName, file: sourceFile, line: null, field: 'props', message: 'props must be an object', severity: 'fatal' })
      }
      // scan for html strings
      const findings = scanForHtmlStrings(c.props || {})
      for (const f of findings) {
        errors.push({ type: 'INLINE_HTML', section: sectionName, file: sourceFile, line: null, field: f.path, message: 'Inline HTML detected in props', severity: 'fatal' })
      }
      // style token checks (example: background color token)
      if (c.props && c.props.background && template.tokens && Array.isArray(template.tokens.colors)) {
        const bg = String(c.props.background)
        if (bg.startsWith('#') && !template.tokens.colors.includes(bg)) {
          errors.push({ type: 'MISSING_TOKEN', section: sectionName, file: sourceFile, line: null, field: 'props.background', message: `Unknown color token ${bg}`, severity: 'warning' })
        }
      }
    })
  }

  // tokens sanity
  if (template.tokens && typeof template.tokens === 'object') {
    if (!Array.isArray(template.tokens.colors)) {
      errors.push({ type: 'MISSING_TOKENS', section: null, file: null, line: null, field: 'tokens.colors', message: 'tokens.colors must be an array', severity: 'fatal' })
    }
  }

  return { valid: errors.length === 0, errors }
}

export function autoFixTemplate(template: any) {
  const fixes: any[] = []
  const t = JSON.parse(JSON.stringify(template))
  const colors = (t.tokens && Array.isArray(t.tokens.colors)) ? t.tokens.colors : []
  const spacings = (t.tokens && Array.isArray(t.tokens.spacings)) ? t.tokens.spacings : []
  for (let i = 0; i < t.content.length; i++) {
    const c = t.content[i]
    if (c.props && c.props.background && typeof c.props.background === 'string') {
      const bg = c.props.background
      if (bg.startsWith('#') && colors.length > 0 && !colors.includes(bg)) {
        // pick nearest color
        let best = colors[0]
        let bestD = colorDistance(bg, best)
        for (const col of colors) {
          const d = colorDistance(bg, col)
          if (d < bestD) { bestD = d; best = col }
        }
        fixes.push({ type: 'FIX_COLOR_TOKEN', section: c.type || String(i), field: 'props.background', from: bg, to: best, message: `Replaced unknown color ${bg} with nearest token ${best}` })
        c.props.background = best
      }
    }
    // spacing fix example: if uses px and tokens available
    if (c.props && c.props.style && c.props.style.padding && spacings.length > 0) {
      // assume padding like '24px'
      const pad = String(c.props.style.padding)
      const m = pad.match(/([0-9.]+)px/) 
      if (m) {
        const val = Number(m[1])
        // find nearest spacing token numeric
        let best = spacings[0]
        let bestDiff = Math.abs(val - Number(String(best).replace(/px/,'')))
        for (const s of spacings) {
          const num = Number(String(s).replace(/px/,''))
          const d = Math.abs(val - num)
          if (d < bestDiff) { bestDiff = d; best = s }
        }
        fixes.push({ type: 'FIX_SPACING', section: c.type || String(i), field: 'props.style.padding', from: pad, to: best, message: `Replaced padding ${pad} with nearest token ${best}` })
        c.props.style.padding = best
      }
    }
  }
  return { fixedTemplate: t, fixes }
}

export function normalizeTemplate(template: any) {
  const t = JSON.parse(JSON.stringify(template))
  t.content = t.content || []
  for (let i = 0; i < t.content.length; i++) {
    const s = t.content[i]
    if (!s.sectionId) s.sectionId = String(i)
    s.props = s.props || {}
    s.props.style = s.props.style || {}
    if (typeof s.props.className === 'string' && /tw-|class=|tailwind/i.test(s.props.className)) {
      delete s.props.className
    }
    if (typeof s.props.class === 'string' && /tw-|tailwind/i.test(s.props.class)) {
      delete s.props.class
    }
  }
  t.root = t.root || { props: {} }
  t.root.props = t.root.props || {}
  t.tokens = t.tokens || { colors: [], fonts: [], spacings: [] }
  return t
}
