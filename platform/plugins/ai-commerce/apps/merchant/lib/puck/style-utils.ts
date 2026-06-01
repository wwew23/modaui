import { SectionStyle } from '../theme-runtime/types'

export function tokenLookup(tokens: any, path: string) {
  if (!tokens) return undefined
  const parts = path.split('.')
  let cur: any = tokens
  for (const p of parts) {
    cur = cur?.[p]
    if (cur === undefined) return undefined
  }
  return cur
}

export function resolveTokenValue(tokens: any, tokenOrValue: string | undefined) {
  if (!tokenOrValue) return undefined
  // if it's a token key like 'md' or a direct value like '16px'
  // try to find in spacing, radius, colors, typography
  if (!tokens) return tokenOrValue
  // spacing
  if (tokens.spacing && tokens.spacing[tokenOrValue]) return tokens.spacing[tokenOrValue]
  if (tokens.radius && tokens.radius[tokenOrValue]) return tokens.radius[tokenOrValue]
  if (tokens.colors && tokens.colors[tokenOrValue]) return tokens.colors[tokenOrValue]
  if (tokens.typography && tokens.typography[tokenOrValue]) return tokens.typography[tokenOrValue]
  return tokenOrValue
}

export function styleToInline(sectionStyle: SectionStyle | undefined, tokens: any) {
  const inline: any = {}
  if (!sectionStyle) return inline

  const mapVal = (v: any) => {
    if (!v) return undefined
    return resolveTokenValue(tokens, v)
  }

  // only apply desktop defaults inline
  if (sectionStyle.padding && sectionStyle.padding.desktop) inline.padding = mapVal(sectionStyle.padding.desktop)
  if (sectionStyle.margin && sectionStyle.margin.desktop) inline.margin = mapVal(sectionStyle.margin.desktop)
  if (sectionStyle.radius && sectionStyle.radius.desktop) inline.borderRadius = mapVal(sectionStyle.radius.desktop)
  if (sectionStyle.background && sectionStyle.background.desktop) inline.background = mapVal(sectionStyle.background.desktop)
  if (sectionStyle.textColor && sectionStyle.textColor.desktop) inline.color = mapVal(sectionStyle.textColor.desktop)
  if (sectionStyle.align && sectionStyle.align.desktop) inline.textAlign = sectionStyle.align.desktop
  if (sectionStyle.containerWidth && sectionStyle.containerWidth.desktop) inline.maxWidth = mapVal(sectionStyle.containerWidth.desktop)
  if (sectionStyle.gap && sectionStyle.gap.desktop) inline.gap = mapVal(sectionStyle.gap.desktop)
  if (sectionStyle.typography && sectionStyle.typography.desktop) {
    const t = mapVal(sectionStyle.typography.desktop)
    if (typeof t === 'object') {
      inline.fontSize = t.fontSize
      inline.lineHeight = t.lineHeight
    }
  }

  return inline
}

export function generateResponsiveCSS(sectionId: string, style: SectionStyle | undefined, tokens: any) {
  if (!style) return ''
  const cls = `section-${sectionId}`
  function v(val: any) {
    if (!val) return null
    return resolveTokenValue(tokens, val)
  }

  let css = ''
  // base (desktop)
  const baseRules: string[] = []
  if (style.padding && style.padding.desktop) baseRules.push(`padding: ${v(style.padding.desktop)};`)
  if (style.margin && style.margin.desktop) baseRules.push(`margin: ${v(style.margin.desktop)};`)
  if (style.radius && style.radius.desktop) baseRules.push(`border-radius: ${v(style.radius.desktop)};`)
  if (style.background && style.background.desktop) baseRules.push(`background: ${v(style.background.desktop)};`)
  if (style.textColor && style.textColor.desktop) baseRules.push(`color: ${v(style.textColor.desktop)};`)
  if (style.align && style.align.desktop) baseRules.push(`text-align: ${style.align.desktop};`)
  if (style.containerWidth && style.containerWidth.desktop) baseRules.push(`max-width: ${v(style.containerWidth.desktop)}; margin-left: auto; margin-right: auto;`)
  if (style.gap && style.gap.desktop) baseRules.push(`gap: ${v(style.gap.desktop)};`)
  if (style.typography && style.typography.desktop) {
    const t = v(style.typography.desktop)
    if (t && typeof t === 'object') {
      if (t.fontSize) baseRules.push(`font-size: ${t.fontSize};`)
      if (t.lineHeight) baseRules.push(`line-height: ${t.lineHeight};`)
    }
  }

  if (baseRules.length) css += `.${cls} { ${baseRules.join(' ')} }\n`

  // tablet
  const tabletRules: string[] = []
  if (style.padding && style.padding.tablet) tabletRules.push(`padding: ${v(style.padding.tablet)};`)
  if (style.margin && style.margin.tablet) tabletRules.push(`margin: ${v(style.margin.tablet)};`)
  if (style.radius && style.radius.tablet) tabletRules.push(`border-radius: ${v(style.radius.tablet)};`)
  if (style.background && style.background.tablet) tabletRules.push(`background: ${v(style.background.tablet)};`)
  if (style.textColor && style.textColor.tablet) tabletRules.push(`color: ${v(style.textColor.tablet)};`)
  if (style.align && style.align.tablet) tabletRules.push(`text-align: ${style.align.tablet};`)
  if (style.containerWidth && style.containerWidth.tablet) tabletRules.push(`max-width: ${v(style.containerWidth.tablet)}; margin-left: auto; margin-right: auto;`)
  if (style.gap && style.gap.tablet) tabletRules.push(`gap: ${v(style.gap.tablet)};`)
  if (style.typography && style.typography.tablet) {
    const t = v(style.typography.tablet)
    if (t && typeof t === 'object') {
      if (t.fontSize) tabletRules.push(`font-size: ${t.fontSize};`)
      if (t.lineHeight) tabletRules.push(`line-height: ${t.lineHeight};`)
    }
  }
  if (tabletRules.length) css += `@media (max-width: 1024px) { .${cls} { ${tabletRules.join(' ')} } }\n`

  // mobile
  const mobileRules: string[] = []
  if (style.padding && style.padding.mobile) mobileRules.push(`padding: ${v(style.padding.mobile)};`)
  if (style.margin && style.margin.mobile) mobileRules.push(`margin: ${v(style.margin.mobile)};`)
  if (style.radius && style.radius.mobile) mobileRules.push(`border-radius: ${v(style.radius.mobile)};`)
  if (style.background && style.background.mobile) mobileRules.push(`background: ${v(style.background.mobile)};`)
  if (style.textColor && style.textColor.mobile) mobileRules.push(`color: ${v(style.textColor.mobile)};`)
  if (style.align && style.align.mobile) mobileRules.push(`text-align: ${style.align.mobile};`)
  if (style.containerWidth && style.containerWidth.mobile) mobileRules.push(`max-width: ${v(style.containerWidth.mobile)}; margin-left: auto; margin-right: auto;`)
  if (style.gap && style.gap.mobile) mobileRules.push(`gap: ${v(style.gap.mobile)};`)
  if (style.typography && style.typography.mobile) {
    const t = v(style.typography.mobile)
    if (t && typeof t === 'object') {
      if (t.fontSize) mobileRules.push(`font-size: ${t.fontSize};`)
      if (t.lineHeight) mobileRules.push(`line-height: ${t.lineHeight};`)
    }
  }
  if (mobileRules.length) css += `@media (max-width: 640px) { .${cls} { ${mobileRules.join(' ')} } }\n`

  return css
}

export default { tokenLookup, resolveTokenValue, styleToInline, generateResponsiveCSS }
