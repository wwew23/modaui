"use client"

import { useState } from "react"
import { Send, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Patch { sectionId: string; changes: { props?: any; style?: any; binding?: any } }

export function TemplateAssistantPanel({
  templateId,
  store,
  onApply,
  onClose,
}: {
  templateId: string
  store: any
  onApply: (patches: Patch[]) => void
  onClose: () => void
}) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [patches, setPatches] = useState<Patch[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setPatches(null)
    try {
      const resp = await fetch('/api/template-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, instruction: input.trim(), context: { store } })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'AI error')
      const patch = data.patch || data.patches || data
      setPatches(patch)
    } catch (e: any) {
      setError(e?.message || '请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[360px] h-full border-l border-border bg-card flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center text-background">AI</div>
          <div>
            <div className="text-sm font-semibold">Template Assistant</div>
            <div className="text-[10px] text-muted-foreground">保持主题风格，只输出 DSL Patch</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="mb-3 text-xs text-muted-foreground">示例指令："更高级", "像 Apple", "留白更多", "珠宝风格"</div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入样式/风格指令..."
          className="w-full h-24 p-2 text-sm rounded-md bg-muted border border-border resize-none"
        />

        <div className="mt-3 flex gap-2">
          <Button onClick={send} disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 生成中...</> : <><Send className="h-4 w-4 mr-2" /> 生成 Patch</>}
          </Button>
          <Button variant="outline" onClick={() => { setInput('更像 Apple'); setPatches(null); setError(null); }}>
            快捷
          </Button>
        </div>

        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

        {patches && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">生成的 Patch</div>
            <pre className="bg-muted p-3 rounded-md text-xs max-h-64 overflow-auto">{JSON.stringify(patches, null, 2)}</pre>
            <div className="flex gap-2 mt-3">
              <Button onClick={() => onApply(patches)} className="flex-1">Apply Patch</Button>
              <Button variant="outline" onClick={() => { setPatches(null); setError(null); }}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
