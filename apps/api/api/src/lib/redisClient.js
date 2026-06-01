const Redis = require('ioredis')

let client = null
if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL)
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
