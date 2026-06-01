const express = require('express')
const router = express.Router()
const { listProducts, seedProducts } = require('../models/products')

// seed demo data if none
router.get('/seed/:store_id', (req, res) => {
  const store_id = req.params.store_id
  seedProducts(store_id, [
    { title: 'Minimal Shirt', price: 79 },
    { title: 'Elegant Coat', price: 199 },
    { title: 'Sneakers', price: 129 },
    { title: 'Designer Bag', price: 299 },
    { title: 'Premium Jeans', price: 149 }
  ])
  res.json({ ok: true })
})

router.get('/', (req, res) => {
  const store_id = req.query.store_id
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  res.json(listProducts(store_id))
})

// 获取指定集合的产品
// 真实实现应该按 collection_id 分组产品
router.get('/collection/:collection_id', (req, res) => {
  const store_id = req.query.store_id
  const collection_id = req.params.collection_id
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  
  // 简单实现：返回该 store 的所有产品
  // 生产环境应从数据库按集合过滤
  res.json(listProducts(store_id))
})

module.exports = router
