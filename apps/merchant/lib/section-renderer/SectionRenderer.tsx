'use client'

import React, { useEffect, useState } from 'react'
import { Section, ComponentRegistry } from '../theme-runtime/types'
import useDataBinding from '../data-bindings/useDataBinding'
import styleUtils from '../puck/style-utils'

function safeClassId(id: string) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '-')
}

interface SectionRendererProps {
  section: Section
  registry: ComponentRegistry
  storeId: string
  token?: string
}

/**
 * Section Renderer: 根据 section type 和 binding 动态渲染单个 section
 */
export function SectionRenderer({
  section,
  registry,
  storeId,
  token
}: SectionRendererProps) {
  const { data, loading, error } = useDataBinding(section.binding, storeId, token)
  const [tokens, setTokens] = useState<any>(null)
  const [css, setCss] = useState<string>('')

  useEffect(() => {
    fetch('/theme-tokens.json').then(r => r.json()).then(t => setTokens(t)).catch(() => setTokens(null))
  }, [])

  useEffect(() => {
    if (!tokens) return
    const cls = safeClassId(section.id)
    const cssText = styleUtils.generateResponsiveCSS(cls, section.style, tokens)
    setCss(cssText)
  }, [section.style, tokens])

  // 获取组件元数据
  const componentMeta = registry.components?.find(c => c.name === section.type)
  if (!componentMeta) {
    return (
      <div className="p-4 bg-red-100 text-red-700">
        Unknown component: {section.type}
      </div>
    )
  }

  const clsName = `section-${safeClassId(section.id)}`
  const inlineStyle = styleUtils.styleToInline(section.style, tokens)

  return (
    <div key={section.id} className={`${clsName} section-renderer border border-gray-200 p-4 mb-4`} data-section-id={section.id} data-section-type={section.type} style={inlineStyle}>
      {css ? <style>{css}</style> : null}
      <div className="section-header mb-2">
        <h3 className="font-semibold text-sm">{section.type}</h3>
      </div>

      {/* 根据组件类型渲染 */}
      {section.type === 'ProductGrid' && (
        <ProductGridRenderer
          section={section}
          data={data}
          loading={loading}
          error={error}
        />
      )}
      {section.type === 'CollectionList' && (
        <CollectionListRenderer
          section={section}
          data={data}
          loading={loading}
          error={error}
        />
      )}
      {section.type === 'Hero' && <HeroRenderer section={section} />}
      {section.type === 'Header' && <HeaderRenderer section={section} />}
      {section.type === 'Footer' && <FooterRenderer section={section} />}
      {section.type === 'BrandStory' && <BrandStoryRenderer section={section} />}
      {section.type === 'Announcement' && (
        <AnnouncementRenderer section={section} />
      )}

      {/* 其他组件类型... */}
      {![
        'ProductGrid',
        'CollectionList',
        'Hero',
        'Header',
        'Footer',
        'BrandStory',
        'Announcement'
      ].includes(section.type) && (
        <div className="p-2 text-gray-500 text-sm">
          Component {section.type} not yet implemented
        </div>
      )}
    </div>
  )
}

// 各组件具体渲染逻辑

function ProductGridRenderer({ section, data, loading, error }: any) {
  if (loading) return <div className="p-4 text-gray-500">Loading products...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  const columns = section.props?.columns || 4
  const colsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-2'
        : columns === 3
          ? 'grid-cols-3'
          : 'grid-cols-4'

  return (
    <div className={`grid ${colsClass} gap-4`}>
      {(data || []).map((product: any) => (
        <div key={product.id} className="border p-3 rounded">
          <div className="font-semibold text-sm">{product.title}</div>
          <div className="text-xs text-gray-600">${product.price}</div>
        </div>
      ))}
    </div>
  )
}

function CollectionListRenderer({ section, data, loading, error }: any) {
  if (loading) return <div className="p-4 text-gray-500">Loading collections...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="flex gap-3 flex-wrap">
      {(data || []).map((collection: any) => (
        <div
          key={collection.id}
          className="px-3 py-2 border rounded bg-gray-50 text-sm"
        >
          {collection.title}
        </div>
      ))}
    </div>
  )
}

function HeroRenderer({ section }: any) {
  const { title, subtitle, background } = section.props || {}
  return (
    <div
      className="p-8 text-center rounded bg-gradient-to-r from-gray-100 to-gray-50"
      style={background ? { backgroundImage: `url(${background})` } : {}}
    >
      <h2 className="text-2xl font-bold mb-2">{title || 'Hero Title'}</h2>
      <p className="text-gray-600">{subtitle || 'Subtitle'}</p>
    </div>
  )
}

function HeaderRenderer({ section }: any) {
  const { logo, show_search } = section.props || {}
  return (
    <div className="border-b p-4 flex justify-between items-center">
      <div className="font-bold">{logo || 'Logo'}</div>
      {show_search && <input className="border px-2 py-1" placeholder="Search" />}
    </div>
  )
}

function FooterRenderer({ section }: any) {
  const { show_payment_icons } = section.props || {}
  return (
    <div className="border-t p-4 bg-gray-50 text-center text-sm">
      <p>© 2024 Store. {show_payment_icons && 'Payment icons shown.'}</p>
    </div>
  )
}

function BrandStoryRenderer({ section }: any) {
  const { title, body } = section.props || {}
  return (
    <div className="p-8 bg-white">
      <h3 className="text-xl font-bold mb-4">{title || 'Brand Story'}</h3>
      <p className="text-gray-700">{body || 'Your brand story goes here.'}</p>
    </div>
  )
}

function AnnouncementRenderer({ section }: any) {
  const { message, visible } = section.props || {}
  if (!visible) return null
  return (
    <div className="p-3 bg-blue-100 text-blue-800 text-center text-sm">
      {message || 'Announcement'}
    </div>
  )
}

export default SectionRenderer
