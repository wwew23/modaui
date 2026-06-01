const { findById } = require('../models/user')

function requireRole(roles) {
  return function (req, res, next) {
    const user = req.user || {}
    if (!user.role) return res.status(401).json({ error: 'Unauthorized' })
    if (Array.isArray(roles) ? roles.includes(user.role) : user.role === roles) return next()
    return res.status(403).json({ error: 'Insufficient role' })
  }
}

function requireStoreAccess(req, res, next) {
  // store_id may be in body, query, or params
  const storeId = req.body && req.body.store_id || req.query && req.query.store_id || req.params && req.params.store_id
  if (!storeId) return res.status(400).json({ error: 'store_id required' })
  const user = req.user || {}
  if (user.role === 'super_admin') return next()
  if (user.role === 'merchant' || user.role === 'staff') {
    // user.sub holds username or user id depending on token payload
    if (String(user.store_id || user.storeId || user.store) === String(storeId) || String(user.store_id) === String(storeId)) return next()
    return res.status(403).json({ error: 'Forbidden: store access' })
  }
  return res.status(403).json({ error: 'Forbidden' })
}

module.exports = { requireRole, requireStoreAccess }
