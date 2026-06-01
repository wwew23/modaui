"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Undo2,
  Redo2,
  Save,
  Settings,
  Bot,
  MessageSquare,
  X,
  Sparkles,
  Wand2,
  Eye,
  CheckCircle2,
  Loader2,
  Layout,
  Layers,
  Hand,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AIInlineAutocomplete } from "@/components/ui/ai-inline-autocomplete"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Data } from "@puckeditor/core"
import { getAllTemplates } from "@/lib/component-registry"
import { TemplateAssistantPanel } from "./template-assistant-panel"

interface PuckEditorProps {
  onSave?: (data: Data) => void
  initialData?: Data
}

export function PuckEditor({ onSave, initialData, initialSelectedBlock }: PuckEditorProps & { initialSelectedBlock?: string | number }) {
  const [editorMode, setEditorMode] = useState<"ai" | "manual">("ai")
  const [activeView, setActiveView] = useState<"editor" | "preview" | "json">("editor")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(initialSelectedBlock ? String(initialSelectedBlock) : null)

  const defaultStore = initialData || getAllTemplates()[0].data
  
  const [storeData, setStoreData] = useState<any>(defaultStore)

  // Assistant / undo history
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const pushHistory = (s: any) => setHistory(h => [...h, JSON.parse(JSON.stringify(s))])
  const undo = () => {
    setHistory(h => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setStoreData(prev)
      return h.slice(0, -1)
    })
  }

  const applyPatches = (patches: any[]) => {
    if (!patches || patches.length === 0) return
    pushHistory(storeData)
    let next = JSON.parse(JSON.stringify(storeData))
    for (const p of patches) {
      const sectionId = p.sectionId
      const changes = p.changes || {}
      // global
      if (sectionId === 'global') {
        next.root = next.root || {}
        next.root.props = { ...(next.root.props || {}), ...(changes.props || {}) }
        next.meta = { ...(next.meta || {}), ...(changes.style || {}) }
        continue
      }
      // numeric index
      const idx = Number(sectionId)
      if (!Number.isNaN(idx) && next.content[idx]) {
        next.content[idx].props = { ...(next.content[idx].props || {}), ...(changes.props || {}) }
        next.content[idx].props.style = { ...(next.content[idx].props.style || {}), ...(changes.style || {}) }
        continue
      }
      // match by type
      const found = next.content.find((c: any) => c.type === sectionId)
      if (found) {
        found.props = { ...(found.props || {}), ...(changes.props || {}) }
        found.props.style = { ...(found.props.style || {}), ...(changes.style || {}) }
      }
    }
    setStoreData(next)
  }

  const blockComponents: any = {
    Navbar: (props: any) => (
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-lg">{props.logoText?.[0] || "M"}</span>
          </div>
          <span className="font-semibold text-lg">{props.logoText || "ModaUI"}</span>
        </div>
        <div className="flex items-center gap-6">
          {(props.links || ["首页", "商品", "关于", "联系"]).map((link: string, i: number) => (
            <a key={i} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link}
            </a>
          ))}
        </div>
        {props.cartIcon !== false && (
          <Button variant="outline" size="sm">
            购物车
          </Button>
        )}
      </nav>
    ),
    MinimalHero: (props: any) => (
      <section 
        className="min-h-[500px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden"
        style={{ backgroundColor: props.background || "#f8fafc" }}
      >
        <div className="relative z-10 max-w-4xl">
          <Badge className="mb-4">2026 新品</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
            {props.title || "欢迎来到我们的商店"}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {props.subtitle || "发现优质产品，享受购物体验"}
          </p>
          <Button size="lg">{props.ctaText || "立即探索"}</Button>
        </div>
      </section>
    ),
    FeatureSection: (props: any) => (
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-2">{props.title || "特色功能"}</h2>
          <p className="text-center text-muted-foreground mb-12">{props.subtitle || ""}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(props.features || [
              { icon: "✨", title: "优质产品", description: "精选全球优质产品" },
              { icon: "🚚", title: "快速配送", description: "全球极速配送服务" },
              { icon: "💯", title: "品质保证", description: "100%正品保证" }
            ]).map((feature: any, i: number) => (
              <div key={i} className="text-center p-6 bg-muted/30 rounded-xl">
                <div className="text-4xl mb-4">{feature.icon || "✨"}</div>
                <h3 className="font-medium mb-2">{feature.title || "功能标题"}</h3>
                <p className="text-sm text-muted-foreground">{feature.description || "功能描述"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    ProductGrid: (props: any) => (
      <section className="py-16 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-2">{props.title || "热门商品"}</h2>
          <p className="text-center text-muted-foreground mb-12">{props.subtitle || ""}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(props.products || [
              { name: "经典白T恤", price: "¥299", image: "https://picsum.photos/300/300?random=1" },
              { name: "牛仔裤", price: "¥599", image: "https://picsum.photos/300/300?random=2" },
              { name: "休闲外套", price: "¥1299", image: "https://picsum.photos/300/300?random=3" }
            ]).map((product: any, i: number) => (
              <div key={i} className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted/50 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{product.name || "商品名称"}</h3>
                  <p className="text-foreground font-semibold mt-1">{product.price || "¥0"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    Testimonials: (props: any) => (
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-2">{props.title || "用户评价"}</h2>
          <p className="text-center text-muted-foreground mb-12">{props.subtitle || ""}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(props.testimonials || [
              { name: "张小姐", avatar: "👩", text: "质量非常好，物流也很快！" },
              { name: "李先生", avatar: "👨", text: "设计感很强，穿着很舒适" },
              { name: "王女士", avatar: "👩‍🦰", text: "会回购的，推荐给朋友们" }
            ]).map((t: any, i: number) => (
              <div key={i} className="p-6 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{t.avatar || "😊"}</span>
                  <div>
                    <div className="font-medium">{t.name || "用户"}</div>
                    <div className="text-sm text-amber-500">★★★★★</div>
                  </div>
                </div>
                <p className="text-muted-foreground">{t.text || "评价内容"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    Footer: (props: any) => (
      <footer className="py-12 px-6 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-2xl font-bold">{props.logoText || "ModaUI"}</span>
          </div>
          <div className="flex justify-center gap-6 mb-8">
            {(props.links || ["关于我们", "联系我们", "隐私政策", "服务条款"]).map((link: string, i: number) => (
              <a key={i} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
            {props.copyright || "© 2026 ModaUI Commerce OS"}
          </div>
        </div>
      </footer>
    )
  }

  const renderStore = () => {
    return (
      <div className="bg-white min-h-full">
        {storeData.content.map((block: any, i: number) => {
          const Component = blockComponents[block.type]
          if (!Component) return null
          return (
            <div
              key={i}
              onClick={() => setSelectedBlock(selectedBlock === i.toString() ? null : i.toString())}
              className="group relative"
            >
              {editorMode === "manual" && selectedBlock === i.toString() && (
                <div className="absolute -top-10 left-0 right-0 h-10 bg-blue-100 border border-blue-200 rounded-t-lg flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <GripVertical className="h-4 w-4" />
                    {block.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <Component {...block.props} />
            </div>
          )
        })}
      </div>
    )
  }

  const blockLibrary = [
    { type: "Navbar", name: "导航栏", icon: "🧭" },
    { type: "MinimalHero", name: "Hero 首屏", icon: "🎯" },
    { type: "FeatureSection", name: "功能展示", icon: "✨" },
    { type: "ProductGrid", name: "商品网格", icon: "📦" },
    { type: "Testimonials", name: "用户评价", icon: "💬" },
    { type: "Footer", name: "页脚", icon: "📄" }
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-4 border-r border-border bg-card p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* 模式切换 */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  {editorMode === "ai" ? (
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Hand className="h-5 w-5 text-emerald-600" />
                  )}
                  <div>
                    <div className="font-medium">
                      {editorMode === "ai" ? "AI 模式" : "手动模式"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {editorMode === "ai" ? "一句话生成商店" : "拖拽编辑微调"}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={editorMode === "manual"}
                  onCheckedChange={(v) => setEditorMode(v ? "manual" : "ai")}
                />
              </div>

              {editorMode === "ai" ? (
                // AI 模式面板
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                      AI 商店生成器
                    </h2>
                    <p className="text-sm text-muted-foreground">一句话描述您的商店，AI 自动生成完整页面</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">您的描述</label>
                      <div className="space-y-2">
                        <AIInlineAutocomplete
                          id="puck-ai-prompt"
                          value={aiPrompt}
                          onChange={setAiPrompt}
                          placeholder="例如：一个卖高级时尚女装的精品店..."
                          className="text-sm"
                        />
                        <Button
                          onClick={() => setIsGenerating(true)}
                          disabled={isGenerating}
                          className="w-full gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              AI 正在生成中...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              生成商店
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">快速模板</div>
                      <div className="space-y-2">
                        {getAllTemplates().map((template) => (
                          <Button
                            key={template.key}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setStoreData(template.data)}
                          >
                            <span className="mr-2">{template.icon}</span>
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      工作流程
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">1</div>
                        <p>用自然语言描述您的商店</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">2</div>
                        <p>选择模板开始编辑</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">3</div>
                        <p>切换手动模式调整细节</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 手动模式面板
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Layers className="h-5 w-5" />
                      块编辑器
                    </h2>
                    <p className="text-sm text-muted-foreground">添加和调整内容块</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">添加块</div>
                      <div className="grid grid-cols-1 gap-2">
                        {blockLibrary.map((block) => (
                          <Button
                            key={block.type}
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2"
                            onClick={() => {
                              const newBlock = {
                                type: block.type,
                                props: {}
                              }
                              setStoreData({
                                ...storeData,
                                content: [...storeData.content, newBlock]
                              })
                            }}
                          >
                            <span>{block.icon}</span>
                            {block.name}
                            <Plus className="h-3 w-3 ml-auto" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">图层 ({storeData.content.length})</div>
                      <div className="space-y-1">
                        {storeData.content.map((section: any, i: number) => (
                          <div
                            key={i}
                            onClick={() => setSelectedBlock(selectedBlock === i.toString() ? null : i.toString())}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                              selectedBlock === i.toString()
                                ? "bg-blue-100 text-blue-700"
                                : "bg-muted/30 hover:bg-muted/50"
                            }`}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{section.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedBlock && (
                      <div className="pt-4 border-t border-border space-y-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            const index = parseInt(selectedBlock)
                            setStoreData({
                              ...storeData,
                              content: storeData.content.filter((_: any, i: number) => i !== index)
                            })
                            setSelectedBlock(null)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除块
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：编辑器和预览 */}
          <div className="lg:col-span-8 flex flex-col overflow-hidden">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <Tabs defaultValue="editor" value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                <TabsList>
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    {editorMode === "ai" ? "AI 画布" : "编辑器"}
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    预览
                  </TabsTrigger>
                  <TabsTrigger value="json" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => undo()} className="gap-2">Undo</Button>
                <Button size="sm" className="gap-2" onClick={() => onSave?.(storeData)}>
                  <Save className="h-4 w-4" />
                  保存发布
                </Button>
                <Button size="sm" variant={assistantOpen ? undefined : "outline"} onClick={() => setAssistantOpen(v => !v)} className="gap-2">
                  Assistant
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-muted/20">
              {activeView === "editor" && (
                <div className="h-full p-6 overflow-y-auto">
                  {renderStore()}
                </div>
              )}
              {assistantOpen && (
                <div className="fixed right-0 top-0 h-full z-50">
                  <TemplateAssistantPanel
                    templateId={storeData?.meta?.key || storeData?.key || 'luxury-fashion'}
                    store={storeData}
                    onApply={(patches) => { applyPatches(patches); setAssistantOpen(false) }}
                    onClose={() => setAssistantOpen(false)}
                  />
                </div>
              )}
              {activeView === "preview" && (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="w-full max-w-4xl bg-white border border-border rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-border flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">yourstore.modaui.com</span>
                    </div>
                    <div className="h-[600px] overflow-y-auto">
                      {renderStore()}
                    </div>
                  </div>
                </div>
              )}
              {activeView === "json" && (
                <div className="h-full p-6 overflow-y-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Store JSON DSL</CardTitle>
                      <CardDescription>AI 生成的结构化数据</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[500px]">
                        {JSON.stringify(storeData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
