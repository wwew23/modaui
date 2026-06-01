import { promises as fs } from 'fs';
import path from 'path';
import { DSLPatch } from './types';

const ROOT = path.resolve(process.cwd());
const REAL_DATA_ONLY = process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true';

async function tryReadJson(p: string) {
  try {
    const abs = path.join(ROOT, p);
    const txt = await fs.readFile(abs, 'utf-8');
    return JSON.parse(txt);
  } catch { return null; }
}

async function tryReadText(p: string) {
  try {
    const abs = path.join(ROOT, p);
    return await fs.readFile(abs, 'utf-8');
  } catch { return null; }
}

// LLM-driven patch generator. Supports OpenAI (preferred), Anthropic, and Gemini (placeholders).
export async function generatePatch(templateId: string, instruction: string, context?: any): Promise<DSLPatch[]> {
  const aiContext = await tryReadText(`apps/api/templates/${templateId}/ai-context.md`) || await tryReadText(`apps/api/templates/luxury-fashion/ai-context.md`) || '';
  const registry = await tryReadJson('registry.json');
  const uiHints = await tryReadJson('uiHints.json') || await tryReadJson('apps/api/templates/uiHints.json');
  const tokens = await tryReadJson(`apps/api/templates/${templateId}/theme-tokens.json`) || await tryReadJson('theme-tokens.json') || {};
  const metadata = await tryReadJson(`apps/api/templates/${templateId}/metadata.json`) || {};

  // Build a strict system prompt requiring JSON-only output (DSL Patch array)
  const system = `You are a Theme-aware Template Assistant for the ModaUI component system.\n
Constraints:\n- ONLY output a valid JSON array of DSLPatch objects and nothing else.\n- DSLPatch schema: [{ sectionId: string, changes: { props: object, style: object, binding?: object } }]\n- Do NOT output HTML, JSX, CSS strings, or Tailwind classes.\n- Do NOT modify layout structure or add new components not present in the registry.\n- Respect existing theme tokens and layout rhythm; do not break spacing rules.\n- Keep changes minimal and localized.\n\nAvailable context (JSON):\n- aiContext: short human description of the template style\n- registry: list of registered components (only these may be used)\n- uiHints: component usage hints\n- tokens: theme tokens that must be used\n- metadata: template metadata\n- store: the current store/page JSON (content blocks)\n\nGoal: Given the user's short instruction, produce an array of DSLPatch objects that adjust style/props/bindings to satisfy the request while preserving layout and registered components.\n`;

  const userMessage = `Instruction:\n${instruction}\n\nContext snapshot:\naiContext: ${aiContext.slice(0,2000)}\nmetadata: ${JSON.stringify(metadata || {}).slice(0,2000)}\nuiHints: ${JSON.stringify(uiHints || {}).slice(0,2000)}\ntokens: ${JSON.stringify(tokens || {}).slice(0,2000)}\nstore: ${JSON.stringify(context?.store || {}).slice(0,4000)}\n`;

  // Choose provider
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY

  async function callOpenAI() {
    const url = 'https://api.openai.com/v1/chat/completions'
    const body = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.6,
      max_tokens: 1000
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    })
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      throw new Error(`OpenAI error: ${resp.status} ${txt}`)
    }
    const data = await resp.json()
    const txt = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || ''
    return txt
  }

  async function callAnthropic() {
    // Placeholder for Anthropic API integration
    throw new Error('Anthropic integration not configured')
  }

  async function callGemini() {
    // Placeholder for Gemini API integration
    throw new Error('Gemini integration not configured')
  }

  let modelOutput = ''
  if (OPENAI_KEY) {
    modelOutput = await callOpenAI()
  } else if (ANTHROPIC_KEY) {
    modelOutput = await callAnthropic()
  } else if (GEMINI_KEY) {
    modelOutput = await callGemini()
  } else {
    if (REAL_DATA_ONLY) {
      throw new Error('REAL_DATA_ONLY active — template assistant fallback mode is disabled');
    }

    // fallback to earlier rule-based mapper if no keys
    const lower = instruction.toLowerCase();
    const patch: DSLPatch = { sectionId: 'global', changes: { style: {}, props: {} } };

    if (lower.includes('留白') || lower.includes('spacing') || lower.includes('more white')) {
      patch.changes.style.spacing = { multiplier: 1.25 };
    }
    if (lower.includes('紧凑') || lower.includes('dense')) {
      patch.changes.style.spacing = { multiplier: 0.85 };
    }

    if (lower.includes('apple') || lower.includes('像 apple') || lower.includes('ios')) {
      patch.changes.style.typography = { fontFamily: 'SF Pro, system-ui, -apple-system' };
    }
    if (lower.includes('高级') || lower.includes('luxury') || lower.includes('珠宝')) {
      patch.changes.style.typography = { fontFamily: 'Playfair Display, serif' };
    }

    if (lower.includes('珠宝') || lower.includes('jewelry')) {
      patch.changes.style.colors = { tone: 'jewel', paletteHint: ['#0f172a', '#b8860b', '#ffffff'] };
    }
    if (lower.includes('更像 apple') || lower.includes('apple')) {
      patch.changes.style.colors = { tone: 'neutral', paletteHint: ['#f5f7fa', '#0b7285', '#0f172a'] };
    }

    if (lower.includes('hero') || lower.includes('大图') || lower.includes('大幅')) {
      patch.changes.props.heroStyle = { size: 'large', focal: 'center' };
    }

    patch.changes.props.context = {
      aiContext: aiContext ? aiContext.slice(0, 2000) : undefined,
      registrySummary: registry ? Object.keys(registry).slice(0,10) : undefined,
      tokensSample: tokens && Object.keys(tokens).length ? Object.entries(tokens).slice(0,10) : undefined,
      metadata: metadata?.title || metadata?.name || templateId,
      uiHints: uiHints || undefined,
    };

    return [patch]
  }

  // Model output should be JSON array. Parse carefully.
  let patches: DSLPatch[] = []
  try {
    // Try direct JSON parse
    patches = JSON.parse(modelOutput)
    if (!Array.isArray(patches)) throw new Error('Model did not return an array')
    return patches
  } catch (e) {
    // Try to extract JSON substring
    const match = modelOutput.match(/\[\s*\{[\s\S]*\}\s*\]/m)
    if (match) {
      try {
        patches = JSON.parse(match[0])
        return patches
      } catch (ee) {
        throw new Error('Failed to parse JSON from model output')
      }
    }
    throw new Error('LLM output not valid JSON')
  }
}
