"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  ChevronRight,
  Activity,
  Cpu,
  Clock,
  Zap,
  RefreshCw,
  MoreHorizontal,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export function AgentsView() {
  const [agents, setAgents] = useState<any[]>([])
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [fetchedAgents, fetchedTasks] = await Promise.all([
        apiClient.getAgents(),
        apiClient.getAgentTasks()
      ])
      setAgents(fetchedAgents)
      setRecentTasks(fetchedTasks)
    } catch (error) {
      console.error("[AgentsView] Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 3000) // Poll every 3s
    return () => clearInterval(timer)
  }, [loadData])

  const handleTriggerTask = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    const action = agent.tools[0] // Trigger first tool for demo
    if (!action) {
      toast.error("此智能体没有可执行的动作")
      return
    }

    try {
      toast.promise(apiClient.runAgentTask(agentId, action, {}), {
        loading: `正在启动任务: ${action}...`,
        success: "任务已下发至执行器",
        error: "任务启动失败"
      })
      loadData()
    } catch (error) {
      console.error("Failed to run task:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "executing":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            运行中
          </Badge>
        )
      case "paused":
      case "idle":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
            <Pause className="h-3 w-3" />
            空闲
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            异常
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
            未知
          </Badge>
        )
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "executing":
      case "pending":
        return <Loader2 className="h-4 w-4 text-foreground animate-spin" />
      case "failed":
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground flex items-center justify-center">
                <Bot className="h-5 w-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">智能体</h1>
                <p className="text-sm text-muted-foreground mt-0.5">管理和监控 AI 自动化助手</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                {agents.filter(a => a.status === 'executing' || a.status === 'active').length} 个运行中
              </Badge>
              <Button className="gap-1.5" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4" />
                创建智能体
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agents List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "活跃智能体", value: agents.length.toString(), icon: Bot },
                { label: "今日任务", value: agents.reduce((acc, a) => acc + (a.taskCount || 0), 0).toString(), icon: Zap },
                { label: "平均响应", value: "2.1s", icon: Clock },
                { label: "成功率", value: "98.4%", icon: Activity },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-foreground font-mono-numbers">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索智能体..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                筛选
              </Button>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">正在连接 Agent Runtime...</p>
                </div>
              ) : agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`
                    p-5 rounded-xl border bg-card cursor-pointer transition-all duration-150
                    ${selectedAgentId === agent.id 
                      ? "border-foreground ring-1 ring-foreground" 
                      : "border-border hover:border-foreground/30"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        h-11 w-11 rounded-xl flex items-center justify-center
                        ${agent.status === "executing" ? "bg-foreground" : "bg-muted"}
                      `}>
                        <Bot className={`h-5 w-5 ${agent.status === "executing" ? "text-background" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{agent.displayName}</h3>
                        <p className="text-xs text-muted-foreground">{agent.model}</p>
                      </div>
                    </div>
                    {getStatusBadge(agent.status)}
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{agent.description}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-lg font-semibold text-foreground font-mono-numbers">{agent.taskCount || 0}</p>
                      <p className="text-[10px] text-muted-foreground">累计任务</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground font-mono-numbers">2.1s</p>
                      <p className="text-[10px] text-muted-foreground">平均耗时</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground font-mono-numbers">100%</p>
                      <p className="text-[10px] text-muted-foreground">成功率</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {agent.tools.slice(0, 2).map((tool: string) => (
                        <Badge key={tool} variant="secondary" className="text-[10px]">{tool}</Badge>
                      ))}
                      {agent.tools.length > 2 && (
                        <Badge variant="secondary" className="text-[10px]">+{agent.tools.length - 2}</Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">刚刚</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Task Log */}
        <div className="w-[320px] border-l border-border bg-card flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">最近任务</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={loadData}>
              <RefreshCw className="h-3 w-3" />
              刷新
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-border">
              {recentTasks.length === 0 ? (
                <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                  暂无执行记录
                </div>
              ) : recentTasks.map((task) => (
                <div key={task.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {getTaskStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{task.action}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {task.agentId} · {task.status}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {task.error && (
                    <p className="mt-1 text-[9px] text-destructive line-clamp-1">{task.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Agent Details (when selected) */}
          {selectedAgent && (
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">智能体操作</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  配置
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  日志
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1.5 col-span-2"
                  onClick={() => handleTriggerTask(selectedAgent.id)}
                  disabled={selectedAgent.status === 'executing'}
                >
                  {selectedAgent.status === 'executing' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  手动触发
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
