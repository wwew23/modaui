const Redis = require('ioredis')
const REAL_DATA_ONLY = process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true'

let client = null
if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL)
} else if (REAL_DATA_ONLY) {
  throw new Error('REAL_DATA_ONLY active — no REDIS_URL configured and in-memory Redis fallback is disabled')
} else {
  // fallback in-memory
  const map = new Map()
  client = {
    async get(k) { return map.has(k) ? map.get(k) : null },
    async set(k, v, exMode, exSeconds) { map.set(k, v); return 'OK' },
    async del(k) { return map.delete(k) },
    async expire(k, seconds) { return 1 }
  }
}

module.exports = client
