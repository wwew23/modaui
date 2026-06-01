'use client'

import React, { useState } from 'react'
import { StoreDSL, ComponentRegistry, Section } from '../theme-runtime/types'
import SectionRenderer from '../section-renderer/SectionRenderer'

interface PuckCanvasProps {
  dsl: StoreDSL
  registry: ComponentRegistry
  storeId: string
  token?: string
  onChange?: (dsl: StoreDSL) => void
  onSelectSection?: (sectionId: string | null) => void
}

export function PuckCanvas({ dsl, registry, storeId, token, onChange }: PuckCanvasProps) {
  const [localDsl, setLocalDsl] = useState<StoreDSL>(dsl)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  // reorder sections within first page
  const page = localDsl.pages?.[0]
  const sectionsMap = new Map(localDsl.sections.map(s => [s.id, s]))

  function updateSectionsOrder(newOrder: string[]) {
    const newPage = Object.assign({}, page, { sections: newOrder })
    const newPages = localDsl.pages.map(p => (p.id === page.id ? newPage : p))
    const newDsl = Object.assign({}, localDsl, { pages: newPages })
    setLocalDsl(newDsl)
    onChange?.(newDsl)
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/section-id', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    const srcId = e.dataTransfer.getData('text/section-id')
    if (!srcId || !page) return
    const order = page.sections.filter(Boolean)
    const srcIndex = order.indexOf(srcId)
    const targetIndex = order.indexOf(targetId)
    if (srcIndex === -1 || targetIndex === -1) return
    order.splice(srcIndex, 1)
    order.splice(targetIndex, 0, srcId)
    updateSectionsOrder(order)
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault()
  }

  function removeSection(id: string) {
    const newSections = localDsl.sections.filter(s => s.id !== id)
    const newPages = localDsl.pages.map(p => ({
      ...p,
      sections: p.sections.filter(sid => sid !== id)
    }))
    const newDsl = { ...localDsl, sections: newSections, pages: newPages }
    setLocalDsl(newDsl)
    onChange?.(newDsl)
  }

  function selectSection(id: string) {
    setSelectedSectionId(id)
    onSelectSection?.(id)
  }

  function updateSection(updated: Section) {
    const newSections = localDsl.sections.map(s => (s.id === updated.id ? updated : s))
    const newDsl = { ...localDsl, sections: newSections }
    setLocalDsl(newDsl)
    onChange?.(newDsl)
  }

  function addSection(type: string) {
    const id = `s_${Date.now()}`
    const newSection: Section = {
      id,
      type,
      props: {},
      binding: undefined
    }
    const newSections = [...localDsl.sections, newSection]
    const newPages = localDsl.pages.map(p => ({ ...p, sections: [...p.sections, id] }))
    const newDsl = { ...localDsl, sections: newSections, pages: newPages }
    setLocalDsl(newDsl)
    onChange?.(newDsl)
    setSelectedSectionId(id)
    onSelectSection?.(id)
  }

  return (
    <div className="puck-canvas">
      <div className="p-2 mb-4 flex gap-2">
        <label className="text-sm font-medium">Add Section:</label>
        {registry.components.map(c => (
          <button
            key={c.name}
            className="px-2 py-1 border rounded text-sm bg-white"
            onClick={() => addSection(c.name)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="sections-list space-y-4">
        {page.sections.map(sid => {
          const sec = sectionsMap.get(sid)
          if (!sec) return null
          return (
            <div
              key={sec.id}
              draggable
              onDragStart={e => onDragStart(e, sec.id)}
              onDragOver={allowDrop}
              onDrop={e => onDrop(e, sec.id)}
              className={`p-2 border ${selectedSectionId === sec.id ? 'border-blue-600' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold">{sec.type}</div>
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 border rounded" onClick={() => selectSection(sec.id)}>Edit</button>
                  <button className="text-xs px-2 py-1 border rounded" onClick={() => removeSection(sec.id)}>Remove</button>
                </div>
              </div>

              <SectionRenderer section={sec} registry={registry} storeId={storeId} token={token} />
            </div>
          )
        })}
      </div>

      {/* Editor slot */}
      <div className="mt-6">
        {selectedSectionId ? (
          <div data-puck-editor>
            {/* We'll let parent supply editor component via props or consumer can render SectionEditor */}
            <p className="text-sm text-gray-600">Select a section editor from the right panel.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">Select a section to edit its props and binding.</p>
        )}
      </div>
    </div>
  )
}

export default PuckCanvas
