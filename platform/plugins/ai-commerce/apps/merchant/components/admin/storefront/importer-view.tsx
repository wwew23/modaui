"use client"

import { useState } from "react"
import { Upload, GitBranch, FileZip, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ImporterView({ onImported }: { onImported: (payload: any) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<any[] | null>(null)
  const [selectedError, setSelectedError] = useState<any | null>(null)
  const [previewSnippet, setPreviewSnippet] = useState<string | null>(null)

  async function postUpload(payload: any) {
    setLoading(true)
    setMessage(null)
    setErrors(null)
    try {
      const resp = await fetch('/api/theme-importer/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await resp.json()
      if (!resp.ok) {
        // data may contain structured errors
        if (data?.errors) {
          setErrors(data.errors)
          setMessage('导入存在问题')
          return { ok: false, data }
        }
        throw new Error(data?.error || '导入失败')
      }
      // success, may include warnings
      if (data.warnings && data.warnings.length) {
        setErrors(data.warnings)
        setMessage('已解析，但存在警告')
      }
      setMessage('导入完成')
      return { ok: true, data }
    } catch (e: any) {
      setMessage(e?.message || '上传失败')
      return { ok: false }
    } finally { setLoading(false) }
  }

  async function uploadFile() {
    if (!file) return
    const buf = await file.arrayBuffer()
    const b64 = Buffer.from(buf).toString('base64')
    const result = await postUpload({ name: file.name.replace(/\.zip$/i, ''), fileBase64: b64 })
    if (result.ok && result.data) {
      onImported({ template: result.data.template, key: result.data.key })
    }
  }

  async function importFromUrl() {
    if (!url) return
    const result = await postUpload({ name: 'imported-theme', url })
    if (result.ok && result.data) {
      onImported({ template: result.data.template, key: result.data.key })
    }
  }

  async function autoFix() {
    // request autofix
    setLoading(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/theme-importer/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file ? file.name.replace(/\.zip$/i,'') : 'imported-theme', fileBase64: file ? Buffer.from(await file.arrayBuffer()).toString('base64') : undefined, url: !file ? url : undefined, autoFix: true })
      })
      const data = await resp.json()
      if (!resp.ok) {
        if (data?.errors) { setErrors(data.errors); setMessage('修复后仍存在问题'); return }
        throw new Error(data?.error || 'Auto-fix 失败')
      }
      if (data.fixes) {
        setMessage('已自动修复')
      }
      onImported({ template: data.template, key: data.key, fixes: data.fixes })
    } catch (e: any) {
      setMessage(e?.message || 'Auto-fix 失败')
    } finally { setLoading(false) }
  }

  function handleErrorClick(err: any) {
    setSelectedError(err)
    // focus preview snippet: if err.section present, try to show template.content for that section
    if (err && err.section) {
      setPreviewSnippet(JSON.stringify({ section: err.section }, null, 2))
      // also notify parent to open editor focused on section
      // call onImported with selectSection
      // NOTE: parent storefront-view handles object with selectSection
      // not automatically importing until user chooses Continue
    } else {
      setPreviewSnippet(null)
    }
  }

  function canContinueDespiteWarnings() {
    if (!errors) return true
    return errors.every(e => e.severity !== 'fatal')
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">模板导入器</h2>
        <p className="text-sm text-muted-foreground">上传 Shopify 主题 ZIP 或提供 GitHub/HTTP 链接以导入模板并进入 AI 工作室。</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="p-4 border border-border rounded-lg mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="h-4 w-4" />
                <div className="text-sm font-medium">上传 ZIP</div>
              </div>
              <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
              <div className="mt-3 flex gap-2">
                <Button onClick={uploadFile} disabled={!file || loading}>{loading ? '上传中...' : '上传并解析'}</Button>
                <Button variant="outline" onClick={() => { setFile(null); setMessage(null); setErrors(null) }}>清除</Button>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <GitBranch className="h-4 w-4" />
                <div className="text-sm font-medium">GitHub / URL</div>
              </div>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/owner/repo or theme zip url" className="w-full p-2 rounded-md bg-muted border border-border" />
              <div className="mt-3 flex gap-2">
                <Button onClick={importFromUrl} disabled={!url || loading}>{loading ? '导入中...' : '导入并解析'}</Button>
                <Button variant="outline" onClick={() => { setUrl(''); setErrors(null); setMessage(null) }}>清除</Button>
              </div>
            </div>

            {message && <div className="text-sm mt-2">{message}</div>}

            {errors && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">检测到问题</div>
                <div className="space-y-2 max-h-72 overflow-auto">
                  {errors.map((err, i) => (
                    <button key={i} onClick={() => handleErrorClick(err)} className={`w-full text-left p-2 rounded-lg border ${err.severity === 'fatal' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium">{err.type}</div>
                        <div className="text-[10px] text-muted-foreground">{err.severity}</div>
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-1">{err.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{err.section || err.field || ''} {err.file ? `· ${err.file}` : ''}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <Button onClick={autoFix} disabled={loading}>Auto Fix</Button>
                  <Button onClick={() => { if (canContinueDespiteWarnings()) onImported({ template: null, continueWithWarnings: true }) }} disabled={!canContinueDespiteWarnings()}>继续（仅警告）</Button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="p-4 border border-border rounded-lg h-full flex flex-col">
              <div className="text-sm font-medium mb-2">预览 / 源片段</div>
              <div className="flex-1 overflow-auto text-xs bg-muted p-3 rounded-md">
                {selectedError ? (
                  <pre>{previewSnippet || JSON.stringify(selectedError, null, 2)}</pre>
                ) : (
                  <div className="text-muted-foreground">点击左侧问题查看相关片段</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
