"use client"

import { useState, useCallback } from "react"
import { 
  Tag, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  ChevronDown, 
  Download,
  Sparkles,
  Loader2,
  Wand2,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { apiClient } from '@/lib/api-client'
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Discount, AIAction, AIActionResult } from "@/lib/types"

interface DiscountsViewProps {
  discounts: Discount[]
  setDiscounts: (discounts: Discount[]) => void
}

const discountAIActions: AIAction[] = [
  {
    id: "generate-code",
    type: "generate",
    label: "AI 生成折扣码",
    description: "自动为特定活动生成优化且易记的推广折扣码",
    icon: "Wand2",
    context: "discounts",
    estimatedTime: "约 5 秒",
  },
  {
    id: "optimize-rate",
    type: "optimize",
    label: "智能力度推荐",
    description: "根据当前库存与销售趋势，智能计算推荐的折扣额度",
    icon: "Percent",
    context: "discounts",
    estimatedTime: "约 15 秒",
  },
  {
    id: "clean-expired",
    type: "automate",
    label: "自动清理过期",
    description: "AI 自动检索或停用、归档所有已失效/过期的折扣码",
    icon: "Calendar",
    context: "discounts",
    estimatedTime: "约 8 秒",
  }
]

export function DiscountsView({ discounts, setDiscounts }: DiscountsViewProps) {
  // Safe default parameter assignment to prevent crash switching tabs
  const activeDiscounts = discounts || []

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "scheduled">("all")
  const [aiExecuting, setAiExecuting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id)
    setAiResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
    
    let message = ""
    if (action.id === "generate-code") {
      const generatedCode = "SPRING30"
      message = `AI 已自动生成并建议添加折扣码「${generatedCode}」(7折优惠卷)`
      const newDiscount: Discount = {
        id: `DSC-${Date.now()}`,
        code: generatedCode,
        type: "percentage",
        value: 30,
        usageCount: 0,
        usageLimit: 300,
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }
      setDiscounts([...activeDiscounts, newDiscount])
    } else if (action.id === "optimize-rate") {
      message = "智能分析完毕！建议针对「智能外设」品类派发15%的限定面额折扣"
    } else if (action.id === "clean-expired") {
      const expiredCount = activeDiscounts.filter(d => d.status === "expired").length
      message = `AI 已检测到 ${expiredCount} 项过期或失效折扣，执行了自动归档/状态置灰`
      if (expiredCount > 0) {
        setDiscounts(activeDiscounts.map(d => d.status === "expired" ? { ...d, status: "expired" as const } : d))
      }
    } else {
      message = "操作完成"
    }
    
    setAiResult(message)
    setAiExecuting(null)
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: message,
      startTime: new Date().toISOString(),
    }
  }, [activeDiscounts, setDiscounts])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      case "expired": return "bg-muted text-muted-foreground border-border"
      case "scheduled": return "bg-blue-500/10 text-blue-600 border-blue-200"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "活跃中"
      case "expired": return "已过期"
      case "scheduled": return "计划中"
      default: return status
    }
  }

  const filteredDiscounts = activeDiscounts.filter(d => {
    const matchesSearch = d.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedDiscounts.length === filteredDiscounts.length) {
      setSelectedDiscounts([])
    } else {
      setSelectedDiscounts(filteredDiscounts.map(d => d.id))
    }
  }

  const toggleSelectDiscount = (id: string) => {
    if (selectedDiscounts.includes(id)) {
      setSelectedDiscounts(selectedDiscounts.filter(d => d !== id))
    } else {
      setSelectedDiscounts([...selectedDiscounts, id])
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">折扣</h1>
              <p className="text-sm text-muted-foreground mt-1">创建和管理面向买家的折扣代码和优惠活动</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button className="gap-2 ai-action-btn" onClick={async () => {
                const code = (prompt("请输入折扣代码 (例如 SPRING20):") || `SUPER-${Math.floor(Math.random() * 900 + 100)}`).toUpperCase()
                const value = Number(prompt("请输入折扣比例 (%) 或固定金额:") || "20") || 20
                const payload = {
                  code,
                  type: "percentage",
                  value,
                  usageLimit: 500,
                  status: "active",
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                }

                try {
                  const created = await apiClient.createDiscount(payload)
                  setDiscounts([created, ...activeDiscounts])
                } catch (error) {
                  console.error('Create discount failed:', error)
                }
              }}>
                <Plus className="h-4 w-4" />
                创建折扣代码
              </Button>
            </div>
          </div>

          {/* AI Actions */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI 自动化</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {discountAIActions.map((action) => (
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
                  ) : action.icon === "Wand2" ? (
                    <Wand2 className="h-3.5 w-3.5" />
                  ) : action.icon === "Percent" ? (
                    <Percent className="h-3.5 w-3.5" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm font-medium text-foreground animate-fade-in flex items-center gap-1.5 max-w-md truncate">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{aiResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["all", "active", "scheduled", "expired"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {status === "all" ? "全部折扣" : status === "active" ? "活跃" : status === "scheduled" ? "待生效" : "已过期"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索折扣代码..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
          </div>

          {selectedDiscounts.length > 0 && (
            <div className="bg-foreground text-background rounded-xl p-4 flex items-center justify-between animate-slide-up">
              <span className="text-sm font-medium">已选择 {selectedDiscounts.length} 个项目</span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="bg-background/10 text-background hover:bg-background/20">
                  停用折扣
                </Button>
                <Button variant="secondary" size="sm" className="bg-red-500/20 text-red-100 hover:bg-red-500/30">
                  批量删除
                </Button>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-3 px-4 text-left w-12">
                    <Checkbox 
                      checked={selectedDiscounts.length === filteredDiscounts.length && filteredDiscounts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">优惠码</th>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">类型</th>
                  <th className="py-3 px-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">额度 / 面值</th>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">使用次数 (限额)</th>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">有效期</th>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">状态</th>
                  <th className="py-3 px-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDiscounts.map((discount) => {
                  const usagePercent = Math.min((discount.usageCount / discount.usageLimit) * 100, 100)
                  return (
                    <tr key={discount.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3 px-4">
                        <Checkbox 
                          checked={selectedDiscounts.includes(discount.id)}
                          onCheckedChange={() => toggleSelectDiscount(discount.id)}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-sm font-semibold text-foreground">
                        {discount.code}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {discount.type === "percentage" ? "百分比折扣" : "固定金额折扣"}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-foreground">
                        {discount.type === "percentage" ? `${discount.value}%` : `¥${discount.value}`}
                      </td>
                      <td className="py-3 px-4 w-60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground font-medium">{discount.usageCount} / {discount.usageLimit} 次</span>
                            <span className="text-muted-foreground">{Math.round(usagePercent)}%</span>
                          </div>
                          <Progress value={usagePercent} className="h-1.5" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <div>{discount.startDate || "无限制"}</div>
                        <div className="mt-0.5">至 {discount.endDate || "无限制"}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(discount.status)}>
                          {getStatusText(discount.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredDiscounts.length === 0 && (
              <div className="px-4 py-12 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">当前还没有任何折扣码</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
