/**
 * Theme Importer Routes
 * POST /api/themes/import - Import a theme from ZIP
 * GET /api/themes/:id/import-status - Check import progress
 */

const express = require('express')
const multer = require('multer')
const { importTheme } = require('../theme-importer')

const router = express.Router()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
})

// In-memory store for import jobs
const importJobs = {}

/**
 * POST /api/themes/import
 * Body: { themeType, themeName, storeId }
 * File: ZIP archive
 */
router.post('/import', upload.single('themeZip'), async (req, res) => {
  try {
    const { themeType, themeName, storeId } = req.body
    
    if (!req.file) {
      return res.status(400).json({ error: 'Theme ZIP file required' })
    }
    
    if (!themeType) {
      return res.status(400).json({ error: 'themeType required (shopify|html|jsx|nextjs|tailwind)' })
    }

    const jobId = `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const importOptions = {
      zipBuffer: req.file.buffer,
      themeType,
      themeName: themeName || 'Imported Theme',
      storeId: storeId || 'default'
    }

    // Track job progress
    importJobs[jobId] = {
      status: 'processing',
      created: new Date(),
      result: null,
      error: null
    }

    // Run import asynchronously
    importTheme(importOptions)
      .then(result => {
        importJobs[jobId].status = 'complete'
        importJobs[jobId].result = result
        console.log(`[API] Theme import ${jobId} completed`)
      })
      .catch(err => {
        importJobs[jobId].status = 'error'
        importJobs[jobId].error = err.message
        console.error(`[API] Theme import ${jobId} failed:`, err.message)
      })

    res.json({
      jobId,
      message: 'Theme import started',
      statusUrl: `/api/themes/${jobId}/import-status`
    })
  } catch (err) {
    console.error('[API] Import endpoint error:', err)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/themes/:jobId/import-status
 * Check import progress and retrieve results
 */
router.get('/:jobId/import-status', (req, res) => {
  const { jobId } = req.params
  const job = importJobs[jobId]

  if (!job) {
    return res.status(404).json({ error: 'Import job not found' })
  }

  const response = {
    jobId,
    status: job.status,
    created: job.created
  }

  if (job.status === 'complete') {
    response.data = job.result
  } else if (job.status === 'error') {
    response.error = job.error
  }

  res.json(response)
})

module.exports = router
