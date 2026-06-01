"use client"

import { useState, useCallback } from "react"
import { 
  Megaphone,
  Mail,
  Target,
  Percent,
  CalendarDays,
  TrendingUp,
  Users,
  MousePointer,
  Sparkles,
  Loader2,
  Plus,
  CheckCircle,
  Wand2,
  Send,
  Clock,
  BarChart3,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AIAction, AIActionResult } from "@/lib/types"

const campaigns = [
  {
    id: "1",
    name: "春季大促活动",
    type: "promotion",
    status: "active",
    budget: 50000,
    spent: 32500,
    reach: 125000,
    clicks: 8500,
    conversions: 342,
    startDate: "2024-03-01",
    endDate: "2024-03-31",
  },
  {
    id: "2",
    name: "新品发布预热",
    type: "awareness",
    status: "scheduled",
    budget: 30000,
    spent: 0,
    reach: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2024-04-01",
    endDate: "2024-04-15",
  },
  {
    id: "3",
    name: "会员专属优惠",
    type: "retention",
    status: "active",
    budget: 20000,
    spent: 15800,
    reach: 45000,
    clicks: 5200,
    conversions: 189,
    startDate: "2024-02-15",
    endDate: "2024-03-15",
  },
  {
    id: "4",
    name: "节日礼品推荐",
    type: "promotion",
    status: "completed",
    budget: 40000,
    spent: 38500,
    reach: 180000,
    clicks: 12000,
    conversions: 520,
    startDate: "2024-02-01",
    endDate: "2024-02-14",
  },
]

const emailTemplates = [
  { id: "1", name: "欢迎邮件", openRate: 45.2, clickRate: 12.5, lastUsed: "2天前" },
  { id: "2", name: "订单确认", openRate: 78.5, clickRate: 8.3, lastUsed: "1小时前" },
  { id: "3", name: "促销通知", openRate: 32.1, clickRate: 18.7, lastUsed: "5天前" },
  { id: "4", name: "会员积分", openRate: 41.8, clickRate: 15.2, lastUsed: "3天前" },
]

// AI Actions for marketing
const marketingAIActions: AIAction[] = [
  {
    id: "generate-campaign",
    type: "generate",
    label: "AI 生成营销方案",
    description: "根据目标受众自动生成营销活动方案",
    icon: "Wand2",
    context: "marketing",
    estimatedTime: "约 20 秒",
  },
  {
    id: "optimize-budget",
    type: "optimize",
    label: "智能预算分配",
    description: "AI 分析数据优化广告预算分配",
    icon: "Target",
    context: "marketing",
    estimatedTime: "约 15 秒",
  },
  {
    id: "write-copy",
    type: "generate",
    label: "AI 撰写文案",
    description: "自动生成吸引人的营销文案",
    icon: "Wand2",
    context: "marketing",
    estimatedTime: "约 10 秒",
  },
  {
    id: "schedule-optimal",
    type: "analyze",
    label: "最佳发送时间",
    description: "分析用户行为找出最佳投放时间",
    icon: "Clock",
    context: "marketing",
    estimatedTime: "约 12 秒",
  },
]

export function MarketingView() {
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id)
    setAiResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
    
    const messages: Record<string, string> = {
      "generate-campaign": "已生成「夏日清凉季」营销方案，预计触达 15 万用户",
      "optimize-budget": "建议将 30% 预算从展示广告转移到社交媒体",
      "write-copy": "已生成 5 组营销文案，点击查看详情",
      "schedule-optimal": "最佳发送时间：周三 10:00 和周六 14:00",
    }
    
    setAiResult(messages[action.id] || "操作完成")
    setAiExecuting(null)
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: messages[action.id] || "操作完成",
      startTime: new Date().toISOString(),
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "scheduled": return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "completed": return "bg-muted text-muted-foreground border-border"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "进行中"
      case "scheduled": return "计划中"
      case "completed": return "已完成"
      default: return status
    }
  }

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">营销</h1>
              <p className="text-sm text-muted-foreground mt-1">管理您的营销活动和推广</p>
            </div>
            <Button className="gap-2 ai-action-btn">
              <Plus className="h-4 w-4" />
              创建活动
            </Button>
          </div>

          {/* AI Actions Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI 营销助手</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {marketingAIActions.map((action) => (
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
                  ) : action.icon === "Wand2" ? (
                    <Wand2 className="h-3.5 w-3.5" />
                  ) : action.icon === "Target" ? (
                    <Target className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm text-foreground animate-fade-in flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                {aiResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">总预算</span>
              </div>
              <p className="text-2xl font-bold text-foreground">¥{totalBudget.toLocaleString()}</p>
              <div className="mt-2">
                <Progress value={(totalSpent / totalBudget) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">已使用 {Math.round((totalSpent / totalBudget) * 100)}%</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">总触达</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{(totalReach / 1000).toFixed(1)}K</p>
              <p className="text-xs text-muted-foreground mt-1">累计触达用户</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <MousePointer className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">点击率</span>
              </div>
              <p className="text-2xl font-bold text-foreground">6.8%</p>
              <p className="text-xs text-emerald-600 mt-1">高于行业平均 2.3%</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">转化数</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
              <p className="text-xs text-muted-foreground mt-1">本月累计转化</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaigns */}
            <div className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">营销活动</h2>
                <Button variant="ghost" size="sm" className="text-xs">
                  查看全部
                </Button>
              </div>
              <div className="divide-y divide-border">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="px-5 py-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{campaign.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {campaign.startDate} - {campaign.endDate}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {getStatusText(campaign.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">预算</p>
                        <p className="font-medium text-foreground">¥{campaign.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">触达</p>
                        <p className="font-medium text-foreground">{(campaign.reach / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">点击</p>
                        <p className="font-medium text-foreground">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">转化</p>
                        <p className="font-medium text-foreground">{campaign.conversions}</p>
                      </div>
                    </div>
                    {campaign.status === "active" && (
                      <div className="mt-3">
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-1.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Templates */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">邮件模板</h2>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <Sparkles className="h-3 w-3" />
                  AI 生成
                </Button>
              </div>
              <div className="divide-y divide-border">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="px-5 py-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground text-sm">{template.name}</h3>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        打开率 <span className="text-foreground font-medium">{template.openRate}%</span>
                      </span>
                      <span className="text-muted-foreground">
                        点击率 <span className="text-foreground font-medium">{template.clickRate}%</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{template.lastUsed}使用</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
