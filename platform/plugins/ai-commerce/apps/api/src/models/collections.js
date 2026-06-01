// Simple in-memory collections per store_id for demo
const REAL_DATA_ONLY = process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true'
const stores = new Map()

function ensureDemoStoreAllowed() {
  if (REAL_DATA_ONLY) {
    throw new Error('REAL_DATA_ONLY active — demo collection store is disabled')
  }
}

function listCollections(store_id) {
  if (REAL_DATA_ONLY) ensureDemoStoreAllowed()
  const arr = stores.get(String(store_id)) || []
  return arr
}

function seedCollections(store_id, items) {
  ensureDemoStoreAllowed()
  stores.set(String(store_id), items.map((it, i) => Object.assign({ id: `c${i+1}` }, it)))
}

function getCollection(store_id, id) {
  if (REAL_DATA_ONLY) ensureDemoStoreAllowed()
  const arr = stores.get(String(store_id)) || []
  return arr.find(c => String(c.id) === String(id))
}

module.exports = { listCollections, seedCollections, getCollection }
