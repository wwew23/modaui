'use client';

import { useState, useEffect } from 'react';
import { ListTodo } from 'lucide-react';
import type { BullQueue } from '@/lib/types';

export function QueuesView() {
  const [queues, setQueues] = useState<BullQueue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await fetch('/api/merchants/merchant-001/tasks');
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setQueues(json.tasks || []);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
        setQueues([]); // 错误时清空
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueues();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">正在加载任务运行时数据...</div>;
  }

  if (queues.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <ListTodo className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">暂无活动任务</h2>
          <p className="text-muted-foreground">当前运行时没有任何正在执行或排队的 AI 任务。</p>
        </div>
      </div>
    );
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-foreground/10 text-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'failed': return 'bg-destructive/10 text-destructive';
      case 'waiting': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '执行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'waiting': return '等待中';
      case 'retrying': return '重试中';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">任务队列</h1>
        <p className="text-sm text-muted-foreground">查看和管理系统任务队列</p>
      </div>

      {/* 队列概览 */}
      <div className="grid grid-cols-4 gap-4">
        {queues.map(queue => (
          <div key={queue.name} className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm font-medium text-foreground">{queue.displayName}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">等待</span>
                <span className="ml-2 font-medium text-foreground">{queue.waiting}</span>
              </div>
              <div>
                <span className="text-muted-foreground">执行</span>
                <span className="ml-2 font-medium text-foreground">{queue.active}</span>
              </div>
              <div>
                <span className="text-muted-foreground">完成</span>
                <span className="ml-2 font-medium text-foreground">{queue.completed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">失败</span>
                <span className="ml-2 font-medium text-foreground">{queue.failed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">任务明细</h2>
        </div>
        <div className="divide-y divide-border">
          {queues.flatMap(queue => 
            queue.jobs.map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">{job.id}</span>
                    <span className="text-xs text-muted-foreground">{queue.displayName}</span>
                  </div>
                  <div className="text-sm text-foreground mt-1">{job.name}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{job.timestamp}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
