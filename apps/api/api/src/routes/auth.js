const express = require('express')
const router = express.Router()
const { signAccessToken } = require('../middleware/auth')
const { saveToken, getToken, revokeToken } = require('../models/refreshTokens')
const { findByUsername } = require('../models/user')
const { requireAuth } = require('../middleware/auth')
const crypto = require('crypto')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })
  const user = findByUsername(username)
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' })

  const payload = { sub: user.id, username: user.username, role: user.role, store_id: user.store_id }
  const access = signAccessToken(payload)
  const refresh = crypto.randomBytes(32).toString('hex')
  // store refresh with basic metadata (30 days)
  await saveToken(refresh, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 * 24 * 30 })
  res.json({ access_token: access, refresh_token: refresh, token_type: 'bearer' })
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body || {}
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' })
  const meta = await getToken(refresh_token)
  if (!meta) return res.status(403).json({ error: 'Invalid refresh token' })
  // check blacklist
  const { isBlacklisted } = require('../models/refreshTokens')
  if (await isBlacklisted(refresh_token)) return res.status(403).json({ error: 'Refresh token revoked' })
  // naive expiry check
  if (meta.expires && meta.expires < Date.now()) return res.status(403).json({ error: 'Refresh token expired' })
  // find user
  const user = require('../models/user').findById(meta.userId)
  if (!user) return res.status(403).json({ error: 'Invalid token user' })
  const payload = { sub: user.id, username: user.username, role: user.role, store_id: user.store_id }
  const access = signAccessToken(payload)
  // rotate refresh token: revoke old, issue new
  const crypto = require('crypto')
  const newRefresh = crypto.randomBytes(32).toString('hex')
  // store new refresh token (30 days)
  await saveToken(newRefresh, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 * 24 * 30 })
  await revokeToken(refresh_token)
  res.json({ access_token: access, refresh_token: newRefresh, token_type: 'bearer' })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { refresh_token } = req.body || {}
  if (refresh_token) await revokeToken(refresh_token)
  res.json({ ok: true })
})

module.exports = router
