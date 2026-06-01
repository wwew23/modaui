"use client"

import { useState } from "react"
import {
  Sparkles,
  Layout,
  Palette,
  Image,
  Type,
  Grid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PuckEditor } from "./puck-editor"
import { getAllTemplates } from "@/lib/component-registry"

// AI 工具
const aiTools = [
  { 
    id: "canvas", 
    name: "AI 画布", 
    description: "一句话生成页面，实时编辑", 
    icon: Layout,
    isNew: true 
  },
  { 
    id: "templates", 
    name: "模板库", 
    description: "选择高级时尚模板", 
    icon: Grid,
    isNew: true 
  },
  { 
    id: "brand", 
    name: "品牌生成", 
    description: "Logo、品牌色、Typography", 
    icon: Palette 
  },
  { 
    id: "visual", 
    name: "视觉生成", 
    description: "Banner、商品图、Campaign图", 
    icon: Image 
  },
  { 
    id: "copy", 
    name: "文案生成", 
    description: "商品文案、营销文案、SEO", 
    icon: Type 
  },
]

export function AIStudioView() {
  const [activeTab, setActiveTab] = useState<"canvas" | "templates" | "brand" | "visual" | "copy">("templates")
  const [showEditor, setShowEditor] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const templates = getAllTemplates()

  const selectTemplate = (template: any) => {
    setSelectedTemplate(template)
    setShowEditor(true)
  }

  if (showEditor && selectedTemplate) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowEditor(false)}>
                ← 返回
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
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">AI 工作室</h1>
                <p className="text-sm text-muted-foreground mt-0.5">高级时尚电商生成器</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 flex items-center gap-1">
          {aiTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id as typeof activeTab)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative
                  ${activeTab === tool.id 
                    ? "bg-background text-foreground border-t border-l border-r border-border -mb-px" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tool.name}
                {tool.isNew && (
                  <Badge className="text-[9px] px-1 py-0 h-4">New</Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {activeTab === "templates" && (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">高级时尚模板</h2>
                  <p className="text-muted-foreground">选择一个模板快速开始创建你的时尚电商网站</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div 
                      key={template.key}
                      className="group cursor-pointer bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 hover:shadow-lg transition-all"
                      onClick={() => selectTemplate(template)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform">{template.icon}</span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-4">
                          {template.tags.map((tag: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button 
                          className="w-full mt-5"
                          onClick={(e) => {
                            e.stopPropagation()
                            selectTemplate(template)
                          }}
                        >
                          选择模板
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "canvas" && (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto text-center py-20">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <Layout className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">AI 画布</h2>
                <p className="text-muted-foreground mb-6">
                  请先从「模板库」选择一个模板开始
                </p>
                <Button onClick={() => setActiveTab("templates")}>
                  <Grid className="h-4 w-4 mr-2" />
                  去模板库
                </Button>
              </div>
            </div>
          )}

          {(activeTab === "brand" || activeTab === "visual" || activeTab === "copy") && (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto text-center py-20">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  {activeTab === "brand" && <Palette className="h-10 w-10 text-muted-foreground" />}
                  {activeTab === "visual" && <Image className="h-10 w-10 text-muted-foreground" />}
                  {activeTab === "copy" && <Type className="h-10 w-10 text-muted-foreground" />}
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {activeTab === "brand" && "品牌生成"}
                  {activeTab === "visual" && "视觉生成"}
                  {activeTab === "copy" && "文案生成"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  此功能即将推出
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
