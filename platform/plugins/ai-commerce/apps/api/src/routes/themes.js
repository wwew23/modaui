const express = require('express')
const router = express.Router({ mergeParams: true })
const { saveTheme, getTheme, publishTheme, getPublishedTheme } = require('../models/themes')

// GET /api/stores/:store_id/theme  - get current saved theme
router.get('/', (req, res) => {
  const store_id = req.params.store_id
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  const theme = getTheme(store_id)
  if (!theme) return res.status(404).json({ error: 'No theme saved for this store' })
  res.json(theme)
})

// POST /api/stores/:store_id/theme - save theme DSL
router.post('/', (req, res) => {
  const store_id = req.params.store_id
  const body = req.body
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  if (!body || !body.template || !body.sections) {
    return res.status(400).json({ error: 'Invalid theme payload. Expect at least template and sections.' })
  }
  saveTheme(store_id, body)
  res.json({ ok: true })
})

// POST /api/stores/:store_id/theme/publish - publish saved theme to storefront
router.post('/publish', (req, res) => {
  const store_id = req.params.store_id
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  const publishedTheme = publishTheme(store_id)
  if (!publishedTheme) return res.status(404).json({ error: 'No saved theme to publish' })
  // In production, this would trigger storefront cache invalidation / webhook
  res.json({ ok: true, published: true })
})

// GET /api/stores/:store_id/theme/published - get published theme
router.get('/published', (req, res) => {
  const store_id = req.params.store_id
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  const t = getPublishedTheme(store_id)
  if (!t) return res.status(404).json({ error: 'No published theme for this store' })
  res.json(t)
})

module.exports = router
