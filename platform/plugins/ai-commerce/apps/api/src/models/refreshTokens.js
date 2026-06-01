const redis = require('../lib/redisClient')

const PREFIX = 'refresh:tok:'
const BLACKLIST = 'refresh:blacklist:'

async function saveToken(token, data) {
  const key = PREFIX + token
  const value = JSON.stringify(data)
  // TTL in seconds if expires provided
  if (data.expires) {
    const ttl = Math.max(0, Math.floor((data.expires - Date.now()) / 1000))
    await redis.set(key, value, 'EX', ttl)
  } else {
    await redis.set(key, value)
  }
}

async function getToken(token) {
  const key = PREFIX + token
  const v = await redis.get(key)
  if (!v) return null
  try { return JSON.parse(v) } catch (e) { return null }
}

async function revokeToken(token) {
  const key = PREFIX + token
  // mark blacklist key to prevent reuse until expiry
  const val = await redis.get(key)
  if (val) {
    try {
      const data = JSON.parse(val)
      const ttl = data.expires ? Math.max(0, Math.floor((data.expires - Date.now()) / 1000)) : 60 * 60 * 24 * 30
      await redis.set(BLACKLIST + token, '1', 'EX', ttl)
    } catch (e) {}
  }
  await redis.del(key)
}

async function isBlacklisted(token) {
  const v = await redis.get(BLACKLIST + token)
  return !!v
}

module.exports = { saveToken, getToken, revokeToken, isBlacklisted }
