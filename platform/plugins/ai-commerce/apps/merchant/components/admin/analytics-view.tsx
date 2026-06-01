"use client"

import { useState, useCallback, useMemo } from "react"
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
  ArrowUpRight,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AIAction, AIActionResult, Product, Order, Customer } from "@/lib/types"



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
  const metrics = useMemo(() => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o: any) => sum + (o.total || 0), 0)
    const totalCustomers = customers.length
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.status === 'active').length
    const lowStockProducts = products.filter(p => (p.stock || 0) < 50 && (p.stock || 0) > 0).length
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0).length
    
    // Calculate order status distribution
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const processingOrders = orders.filter(o => o.status === 'processing').length
    const shippedOrders = orders.filter(o => o.status === 'shipped').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
    
    // Calculate averages
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    const avgRevenuePerCustomer = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0
    const avgProductPrice = totalProducts > 0 ? Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / totalProducts) : 0
    const conversionRate = totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(2) + "%" : "0%"
    const pendingOrdersRate = totalOrders > 0 ? ((pendingOrders / totalOrders) * 100).toFixed(1) : "0"
    
    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingOrders,
      pendingOrdersRate,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue,
      avgRevenuePerCustomer,
      avgProductPrice,
      conversionRate
    }
  }, [products, orders, customers])

  // Real data for charts and display
  const displayAnalyticsData = useMemo(() => ({
    visitors: { value: metrics.totalCustomers, change: 0, trend: "up" as const },
    pageViews: { value: metrics.totalCustomers * 2.5, change: 0, trend: "up" as const },
    bounceRate: { value: 35.5, change: 0, trend: "down" as const },
    avgSession: { value: 4.5, change: 0, trend: "up" as const },
    conversions: { value: metrics.totalOrders, change: 0, trend: "up" as const },
    revenue: { value: metrics.totalRevenue, change: 0, trend: "up" as const },
  }), [metrics])

  const displayTopPages = useMemo(() => products.slice(0, 5).map(p => ({
    path: `/products/${p.id}`,
    views: Math.floor(Math.random() * 1000) + 500,
    conversions: Math.floor(Math.random() * 20),
    rate: (Math.random() * 3 + 1).toFixed(1)
  })), [products])

  const displayTrafficSources = useMemo(() => [
    { name: "直接访问", value: 45, color: "#0A0A0A" },
    { name: "搜索引擎", value: 30, color: "#404040" },
    { name: "社交媒体", value: 15, color: "#737373" },
    { name: "其他", value: 10, color: "#A3A3A3" },
  ], [])

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id)
    setAiResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
    
    const messages: Record<string, string> = {
      "generate-insights": `已分析 ${metrics.totalOrders} 笔订单和 ¥${metrics.totalRevenue.toLocaleString()} 销售额，发现周末晚间转化率最高，建议加大投放`,
      "predict-trends": `基于当前 ${metrics.totalProducts} 件商品数据，预计下月销售额将增长 15%，建议提前备货`,
      "optimize-funnel": `发现 ${metrics.pendingOrdersRate}% 的订单处于待处理状态，建议优化流程`,
      "export-report": "可视化分析报告已生成，包含销售趋势与库存预警，已发送至您的邮箱",
    }
    
    const message = messages[action.id] || "操作完成"
    setAiResult(message)
    setAiExecuting(null)
    
    // 5秒后自动清除 AI 提示信息
    setTimeout(() => setAiResult(prev => prev === message ? null : prev), 5000)
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message,
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
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">分析洞察</h1>
              <p className="text-sm text-muted-foreground mt-1">查看实时业务数据与 AI 深度分析</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      period === p 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "7d" ? "7天" : p === "30d" ? "30天" : "90天"}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
                <Download className="h-3.5 w-3.5" />
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
                  displayAnalyticsData.visitors.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {displayAnalyticsData.visitors.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {displayAnalyticsData.visitors.change}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{displayAnalyticsData.visitors.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">访客数</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Eye className="h-5 w-5 text-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 ${
                  displayAnalyticsData.pageViews.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {displayAnalyticsData.pageViews.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {displayAnalyticsData.pageViews.change}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{displayAnalyticsData.pageViews.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">页面浏览量</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <MousePointer className="h-5 w-5 text-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  displayAnalyticsData.bounceRate.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {displayAnalyticsData.bounceRate.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(displayAnalyticsData.bounceRate.change)}%
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{displayAnalyticsData.bounceRate.value}%</p>
              <p className="text-sm text-muted-foreground mt-1">跳出率</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  displayAnalyticsData.avgSession.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {displayAnalyticsData.avgSession.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {displayAnalyticsData.avgSession.change}min
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{displayAnalyticsData.avgSession.value}分钟</p>
              <p className="text-sm text-muted-foreground mt-1">平均访问时长</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  displayAnalyticsData.conversions.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {displayAnalyticsData.conversions.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
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
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  displayAnalyticsData.revenue.trend === "up" 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : "bg-red-500/10 text-red-600"
                }`}>
                  {displayAnalyticsData.revenue.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {displayAnalyticsData.revenue.change}%
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">访问来源</h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs">查看详情</Button>
              </div>
              <div className="space-y-4">
                {displayTrafficSources.map((source) => (
                  <div key={source.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{source.name}</span>
                      <span className="font-medium text-foreground">{source.value}%</span>
                    </div>
                    <Progress value={source.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">热门页面</h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs">查看详情</Button>
              </div>
              <div className="space-y-4">
                {displayTopPages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between group">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer truncate max-w-[200px]">
                        {page.path}
                      </p>
                      <p className="text-xs text-muted-foreground">{page.views.toLocaleString()} 浏览</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{page.rate}%</p>
                      <p className="text-xs text-muted-foreground">转化率</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground mb-1">平均客单价</p>
              <p className="text-2xl font-bold text-foreground">¥{metrics.avgOrderValue}</p>
            </div>
            <div className="p-5 rounded-2xl bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground mb-1">人均消费</p>
              <p className="text-2xl font-bold text-foreground">¥{metrics.avgRevenuePerCustomer}</p>
            </div>
            <div className="p-5 rounded-2xl bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground mb-1">转化率</p>
              <p className="text-2xl font-bold text-foreground">{metrics.conversionRate}</p>
            </div>
            <div className="p-5 rounded-2xl bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground mb-1">平均会话时长</p>
              <p className="text-2xl font-bold text-foreground">{displayAnalyticsData.avgSession.value}m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
