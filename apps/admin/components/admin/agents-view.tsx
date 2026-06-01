'use client';

import { Bot, Play, Pause, RefreshCw } from 'lucide-react';
import { AgentInfo } from '@/lib/types';

interface AgentsViewProps {
  agents: AgentInfo[];
}

export function AgentsView({ agents }: AgentsViewProps) {
  const getStatusLabel = (status: AgentInfo['status']) => {
    switch (status) {
      case 'executing':
        return '运行中';
      case 'paused':
        return '已暂停';
      case 'error':
        return '异常';
      default:
        return '空闲';
    }
  };

  const getStatusColor = (status: AgentInfo['status']) => {
    switch (status) {
      case 'executing':
        return 'bg-green-50 text-green-700';
      case 'paused':
        return 'bg-yellow-50 text-yellow-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">智能助理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理和监控所有 AI 助理</p>
      </div>

      {/* 助理卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 rounded-lg bg-card border border-border hover:border-foreground/20 transition-colors"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{agent.displayName}</h3>
                  <p className="text-[11px] text-muted-foreground">{agent.id}</p>
                </div>
              </div>
              <span className={`h-2 w-2 rounded-full ${
                agent.status === 'executing' 
                  ? 'bg-green-500 animate-pulse' 
                  : agent.status === 'paused'
                  ? 'bg-yellow-500'
                  : agent.status === 'error'
                  ? 'bg-red-500'
                  : 'bg-muted-foreground'
              }`} />
            </div>

            {/* 状态信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">状态</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(agent.status)}`}>
                  {getStatusLabel(agent.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">已完成任务</span>
                <span className="text-xs font-medium text-foreground">{agent.taskCount}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              {agent.status === 'executing' ? (
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors">
                  <Pause className="h-4 w-4" />
                  <span>暂停</span>
                </button>
              ) : (
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-sm text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Play className="h-4 w-4" />
                  <span>启动</span>
                </button>
              )}
              <button className="p-2 rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
