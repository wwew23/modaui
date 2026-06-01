'use client'

'use client'

import React, { useEffect, useState } from 'react'
import { Section, ComponentRegistry } from '../theme-runtime/types'
import SchemaForm from './schemaForm'
import StylePanel from './StylePanel'

interface CollectionItem { id: string; title: string; handle?: string }

interface SectionEditorProps {
  section: Section
  onChange: (s: Section) => void
  registry?: ComponentRegistry
}

export function SectionEditor({ section, onChange, registry }: SectionEditorProps) {
  const [props, setProps] = useState(section.props || {})
  const [binding, setBinding] = useState(section.binding || undefined)
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [componentSchema, setComponentSchema] = useState<any>(null)
  const [bindingSchema, setBindingSchema] = useState<any>(null)
  const [uiHints, setUiHints] = useState<any>(null)
  const [tokens, setTokens] = useState<any>(null)
  const [styleState, setStyleState] = useState<any>(section.style || {})
  const [error, setError] = useState<string | null>(null)

  const REAL_DATA_ONLY = process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true'

  useEffect(() => {
    setProps(section.props || {})
    setBinding(section.binding)
    setStyleState(section.style || {})

    // load collections for visual selector
    fetch('/api/collections?store_id=1')
      .then(r => r.json())
      .then((data: CollectionItem[]) => setCollections(data || []))
      .catch((e) => {
        if (REAL_DATA_ONLY) setError('NO DATA SOURCE CONNECTED: collections')
        else setCollections([])
      })

    // load component schema from registry if provided
    if (registry) {
      const comp = registry.components.find(c => c.name === section.type)
        if (comp) {
        setComponentSchema(comp.schema)
        setBindingSchema(comp.bindingSchema)
        setUiHints(comp.uiHints)
      }
    } else {
      // fallback: try fetch registry from API
      fetch('/api/components')
        .then(r => r.json())
          .then((data: ComponentRegistry) => {
            const comp = data.components.find(c => c.name === section.type)
            if (comp) {
              setComponentSchema(comp.schema)
              setBindingSchema(comp.bindingSchema)
              setUiHints(comp.uiHints)
            }
          })
          .catch((e) => {
            if (REAL_DATA_ONLY) setError('NO DATA SOURCE CONNECTED: component registry')
          })
    }
    // load tokens
    fetch('/theme-tokens.json')
      .then(r => r.json())
      .then(t => setTokens(t))
      .catch((e) => {
        if (REAL_DATA_ONLY) setError('NO DATA SOURCE CONNECTED: theme tokens')
        else setTokens(null)
      })
  }, [section, registry])

  if (error) {
    return (
      <div className="p-4 border rounded bg-white text-red-600">
        <strong>Data error:</strong> {error}
      </div>
    )
  }

  function save() {
    onChange({ ...section, props, binding, style: styleState })
  }

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-semibold mb-2">Editing: {section.type}</h3>

      {componentSchema ? (
        <div className="mb-3">
          <SchemaForm schema={componentSchema} value={props} onChange={v => setProps(v)} uiHints={uiHints} tokens={tokens} />
        </div>
      ) : (
        <div className="mb-3 text-sm text-gray-500">No schema available for this component.</div>
      )}

      {/* Binding editor driven by bindingSchema */}
      <div className="mb-3">
        <label className="text-xs text-gray-600">Binding Source</label>
        <select
          value={(binding && (binding as any).source) || ''}
          onChange={e => setBinding({ ...(binding || {}), source: e.target.value })}
          className="w-full border px-2 py-1 text-sm mt-1"
        >
          <option value="">-- none --</option>
          {bindingSchema && bindingSchema.properties && bindingSchema.properties.source && bindingSchema.properties.source.enum ? (
            bindingSchema.properties.source.enum.map((opt: any) => (
              <option key={opt} value={opt}>{opt}</option>
            ))
          ) : (
            <>
              <option value="collection">collection</option>
              <option value="manual">manual</option>
              <option value="all">all</option>
            </>
          )}
        </select>
      </div>

      {/* Style panel */}
      <div className="mb-3">
        <label className="text-xs text-gray-600">Style</label>
        <StylePanel style={styleState} tokens={tokens} onChange={(s: any) => setStyleState(s)} />
      </div>

      {binding && (binding as any).source === 'collection' && (
        <div className="mb-3">
          <label className="text-xs text-gray-600">Collection</label>
          <select
            value={(binding as any).collection_id || ''}
            onChange={e => setBinding({ ...(binding || {}), collection_id: e.target.value })}
            className="w-full border px-2 py-1 text-sm mt-1"
          >
            <option value="">-- select collection --</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.handle || c.id})</option>
            ))}
          </select>
        </div>
      )}

      {binding && (binding as any).source === 'manual' && (
        <div className="mb-3">
          <label className="text-xs text-gray-600">Product IDs (comma separated)</label>
          <input
            value={((binding as any).ids || []).join(',')}
            onChange={e => setBinding({ ...(binding || {}), ids: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full border px-2 py-1 text-sm mt-1"
            placeholder="p1,p2"
          />
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => { setStyleState(styleState); save(); }}>Save</button>
      </div>
    </div>
  )
}

export default SectionEditor
