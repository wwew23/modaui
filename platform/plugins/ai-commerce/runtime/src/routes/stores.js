const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { requireRole, requireStoreAccess } = require('../middleware/permissions')
const Store = require('../models/store')

// public list (optionally filter by store_id)
router.get('/', (req, res) => {
  const sid = req.query.store_id
  if (sid) return res.json(Store.listStores().filter(s => String(s.id) === String(sid)))
  res.json(Store.listStores())
})

// protected create: only super_admin or merchant can create
router.post('/', requireAuth, requireRole(['super_admin', 'merchant']), (req, res) => {
  const data = req.body || {}
  if (!data.name) return res.status(400).json({ error: 'name required' })
  // if merchant, set owner store_id association
  const item = Store.createStore({ name: data.name, owner: req.user.sub })
  res.status(201).json(item)
})

router.get('/:id', requireAuth, (req, res) => {
  const s = Store.getStore(req.params.id)
  if (!s) return res.status(404).json({ error: 'not found' })
  // enforce store isolation: merchants only their store
  if (req.user && req.user.role !== 'super_admin') {
    if (String(req.user.store_id) !== String(s.id)) return res.status(403).json({ error: 'Forbidden' })
  }
  res.json(s)
})

module.exports = router
