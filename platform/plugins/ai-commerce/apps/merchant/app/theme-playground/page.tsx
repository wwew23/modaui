'use client'

import { useState, useEffect } from 'react'
import StoreRenderer from '@/lib/store-renderer/StoreRenderer'
import { StoreDSL, ComponentRegistry } from '@/lib/theme-runtime/types'

/**
 * Theme Playground: 展示如何使用 Theme Runtime
 * 流程：一句话 → AI生成 DSL → 实时渲染 → 可编辑
 */
export default function ThemePlayground() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [dsl, setDsl] = useState<StoreDSL | null>(null)
  const [registry, setRegistry] = useState<ComponentRegistry | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 模拟 storeId 和 token
  const storeId = '1'
  const token = undefined // 演示中可以是 localStorage.getItem('access_token')

  // 加载组件注册表
  useEffect(() => {
    fetch('/api/components')
      .then(r => r.json())
      .then(data => setRegistry(data))
      .catch(err => console.error('Failed to load registry:', err))
  }, [])

  // 处理 AI 生成
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 调用 API 生成 DSL
      const res = await fetch('/api/ai/generate/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          store_id: storeId
        })
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`)
      }

      const data = await res.json()
      setDsl(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏：输入和控制 */}
      <div className="fixed left-0 top-0 w-80 h-screen bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Theme Playground</h1>

        {/* 提示输入 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Describe your store
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g., Luxury fashion brand with minimalist aesthetic and featured collection"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            rows={4}
            disabled={loading}
          />
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-6"
        >
          {loading ? 'Generating...' : 'Generate Theme'}
        </button>

        {/* 错误显示 */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm mb-6">
            {error}
          </div>
        )}

        {/* DSL 显示 */}
        {dsl && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-2">Generated DSL</h2>
            <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64 border border-gray-300">
              <pre>{JSON.stringify(dsl, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* 说明文本 */}
        <div className="text-xs text-gray-600 space-y-2">
          <p>
            <strong>1. Describe</strong> your store in one sentence
          </p>
          <p>
            <strong>2. Generate</strong> - AI creates a Store DSL
          </p>
          <p>
            <strong>3. View</strong> - Real-time rendered theme on the right
          </p>
          <p>
            <strong>4. Edit</strong> - Sections are editable (future: Puck integration)
          </p>
        </div>
      </div>

      {/* 主要内容区：主题渲染 */}
      <div className="ml-80 p-6">
        {dsl && registry ? (
          <StoreRenderer
            dsl={dsl}
            registry={registry}
            storeId={storeId}
            token={token}
          />
        ) : (
          <div className="flex items-center justify-center h-96 bg-white rounded border border-gray-200">
            <div className="text-center text-gray-500">
              <p className="mb-2">👈 Enter a prompt and click Generate</p>
              <p className="text-sm">Your theme will render here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
