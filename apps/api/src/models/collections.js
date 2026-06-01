// Simple in-memory collections per store_id for demo
const stores = new Map()

function listCollections(store_id) {
  const arr = stores.get(String(store_id)) || []
  return arr
}

function seedCollections(store_id, items) {
  stores.set(String(store_id), items.map((it, i) => Object.assign({ id: `c${i+1}` }, it)))
}

function getCollection(store_id, id) {
  const arr = stores.get(String(store_id)) || []
  return arr.find(c => String(c.id) === String(id))
}

module.exports = { listCollections, seedCollections, getCollection }
