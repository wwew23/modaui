'use client'

import React, { useEffect, useState } from 'react'
import PuckCanvas from '@/lib/puck/PuckCanvas'
import SectionEditor from '@/lib/puck/SectionEditor'
import StoreRenderer from '@/lib/store-renderer/StoreRenderer'
import { StoreDSL, ComponentRegistry, Section } from '@/lib/theme-runtime/types'

export default function AICanvasPage() {
  const storeId = '1'
  const [dsl, setDsl] = useState<StoreDSL | null>(null)
  const [registry, setRegistry] = useState<ComponentRegistry | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // load registry
    fetch('/api/components')
      .then(r => r.json())
      .then(setRegistry)
      .catch(console.error)

    // try load saved theme
    fetch(`/api/stores/${storeId}/theme`)
      .then(r => {
        if (!r.ok) return null
        return r.json()
      })
      .then(data => {
        if (data) setDsl(data)
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    if (!dsl) return
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dsl)
      })
      if (!res.ok) throw new Error('save failed')
      alert('Saved')
    } catch (err) {
      alert('Save failed: ' + (err as any).message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish() {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${storeId}/theme/publish`, { method: 'POST' })
      if (!res.ok) throw new Error('publish failed')
      alert('Published')
    } catch (err) {
      alert('Publish failed: ' + (err as any).message)
    } finally {
      setLoading(false)
    }
  }

  if (!registry) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex gap-6">
      <div style={{ width: 380 }} className="bg-white border p-4">
        <h2 className="font-bold mb-4">AI 工作室 — AI 画布</h2>
        <div className="mb-4">
          <button className="px-3 py-2 bg-blue-600 text-white rounded mr-2" onClick={handleSave} disabled={!dsl || loading}>Save</button>
          <button className="px-3 py-2 border rounded" onClick={handlePublish} disabled={!dsl || loading}>Publish</button>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Section Editor</h3>
          {selectedSection ? (
            <SectionEditor
              section={selectedSection}
              registry={registry}
              onChange={(s: Section) => {
                setDsl(d => d ? { ...d, sections: d.sections.map(ss => ss.id === s.id ? s : ss) } : null)
                setSelectedSection(s)
              }}
            />
          ) : (
            <div className="text-sm text-gray-500">Select a section to edit</div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Registry</h3>
          <div className="text-xs text-gray-600">
            {registry.components.map(c => (
              <div key={c.name} className="py-1">{c.name} — {c.category}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border p-4">
        <h3 className="font-semibold mb-4">Canvas</h3>
        {dsl ? (
          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <PuckCanvas
                dsl={dsl}
                registry={registry}
                storeId={storeId}
                onChange={d => setDsl(d)}
                onSelectSection={id => {
                  const sec = id ? dsl?.sections.find(s => s.id === id) || null : null
                  setSelectedSection(sec)
                }}
              />
            </div>
            <div style={{ width: 380 }}>
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <StoreRenderer dsl={dsl} registry={registry} storeId={storeId} />
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No theme loaded. Generate a theme in AI then open this canvas.</div>
        )}
      </div>
    </div>
  )
}
