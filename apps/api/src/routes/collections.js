const express = require('express')
const router = express.Router()
const { listCollections, seedCollections, getCollection } = require('../models/collections')
const { listProducts } = require('../models/products')

router.get('/seed/:store_id', (req, res) => {
  const store_id = req.params.store_id
  seedCollections(store_id, [
    { title: 'New Arrivals', handle: 'new-arrivals' },
    { title: 'Best Sellers', handle: 'best-sellers' },
    { title: 'Featured', handle: 'featured' }
  ])
  res.json({ ok: true })
})

router.get('/', (req, res) => {
  const store_id = req.query.store_id
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  res.json(listCollections(store_id))
})

// 获取集合内的产品
router.get('/:collection_id/products', (req, res) => {
  const store_id = req.query.store_id
  const collection_id = req.params.collection_id
  
  if (!store_id) return res.status(400).json({ error: 'store_id required' })
  
  const collection = getCollection(store_id, collection_id)
  if (!collection) return res.status(404).json({ error: 'Collection not found' })
  
  // 简单实现：返回该 store 的所有产品
  // 真实应该按 collection_id 关联表过滤
  const products = listProducts(store_id)
  res.json(products)
})

module.exports = router
