const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { requireStoreAccess } = require('../middleware/permissions')
const { generateStoreDSL } = require('../lib/aiClient')

// AI generate placeholder — returns a Store DSL JSON
router.post('/generate', requireAuth, requireStoreAccess, async (req, res) => {
  const { prompt, template, store_id } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'prompt required' })
  if (!store_id) return res.status(400).json({ error: 'store_id required' })

  try {
    const dsl = await generateStoreDSL({ prompt, template, store_id })
    return res.json({ ok: true, store_id, dsl })
  } catch (e) {
    return res.status(500).json({ error: 'AI generation failed', detail: e.message })
  }
})

// Quick one-sentence generation: auto-select template based on prompt
router.post('/generate/quick', requireAuth, requireStoreAccess, async (req, res) => {
  const { prompt, store_id } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'prompt required' })
  if (!store_id) return res.status(400).json({ error: 'store_id required' })

  const text = String(prompt).toLowerCase()
  let template = 'luxury-fashion'
  if (text.match(/minimal|clean|simple|tech/)) template = 'minimal-tech'
  else if (text.match(/beauty|cosmetic|cosmetics|makeup/)) template = 'beauty-brand'
  else if (text.match(/luxury|fashion|designer/)) template = 'luxury-fashion'

  try {
    const dsl = await generateStoreDSL({ prompt, template, store_id })
    return res.json({ ok: true, store_id, template, dsl })
  } catch (e) {
    return res.status(500).json({ error: 'AI quick generation failed', detail: e.message })
  }
})

module.exports = router
