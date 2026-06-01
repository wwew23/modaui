"use client"

import { Check, X, ChevronRight, FileJson, Layers, Tag, Palette } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface DiffItem {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy'
  path: string
  oldValue?: any
  newValue?: any
  scope: string
}

export interface DiffExplainerProps {
  patches: DiffItem[]
  description?: string
  actor?: string
}

export function DiffExplainer({ patches = [], description, actor = 'AI Agent' }: DiffExplainerProps) {
  const getIcon = (scope: string) => {
    switch (scope) {
      case 'tokens': return <Palette className="h-3.5 w-3.5" />
      case 'content': return <FileJson className="h-3.5 w-3.5" />
      case 'structure': return <Layers className="h-3.5 w-3.5" />
      default: return <Tag className="h-3.5 w-3.5" />
    }
  }

  const formatPath = (path: string) => {
    return path.split('/').filter(Boolean).join(' → ')
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5 h-4">
            {actor}
          </Badge>
          <span className="text-xs font-medium text-foreground">{description || '变更详情'}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{patches.length} 处变更</span>
      </div>
      
      <div className="divide-y divide-border max-h-[300px] overflow-auto">
        {patches.map((patch, i) => (
          <div key={i} className="px-3 py-2.5 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 p-1 rounded ${
                patch.op === 'replace' ? 'bg-blue-500/10 text-blue-500' :
                patch.op === 'add' ? 'bg-green-500/10 text-green-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {getIcon(patch.scope)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">
                    {formatPath(patch.path)}
                  </span>
                  <Badge variant="secondary" className="text-[9px] h-3.5 px-1 uppercase">
                    {patch.op}
                  </Badge>
                </div>

                <div className="space-y-1">
                  {patch.oldValue !== undefined && (
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <X className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                      <span className="text-muted-foreground line-through truncate">
                        {typeof patch.oldValue === 'object' ? JSON.stringify(patch.oldValue) : String(patch.oldValue)}
                      </span>
                    </div>
                  )}
                  {patch.newValue !== undefined && (
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <Check className="h-3 w-3 mt-0.5 text-success shrink-0" />
                      <span className="text-foreground font-medium truncate">
                        {typeof patch.newValue === 'object' ? JSON.stringify(patch.newValue) : String(patch.newValue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
