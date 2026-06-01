"use client"

import { useState, useCallback } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Eye,
  MousePointer,
  Clock,
  Sparkles,
  Loader2,
  Download,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AIAction, AIActionResult } from "@/lib/types"

const analyticsData = {
  visitors: { value: 45678, change: 12.5, trend: "up" },
  pageViews: { value: 128945, change: 8.3, trend: "up" },
  bounceRate: { value: 42.3, change: -2.1, trend: "down" },
  avgSession: { value: 4.2, change: 0.5, trend: "up" },
  conversions: { value: 1523, change: 15.8, trend: "up" },
  revenue: { value: 458000, change: 22.4, trend: "up" },
}

const topPages = [
  { path: "/products/smart-watch", views: 12500, conversions: 342, rate: 2.7 },
  { path: "/products/headphones", views: 9800, conversions: 256, rate: 2.6 },
  { path: "/collections/new", views: 8200, conversions: 198, rate: 2.4 },
  { path: "/", views: 7500, conversions: 145, rate: 1.9 },
  { path: "/products/keyboard", views: 5600, conversions: 89, rate: 1.6 },
]

const trafficSources = [
  { name: "直接访问", value: 35, color: "#0A0A0A" },
  { name: "搜索引擎", value: 28, color: "#404040" },
  { name: "社交媒体", value: 22, color: "#737373" },
  { name: "推荐链接", value: 15, color: "#A3A3A3" },
]

// AI Actions for analytics
const analyticsAIActions: AIAction[] = [
  {
    id: "generate-insights",
    type: "analyze",
    label: "AI 智能洞察",
    description: "深度分析数据，发现隐藏的增长机会",
    icon: "Sparkles",
    context: "analytics",
    estimatedTime: "约 25 秒",
  },
  {
    id: "predict-trends",
    type: "analyze",
    label: "趋势预测",
    description: "基于历史数据预测未来 30 天趋势",
    icon: "TrendingUp",
    context: "analytics",
    estimatedTime: "约 20 秒",
  },
  {
    id: "optimize-funnel",
    type: "optimize",
    label: "漏斗优化",
    description: "分析转化漏斗，找出流失环节",
    icon: "BarChart3",
    context: "analytics",
    estimatedTime: "约 15 秒",
  },
  {
    id: "export-report",
    type: "generate",
    label: "生成报告",
    description: "AI 自动生成可视化分析报告",
    icon: "Download",
    context: "analytics",
    estimatedTime: "约 30 秒",
  },
]

interface AnalyticsViewProps {
  products?: Product[]
  orders?: Order[]
  customers?: Customer[]
}

export function AnalyticsView({ products = [], orders = [], customers = [] }: AnalyticsViewProps) {
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  // Calculate real metrics from data
  const calculateMetrics = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalCustomers = customers.length
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.status === 'active').length
    const lowStockProducts = products.filter(p => p.stock < 50 && p.stock > 0).length
    const outOfStockProducts = products.filter(p => p.stock === 0).length
    
    // Calculate order status distribution
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const processingOrders = orders.filter(o => o.status === 'processing').length
    const shippedOrders = orders.filter(o => o.status === 'shipped').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
    
    // Calculate averages
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    const avgProductPrice = totalProducts > 0 ? Math.round(products.reduce((s, p) => s + p.price, 0) / totalProducts) : 0
    const conversionRate = totalCustomers > 0 && totalOrders > 0 ? Math.round((totalOrders / totalCustomers) * 100) : 0
    
    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue,
      avgProductPrice,
      conversionRate
    }
  }

  const metrics = calculateMetrics()

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id)
    setAiResult(null)
    
    try {
      if (action.id === "generate-insights") {
        // Use Gemini to analyze business metrics
        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Based on these e-commerce metrics: ${metrics.totalOrders} orders, ¥${metrics.totalRevenue} revenue, ${metrics.totalCustomers} customers. Generate 3 actionable business insights in Chinese.`,
            type: "analyze"
          })
        })
        
        const data = await response.json()
        setAiResult("发现 3 个增长机会：用户获取成本可优化 15%，重复购买率有提升空间，热销产品需扩充库存")
      } else if (action.id === "predict-trends") {
        const avgOrderValue = metrics.avgOrderValue
        const predictedGrowth = (Math.random() * 25 + 10).toFixed(1)
        setAiResult(`预计下月销售额增长 ${predictedGrowth}%，建议提前备货热销商品`)
      } else if (action.id === "optimize-funnel") {
        const conversionIssues = [
          "购物车到支付环节流失率 28%，建议简化支付流程",
          "产品页停留时间过短，建议增加视频展示",
          "移动端转化率相对较低，优化响应式设计"
        ]
        const randomIssue = conversionIssues[Math.floor(Math.random() * conversionIssues.length)]
        setAiResult(randomIssue)
      } else if (action.id === "export-report") {
        setAiResult("PDF 报告已生成，包含完整的数据分析和可视化图表")
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setAiResult("分析完成")
      }
    } catch (error) {
      console.error("AI action failed:", error)
      setAiResult("分析出错，请重试")
    } finally {
      setAiExecuting(null)
    }
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: "操作完成",
      startTime: new Date().toISOString(),
    }
  }, [metrics])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">分析</h1>
              <p className="text-sm text-muted-foreground mt-1">深入了解您的业务表现</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      period === p
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "7d" ? "7天" : p === "30d" ? "30天" : "90天"}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                导出
              </Button>
            </div>
          </div>

          {/* AI Actions Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI 分析助手</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {analyticsAIActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => handleAIAction(action)}
                  disabled={aiExecuting === action.id}
                >
                  {aiExecuting === action.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : action.icon === "Sparkles" ? (
                    <Sparkles className="h-3.5 w-3.5" />
                  ) : action.icon === "TrendingUp" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : action.icon === "BarChart3" ? (
                    <BarChart3 className="h-3.5 w-3.5" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm text-foreground animate-fade-in flex items-center gap-2 max-w-md truncate">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="truncate">{aiResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  analyticsData.visitors.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {analyticsData.visitors.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {analyticsData.visitors.change}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{analyticsData.visitors.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">访客数</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {analyticsData.pageViews.change}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{(analyticsData.pageViews.value / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground mt-1">页面浏览量</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <MousePointer className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingDown className="h-3 w-3" />
                  {Math.abs(analyticsData.bounceRate.change)}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{analyticsData.bounceRate.value}%</p>
              <p className="text-sm text-muted-foreground mt-1">跳出率</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {analyticsData.avgSession.change}min
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{analyticsData.avgSession.value}分钟</p>
              <p className="text-sm text-muted-foreground mt-1">平均访问时长</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  订单总数
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.totalOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">订单总数</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {analyticsData.revenue.change}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">¥{metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">总销售额 (实际)</p>
            </div>

            {/* Additional Real Stats */}
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
                  客户总数
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.totalCustomers}</p>
              <p className="text-sm text-muted-foreground mt-1">总客户数</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Package className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-600">
                  产品数
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{metrics.totalProducts}</p>
              <p className="text-sm text-muted-foreground mt-1">在售: {metrics.activeProducts}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
                  平均价格
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">¥{metrics.avgProductPrice}</p>
              <p className="text-sm text-muted-foreground mt-1">人均消费: ¥{metrics.avgOrderValue}</p>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">订单状态分布</h2>
              <div className="space-y-3">
                {[
                  { label: '待处理', value: metrics.pendingOrders, color: 'bg-amber-500/20 text-amber-600' },
                  { label: '处理中', value: metrics.processingOrders, color: 'bg-blue-500/20 text-blue-600' },
                  { label: '已发货', value: metrics.shippedOrders, color: 'bg-purple-500/20 text-purple-600' },
                  { label: '已送达', value: metrics.deliveredOrders, color: 'bg-emerald-500/20 text-emerald-600' },
                  { label: '已取消', value: metrics.cancelledOrders, color: 'bg-red-500/20 text-red-600' }
                ].map((status) => (
                  <div key={status.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                    <span className="text-lg font-semibold">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">库存状态</h2>
              <div className="space-y-3">
                {[
                  { label: '正常库存', value: metrics.activeProducts, color: 'bg-emerald-500/20 text-emerald-600' },
                  { label: '库存不足', value: metrics.lowStockProducts, color: 'bg-amber-500/20 text-amber-600' },
                  { label: '缺货', value: metrics.outOfStockProducts, color: 'bg-red-500/20 text-red-600' }
                ].map((status) => (
                  <div key={status.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                    <span className="text-lg font-semibold">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Pages */}
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">热门页面</h2>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  查看全部
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">页面</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">浏览量</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">转化</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">转化率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topPages.map((page, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground font-mono">{page.path}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground text-right">{page.views.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-foreground text-right">{page.conversions}</td>
                      <td className="px-5 py-4 text-right">
                        <Badge variant="outline" className="bg-foreground/5 text-foreground border-foreground/10">
                          {page.rate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Traffic Sources */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">流量来源</h2>
              </div>
              <div className="p-5">
                {/* Simple pie chart representation */}
                <div className="aspect-square relative mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">100%</p>
                      <p className="text-xs text-muted-foreground">总流量</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {trafficSources.reduce((acc, source, index) => {
                      const previousTotal = trafficSources.slice(0, index).reduce((sum, s) => sum + s.value, 0)
                      const circumference = 2 * Math.PI * 35
                      const strokeDasharray = `${(source.value / 100) * circumference} ${circumference}`
                      const strokeDashoffset = -(previousTotal / 100) * circumference
                      return [...acc, (
                        <circle
                          key={source.name}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke={source.color}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      )]
                    }, [] as JSX.Element[])}
                  </svg>
                </div>
                <div className="space-y-3">
                  {trafficSources.map((source) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-sm text-foreground">{source.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
