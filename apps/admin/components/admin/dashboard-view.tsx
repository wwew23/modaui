'use client';

import { Users, Bot, FileText, TrendingUp, ArrowUpRight, Bell, Check, X, AlertTriangle } from 'lucide-react';
import type { AgentInfo, MerchantStore, RuntimeLog, ApprovalItem, Notification } from '@/lib/types';

interface DashboardViewProps {
  agents: AgentInfo[];
  merchants: MerchantStore[];
  logs: RuntimeLog[];
  approvals: ApprovalItem[];
  setApprovals: (approvals: ApprovalItem[]) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

export function DashboardView({ 
  agents, 
  merchants, 
  logs, 
  approvals, 
  setApprovals,
  notifications,
  setNotifications 
}: DashboardViewProps) {
  const activeAgents = agents.filter(a => a.status === 'executing').length;
  const activeMerchants = merchants.filter(m => m.status === 'active').length;
  const successLogs = logs.filter(l => l.status === 'success').length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = [
    { label: '活跃商户', value: activeMerchants, total: merchants.length, icon: Users, trend: '+12%' },
    { label: '在线助理', value: activeAgents, total: agents.length, icon: Bot, trend: '运行中' },
    { label: '今日操作', value: successLogs, total: logs.length, icon: FileText, trend: `${Math.round((successLogs / Math.max(logs.length, 1)) * 100)}%` },
    { label: '本月增长', value: '12.5', unit: '%', icon: TrendingUp, trend: '+2.3%' },
  ];

  const handleApproval = (id: string, status: 'approved' | 'rejected') => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status } : a));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">概览</h1>
          <p className="text-sm text-muted-foreground mt-1">查看关键业务指标和系统状态</p>
        </div>
        {(pendingApprovals > 0 || unreadNotifications > 0) && (
          <div className="flex items-center gap-2 text-xs">
            {pendingApprovals > 0 && (
              <span className="px-2 py-1 rounded bg-foreground/10 text-foreground">{pendingApprovals} 待审批</span>
            )}
            {unreadNotifications > 0 && (
              <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">{unreadNotifications} 未读</span>
            )}
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-4 rounded-lg bg-card border border-border hover:border-foreground/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {stat.trend}
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                  {stat.unit && <span className="text-sm">{stat.unit}</span>}
                  {stat.total && <span className="text-sm text-muted-foreground font-normal"> / {stat.total}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 待审批事项 */}
      {approvals.filter(a => a.status === 'pending').length > 0 && (
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-foreground" />
            <h2 className="text-sm font-medium text-foreground">待审批</h2>
          </div>
          <div className="divide-y divide-border">
            {approvals.filter(a => a.status === 'pending').map((approval) => (
              <div key={approval.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{approval.target}</p>
                  <p className="text-[11px] text-muted-foreground">{approval.requestedBy} · {approval.timestamp}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    approval.severity === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                  }`}>
                    {approval.severity}
                  </span>
                  <button
                    onClick={() => handleApproval(approval.id, 'approved')}
                    className="h-7 w-7 flex items-center justify-center rounded bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, 'rejected')}
                    className="h-7 w-7 flex items-center justify-center rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 通知 */}
      {notifications.filter(n => !n.read).length > 0 && (
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">通知</h2>
          </div>
          <div className="divide-y divide-border">
            {notifications.filter(n => !n.read).slice(0, 3).map((notif) => (
              <div 
                key={notif.id} 
                className="px-4 py-3 flex items-center justify-between hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => markNotificationRead(notif.id)}
              >
                <div>
                  <p className="text-sm text-foreground">{notif.title}</p>
                  <p className="text-[11px] text-muted-foreground">{notif.text}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 商户列表 */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">商户</h2>
          </div>
          <div className="divide-y divide-border">
            {merchants.slice(0, 5).map((merchant) => (
              <div key={merchant.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                    {merchant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{merchant.name}</p>
                    <p className="text-[10px] text-muted-foreground">{merchant.aiUsage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    merchant.plan === 'Enterprise' ? 'bg-foreground text-background' 
                    : merchant.plan === 'Pro' ? 'bg-secondary text-foreground' 
                    : 'bg-secondary text-muted-foreground'
                  }`}>
                    {merchant.plan}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${merchant.status === 'active' ? 'bg-foreground/60' : 'bg-destructive'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 助理状态 */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">助理状态</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {agents.map((agent) => (
              <div key={agent.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className={`h-2 w-2 rounded-full ${
                    agent.status === 'executing' ? 'bg-foreground animate-pulse' 
                    : agent.status === 'paused' ? 'bg-muted-foreground'
                    : agent.status === 'error' ? 'bg-destructive'
                    : 'bg-muted-foreground/50'
                  }`} />
                </div>
                <p className="text-xs font-medium text-foreground truncate">{agent.displayName}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{agent.taskCount} 任务</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
