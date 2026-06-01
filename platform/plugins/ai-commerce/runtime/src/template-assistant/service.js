const fs = require('fs').promises
const path = require('path')

const ROOT = path.resolve(process.cwd())

async function tryReadJson(p) {
  try {
    const abs = path.join(ROOT, p)
    const txt = await fs.readFile(abs, 'utf-8')
    return JSON.parse(txt)
  } catch { return null }
}

async function tryReadText(p) {
  try {
    const abs = path.join(ROOT, p)
    return await fs.readFile(abs, 'utf-8')
  } catch { return null }
}

async function generatePatch(templateId, instruction, context) {
  const aiContext = await tryReadText(`apps/api/templates/${templateId}/ai-context.md`) || await tryReadText(`apps/api/templates/luxury-fashion/ai-context.md`) || ''
  const registry = await tryReadJson('registry.json')
  const uiHints = await tryReadJson('uiHints.json') || await tryReadJson('apps/api/templates/uiHints.json')
  const tokens = await tryReadJson(`apps/api/templates/${templateId}/theme-tokens.json`) || await tryReadJson('theme-tokens.json') || {}
  const metadata = await tryReadJson(`apps/api/templates/${templateId}/metadata.json`) || {}

  const lower = instruction.toLowerCase()
  const patch = { sectionId: 'global', changes: { style: {}, props: {} } }

  if (lower.includes('留白') || lower.includes('spacing') || lower.includes('more white')) {
    patch.changes.style.spacing = { multiplier: 1.25 }
  }
  if (lower.includes('紧凑') || lower.includes('dense')) {
    patch.changes.style.spacing = { multiplier: 0.85 }
  }

  if (lower.includes('apple') || lower.includes('像 apple') || lower.includes('ios')) {
    patch.changes.style.typography = { fontFamily: 'SF Pro, system-ui, -apple-system' }
  }
  if (lower.includes('高级') || lower.includes('luxury') || lower.includes('珠宝')) {
    patch.changes.style.typography = { fontFamily: 'Playfair Display, serif' }
  }

  if (lower.includes('珠宝') || lower.includes('jewelry')) {
    patch.changes.style.colors = { tone: 'jewel', paletteHint: ['#0f172a', '#b8860b', '#ffffff'] }
  }
  if (lower.includes('更像 apple') || lower.includes('apple')) {
    patch.changes.style.colors = { tone: 'neutral', paletteHint: ['#f5f7fa', '#0b7285', '#0f172a'] }
  }

  if (lower.includes('hero') || lower.includes('大图') || lower.includes('大幅')) {
    patch.changes.props.heroStyle = { size: 'large', focal: 'center' }
  }
  if (lower.includes('section density') || lower.includes('section 密度') || lower.includes('section 密')) {
    patch.changes.style.sectionDensity = lower.includes('低') ? 'sparse' : 'normal'
  }

  patch.changes.props.context = {
    aiContext: aiContext ? aiContext.slice(0, 2000) : undefined,
    registrySummary: registry ? Object.keys(registry).slice(0,10) : undefined,
    tokensSample: tokens && Object.keys(tokens).length ? Object.entries(tokens).slice(0,10) : undefined,
    metadata: metadata?.title || metadata?.name || templateId,
    uiHints: uiHints || undefined,
  }

  return [patch]
}

module.exports = { generatePatch }
