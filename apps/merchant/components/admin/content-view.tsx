"use client"

import { useState, useCallback } from "react"
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Sparkles,
  Loader2,
  Wand2,
  Image as ImageIcon,
  Type,
  Layout as LayoutIcon,
  CheckCircle,
  Copy,
  ChevronDown,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AIInlineAutocomplete } from "@/components/ui/ai-inline-autocomplete"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ContentItem {
  id: string
  title: string
  category: "blog" | "product_copy" | "marketing" | "page"
  author: string
  wordCount: number
  status: "published" | "draft" | "scheduled"
  lastUpdated: string
}

const INITIAL_CONTENTS: ContentItem[] = [
  { id: "CNT-001", title: "智能手表 Pro 2024 年度深度评测与推介", category: "blog", author: "AI 文创助手", wordCount: 1250, status: "published", lastUpdated: "2024-03-12" },
  { id: "CNT-002", title: "新品降噪耳机落地页主轮播文案（五组备选）", category: "product_copy", author: "运营一主创", wordCount: 420, status: "draft", lastUpdated: "2024-03-14" },
  { id: "CNT-003", title: "春季换新季：多维社群联合促购社群消息", category: "marketing", author: "AI 营销分身", wordCount: 180, status: "published", lastUpdated: "2024-03-15" },
  { id: "CNT-004", title: "关于我们极简品牌起源与工匠精神陈述页", category: "page", author: "品牌部主笔", wordCount: 890, status: "scheduled", lastUpdated: "2024-03-10" }
]

const contentAIActions = [
  {
    id: "generate-copy-ai",
    type: "generate",
    label: "智能内容写作",
    description: "输入品类或卖点，一键生成优质多态电商内容",
    icon: "Wand2"
  },
  {
    id: "optimize-seo",
    type: "optimize",
    label: "SEO 权重调优",
    description: "丰富内容长尾词，调整关键词密度",
    icon: "Sparkles"
  }
]

export function ContentView() {
  const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab2] = useState<"list" | "generator" | "canvas">("list")
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  // AI Prompt and Output state for generator
  const [generatorPrompt, setGeneratorPrompt] = useState("")
  const [generatorResult, setGeneratorResult] = useState("")
  const [contentType, setContentType] = useState<"product" | "blog" | "ad">("product")

  // AI Canvas Layout items (representing injected layout nodes)
  const [canvasNodes, setCanvasNodes] = useState([
    { id: "node-header", type: "header", text: "纯粹、静谧、无拘无束", subtitle: "体验前所未有的静音黑科技" },
    { id: "node-hero", type: "image_placeholder", label: "点击上传或生成主KV视觉图" },
    { id: "node-feature", type: "text_block", text: "采用全新复合多层抗噪瞬态振膜，内置旗舰级五处理器多态音频运算单元，高精度滤除多达 99.8% 的频段杂讯。" }
  ])

  const runGlobalAI = useCallback(async (actionId: string) => {
    setAiExecuting(actionId)
    setAiResult(null)
    await new Promise(resolve => setTimeout(resolve, 1800))

    if (actionId === "generate-copy-ai") {
      setAiResult("已推荐转去【AI 智能撰写】面板，以便您获取定制化排版文案")
      setActiveTab2("generator")
    } else {
      setAiResult("SEO 密度优化完成！相关关键词丰富度提升了 42%")
    }
    setAiExecuting(null)
  }, [])

  const handleGenerateCopy = async () => {
    if (!generatorPrompt.trim()) return
    setAiExecuting("generator-run")
    setGeneratorResult("")

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate commercial ecommerce copy for: "${generatorPrompt}". Action targets: ${contentType === "product" ? "Product Description Detailed" : contentType === "blog" ? "Engaging Blogpost Story" : "Social Media Promo Ads"}. Generate in high-quality Chinese with elegant formatting. Do not output code blocks.`,
          type: "copy",
        }),
      })
      const data = await response.json()
      if (data.text) {
        setGeneratorResult(data.text)
      } else {
        setGeneratorResult("AI 文案撰写产生错误，请重试。")
      }
    } catch (err) {
      console.error(err)
      setGeneratorResult("与服务器连接断开，生成失败。")
    } finally {
      setAiExecuting(null)
    }
  }

  const handleApplyToCanvas = () => {
    if (!generatorResult) return
    // Directly inject generated copywriting block into AI canvas layout
    const newCanvasNodes = [
      ...canvasNodes,
      { id: `node-injected-${Date.now()}`, type: "text_block", text: generatorResult.slice(0, 300) + "..." }
    ]
    setCanvasNodes(newCanvasNodes)
    setActiveTab2("canvas")
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "blog": return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "product_copy": return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "marketing": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "blog": return "深度文章"
      case "product_copy": return "商品详描"
      case "marketing": return "社群文案"
      case "page": return "独立页面"
      default: return cat
    }
  }

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">内容</h1>
              <p className="text-sm text-muted-foreground mt-1">智能创作管理：构建高转化率商品文案、博客与品牌说明页面</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setActiveTab2("generator")} variant="outline" className="gap-2">
                <Wand2 className="h-4 w-4" />
                AI 撰写器
              </Button>
              <Button onClick={() => setActiveTab2("canvas")} variant="outline" className="gap-2">
                <LayoutIcon className="h-4 w-4" />
                智能画布
              </Button>
              <Button onClick={() => {
                const title = prompt("请输入文案标题:") || "自研抗噪瞬态振膜特色宣介 (AeroWave)"
                setContents([{
                  id: `CNT-${Date.now().toString().slice(-4)}`,
                  title,
                  category: "product_copy",
                  author: "超级管理员",
                  wordCount: 150,
                  status: "draft",
                  lastUpdated: new Date().toISOString().split("T")[0]
                }, ...contents])
              }} className="gap-2 ai-action-btn">
                <Plus className="h-4 w-4" />
                添加内容
              </Button>
            </div>
          </div>

          {/* AI Actions */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
              <Sparkles className="h-4 w-4 font-semibold" />
              <span>AI 内容助手</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {contentAIActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => runGlobalAI(action.id)}
                  disabled={aiExecuting !== null}
                >
                  {aiExecuting === action.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : action.icon === "Wand2" ? (
                    <Wand2 className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm font-medium text-foreground animate-fade-in flex items-center gap-1.5 max-w-sm truncate">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{aiResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex-shrink-0 border-b border-border bg-card px-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab2("list")}
            className={`py-3.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === "list"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            素材库列表
          </button>
          <button
            onClick={() => setActiveTab2("generator")}
            className={`py-3.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === "generator"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            AI 智能撰写
          </button>
          <button
            onClick={() => setActiveTab2("canvas")}
            className={`py-3.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === "canvas"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            AI 交互画布
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-auto p-6 bg-muted/10">
        <div className="max-w-7xl mx-auto h-full">

          {/* المواد库 (Material Library) */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="输入关键词模糊检索内容素材..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">标题 / 标识</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">品类</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">创作者</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">字数</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">最后更新</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">状态</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredContents.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-3.5 px-5">
                          <div>
                            <p className="text-sm font-medium text-foreground">{c.title}</p>
                            <span className="text-[10px] text-muted-foreground font-mono">{c.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className={getCategoryBadge(c.category)}>
                            {getCategoryLabel(c.category)}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-sm font-medium text-foreground">
                          {c.author}
                        </td>
                        <td className="py-3.5 px-5 text-sm text-foreground text-right font-mono">
                          {c.wordCount}
                        </td>
                        <td className="py-3.5 px-5 text-sm text-muted-foreground">
                          {c.lastUpdated}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge
                            variant="outline"
                            className={
                              c.status === "published"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                                : c.status === "scheduled"
                                ? "bg-blue-500/10 text-blue-600 border-blue-200"
                                : "bg-muted text-muted-foreground border-border"
                            }
                          >
                            {c.status === "published" ? "已发布" : c.status === "scheduled" ? "待生效" : "草稿箱"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => setContents(contents.filter(item => item.id !== c.id))} variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI 智能撰写 (AI Copywriter) */}
          {activeTab === "generator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
              {/* Writer Form */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-md">
                  <Wand2 className="h-4 w-4 text-foreground" />
                  AI 高转化文案生成引擎
                </h3>
                <p className="text-xs text-muted-foreground">
                  利用精准训练的电商文案大语言模型，能为您的主推硬核新品、详情说明页、甚至社群大促极速生成专业级、高情绪价值文案。
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">文案目标类型</label>
                  <div className="flex gap-2">
                    {[
                      { value: "product", label: "爆款详描" },
                      { value: "blog", label: "品牌博文" },
                      { value: "ad", label: "大促引流广告" }
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setContentType(t.value as any)}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                          contentType === t.value
                            ? "bg-foreground text-background border-foreground"
                            : "bg-card border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">核心产品特征 / 创意提示词</label>
                  <AIInlineAutocomplete
                    id="content-prompt"
                    as="textarea"
                    value={generatorPrompt}
                    onChange={setGeneratorPrompt}
                    placeholder="例如: 智能降噪耳机，搭载旗舰芯片，磨砂黑配色，主动ANC自适应降噪，主打追求纯粹静谧体验的年轻白领..."
                    rows={4}
                    className="bg-background border-border"
                  />
                </div>

                <Button
                  onClick={handleGenerateCopy}
                  className="w-full gap-2 py-5 text-sm"
                  disabled={aiExecuting === "generator-run"}
                >
                  {aiExecuting === "generator-run" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      正在撰写并渲染排版中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      开始 AI 极速输出
                    </>
                  )}
                </Button>
              </div>

              {/* Generator Result Panel */}
              <div className="bg-card border border-border rounded-xl p-6 h-full min-h-[350px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">AI 撰写原稿输出</h4>
                    {generatorResult && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(generatorResult)
                            alert("已复制文案至剪贴板!")
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {generatorResult ? (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                      {generatorResult}
                    </div>
                  ) : (
                    <div className="h-48 border border-dashed border-border rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">在左侧输入创意提示词并点击生成...</p>
                    </div>
                  )}
                </div>

                {generatorResult && (
                  <div className="pt-4 border-t border-border flex justify-end gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Create draft item
                        const newDraft: ContentItem = {
                          id: `CNT-${Date.now()}`,
                          title: generatorResult.split("\n")[0].replace("【产品主标题】 ", "").replace("【博文标题】 ", "") || "AI 生成创意草稿",
                          category: contentType === "product" ? "product_copy" : contentType === "blog" ? "blog" : "marketing",
                          author: "AI 写作大模型",
                          wordCount: generatorResult.length,
                          status: "draft",
                          lastUpdated: new Date().toISOString().split("T")[0]
                        }
                        setContents([newDraft, ...contents])
                        setActiveTab2("list")
                      }} 
                      className="text-xs"
                    >
                      保存为文案素材
                    </Button>
                    <Button onClick={handleApplyToCanvas} className="text-xs gap-1">
                      <LayoutIcon className="h-3 w-3" />
                      注入并预览画布
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI 交互画布 (AI Interactive Canvas) */}
          {activeTab === "canvas" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full pb-6">
              {/* Canvas Controls */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 lg:col-span-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <LayoutIcon className="h-4.5 w-4.5" />
                  画布模块控制
                </h3>
                <p className="text-xs text-muted-foreground">
                  这里是直观、低代码的 AI 交互渲染区。AI 在此区域可以直接排布大图、宣传标语和正文，模拟前端网页。
                </p>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground">网页模块节点</span>
                    <Button 
                      variant="ghost" 
                      onClick={() => setCanvasNodes([
                        { id: "node-header", type: "header", text: "纯粹、静谧、无拘无束", subtitle: "体验前所未有的静音黑科技" },
                        { id: "node-hero", type: "image_placeholder", label: "点击上传或生成主KV视觉图" },
                        { id: "node-feature", type: "text_block", text: "采用全新复合多层抗噪瞬态振膜，内置旗舰级五处理器多态音频运算单元，高精度滤除多达 99.8% 的频段杂讯。" }
                      ])} 
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <RefreshCw className="h-2.5 w-2.5 mr-1" />
                      重置画布
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {canvasNodes.map((node, i) => (
                      <div key={node.id} className="p-3 bg-muted/40 border border-border rounded-xl text-xs flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-[9px] text-muted-foreground px-1 py-0.5 bg-muted rounded">
                            {node.type.toUpperCase()}
                          </span>
                          <span className="truncate max-w-[130px] font-medium text-foreground">
                            {node.text || node.label || `图片占位-${i}`}
                          </span>
                        </div>
                        <button 
                          onClick={() => setCanvasNodes(canvasNodes.filter(n => n.id !== node.id))}
                          className="text-red-500 hover:text-red-600 px-1 py-0.5 font-semibold text-[10px]"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-1">
                  <Button
                    onClick={async () => {
                      setAiExecuting("canvas-optimize")
                      await new Promise(resolve => setTimeout(resolve, 1500))
                      // Edit the nodes via simulated AI
                      setCanvasNodes(nodes => nodes.map(n => 
                        n.type === "header" ? { ...n, text: "【AI精调】纯粹 · 静谧 · 无界 - 旗舰降噪新篇章" } : n
                      ))
                      setAiExecuting(null)
                    }}
                    variant="outline"
                    className="w-full gap-1.5 text-xs py-4"
                    disabled={aiExecuting === "canvas-optimize"}
                  >
                    {aiExecuting === "canvas-optimize" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    AI 一键调优布局文案
                  </Button>
                </div>
              </div>

              {/* Injected AI Canvas Stage */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between text-xs px-2">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    在线落地页 AI 同步渲染区
                  </span>
                  <span className="text-muted-foreground font-mono">1024px Width (Scaled)</span>
                </div>

                {/* Canvas Box */}
                <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[480px]">
                  {/* Mock browser Chrome header */}
                  <div className="bg-muted/45 px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-border" />
                      <span className="w-2.5 h-2.5 rounded-full bg-border" />
                      <span className="w-2.5 h-2.5 rounded-full bg-border" />
                    </div>
                    <div className="bg-background border border-border rounded px-4 py-0.5 text-[10px] text-muted-foreground font-mono truncate max-w-sm ml-4">
                      https://my-minimal-store.com/preview-ai-canvas
                    </div>
                  </div>

                  {/* Canvas Render Area */}
                  <div className="p-8 space-y-6 flex-1 bg-white flex flex-col justify-center">
                    {canvasNodes.map((node) => {
                      if (node.type === "header") {
                        return (
                          <div key={node.id} className="text-center space-y-2 py-4">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                              {node.text}
                            </h2>
                            <p className="text-xs text-gray-400 font-medium">
                              {node.subtitle}
                            </p>
                          </div>
                        )
                      }
                      if (node.type === "image_placeholder") {
                        return (
                          <div key={node.id} className="aspect-video bg-gray-50 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-4">
                            <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-xs text-gray-405 font-medium">{node.label}</p>
                            <p className="text-[10px] text-gray-400 mt-1 max-w-xs">（系统自适应：极简白灰概念渲染图）</p>
                          </div>
                        )
                      }
                      if (node.type === "text_block") {
                        return (
                          <div key={node.id} className="max-w-xl mx-auto py-2">
                            <p className="text-xs text-gray-650 leading-relaxed font-sans text-center">
                              {node.text}
                            </p>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
