const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { requireAuth } = require('../middleware/auth')
const { requireStoreAccess } = require('../middleware/permissions')

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates')

function listTemplateDirs() {
  try {
    return fs.readdirSync(TEMPLATES_DIR).filter(f => fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory())
  } catch (e) {
    return []
  }
}

router.get('/', (req, res) => {
  const dirs = listTemplateDirs()
  const result = dirs.map(id => {
    const metaPath = path.join(TEMPLATES_DIR, id, 'metadata.json')
    let meta = { id }
    try {
      meta = Object.assign(meta, JSON.parse(fs.readFileSync(metaPath, 'utf8')))
    } catch (e) {}
    return meta
  })
  res.json(result)
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  const templatePath = path.join(TEMPLATES_DIR, id, 'template.json')
  const metaPath = path.join(TEMPLATES_DIR, id, 'metadata.json')
  if (!fs.existsSync(templatePath)) return res.status(404).json({ error: 'template not found' })
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'))
  let meta = {}
  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) } catch (e) {}
  res.json({ id, metadata: meta, template })
})

router.get('/:id/preview', (req, res) => {
  const id = req.params.id
  const imgPath = path.join(TEMPLATES_DIR, id, 'preview.png')
  if (!fs.existsSync(imgPath)) return res.status(404).json({ error: 'preview not found' })
  res.sendFile(imgPath)
})

// POST /api/templates/:id/generate
router.post('/:id/generate', requireAuth, requireStoreAccess, async (req, res) => {
  const id = req.params.id
  const { prompt, store_id } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'prompt required' })
  if (!store_id) return res.status(400).json({ error: 'store_id required' })

  // load template metadata to provide theme/tokens
  const metaPath = path.join(TEMPLATES_DIR, id, 'metadata.json')
  let meta = {}
  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) } catch (e) {}

  // delegate to AI client for generation
  try {
    const { generateStoreDSL } = require('../lib/aiClient')
    const dsl = await generateStoreDSL({ prompt, template: id, store_id })
    // attach theme if present in metadata
    if (meta.theme) dsl.theme = meta.theme
    return res.json({ ok: true, store_id, dsl })
  } catch (e) {
    return res.status(500).json({ error: 'generate failed', detail: e.message })
  }
})

module.exports = router
