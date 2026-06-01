const fs = require('fs')
const path = require('path')

const REAL_DATA_ONLY = process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true'
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates')
const COMPONENTS_REGISTRY = path.resolve(__dirname, '../../components/registry.json')
const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true, strict: false })

function loadTemplate(templateId) {
  const file = path.join(TEMPLATES_DIR, templateId, 'template.json')
  if (!fs.existsSync(file)) throw new Error('template not found')
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function loadTemplateMeta(templateId) {
  const file = path.join(TEMPLATES_DIR, templateId, 'metadata.json')
  if (!fs.existsSync(file)) return {}
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch (e) { return {} }
}

function loadRegistry() {
  if (!fs.existsSync(COMPONENTS_REGISTRY)) return { components: [] }
  return JSON.parse(fs.readFileSync(COMPONENTS_REGISTRY, 'utf8'))
}

function loadGlobalTokens() {
  // try to load tokens shipped with the merchant frontend public folder
  const candidate = path.join(__dirname, '../../merchant/public/theme-tokens.json')
  if (fs.existsSync(candidate)) {
    try { return JSON.parse(fs.readFileSync(candidate, 'utf8')) } catch (e) { return null }
  }
  return null
}

function sanitizeText(t) {
  return String(t || '').replace(/\n/g, ' ').slice(0, 1000)
}

async function callProvider(systemPrompt, userPrompt) {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase()
  const body = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]

  const maxAttempts = 3
  let attempt = 0
  while (attempt < maxAttempts) {
    try {
      attempt++
      // OpenAI
      if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o', messages: body, max_tokens: 1500, temperature: 0.2 })
        })
        const j = await res.json()
        return j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || JSON.stringify(j)
      }

      // Anthropic / Claude
      if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
        const promptText = `${systemPrompt}\n\nUSER:\n${userPrompt}`
        const res = await fetch('https://api.anthropic.com/v1/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}` },
          body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-2', prompt: promptText, max_tokens: 1500, temperature: 0.2 })
        })
        const j = await res.json()
        return j.completion || JSON.stringify(j)
      }

      // Google / Gemini (placeholder)
      if (provider === 'google' && process.env.GOOGLE_API_KEY) {
        const res = await fetch(process.env.GOOGLE_GENAI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GOOGLE_API_KEY}` },
          body: JSON.stringify({ prompt: { text: systemPrompt + '\n' + userPrompt }, temperature: 0.2 })
        })
        const j = await res.json()
        return j.candidates && j.candidates[0] && j.candidates[0].content || JSON.stringify(j)
      }

      if (REAL_DATA_ONLY) {
        throw new Error('REAL_DATA_ONLY active — AI provider not configured and local fallback is disabled')
      }

      // Fallback logic for non-REAL_DATA_ONLY mode
      return JSON.stringify({
        template: "luxury-fashion",
        theme: "modern-dark",
        pages: [{ id: "home", title: "Home", sections: ["hero-1", "features-1"] }],
        sections: [
          { id: "hero-1", type: "Hero", props: { title: "Mock Title", subtitle: "Mock Subtitle" }, style: { padding: { desktop: "lg", tablet: "md", mobile: "sm" }, margin: { desktop: "none", tablet: "none", mobile: "none" }, radius: { desktop: "md", tablet: "md", mobile: "md" }, background: { desktop: "primary", tablet: "primary", mobile: "primary" }, textColor: { desktop: "white", tablet: "white", mobile: "white" }, align: { desktop: "center", tablet: "center", mobile: "center" }, containerWidth: { desktop: "xl", tablet: "lg", mobile: "full" }, gap: { desktop: "md", tablet: "md", mobile: "sm" } } }
        ]
      })
    } catch (err) {
      if (REAL_DATA_ONLY) {
        throw err
      }
      if (attempt >= maxAttempts) throw err
      await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)))
    }
  }
}

function ensureNoForbidden(outputText) {
  // forbid HTML/JSX/CSS tokens
  const forbidden = ['<div', '<span', '<img', '<script', '<style', '<svg', 'className=', 'function(', '=>', '<!DOCTYPE']
  for (const f of forbidden) if (outputText.includes(f)) throw new Error('LLM output contains forbidden content')
}

function extractJSON(text) {
  // try direct parse
  try { return JSON.parse(text) } catch (e) {}
  // try to extract first {...} block
  const m = text.match(/(\{[\s\S]*\})/)
  if (m) {
    try { return JSON.parse(m[1]) } catch (e) {}
  }
  throw new Error('Unable to parse JSON from model output')
}

async function generateStoreDSL({ prompt, template: templateId, store_id }) {
  const tplId = templateId || 'luxury-fashion'
  if (!prompt || String(prompt).length > 2000) throw new Error('prompt empty or too long')
  const template = loadTemplate(tplId)
  const templateMeta = loadTemplateMeta(tplId)
  const registry = loadRegistry()
  const allowed = (registry.components || []).map(c => c.name)

  // provide registry summary and tokens to the model so it can produce tokenized styles
  const registrySummary = (registry.components || []).map(c => ({ name: c.name, props: Object.keys(c.schema && c.schema.properties ? c.schema.properties : {}), uiHints: c.uiHints || null }))
  const globalTokens = templateMeta.tokens || loadGlobalTokens() || {}

  const systemPrompt = `You are an assistant that MUST output ONLY valid JSON describing a Store DSL with the following top-level keys: template, theme, pages, sections. Do NOT output HTML, JSX, CSS, or any code. Use only the allowed components. The template to base on is ${tplId}.` +
    `\n\nRegistry Summary: ${JSON.stringify(registrySummary)}\n\nAvailable tokens: ${JSON.stringify(globalTokens)}\n`;

  const userPrompt = `Generate a store DSL for store_id=${store_id} using template=${tplId}. Prompt: ${sanitizeText(prompt)}.` +
    `\n\nREQUIREMENTS:\n- Output must be valid JSON and parseable without extra commentary.\n- Top-level keys: template, theme, pages, sections.\n- For every section in sections array, include a 'style' object with these keys: padding, margin, radius, background, textColor, align, containerWidth, gap.\n- Each style key must be an object with responsive breakpoints: desktop, tablet, mobile. Example: \n  "style": { "padding": { "desktop": "lg", "tablet": "md", "mobile": "sm" }, ... }\n- Values MUST be token keys from the provided tokens blob (do NOT invent numeric units or raw CSS like "16px" or "#fff").\n- Follow template-specific aesthetic if the template is known (e.g. luxury-fashion -> prefer larger radii and muted palettes; minimal-tech -> prefer small spacing, monochrome; beauty-brand -> softer radii, pastel palette).\n`;

  const raw = await callProvider(systemPrompt, userPrompt)
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw)
  ensureNoForbidden(text)
  const parsed = extractJSON(text)
  // enforce template id
  parsed.template = parsed.template || tplId

  // DSL schema validation
  const storeSchema = {
    type: 'object',
    properties: {
      template: { type: 'string' },
      theme: { type: 'string' },
      pages: { type: 'array' },
      sections: { type: 'array' }
    },
    required: ['template','pages','sections']
  }
  const valid = ajv.validate(storeSchema, parsed)
  if (!valid) throw new Error('Store DSL schema validation failed: ' + ajv.errorsText())

  // Validate components used and props against registry schemas
  const compMap = {}
  for (const c of registry.components || []) compMap[c.name] = c

  function validateSection(s) {
    if (!s || !s.type) throw new Error('Section missing type')
    if (!compMap[s.type]) throw new Error('Unregistered component used: ' + s.type)
    const schema = compMap[s.type].schema || { type: 'object' }
    const validate = ajv.compile(schema)
    const ok = validate(s.props || {})
    if (!ok) throw new Error('Props validation failed for ' + s.type + ': ' + ajv.errorsText(validate.errors))
    // validate binding if component declares bindingSchema
    const bindingSchema = compMap[s.type].bindingSchema
    if (bindingSchema) {
      const vb = ajv.compile(bindingSchema)
      const bok = vb(s.binding || {})
      if (!bok) throw new Error('Binding validation failed for ' + s.type + ': ' + ajv.errorsText(vb.errors))
    }
  }

  // pages may reference sections by id; ensure sections array contains defined sections
  const sectionIds = new Set((parsed.sections || []).map(s => s.id))
  for (const p of parsed.pages || []) {
    if (p.sections && Array.isArray(p.sections)) {
      for (const sid of p.sections) if (!sectionIds.has(sid)) throw new Error('Page references unknown section: ' + sid)
    }
  }

  // ensure sections used are allowed by template: template.sections defines allowed ids/types
  const templateSectionTypes = new Set((template.sections || []).map(s => s.type))
  const templateSectionIds = new Set((template.sections || []).map(s => s.id))
  // prepare style validation schema based on tokens if available
  const tokens = parsed.tokens || templateMeta.tokens || loadGlobalTokens() || {}
  const spacingKeys = tokens.spacing ? Object.keys(tokens.spacing) : null
  const radiusKeys = tokens.radius ? Object.keys(tokens.radius) : null
  const colorKeys = tokens.colors ? Object.keys(tokens.colors) : null

  const styleSchema = {
    type: 'object',
    properties: {
      padding: { type: 'object', properties: { desktop: { type: 'string', enum: spacingKeys || undefined }, tablet: { type: 'string', enum: spacingKeys || undefined }, mobile: { type: 'string', enum: spacingKeys || undefined } }, required: ['desktop','tablet','mobile'] },
      margin: { type: 'object', properties: { desktop: { type: 'string', enum: spacingKeys || undefined }, tablet: { type: 'string', enum: spacingKeys || undefined }, mobile: { type: 'string', enum: spacingKeys || undefined } }, required: ['desktop','tablet','mobile'] },
      radius: { type: 'object', properties: { desktop: { type: 'string', enum: radiusKeys || undefined }, tablet: { type: 'string', enum: radiusKeys || undefined }, mobile: { type: 'string', enum: radiusKeys || undefined } }, required: ['desktop','tablet','mobile'] },
      background: { type: 'object', properties: { desktop: { type: 'string', enum: colorKeys || undefined }, tablet: { type: 'string', enum: colorKeys || undefined }, mobile: { type: 'string', enum: colorKeys || undefined } }, required: ['desktop','tablet','mobile'] },
      textColor: { type: 'object', properties: { desktop: { type: 'string', enum: colorKeys || undefined }, tablet: { type: 'string', enum: colorKeys || undefined }, mobile: { type: 'string', enum: colorKeys || undefined } }, required: ['desktop','tablet','mobile'] },
      align: { type: 'object', properties: { desktop: { type: 'string', enum: ['left','center','right'] }, tablet: { type: 'string', enum: ['left','center','right'] }, mobile: { type: 'string', enum: ['left','center','right'] } }, required: ['desktop','tablet','mobile'] },
      containerWidth: { type: 'object', properties: { desktop: { type: 'string' }, tablet: { type: 'string' }, mobile: { type: 'string' } }, required: ['desktop','tablet','mobile'] },
      gap: { type: 'object', properties: { desktop: { type: 'string', enum: spacingKeys || undefined }, tablet: { type: 'string', enum: spacingKeys || undefined }, mobile: { type: 'string', enum: spacingKeys || undefined } }, required: ['desktop','tablet','mobile'] }
    }
  }

  for (const s of parsed.sections || []) {
    if (!templateSectionIds.has(s.id) && !templateSectionTypes.has(s.type)) {
      throw new Error('Section not allowed by template: ' + (s.id || s.type))
    }
    validateSection(s)
    // validate style presence and tokens
    const st = s.style || {}
    const validateStyle = ajv.compile(styleSchema)
    const okStyle = validateStyle(st)
    if (!okStyle) throw new Error('Style validation failed for section ' + (s.id || s.type) + ': ' + ajv.errorsText(validateStyle.errors))
  }

  // attach theme/tokens from template metadata if available
  if (templateMeta.theme) parsed.theme = parsed.theme || templateMeta.theme
  if (templateMeta.tokens) parsed.tokens = parsed.tokens || templateMeta.tokens

  return parsed
}

module.exports = { generateStoreDSL }
