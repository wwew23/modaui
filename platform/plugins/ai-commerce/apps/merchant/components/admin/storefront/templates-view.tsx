"use client"

import { useState } from "react"
import { Check, Heart, Eye, Plus, Sparkles, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllTemplates } from "@/lib/component-registry"
import { PuckEditor } from "../puck-editor"

export function TemplatesView() {
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)
  const templates = getAllTemplates()

  const toggleFavorite = (id: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const enableTemplate = (template: any) => {
    setSelectedTemplate(template)
    setShowEditor(true)
  }

  if (showEditor && selectedTemplate) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowEditor(false)}>
                ← 返回模板库
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{selectedTemplate.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <PuckEditor initialData={selectedTemplate.data} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">高级时尚模板库</h1>
          <p className="text-sm text-muted-foreground mt-1">选择精美的时尚电商模板，一键启用</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          创建自定义模板
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.key} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl group-hover:scale-110 transition-transform">{template.icon}</span>
              </div>
              <button 
                onClick={() => toggleFavorite(template.key)}
                className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 ${favoriteTemplates.includes(template.key) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </button>
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  高级
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
                </div>
                <Badge variant="outline" className="shrink-0">时尚</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {template.tags.map((tag: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Eye className="h-4 w-4" />
                预览
              </Button>
              <Button 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => enableTemplate(template)}
              >
                <Edit3 className="h-4 w-4" />
                编辑
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
