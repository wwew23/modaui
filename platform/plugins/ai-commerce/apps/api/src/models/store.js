// Minimal in-memory store model for scaffolding and tests
const stores = []
let nextId = 1

function listStores() {
  return stores
}

function createStore(data) {
  const item = Object.assign({ id: nextId++ }, data)
  stores.push(item)
  return item
}

function getStore(id) {
  return stores.find(s => String(s.id) === String(id))
}

module.exports = { listStores, createStore, getStore }
