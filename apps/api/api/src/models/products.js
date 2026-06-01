// Simple in-memory products per store_id for demo
const stores = new Map()

function listProducts(store_id) {
  const arr = stores.get(String(store_id)) || []
  return arr
}

function seedProducts(store_id, items) {
  stores.set(String(store_id), items.map((it, i) => Object.assign({ id: `p${i+1}` }, it)))
}

function getProduct(store_id, id) {
  const arr = stores.get(String(store_id)) || []
  return arr.find(p => String(p.id) === String(id))
}

module.exports = { listProducts, seedProducts, getProduct }
