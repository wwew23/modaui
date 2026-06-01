"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Sparkles,
  Send,
  X,
  Loader2,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Wand2,
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  FileText,
  Settings,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActiveTab } from "@/lib/types"

interface AIAssistantPanelProps {
  activeTab: ActiveTab
  onClose: () => void
}

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  status?: "pending" | "executing" | "success" | "error"
  actions?: AIAction[]
  executedAction?: string
}

interface AIAction {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  status?: "idle" | "executing" | "success" | "error"
  result?: string
}

// 每个页面的 AI 能力定义
const pageAICapabilities: Record<string, { 
  title: string
  description: string
  quickActions: AIAction[]
}> = {
  dashboard: {
    title: "仪表盘 AI",
    description: "分析数据、生成报告、预测趋势",
    quickActions: [
      { id: "report", label: "生成今日报告", description: "自动汇总销售、订单、客户数据", icon: <FileText className="h-3.5 w-3.5" /> },
      { id: "forecast", label: "销量预测", description: "基于历史数据预测未来7天销量", icon: <TrendingUp className="h-3.5 w-3.5" /> },
      { id: "optimize", label: "优化建议", description: "分析数据并给出运营优化建议", icon: <Wand2 className="h-3.5 w-3.5" /> },
    ]
  },
  products: {
    title: "产品 AI",
    description: "批量操作、智能定价、库存优化",
    quickActions: [
      { id: "generate-desc", label: "批量生成描述", description: "为选中产品生成 SEO 优化描述", icon: <FileText className="h-3.5 w-3.5" /> },
      { id: "optimize-price", label: "智能定价", description: "分析市场数据优化产品定价", icon: <TrendingUp className="h-3.5 w-3.5" /> },
      { id: "inventory", label: "库存预警", description: "分析库存状态并预测补货时间", icon: <Package className="h-3.5 w-3.5" /> },
    ]
  },
  orders: {
    title: "订单 AI",
    description: "批量处理、异常检测、物流优化",
    quickActions: [
      { id: "batch-ship", label: "批量发货", description: "自动处理所有待发货订单", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
      { id: "detect-anomaly", label: "异常检测", description: "检测可疑订单和欺诈行为", icon: <AlertCircle className="h-3.5 w-3.5" /> },
      { id: "optimize-route", label: "物流优化", description: "优化发货路线降低物流成本", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    ]
  },
  customers: {
    title: "客户 AI",
    description: "客户分析、流失预警、精准营销",
    quickActions: [
      { id: "segment", label: "客户分群", description: "基于行为自动划分客户群体", icon: <Users className="h-3.5 w-3.5" /> },
      { id: "churn", label: "流失预警", description: "识别高流失风险客户", icon: <AlertCircle className="h-3.5 w-3.5" /> },
      { id: "recommend", label: "营销建议", description: "针对不同客户群生成营销策略", icon: <Wand2 className="h-3.5 w-3.5" /> },
    ]
  },
  marketing: {
    title: "营销 AI",
    description: "活动创建、文案生成、效果分析",
    quickActions: [
      { id: "create-campaign", label: "创建活动", description: "一键创建完整营销活动", icon: <Zap className="h-3.5 w-3.5" /> },
      { id: "generate-copy", label: "生成文案", description: "为活动生成吸引人的文案", icon: <FileText className="h-3.5 w-3.5" /> },
      { id: "analyze-roi", label: "ROI 分析", description: "分析营销活动投入产出比", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    ]
  },
  analytics: {
    title: "分析 AI",
    description: "深度分析、趋势洞察、报告生成",
    quickActions: [
      { id: "deep-analysis", label: "深度分析", description: "对所有数据进行综合分析", icon: <BarChart3 className="h-3.5 w-3.5" /> },
      { id: "find-insight", label: "发现洞察", description: "自动发现数据中的关键洞察", icon: <Sparkles className="h-3.5 w-3.5" /> },
      { id: "export-report", label: "导出报告", description: "生成并导出详细分析报告", icon: <FileText className="h-3.5 w-3.5" /> },
    ]
  },
  agents: {
    title: "智能体管理",
    description: "创建、配置、监控 AI 智能体",
    quickActions: [
      { id: "create-agent", label: "创建智能体", description: "创建新的自动化智能体", icon: <Sparkles className="h-3.5 w-3.5" /> },
      { id: "optimize-agent", label: "优化配置", description: "优化现有智能体性能", icon: <Settings className="h-3.5 w-3.5" /> },
      { id: "view-logs", label: "查看日志", description: "查看智能体执行日志", icon: <FileText className="h-3.5 w-3.5" /> },
    ]
  },
}

export function AIAssistantPanel({ activeTab, onClose }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const capabilities = pageAICapabilities[activeTab] || pageAICapabilities.dashboard

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 执行 AI 操作
  const executeAction = useCallback(async (action: AIAction) => {
    setExecutingAction(action.id)
    
    // 添加系统消息
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: "system",
      content: `正在执行：${action.label}`,
      timestamp: new Date(),
      status: "executing"
    }
    setMessages(prev => [...prev, systemMessage])

    // 模拟执行
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500))

    // 更新状态为成功
    const resultMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getActionResult(action.id, activeTab),
      timestamp: new Date(),
      status: "success",
      executedAction: action.label
    }

    setMessages(prev => [
      ...prev.filter(m => m.id !== systemMessage.id),
      resultMessage
    ])
    setExecutingAction(null)
  }, [activeTab])

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: generateAIResponse(input, activeTab),
      timestamp: new Date(),
      actions: generateSuggestedActions(input, activeTab)
    }

    setMessages(prev => [...prev, aiMessage])
    setIsTyping(false)
  }, [input, isTyping, activeTab])

  return (
    <div className="w-[340px] h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{capabilities.title}</h3>
            <p className="text-[10px] text-muted-foreground">{capabilities.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-hover transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-label mb-2">快捷操作</p>
        <div className="space-y-1.5">
          {capabilities.quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              disabled={executingAction !== null}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-lg border border-border text-left transition-all duration-150",
                executingAction === action.id 
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background hover:border-foreground/30 hover:bg-hover"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                executingAction === action.id ? "bg-background/20" : "bg-muted"
              )}>
                {executingAction === action.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  action.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{action.label}</p>
                <p className={cn(
                  "text-[10px] truncate",
                  executingAction === action.id ? "text-background/70" : "text-muted-foreground"
                )}>{action.description}</p>
              </div>
              {executingAction === action.id ? (
                <span className="text-[10px] text-background/70">执行中...</span>
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">开始对话</p>
            <p className="text-xs text-muted-foreground">输入指令或使用上方快捷操作</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "animate-slide-up",
              message.role === "user" && "flex justify-end"
            )}
          >
            {message.role === "system" ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{message.content}</span>
              </div>
            ) : message.role === "user" ? (
              <div className="max-w-[85%] px-3 py-2 rounded-lg bg-foreground text-background text-xs">
                {message.content}
              </div>
            ) : (
              <div className="space-y-2">
                {message.executedAction && (
                  <div className="flex items-center gap-1.5 text-[10px] text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{message.executedAction} 完成</span>
                  </div>
                )}
                <div className="px-3 py-2.5 rounded-lg bg-muted text-xs text-foreground whitespace-pre-wrap">
                  {message.content}
                </div>
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {message.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => executeAction(action)}
                        className="px-2.5 py-1 rounded-md bg-background border border-border text-[10px] font-medium hover:border-foreground/30 transition-colors"
                      >
                        <Play className="h-2.5 w-2.5 inline mr-1" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted animate-fade-in">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-ai-thinking" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-ai-thinking" style={{ animationDelay: "0.15s" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-ai-thinking" style={{ animationDelay: "0.3s" }} />
            </div>
            <span className="text-[10px] text-muted-foreground">AI 正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="输入指令..."
            className="flex-1 h-9 px-3 rounded-lg bg-muted border-0 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-150",
              input.trim() && !isTyping
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// 根据操作生成结果
function getActionResult(actionId: string, context: string): string {
  const results: Record<string, string> = {
    "report": `今日销售报告已生成：

销售总额：¥128,450 (↑12.5%)
订单数量：284 笔
平均客单价：¥452
转化率：3.24%

热销产品 TOP 3：
1. 智能手表 Pro - 56 件
2. 无线耳机 Ultra - 43 件  
3. 便携充电宝 - 38 件

建议：转化率较昨日下降 0.3%，建议检查商品详情页。`,
    
    "forecast": `未来 7 天销量预测：

预计总销售额：¥896,000
预计订单数：1,980 笔
置信度：87%

趋势分析：
- 周末销量预计上涨 25%
- 周三可能出现销量低谷
- 建议提前备货热销品类`,

    "batch-ship": `批量发货完成：

已处理订单：12 笔
成功发货：12 笔
已发送通知：12 条
预计送达：2-3 个工作日

物流商分配：
- 顺丰：8 笔
- 中通：4 笔`,

    "segment": `客户分群分析完成：

高价值客户 (23%)
- 平均消费：¥12,450
- 复购率：68%

活跃客户 (45%)
- 30天内有购买
- 平均客单价：¥380

潜力客户 (20%)
- 浏览多购买少
- 建议：发送优惠券激活

流失风险 (12%)
- 90天无活动
- 建议：召回营销`,

    "create-campaign": `营销活动已创建：

活动名称：夏季促销
活动时间：7月1日 - 7月15日
目标客群：全部活跃用户
预估触达：12,450 人

已自动生成：
- 活动海报 x 3
- 推送文案 x 5
- 短信模板 x 2`,
  }

  return results[actionId] || `操作「${actionId}」已成功执行。\n\n相关数据已更新，您可以在对应页面查看详情。`
}

// 生成 AI 响应
function generateAIResponse(input: string, context: string): string {
  if (input.includes("销售") || input.includes("报告")) {
    return "根据您的需求，我可以帮您生成详细的销售报告。点击下方按钮开始执行。"
  }
  if (input.includes("发货") || input.includes("订单")) {
    return "检测到 12 笔待发货订单。我可以帮您批量处理，自动生成发货单并通知客户。"
  }
  if (input.includes("客户") || input.includes("分析")) {
    return "我可以帮您分析客户数据，识别高价值客户和流失风险客户，并给出精准营销建议。"
  }
  return `好的，我理解您的需求是「${input}」。\n\n我可以帮您执行以下相关操作：`
}

// 生成建议操作
function generateSuggestedActions(input: string, context: string): AIAction[] {
  if (input.includes("销售")) {
    return [
      { id: "report", label: "生成报告" },
      { id: "forecast", label: "预测趋势" },
    ]
  }
  if (input.includes("发货")) {
    return [
      { id: "batch-ship", label: "批量发货" },
    ]
  }
  return [
    { id: "analyze", label: "开始分析" },
  ]
}
