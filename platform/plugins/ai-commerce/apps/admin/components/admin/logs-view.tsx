'use client';

import { CheckCircle, AlertCircle, Clock, Filter } from 'lucide-react';
import { RuntimeLog } from '@/lib/types';

interface LogsViewProps {
  logs: RuntimeLog[];
}

export function LogsView({ logs }: LogsViewProps) {
  const getStatusIcon = (status: RuntimeLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: RuntimeLog['status']) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'failed':
        return '失败';
      default:
        return '处理中';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">操作日志</h1>
          <p className="text-sm text-muted-foreground mt-1">查看所有系统操作记录</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors">
          <Filter className="h-4 w-4" />
          <span>筛选</span>
        </button>
      </div>

      {/* 日志列表 */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>状态</span>
          <span>操作</span>
          <span>执行者</span>
          <span>时间</span>
        </div>
        <div className="divide-y divide-border">
          {logs.length > 0 ? logs.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 items-center hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(log.status)}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  log.status === 'success'
                    ? 'bg-green-50 text-green-700'
                    : log.status === 'failed'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {getStatusLabel(log.status)}
                </span>
              </div>
              <span className="text-sm text-foreground">{log.action}</span>
              <span className="text-sm text-muted-foreground">{log.executor}</span>
              <span className="text-sm text-muted-foreground font-mono">{log.timestamp}</span>
            </div>
          )) : (
            <div className="p-12 text-center text-sm text-muted-foreground italic">
              暂无系统操作日志
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
