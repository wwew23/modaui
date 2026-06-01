'use client'

import React, { useState, useEffect } from 'react'
import { StoreDSL, ComponentRegistry } from '../theme-runtime/types'
import ThemeRuntime from '../theme-runtime'
import { SectionRenderer } from '../section-renderer/SectionRenderer'

interface StoreRendererProps {
  dsl: StoreDSL
  registry: ComponentRegistry
  storeId: string
  token?: string
  pageId?: string
}

/**
 * Store Renderer: 渲染整个 Store（包含所有 sections）
 */
export function StoreRenderer({
  dsl,
  registry,
  storeId,
  token,
  pageId
}: StoreRendererProps) {
  const runtime = new ThemeRuntime(dsl)
  const [currentPage, setCurrentPage] = useState<any>(null)

  useEffect(() => {
    if (pageId) {
      const page = dsl.pages?.find(p => p.id === pageId)
      setCurrentPage(page || runtime.getHomePage())
    } else {
      setCurrentPage(runtime.getHomePage())
    }
  }, [dsl, pageId])

  if (!currentPage) {
    return <div className="p-4 text-gray-500">No page to display</div>
  }

  // 获取当前页面的所有 sections
  const sections = runtime.getPageSections(currentPage.id)

  return (
    <div className="store-renderer w-full">
      <div className="page-header mb-4 p-4 bg-gray-50 border-b">
        <h1 className="text-2xl font-bold">{currentPage.title || 'Untitled Page'}</h1>
        <p className="text-sm text-gray-600">
          Template: {runtime.getTemplate()} | Theme: {runtime.getTheme() || 'default'}
        </p>
      </div>

      <div className="page-content max-w-7xl mx-auto p-4">
        {sections.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No sections configured for this page
          </div>
        ) : (
          <div className="sections-container space-y-0">
            {sections.map(section => (
              <SectionRenderer
                key={section.id}
                section={section}
                registry={registry}
                storeId={storeId}
                token={token}
              />
            ))}
          </div>
        )}
      </div>

      {/* 页面导航 */}
      {dsl.pages && dsl.pages.length > 1 && (
        <div className="page-nav p-4 border-t bg-gray-50 flex gap-2">
          {dsl.pages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage.id === page.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StoreRenderer
