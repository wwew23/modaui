const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

const REG_PATH = path.resolve(__dirname, '../../components/registry.json')

router.get('/', (req, res) => {
  if (!fs.existsSync(REG_PATH)) return res.json({ components: [] })
  const data = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'))
  res.json(data)
})

module.exports = router
