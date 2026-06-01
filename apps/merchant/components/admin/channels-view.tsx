"use client"

import { useState, useCallback } from "react"
import { 
  TrendingUp, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Sparkles,
  Loader2,
  Wand2,
  Globe,
  ExternalLink,
  Signal,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StoreChannel {
  id: string
  name: string
  url: string
  status: "active" | "maintenance" | "suspended"
  productsCount: number
  ordersCount: number
  revenue: number
}

interface ChannelsViewProps {
  stores?: StoreChannel[]
  setStores?: (stores: StoreChannel[]) => void
}

const channelsAIActions = [
  {
    id: "check-latency",
    type: "analyze",
    label: "AI 状态巡检",
    description: "多极点网络探针巡检，检验渠道连通性及响应时间",
    icon: "Signal",
    estimatedTime: "约 6 秒"
  },
  {
    id: "generate-attribution",
    type: "generate",
    label: "AI 归因分析",
    description: "分析流量漏斗及多渠道转化贡献度",
    icon: "Wand2",
    estimatedTime: "约 12 秒"
  }
]

export function ChannelsView({ stores, setStores }: ChannelsViewProps) {
  const activeStores = stores || []
  const setActiveStores = setStores || (() => {})
  const [searchQuery, setSearchQuery] = useState("")
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleAIAction = useCallback(async (action: any) => {
    setAiExecuting(action.id)
    setAiResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 1800))
    
    let message = ""
    if (action.id === "check-latency") {
      message = "自检完毕！所有域名 DNS 解析正常，首屏响应(LCP)均在 1.2s 以内。"
    } else if (action.id === "generate-attribution") {
      message = "归因报告已生成：极简旗舰店贡献度最高(72.5%)，搜索引擎拉新效率较上周提升3.5%"
    } else {
      message = "渠道诊断成功"
    }

    setAiResult(message)
    setAiExecuting(null)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "maintenance": return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "suspended": return "bg-red-500/10 text-red-600 border-red-200"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "正常运行"
      case "maintenance": return "系统维护"
      case "suspended": return "已下线"
      default: return status
    }
  }

  const filtered = activeStores.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = activeStores.reduce((sum, s) => sum + s.revenue, 0)
  const totalOrders = activeStores.reduce((sum, s) => sum + s.ordersCount, 0)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">销售渠道</h1>
              <p className="text-sm text-muted-foreground mt-1">管理和接入您的跨平台多终端在线销售渠道</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                导出数据
              </Button>
              <Button className="gap-2 ai-action-btn" onClick={() => {
                const name = prompt("请输入新渠道名称:") || "小红书直连旗舰店"
                const url = prompt("请输入渠道网址:") || "xiaohongshu.com/shop/aerotech"
                const newChan: StoreChannel = {
                  id: `store-00${activeStores.length + 1}`,
                  name,
                  url,
                  status: "active",
                  productsCount: 0,
                  ordersCount: 0,
                  revenue: 0
                }
                const updated = [...activeStores, newChan]
                setActiveStores(updated)
              }}>
                <Plus className="h-4 w-4" />
                配置新渠道
              </Button>
            </div>
          </div>

          {/* AI Info Diagnostics */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>智能多渠道体检</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {channelsAIActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => handleAIAction(action)}
                  disabled={aiExecuting !== null}
                >
                  {aiExecuting === action.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : action.id === "check-latency" ? (
                    <Signal className="h-3.5 w-3.5" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm font-medium text-foreground animate-fade-in flex items-center gap-1.5 max-w-sm shrink-0 truncate">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{aiResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">接入渠道总数</p>
              <p className="text-2xl font-bold text-foreground font-mono-numbers">{activeStores.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">跨端合集订单数</p>
              <p className="text-2xl font-bold text-foreground font-mono-numbers">{totalOrders}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">合并运营总营收</p>
              <p className="text-2xl font-bold text-foreground font-mono-numbers">¥{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索渠道名称、标识或绑定域名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          {/* Grid Layout of Stores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((store) => (
              <div key={store.id} className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-mono font-bold text-foreground overflow-hidden group-hover:bg-foreground group-hover:text-background transition-colors">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{store.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <span>{store.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(store.status)}>
                    {getStatusText(store.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-center mt-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">商品数</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-0.5">{store.productsCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">订单量</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-0.5">{store.ordersCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">总流水</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-0.5">¥{store.revenue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 mt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => {
                      const updated = activeStores.filter(item => item.id !== store.id)
                      setActiveStores(updated)
                      if (setStores) setStores(updated)
                    }} 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-650"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center rounded-2xl bg-card border border-border">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">未检索到符合检索项的销售渠道</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
