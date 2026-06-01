const fs = require('fs').promises
const path = require('path')
const AdmZip = require('adm-zip')

const ROOT = path.resolve(process.cwd())

function safeName(name) {
  return name.replace(/[^a-z0-9\-]/gi, '-').toLowerCase()
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

function extractSchemaFromLiquid(content) {
  const m = content.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/i)
  if (!m) return null
  try {
    const json = m[1].trim()
    return JSON.parse(json)
  } catch (e) { return null }
}

function detectSectionType(filename, schema) {
  const name = filename.toLowerCase()
  if (name.includes('hero') || (schema && /hero/i.test(schema.name || ''))) return 'MinimalHero'
  if (name.includes('product') || name.includes('collection') || (schema && /product/i.test(schema.name || ''))) return 'ProductGrid'
  if (name.includes('gallery') || name.includes('slideshow')) return 'ProductGrid'
  if (name.includes('testimonial') || name.includes('testimonials') || (schema && /testimonial/i.test(schema.name || ''))) return 'Testimonials'
  if (name.includes('faq')) return 'FeatureSection'
  if (name.includes('footer')) return 'Footer'
  if (name.includes('header') || name.includes('nav') || name.includes('navigation')) return 'Navbar'
  return 'FeatureSection'
}

async function generateThemeFromZip(zipPath, nameHint) {
  const key = safeName(nameHint || ('imported-' + Date.now()))
  // write outputs under apps/api/templates to avoid permission issues at repo root
  const outDir = path.join(ROOT, 'apps', 'api', 'templates', key)
  await ensureDir(outDir)

  const zip = new AdmZip(zipPath)
  const tempDir = path.join('/tmp', `modaui-theme-${Date.now()}`)
  await ensureDir(tempDir)
  zip.extractAllTo(tempDir, true)

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    let files = []
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) files = files.concat(await walk(full))
      else files.push(full)
    }
    return files
  }

  const allFiles = await walk(tempDir)
  const liquidFiles = allFiles.filter(f => f.endsWith('.liquid'))

  const detectedSections = []
  const colors = new Set()
  const fonts = new Set()
  const spacings = new Set()
  let containerWidth = null

  for (const f of liquidFiles) {
    const rel = path.relative(tempDir, f)
    const txt = await fs.readFile(f, 'utf-8')
    const schema = extractSchemaFromLiquid(txt)
    const type = detectSectionType(rel, schema)

    const props = {}
    if (schema && schema.settings && Array.isArray(schema.settings)) {
      for (const s of schema.settings) {
        if (s.type === 'color' && s.id) {
          props.background = s.default || '#ffffff'
          colors.add((s.default || '#ffffff'))
        }
        if ((s.type === 'text' || s.type === 'richtext') && s.id) {
          props.title = s.default || ''
        }
      }
    }

    const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g
    const foundColors = txt.match(colorRegex) || []
    for (const c of foundColors) colors.add(c)

    const fontRegex = /font-family:\s*([^;\n]+);/gi
    let fm
    while ((fm = fontRegex.exec(txt)) !== null) {
      fonts.add(fm[1].trim())
    }

    const paddingRegex = /padding:\s*([0-9.]+px)/gi
    let pm
    while ((pm = paddingRegex.exec(txt)) !== null) spacings.add(pm[1])

    const maxWidthRegex = /max-width:\s*([0-9.]+(px|rem|em|%))/i
    const mw = txt.match(maxWidthRegex)
    if (mw && !containerWidth) containerWidth = mw[1]

    detectedSections.push({ filename: rel, type, props, schema: schema || undefined })
  }

  const themeTokens = {
    colors: Array.from(colors).slice(0, 8),
    fonts: Array.from(fonts).slice(0, 4),
    spacings: Array.from(spacings).slice(0, 6),
    containerWidth: containerWidth || '1200px'
  }

  const content = detectedSections.slice(0, 10).map((s, idx) => ({
    type: s.type,
    props: {
      title: s.props.title || (s.schema && s.schema.name) || s.type,
      subtitle: s.props.subtitle || '',
      background: s.props.background || undefined
    },
    sourceFile: s.filename
  }))

  const templateJson = {
    content,
    root: { props: { title: nameHint || key } },
    tokens: themeTokens
  }

  const registry = { components: Array.from(new Set(detectedSections.map(s => s.type))) }
  const uiHints = { notes: 'Imported from Shopify theme. Edit carefully. Do not change layout rhythm.' }
  const aiContext = `Imported theme from Shopify zip. Detected ${detectedSections.length} liquid sections. Primary colors: ${themeTokens.colors.join(', ')}.`

  // validate and normalize using validator.js
  try {
    const validator = require('./validator')
    const normalized = validator.normalizeTemplate(templateJson)
    const check = validator.validateTemplate(normalized)

    const writeAll = async (obj) => {
      await fs.writeFile(path.join(outDir, 'theme-tokens.json'), JSON.stringify(themeTokens, null, 2), 'utf-8')
      await fs.writeFile(path.join(outDir, 'template.json'), JSON.stringify(obj, null, 2), 'utf-8')
      await fs.writeFile(path.join(outDir, 'registry.json'), JSON.stringify(registry, null, 2), 'utf-8')
      await fs.writeFile(path.join(outDir, 'uiHints.json'), JSON.stringify(uiHints, null, 2), 'utf-8')
      await fs.writeFile(path.join(outDir, 'ai-context.md'), aiContext, 'utf-8')
    }

    if (!check.valid) {
      await writeAll(normalized)
      return { key, outDir, template: normalized, tokens: themeTokens, registry, uiHints, aiContext, detectedSections, validation: { valid: false, errors: check.errors } }
    }

    await writeAll(normalized)
    return { key, outDir, template: normalized, tokens: themeTokens, registry, uiHints, aiContext, detectedSections, validation: { valid: true } }
  } catch (e) {
    await fs.writeFile(path.join(outDir, 'theme-tokens.json'), JSON.stringify(themeTokens, null, 2), 'utf-8')
    await fs.writeFile(path.join(outDir, 'template.json'), JSON.stringify(templateJson, null, 2), 'utf-8')
    await fs.writeFile(path.join(outDir, 'registry.json'), JSON.stringify(registry, null, 2), 'utf-8')
    await fs.writeFile(path.join(outDir, 'uiHints.json'), JSON.stringify(uiHints, null, 2), 'utf-8')
    await fs.writeFile(path.join(outDir, 'ai-context.md'), aiContext, 'utf-8')
    return { key, outDir, template: templateJson, tokens: themeTokens, registry, uiHints, aiContext, detectedSections, validation: { valid: false, error: 'validation error' } }
  }
}

module.exports = { generateThemeFromZip }
