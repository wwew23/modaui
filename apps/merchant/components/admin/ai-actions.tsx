"use client"

import { useState, useCallback } from "react"
import { 
  Sparkles, 
  Play, 
  Check, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  Zap,
  Bot,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AIAction, AIActionStatus, AIActionResult } from "@/lib/types"

interface AIActionCardProps {
  action: AIAction
  onExecute: (action: AIAction) => Promise<AIActionResult>
  disabled?: boolean
  compact?: boolean
}

export function AIActionCard({ action, onExecute, disabled, compact }: AIActionCardProps) {
  const [status, setStatus] = useState<AIActionStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AIActionResult | null>(null)

  const handleExecute = useCallback(async () => {
    if (status === "executing" || disabled) return
    
    setStatus("pending")
    setProgress(0)
    
    // 模拟进度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 200)
    
    setStatus("executing")
    
    try {
      const result = await onExecute(action)
      clearInterval(progressInterval)
      setProgress(100)
      setResult(result)
      setStatus(result.status === "success" ? "success" : "error")
      
      // 重置状态
      setTimeout(() => {
        setStatus("idle")
        setProgress(0)
        setResult(null)
      }, 3000)
    } catch {
      clearInterval(progressInterval)
      setStatus("error")
      setTimeout(() => {
        setStatus("idle")
        setProgress(0)
      }, 3000)
    }
  }, [action, onExecute, status, disabled])

  const getStatusIcon = () => {
    switch (status) {
      case "executing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <Check className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "executing":
        return "bg-foreground text-background"
      case "success":
        return "bg-foreground text-background"
      case "error":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-foreground text-background hover:bg-foreground/90"
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleExecute}
        disabled={disabled || status === "executing"}
        className={`
          group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 ai-action-btn
          ${status === "idle" 
            ? "bg-foreground text-background hover:bg-foreground/90" 
            : status === "executing"
            ? "bg-foreground/80 text-background"
            : status === "success"
            ? "bg-foreground text-background"
            : "bg-destructive text-destructive-foreground"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>{action.label}</span>
        {status === "executing" && <Loader2 className="h-3.5 w-3.5 animate-spin ml-1" />}
        {status === "success" && <Check className="h-3.5 w-3.5 ml-1" />}
      </button>
    )
  }

  return (
    <div className={`
      relative overflow-hidden rounded-xl border bg-card p-4
      transition-all duration-300 ai-card
      ${status === "executing" ? "ai-executing" : ""}
      ${disabled ? "opacity-60" : ""}
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`
            h-10 w-10 rounded-lg flex items-center justify-center shrink-0
            ${status === "executing" ? "bg-foreground animate-ai-pulse" : "bg-muted"}
          `}>
            <Bot className={`h-5 w-5 ${status === "executing" ? "text-background" : "text-foreground"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">{action.label}</h4>
              {action.estimatedTime && (
                <Badge variant="secondary" className="text-[10px]">
                  {action.estimatedTime}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {action.description}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleExecute}
          disabled={disabled || status === "executing"}
          size="sm"
          className={`shrink-0 gap-1.5 ai-action-btn ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">
            {status === "executing" ? "执行中" : status === "success" ? "完成" : status === "error" ? "失败" : "执行"}
          </span>
        </Button>
      </div>
      
      {/* 进度条 */}
      {(status === "executing" || status === "pending") && (
        <div className="mt-3">
          <Progress value={progress} className="h-1" />
        </div>
      )}
      
      {/* 结果消息 */}
      {result && status !== "idle" && (
        <div className={`
          mt-3 p-2 rounded-lg text-sm animate-slide-up
          ${status === "success" ? "bg-muted text-foreground" : "bg-destructive/10 text-destructive"}
        `}>
          {result.message}
        </div>
      )}
    </div>
  )
}

interface AIActionGridProps {
  actions: AIAction[]
  onExecute: (action: AIAction) => Promise<AIActionResult>
  columns?: 1 | 2 | 3
  title?: string
  subtitle?: string
}

export function AIActionGrid({ actions, onExecute, columns = 2, title, subtitle }: AIActionGridProps) {
  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
            <Zap className="h-4 w-4 text-background" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={`grid gap-3 ${
        columns === 1 ? "grid-cols-1" : 
        columns === 2 ? "grid-cols-1 lg:grid-cols-2" : 
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      }`}>
        {actions.map((action) => (
          <AIActionCard key={action.id} action={action} onExecute={onExecute} />
        ))}
      </div>
    </div>
  )
}

interface AIQuickActionsProps {
  actions: AIAction[]
  onExecute: (action: AIAction) => Promise<AIActionResult>
}

export function AIQuickActions({ actions, onExecute }: AIQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <AIActionCard key={action.id} action={action} onExecute={onExecute} compact />
      ))}
    </div>
  )
}

interface AIContextBarProps {
  context: string
  suggestion?: string
  action?: AIAction
  onExecute?: (action: AIAction) => Promise<AIActionResult>
}

export function AIContextBar({ context, suggestion, action, onExecute }: AIContextBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-muted/50 border border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-background" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{context}</p>
          {suggestion && (
            <p className="text-xs text-muted-foreground truncate">{suggestion}</p>
          )}
        </div>
      </div>
      {action && onExecute && (
        <Button 
          size="sm" 
          className="shrink-0 gap-1.5 ai-action-btn"
          onClick={() => onExecute(action)}
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

interface AIExecutionLogProps {
  logs: { time: string; message: string; status: "info" | "success" | "error" }[]
}

export function AIExecutionLog({ logs }: AIExecutionLogProps) {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border max-h-48 overflow-y-auto">
      {logs.map((log, i) => (
        <div key={i} className="flex items-start gap-2 text-sm animate-fade-in">
          <span className="text-muted-foreground font-mono text-xs shrink-0">{log.time}</span>
          <span className={`
            ${log.status === "success" ? "text-foreground" : 
              log.status === "error" ? "text-destructive" : "text-muted-foreground"}
          `}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  )
}

interface AISuggestionCardProps {
  title: string
  description: string
  priority?: "low" | "medium" | "high" | "urgent"
  action?: AIAction
  onExecute?: (action: AIAction) => Promise<AIActionResult>
  onDismiss?: () => void
}

export function AISuggestionCard({ 
  title, 
  description, 
  priority = "medium",
  action, 
  onExecute,
  onDismiss 
}: AISuggestionCardProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case "urgent": return "border-l-destructive"
      case "high": return "border-l-foreground"
      case "medium": return "border-l-muted-foreground"
      default: return "border-l-border"
    }
  }

  return (
    <div className={`
      relative p-4 rounded-xl bg-card border border-border border-l-4
      ${getPriorityColor()} card-hover
    `}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="sr-only">关闭</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {action && onExecute && (
        <div className="mt-3 flex justify-end">
          <AIActionCard action={action} onExecute={onExecute} compact />
        </div>
      )}
    </div>
  )
}
