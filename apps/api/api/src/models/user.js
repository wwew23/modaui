// In-memory user store for scaffolding
const users = [
  { id: 'u1', username: 'super', password: 'password', role: 'super_admin' },
  { id: 'm1', username: 'merchant', password: 'password', role: 'merchant', store_id: 1 },
  { id: 's1', username: 'staff', password: 'password', role: 'staff', store_id: 1 },
]

function findByUsername(username) {
  return users.find(u => u.username === username)
}

function findById(id) {
  return users.find(u => u.id === id)
}

module.exports = { users, findByUsername, findById }
