/**
 * useThemeImporter Hook
 * Handles theme import workflow with progress tracking
 */

'use client'

import { useState, useCallback } from 'react'

interface ImportProgress {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error'
  jobId?: string
  progress?: number
  result?: any
  error?: string
}

export function useThemeImporter() {
  const [state, setState] = useState<ImportProgress>({ status: 'idle' })

  const importFromZip = useCallback(async (file: File, themeType: string, themeName?: string) => {
    try {
      setState({ status: 'uploading', progress: 0 })

      const formData = new FormData()
      formData.append('themeZip', file)
      formData.append('themeType', themeType)
      if (themeName) formData.append('themeName', themeName)
      formData.append('storeId', 'current') // Could use auth context

      // Upload and start import job
      const uploadRes = await fetch('/api/themes/import', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.statusText}`)
      }

      const { jobId } = await uploadRes.json()
      setState({ status: 'processing', jobId, progress: 25 })

      // Poll for completion
      let attempts = 0
      const maxAttempts = 120 // 2 minutes with 1-second polls

      while (attempts < maxAttempts) {
        const statusRes = await fetch(`/api/themes/${jobId}/import-status`)
        const statusData = await statusRes.json()

        if (statusData.status === 'complete') {
          setState({
            status: 'complete',
            jobId,
            result: statusData.data,
            progress: 100
          })
          return statusData.data
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Import failed')
        }

        // Update progress (simplified)
        setState(prev => ({
          ...prev,
          progress: Math.min(25 + (attempts / maxAttempts) * 75, 99)
        }))

        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }

      throw new Error('Import timeout')
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error'
      setState({ status: 'error', error })
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return {
    ...state,
    importFromZip,
    reset
  }
}
