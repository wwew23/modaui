'use client'

import React from 'react'

interface SchemaFormProps {
  schema: any
  value: Record<string, any>
  onChange: (v: Record<string, any>) => void
  uiHints?: Record<string, any>
  tokens?: any
}

function guessFieldType(name: string, propSchema: any) {
  if (propSchema.enum) return 'select'
  if (propSchema.type === 'boolean') return 'checkbox'
  if (propSchema.type === 'integer' || propSchema.type === 'number') return 'number'
  if (name.toLowerCase().includes('body') || name.toLowerCase().includes('description')) return 'textarea'
  if (name.toLowerCase().includes('image') || name.toLowerCase().includes('logo') || name.toLowerCase().includes('background')) return 'image'
  if (name.toLowerCase().includes('color')) return 'color'
  return 'text'
}

export function SchemaForm({ schema, value, onChange, uiHints, tokens }: SchemaFormProps) {
  if (!schema || !schema.properties) return null

  const props = schema.properties

  function setProp(k: string, v: any) {
    onChange({ ...(value || {}), [k]: v })
  }

  return (
    <div className="schema-form space-y-3">
      {Object.keys(props).map(key => {
        const propSchema = props[key]
        const hint = uiHints && uiHints[key]
        const fieldType = hint && hint.widget ? hint.widget : guessFieldType(key, propSchema)
        const cur = (value && value[key]) ?? ''

        // enum -> select
        if (propSchema.enum) {
          return (
            <div key={key}>
              <label className="text-xs text-gray-600">{key}</label>
              <select className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, e.target.value)}>
                <option value="">--</option>
                {propSchema.enum.map((opt: any) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )
        }

        switch (fieldType) {
          case 'textarea':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <textarea className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, e.target.value)} />
              </div>
            )
          case 'number':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <input type="number" className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, Number(e.target.value))} />
              </div>
            )
          case 'checkbox':
            return (
              <div key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={!!cur} onChange={e => setProp(key, e.target.checked)} />
                <label className="text-xs text-gray-600">{key}</label>
              </div>
            )
          case 'image':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key} (image URL)</label>
                <input className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, e.target.value)} placeholder="https://..." />
                <div className="mt-2">
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const reader = new FileReader()
                    reader.onload = () => setProp(key, reader.result)
                    reader.readAsDataURL(f)
                  }} />
                </div>
                {cur && <div className="mt-2"><img src={String(cur)} alt={key} style={{ maxWidth: 200 }} /></div>}
              </div>
            )
          case 'select':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <select className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, e.target.value)}>
                  <option value="">--</option>
                  {(hint && hint.options || propSchema.enum || []).map((opt: any) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )
          case 'slider':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}: {cur}</label>
                <input type="range" min={hint?.min ?? 0} max={hint?.max ?? 10} value={cur || 0} onChange={e => setProp(key, Number(e.target.value))} />
              </div>
            )
          case 'spacing':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key} (spacing)</label>
                <select className="w-full border px-2 py-1 mt-1 text-sm" value={cur || ''} onChange={e => setProp(key, e.target.value)}>
                  <option value="">--</option>
                  {tokens && tokens.spacing ? Object.keys(tokens.spacing).map(k => (
                    <option key={k} value={tokens.spacing[k]}>{k} ({tokens.spacing[k]})</option>
                  )) : null}
                </select>
              </div>
            )
          case 'color':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <input type="color" className="w-12 h-8 p-0 mt-1" value={cur || '#000000'} onChange={e => setProp(key, e.target.value)} />
                {tokens && tokens.colors && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {Object.keys(tokens.colors).map(k => (
                      <button key={k} className="w-6 h-6 rounded" style={{ background: tokens.colors[k] }} onClick={() => setProp(key, tokens.colors[k])} title={`${k}: ${tokens.colors[k]}`} />
                    ))}
                  </div>
                )}
              </div>
            )
          case 'align':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <select className="w-full border px-2 py-1 mt-1 text-sm" value={cur || ''} onChange={e => setProp(key, e.target.value)}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )
          case 'typography':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key} (typography)</label>
                <select className="w-full border px-2 py-1 mt-1 text-sm" value={cur || ''} onChange={e => setProp(key, e.target.value)}>
                  {tokens && tokens.typography ? Object.keys(tokens.typography).map(k => (
                    <option key={k} value={JSON.stringify(tokens.typography[k])}>{k}</option>
                  )) : <option value="">default</option>}
                </select>
              </div>
            )
          case 'icon':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key} (icon name)</label>
                <input className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, e.target.value)} placeholder="icon-name" />
              </div>
            )
          case 'color':
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <input type="color" className="w-12 h-8 p-0 mt-1" value={cur || '#000000'} onChange={e => setProp(key, e.target.value)} />
              </div>
            )
          default:
            return (
              <div key={key}>
                <label className="text-xs text-gray-600">{key}</label>
                <input className="w-full border px-2 py-1 mt-1 text-sm" value={cur} onChange={e => setProp(key, e.target.value)} />
              </div>
            )
        }
      })}
    </div>
  )
}

export default SchemaForm
