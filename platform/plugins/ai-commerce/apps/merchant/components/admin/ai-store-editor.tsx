"use client"

import { useState } from "react"
import {
  Sparkles, Wand2, Eye, Save, CheckCircle2, Loader2, Layout, Layers, Hand,
  Plus, Trash2, GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AIInlineAutocomplete } from "@/components/ui/ai-inline-autocomplete"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// AI 生成的 JSON DSL 示例
const sampleStoreJSON = {
  template: "luxury-fashion",
  theme: "modern-dark",
  pages: [{ id: "home", title: "Home", sections: ["hero-1", "features-1"] }],
  sections: [
    { 
      id: "hero-1", 
      type: "hero", 
      title: "探索未来时尚", 
      subtitle: "ModaUI AIOS 驱动的高级电商体验", 
      cta: "立即探索",
      background: "#f8fafc"
    },
    {
      id: "features-1",
      type: "features",
      title: "为什么选择我们",
      features: [
        { icon: "🚀", title: "极速送达", description: "全球 24 小时配送服务" },
        { icon: "💎", title: "品质保证", description: "精选全球顶级奢侈品牌" },
        { icon: "🛡️", title: "安全支付", description: "银行级加密支付系统" }
      ]
    }
  ]
}

// 可拖放组件
const HeroBlock = ({ data, isEditing, onUpdate }: { data: any; isEditing?: boolean; onUpdate?: (newData: any) => void }) => (
  <section 
    className={`min-h-[400px] flex items-center justify-center text-center p-12 ${isEditing ? 'ring-2 ring-blue-400 ring-inset cursor-move' : ''}`}
    style={{ backgroundColor: data?.background || "#f8fafc" }}
  >
    <div className="max-w-2xl">
      <Badge className="mb-4">2026 新品</Badge>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">{data?.title || "你的商店标题"}</h1>
      <p className="text-lg text-muted-foreground mb-8">{data?.subtitle || "你的商店描述"}</p>
      <Button size="lg">{data?.cta || "开始购物"}</Button>
    </div>
  </section>
)

const FeatureBlock = ({ data, isEditing, onUpdate }: { data: any; isEditing?: boolean; onUpdate?: (newData: any) => void }) => (
  <section 
    className={`py-16 px-6 bg-background ${isEditing ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
  >
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-12">{data?.title || "特色功能"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data?.features?.map((feature: any, i: number) => (
          <div key={i} className="text-center p-6 bg-muted/30 rounded-xl">
            <div className="text-4xl mb-4">{feature?.icon || "✨"}</div>
            <h3 className="font-medium mb-2">{feature?.title || "功能标题"}</h3>
            <p className="text-sm text-muted-foreground">{feature?.description || "功能描述"}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const ProductGridBlock = ({ data, isEditing, onUpdate }: { data: any; isEditing?: boolean; onUpdate?: (newData: any) => void }) => (
  <section 
    className={`py-16 px-6 bg-muted/20 ${isEditing ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
  >
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-12">{data?.title || "热门商品"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.products?.map((product: any, i: number) => (
          <div key={i} className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted/50 flex items-center justify-center">
              <img src={product?.image} alt={product?.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-medium">{product?.name || "商品名称"}</h3>
              <p className="text-foreground font-semibold mt-1">{product?.price || "¥0"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const blockComponents = {
  hero: HeroBlock,
  features: FeatureBlock,
  product_grid: ProductGridBlock
}

export function AIStoreEditor() {
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [storeJSON, setStoreJSON] = useState<any>(sampleStoreJSON)
  const [activeView, setActiveView] = useState<"editor" | "preview" | "json">("editor")
  const [editorMode, setEditorMode] = useState<"ai" | "manual">("ai")
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      // 真实调用 AI 生成接口
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          template: 'luxury-fashion'
        })
      })

      if (!response.ok) {
        throw new Error('AI 生成请求失败')
      }

      const generatedStore = await response.json()
      
      // 如果接口返回了有效的 DSL，则使用它；否则使用带关键词微调的 fallback
      if (generatedStore && generatedStore.sections && generatedStore.sections.length > 0) {
        setStoreJSON(generatedStore)
      } else {
        // Fallback 逻辑
        const keywords = aiPrompt.toLowerCase()
        const fallbackStore = JSON.parse(JSON.stringify(sampleStoreJSON))
        
        if (keywords.includes("服装") || keywords.includes("时尚")) {
          fallbackStore.sections[0].title = "潮流时尚，尽在掌握"
          fallbackStore.sections[0].subtitle = "探索 2026 春季最新潮流单品"
        } else if (keywords.includes("咖啡") || keywords.includes("饮品")) {
          fallbackStore.sections[0].title = "每一杯，都是故事"
          fallbackStore.sections[0].subtitle = "精选全球优质咖啡豆"
        }
        setStoreJSON(fallbackStore)
      }
    } catch (error) {
      console.error('AI Generation error:', error)
      // 在生产环境中如果报错，显示提示
      alert('AI 生成暂时不可用，已加载基础模板。')
      setStoreJSON(sampleStoreJSON)
    } finally {
      setIsGenerating(false)
    }
  }

  // 渲染 JSON DSL 到页面
  const renderStore = () => {
    return (
      <div className="bg-white min-h-full">
        {storeJSON.sections.map((section: any, i: number) => {
          const Component = blockComponents[section.type as keyof typeof blockComponents]
          if (!Component) return null
          
          return (
            <div 
              key={section.id} 
              onClick={() => setSelectedBlock(selectedBlock === section.id ? null : section.id)}
              className="group relative"
            >
              {editorMode === "manual" && (
                <div className="absolute -top-10 left-0 right-0 h-10 bg-blue-100 border border-blue-200 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <GripVertical className="h-4 w-4" />
                    {section.type}
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
              <Component 
                data={section} 
                isEditing={selectedBlock === section.id && editorMode === "manual"}
              />
            </div>
          )
        })}
        <footer className="py-8 px-6 border-t border-border bg-background">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            © 2026 ModaUI Commerce OS
          </div>
        </footer>
      </div>
    )
  }

  // 块库
  const blockLibrary = [
    { type: "hero", name: "Hero 首屏", icon: "🎯" },
    { type: "features", name: "功能展示", icon: "✨" },
    { type: "product_grid", name: "商品网格", icon: "📦" }
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
                          id="ai-prompt"
                          value={aiPrompt}
                          onChange={setAiPrompt}
                          placeholder="例如：一个卖智能降噪耳机的极简科技风网店..."
                          className="text-sm"
                        />
                        <Button
                          onClick={handleGenerate}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAiPrompt("一个极简风格的智能电子产品商店")}
                        >
                          🎧 电子产品商店
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAiPrompt("一个时尚潮流的服装品牌店")}
                        >
                          👗 服装品牌店
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setAiPrompt("一个温暖的咖啡店和精品小店")}
                        >
                          ☕ 咖啡精品店
                        </Button>
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
                        <p>LLM 生成 JSON DSL 结构</p>
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
                    <p className="text-sm text-muted-foreground">拖拽和添加内容块到您的商店</p>
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
                                id: `${block.type}-${Date.now()}`,
                                type: block.type,
                                title: block.name,
                                ...(block.type === "hero" && { subtitle: "描述内容", cta: "按钮" }),
                                ...(block.type === "features" && { features: [{ icon: "✨", title: "功能1", description: "描述" }] }),
                                ...(block.type === "product_grid" && { products: [{ name: "商品", price: "¥0", image: "https://picsum.photos/300/300?random=new" }] })
                              }
                              setStoreJSON({
                                ...storeJSON,
                                sections: [...storeJSON.sections, newBlock]
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
                      <div className="text-sm font-medium">图层 ({storeJSON.sections.length})</div>
                      <div className="space-y-1">
                        {storeJSON.sections.map((section: any, i: number) => (
                          <div 
                            key={section.id}
                            onClick={() => setSelectedBlock(section.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                              selectedBlock === section.id 
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
                        <div className="text-sm font-medium">块属性</div>
                        <Card>
                          <CardContent className="p-4 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">标题</Label>
                              <AIInlineAutocomplete
                                id={`block-title-${selectedBlock}`}
                                value={storeJSON.sections.find((s: any) => s.id === selectedBlock)?.title || ""}
                                onChange={(value) => {
                                  setStoreJSON({
                                    ...storeJSON,
                                    sections: storeJSON.sections.map((s: any) => 
                                      s.id === selectedBlock ? { ...s, title: value } : s
                                    )
                                  })
                                }}
                                placeholder="请输入块标题"
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setStoreJSON({
                                  ...storeJSON,
                                  sections: storeJSON.sections.filter((s: any) => s.id !== selectedBlock)
                                })
                                setSelectedBlock(null)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除块
                            </Button>
                          </CardContent>
                        </Card>
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
                    JSON DSL
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                保存发布
              </Button>
            </div>

            <div className="flex-1 overflow-hidden bg-muted/20">
              {activeView === "editor" && (
                <div className="h-full p-6 overflow-y-auto">
                  {renderStore()}
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
                      <CardDescription>AI 生成的结构化数据，可以手动编辑</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[500px]">
                        {JSON.stringify(storeJSON, null, 2)}
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
