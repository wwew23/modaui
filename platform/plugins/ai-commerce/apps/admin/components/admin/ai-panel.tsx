'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ChatMessage, RuntimeLog, ActiveTab } from '@/lib/types';

interface AIPanelProps {
  chatMessages: ChatMessage[];
  logs: RuntimeLog[];
  activeTab: ActiveTab;
  onSendMessage: (message: string) => void;
}

// 页面上下文映射
const contextMap: Record<ActiveTab, { title: string; desc: string; tip: string }> = {
  dashboard: { title: '概览', desc: '查看核心业务指标和待处理事项', tip: '可输入"查看商户"快速切换' },
  merchants: { title: '商户管理', desc: '管理商户信息和配额', tip: '可输入商户名称进行搜索' },
  stores: { title: '店铺管理', desc: '配置店铺设置和展示', tip: '可输入"创建店铺"快速操作' },
  agents: { title: '智能助理', desc: '查看各助理运行状态', tip: '可输入助理名称查看详情' },
  queues: { title: '任务队列', desc: '查看任务执行状态', tip: '可输入任务类型进行筛选' },
  logs: { title: '操作日志', desc: '审查系统操作记录', tip: '可输入时间范围进行筛选' },
  billing: { title: '账单', desc: '查看用量和费用明细', tip: '可输入"导出账单"生成报表' },
  analytics: { title: '数据分析', desc: '查看业务数据统计', tip: '可输入指标名称查看趋势' },
  settings: { title: '系统设置', desc: '配置系统参数和规则', tip: '修改设置需要管理员权限' },
};

export function AIPanel({ chatMessages, logs, activeTab, onSendMessage }: AIPanelProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setIsTyping(true);
    onSendMessage(input);
    setInput('');
    setTimeout(() => setIsTyping(false), 500);
  };

  const getStatusIcon = (status: RuntimeLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-foreground/60" />;
      case 'failed':
      case 'rollback':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'executing':
        return <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const context = contextMap[activeTab] || { title: '未知页面', desc: '当前页面信息', tip: '请选择功能页面' };

  return (
    <aside className="w-[320px] h-full flex flex-col bg-card border-l border-border shrink-0">
      {/* 标题 */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold text-foreground">智能助理</h2>
        </div>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-secondary">在线</span>
      </div>

      {/* 当前页面上下文 */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">当前页面</div>
        <div className="text-sm font-medium text-foreground">{context.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{context.desc}</div>
        <div className="text-[10px] text-muted-foreground/70 mt-2 italic">{context.tip}</div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 ${
                msg.sender === 'user'
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p className="text-xs leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${
                msg.sender === 'user' ? 'text-background/60' : 'text-muted-foreground'
              }`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 最近操作 */}
      <div className="border-t border-border shrink-0">
        <div className="px-4 py-2 border-b border-border bg-muted/20">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">最近操作</p>
        </div>
        <div className="max-h-[120px] overflow-y-auto">
          {logs.slice(0, 4).map((log) => (
            <div key={log.id} className="px-4 py-2 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
              {getStatusIcon(log.status)}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{log.action}</p>
                <p className="text-[10px] text-muted-foreground">{log.executor} · {log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入消息或指令..."
            className="flex-1 h-9 px-3 rounded-md bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-9 w-9 flex items-center justify-center rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
