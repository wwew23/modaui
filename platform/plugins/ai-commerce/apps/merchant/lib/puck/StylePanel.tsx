'use client'

import React, { useState } from 'react'
import { SectionStyle } from '../theme-runtime/types'

interface StylePanelProps {
  style?: SectionStyle
  tokens?: any
  onChange: (s: SectionStyle) => void
}

const breakpoints = ['desktop', 'tablet', 'mobile'] as const

export function StylePanel({ style, tokens, onChange }: StylePanelProps) {
  const [activeBp, setActiveBp] = useState<'desktop'|'tablet'|'mobile'>('desktop')

  function setStyleProp(prop: keyof SectionStyle, value: any) {
    const next = { ...(style || {}) }
    next[prop] = { ...(next[prop] || {}), [activeBp]: value }
    onChange(next)
  }

  function getStyleProp(prop: keyof SectionStyle) {
    return (style && style[prop] && (style as any)[prop][activeBp]) || ''
  }

  return (
    <div className="p-3 border rounded bg-white">
      <div className="mb-3 flex gap-2">
        {breakpoints.map(bp => (
          <button key={bp} className={`px-2 py-1 rounded ${activeBp===bp? 'bg-blue-600 text-white':'bg-gray-100'}`} onClick={() => setActiveBp(bp)}>{bp}</button>
        ))}
      </div>

      <div className="space-y-3">
        {/* Spacing: padding */}
        <div>
          <label className="text-xs text-gray-600">Padding</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('padding') || ''} onChange={e => setStyleProp('padding', e.target.value)}>
            <option value="">--</option>
            {tokens && tokens.spacing ? Object.keys(tokens.spacing).map(k => <option key={k} value={k}>{k} ({tokens.spacing[k]})</option>) : null}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Margin</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('margin') || ''} onChange={e => setStyleProp('margin', e.target.value)}>
            <option value="">--</option>
            {tokens && tokens.spacing ? Object.keys(tokens.spacing).map(k => <option key={k} value={k}>{k} ({tokens.spacing[k]})</option>) : null}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Radius</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('radius') || ''} onChange={e => setStyleProp('radius', e.target.value)}>
            <option value="">--</option>
            {tokens && tokens.radius ? Object.keys(tokens.radius).map(k => <option key={k} value={k}>{k} ({tokens.radius[k]})</option>) : null}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Background Color</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('background') || ''} onChange={e => setStyleProp('background', e.target.value)}>
            <option value="">--</option>
            {tokens && tokens.colors ? Object.keys(tokens.colors).map(k => <option key={k} value={k}>{k} ({tokens.colors[k]})</option>) : null}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Text Color</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('textColor') || ''} onChange={e => setStyleProp('textColor', e.target.value)}>
            <option value="">--</option>
            {tokens && tokens.colors ? Object.keys(tokens.colors).map(k => <option key={k} value={k}>{k}</option>) : null}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Align</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('align') || ''} onChange={e => setStyleProp('align', e.target.value)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Container Width</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('containerWidth') || ''} onChange={e => setStyleProp('containerWidth', e.target.value)}>
            <option value="">Full</option>
            <option value="1200px">1200px</option>
            <option value="960px">960px</option>
            <option value="720px">720px</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Gap</label>
          <select className="w-full border px-2 py-1 mt-1 text-sm" value={getStyleProp('gap') || ''} onChange={e => setStyleProp('gap', e.target.value)}>
            <option value="">--</option>
            {tokens && tokens.spacing ? Object.keys(tokens.spacing).map(k => <option key={k} value={k}>{k} ({tokens.spacing[k]})</option>) : null}
          </select>
        </div>
      </div>
    </div>
  )
}

export default StylePanel
