"use client"

import { useState, useCallback } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Bot,
  Store,
  BarChart3,
  Sparkles,
  Zap,
  RefreshCw,
  FileText,
  Target,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AIActionCard, AISuggestionCard } from "@/components/admin/ai-actions"
import type { AIAction, AIActionResult } from "@/lib/types"

// 内置统计数据
const stats = [
  { 
    label: "昨日销售额", 
    value: "¥128,450", 
    change: "+12.5%", 
    trend: "up" as const,
    icon: DollarSign,
    description: "较前日增长"
  },
  { 
    label: "昨日利润", 
    value: "¥32,100", 
    change: "+8.9%", 
    trend: "up" as const,
    icon: TrendingUp,
    description: "毛利率保持稳定"
  },
  { 
    label: "新增客户", 
    value: "128", 
    change: "+10.2%", 
    trend: "up" as const,
    icon: Users,
    description: "较昨日新增客户数"
  },
  { 
    label: "库存风险", 
    value: "3 个", 
    change: "-1.0%", 
    trend: "down" as const,
    icon: AlertCircle,
    description: "低库存产品数量"
  },
]

const recentOrders = [
  { id: "ORD-9921", customer: "张伟", amount: 3898, status: "pending", time: "10分钟前" },
  { id: "ORD-9920", customer: "李娜", amount: 899, status: "processing", time: "25分钟前" },
  { id: "ORD-9919", customer: "王芳", amount: 5497, status: "shipped", time: "1小时前" },
  { id: "ORD-9918", customer: "刘强", amount: 199, status: "delivered", time: "2小时前" },
]

const topProducts = [
  { name: "智能手表 Pro Max", sales: 156, revenue: 467244, growth: 15.2 },
  { name: "无线降噪耳机", sales: 342, revenue: 307458, growth: 8.5 },
  { name: "机械键盘 87键", sales: 89, revenue: 53311, growth: -2.3 },
  { name: "4K显示器 27英寸", sales: 45, revenue: 112455, growth: 12.8 },
]

// AI Actions 定义
const dashboardAIActions: AIAction[] = [
  {
    id: "generate-report",
    type: "generate",
    label: "生成销售报告",
    description: "AI 自动分析今日销售数据，生成详细报告",
    icon: "FileText",
    context: "dashboard",
    estimatedTime: "约 15 秒",
  },
  {
    id: "optimize-inventory",
    type: "optimize",
    label: "优化库存建议",
    description: "根据销售趋势智能计算最佳补货方案",
    icon: "Package",
    context: "dashboard",
    estimatedTime: "约 10 秒",
  },
  {
    id: "analyze-trends",
    type: "analyze",
    label: "分析销售趋势",
    description: "AI 深度分析近 7 天销售数据，发现潜在机会",
    icon: "TrendingUp",
    context: "dashboard",
    estimatedTime: "约 20 秒",
  },
  {
    id: "auto-process-orders",
    type: "automate",
    label: "批量处理订单",
    description: "自动处理所有待处理订单，更新状态",
    icon: "Zap",
    context: "dashboard",
    estimatedTime: "约 30 秒",
    requiresConfirmation: true,
  },
]

const DASHBOARD_TEAM_MEMBERS = [
  { emoji: "👗", name: "李设计师", title: "设计师" },
  { emoji: "📦", name: "陈采购经理", title: "采购经理" },
  { emoji: "📈", name: "王运营总监", title: "运营总监" },
  { emoji: "📣", name: "张营销总监", title: "营销总监" },
  { emoji: "💰", name: "刘会计", title: "会计" },
  { emoji: "💬", name: "赵客服主管", title: "客服主管" },
]

export function DashboardView({ showWelcome, onCloseWelcome }: { showWelcome: boolean; onCloseWelcome: () => void }) {
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<Record<string, AIActionResult>>({})

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id)
    
    // 模拟 AI 执行
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
    
    const result: AIActionResult = {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: getSuccessMessage(action.id),
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    }
    
    setAiResults(prev => ({ ...prev, [action.id]: result }))
    setAiExecuting(null)
    
    return result
  }, [])

  const getSuccessMessage = (actionId: string) => {
    const messages: Record<string, string> = {
      "generate-report": "销售报告已生成，今日总销售额 ¥128,450，同比增长 12.5%",
      "optimize-inventory": "已分析 6 个产品，建议补货：智能手表 Pro Max (50件)、便携充电宝 (100件)",
      "analyze-trends": "发现增长机会：无线耳机类目需求上涨 23%，建议增加营销投入",
      "auto-process-orders": "已自动处理 12 笔待处理订单，3 笔已发货通知",
    }
    return messages[actionId] || "操作完成"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">待处理</Badge>
      case "processing": return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">处理中</Badge>
      case "shipped": return <Badge variant="outline" className="bg-foreground/10 text-foreground border-foreground/20">已发货</Badge>
      case "delivered": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">已送达</Badge>
      default: return null
    }
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-10 sm:px-6">
          <div className="w-full max-w-3xl rounded-[32px] border border-[#2F3336] bg-[#050505] p-8 shadow-2xl">
            <div className="space-y-6 text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1EBAE6]">欢迎加入</p>
              <h1 className="text-4xl font-semibold tracking-[-0.03em]">已为您配置AI团队</h1>
              <p className="mx-auto max-w-2xl text-base text-[#94A3B8]">您的团队已经搭建完成，AI成员已准备好为您的业务赋能。</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {DASHBOARD_TEAM_MEMBERS.map((member) => (
                <div key={member.name} className="rounded-3xl border border-[#2F3336] bg-[#0E0E0E] p-5 text-left">
                  <div className="text-2xl">{member.emoji}</div>
                  <p className="mt-3 text-lg font-semibold text-white">{member.name}</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">{member.title}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">现在可以开始您的 AI 运营工作台。</p>
              </div>
              <Button variant="default" size="lg" className="w-full sm:w-auto bg-[#1EBAE6] text-black" onClick={onCloseWelcome}>
                开始工作
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI总经理</h1>
              <p className="text-sm text-muted-foreground mt-1">老板早上好，以下是昨日核心业务概览</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                3 个 AI 助理运行中
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <Store className="h-3.5 w-3.5" />
                4 个店铺在线
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl space-y-6">
          {/* AI Quick Actions */}
          <div className="bg-gradient-to-r from-foreground to-foreground/90 rounded-2xl p-6 text-background">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-background/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-background" />
                </div>
                <div>
                  <h2 className="font-semibold text-background">AI 智能助手</h2>
                  <p className="text-sm text-background/70">让 AI 帮您完成繁琐的工作</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5 bg-background/10 text-background border-background/20 hover:bg-background/20">
                <RefreshCw className="h-3.5 w-3.5" />
                刷新建议
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {dashboardAIActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAIAction(action)}
                  disabled={aiExecuting === action.id}
                  className={`
                    group flex flex-col items-start gap-2 p-4 rounded-xl 
                    bg-background/10 hover:bg-background/20 
                    transition-all duration-200 text-left
                    ${aiExecuting === action.id ? "animate-ai-pulse" : ""}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="h-8 w-8 rounded-lg bg-background/10 flex items-center justify-center">
                      {aiExecuting === action.id ? (
                        <Loader2 className="h-4 w-4 text-background animate-spin" />
                      ) : action.icon === "FileText" ? (
                        <FileText className="h-4 w-4 text-background" />
                      ) : action.icon === "Package" ? (
                        <Package className="h-4 w-4 text-background" />
                      ) : action.icon === "TrendingUp" ? (
                        <TrendingUp className="h-4 w-4 text-background" />
                      ) : (
                        <Zap className="h-4 w-4 text-background" />
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-background/50 group-hover:text-background group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-background">{action.label}</p>
                    <p className="text-xs text-background/60 mt-0.5">{action.estimatedTime}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* AI 执行结果 */}
            {Object.entries(aiResults).length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-background/10 animate-slide-up">
                <div className="flex items-center gap-2 text-background/80 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>{Object.values(aiResults)[Object.values(aiResults).length - 1]?.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div 
                  key={index} 
                  className="group p-5 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-all duration-300 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trend === "up" 
                        ? "bg-emerald-500/10 text-emerald-600" 
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h2 className="font-semibold text-foreground">最近订单</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">实时订单更新</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 text-xs"
                    onClick={() => handleAIAction(dashboardAIActions[3])}
                    disabled={aiExecuting === "auto-process-orders"}
                  >
                    {aiExecuting === "auto-process-orders" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                    AI 批量处理
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    查看全部
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-5 py-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                        {order.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.id} · {order.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <span className="text-sm font-semibold text-foreground">¥{order.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h2 className="font-semibold text-foreground">AI 洞察</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">智能分析建议</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">实时</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                <AISuggestionCard
                  title="库存预警"
                  description="智能手表 Pro Max 库存低于安全阈值，建议及时补货"
                  priority="high"
                  action={{
                    id: "restock",
                    type: "automate",
                    label: "自动补货",
                    description: "AI 自动生成补货订单",
                    icon: "Package",
                    context: "dashboard",
                  }}
                  onExecute={handleAIAction}
                />
                <AISuggestionCard
                  title="销售趋势"
                  description="无线耳机类目本周销量增长 23%，可考虑增加推广力度"
                  priority="medium"
                  action={{
                    id: "boost-marketing",
                    type: "automate",
                    label: "创建营销",
                    description: "AI 自动创建营销活动",
                    icon: "Target",
                    context: "dashboard",
                  }}
                  onExecute={handleAIAction}
                />
                <AISuggestionCard
                  title="价格建议"
                  description="机械键盘类目竞品价格下调，建议关注市场动态"
                  priority="low"
                />
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">热销产品</h2>
                <p className="text-xs text-muted-foreground mt-0.5">本周销量排行</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-xs"
                  onClick={() => handleAIAction(dashboardAIActions[0])}
                  disabled={aiExecuting === "generate-report"}
                >
                  {aiExecuting === "generate-report" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  生成报告
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  查看全部
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">产品</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">销量</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">销售额</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">增长</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">趋势</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground text-right font-medium">{product.sales}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-foreground text-right">¥{product.revenue.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${product.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {product.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {product.growth >= 0 ? "+" : ""}{product.growth}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Progress value={Math.min(100, Math.abs(product.growth) * 5)} className="h-1.5 w-16" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
