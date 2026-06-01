'use client'
import React, { useEffect, useState } from 'react'

type HistoryEntry = {
  id: string
  type?: string
  stepId?: string
  instruction?: string
  patches?: any
  snapshot?: string
  timestamp?: string
}

export default function AssistantTimeline({ templateKey = 'test-theme' }: { templateKey?: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [memory, setMemory] = useState<any>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai-setup/history?key=${templateKey}`)
      const j = await res.json()
      if (j.ok) {
        setHistory(j.history || [])
        setMemory(j.memory || {})
      } else {
        setError(j.error || 'failed')
      }
    } catch (e: any) {
      setError(String(e))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [templateKey])

  async function action(act: 'undo' | 'approve' | 'restore', entryId?: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-setup/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: act, key: templateKey, entryId }) })
      const j = await res.json()
      if (j.ok) await load()
      else setError(j.error || 'action failed')
    } catch (e: any) { setError(String(e)) }
    setLoading(false)
  }

  return (
    <div style={{padding:12, maxWidth:420}}>
      <h3>AI Patch Timeline</h3>
      <div style={{fontSize:12, color:'#666'}}>Brand memory: {JSON.stringify(memory)}</div>
      <div style={{marginTop:8}}>
        {loading && <div>Loading…</div>}
        {error && <div style={{color:'red'}}>{error}</div>}
        {history.length === 0 && !loading && <div style={{color:'#888'}}>No history yet</div>}
        <ul style={{listStyle:'none', padding:0}}>
          {history.slice().reverse().map((h) => (
            <li key={h.id} style={{padding:8, borderBottom:'1px solid #eee'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:13, fontWeight:600}}>{h.stepId || h.type || 'AI'}</div>
                  <div style={{fontSize:12, color:'#444'}}>{h.instruction || (h.type === 'approval' ? 'approved' : '')}</div>
                  <div style={{fontSize:11, color:'#888'}}>{h.timestamp}</div>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={() => setExpanded(expanded === h.id ? null : h.id)}>Preview</button>
                  <button onClick={() => action('restore', h.id)}>Restore</button>
                  <button onClick={() => action('approve', h.id)}>Approve</button>
                </div>
              </div>
              {expanded === h.id && (
                <div style={{marginTop:8, background:'#f9f9f9', padding:8}}>
                  <div style={{fontSize:12, color:'#222'}}>Patches:</div>
                  <pre style={{fontSize:11, maxHeight:200, overflow:'auto'}}>{JSON.stringify(h.patches, null, 2)}</pre>
                  {h.snapshot && <div style={{fontSize:12}}>Snapshot: {h.snapshot}</div>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div style={{marginTop:12, display:'flex', gap:8}}>
        <button onClick={() => action('undo')}>Undo Last</button>
        <button onClick={() => load()}>Refresh</button>
      </div>
    </div>
  )
}
