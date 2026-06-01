'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, 
  MessageSquare, 
  Zap, 
  History, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle,
  Send,
  Terminal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { RuntimeStatus, RuntimeEvent, IntentType } from '@/lib/types';

interface RuntimeViewProps {
}

const INTENT_OPTIONS: { value: IntentType; label: string; desc: string }[] = [
  { value: 'chat.general', label: '通用聊天', desc: 'chat.general' },
  { value: 'workflow.run', label: '运行工作流', desc: 'workflow.run' },
  { value: 'agent.run', label: '运行代理', desc: 'agent.run' },
  { value: 'inventory.forecast', label: '库存预测', desc: 'inventory.forecast' },
  { value: 'trend.discover', label: '趋势发现', desc: 'trend.discover' },
  { value: 'store.generate', label: '店铺生成', desc: 'store.generate' },
  { value: 'task.create', label: '创建任务', desc: 'task.create' },
];

export function RuntimeView(_props: RuntimeViewProps) {
  const [status, setStatus] = useState<RuntimeStatus>({
    status: 'running',
    events: 0,
    workflows: 0,
    agents: 0
  });
  
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string }[]>([
    { id: '1', sender: 'ai', text: '你好！我是Deepay AI Runtime，有什么可以帮助你的吗？' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  const [selectedIntent, setSelectedIntent] = useState<IntentType>('chat.general');
  const [intentPayload, setIntentPayload] = useState('{"message": "测试消息"}');
  const [intentResult, setIntentResult] = useState<string | null>(null);
  
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/admin/runtime/status');
      const data = await response.json();
      setStatus(data || {
        status: 'running',
        events: 0,
        workflows: 0,
        agents: 0
      });
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/admin/runtime/events');
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, []);

  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage = { id: Date.now().toString(), sender: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const message = chatInput;
    setChatInput('');

    try {
      const response = await fetch('/admin/runtime/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai' as const, 
        text: data.reply || '收到回复' 
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai' as const, 
        text: '请求失败，请稍后重试' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  }, [chatInput]);

  const executeIntent = useCallback(async () => {
    setIsLoading(true);
    setIntentResult(null);

    try {
      let payload;
      try {
        payload = JSON.parse(intentPayload);
      } catch {
        setIntentResult('JSON 格式错误');
        return;
      }

      const response = await fetch('/admin/runtime/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: selectedIntent,
          payload
        })
      });
      const data = await response.json();
      setIntentResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setIntentResult(`执行失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIntent, intentPayload]);

  useEffect(() => {
    fetchStatus();
    fetchEvents();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchEvents]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Runtime 控制中心</h1>
          <p className="text-sm text-muted-foreground mt-1">管理和监控 Deepay AI Runtime</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchStatus(); fetchEvents(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Cpu className="h-5 w-5 text-muted-foreground" />
              {status.status === 'running' ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> 运行中
                </Badge>
              ) : status.status === 'error' ? (
                <Badge className="bg-red-500">
                  <XCircle className="h-3 w-3 mr-1" /> 错误
                </Badge>
              ) : (
                <Badge className="bg-gray-500">已停止</Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-foreground">Runtime</p>
              <p className="text-xs text-muted-foreground">系统状态</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-foreground">{status.events}</p>
              <p className="text-xs text-muted-foreground">已处理事件</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-foreground">{status.workflows}</p>
              <p className="text-xs text-muted-foreground">活动工作流</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Cpu className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-foreground">{status.agents}</p>
              <p className="text-xs text-muted-foreground">代理运行中</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              与 Runtime 对话
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border border-border rounded-lg p-3 mb-3 h-[300px] overflow-y-auto bg-background"
            >
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`mb-2 p-2 rounded ${
                    msg.sender === 'user' 
                      ? 'bg-primary/10 text-foreground ml-8' 
                      : 'bg-secondary text-foreground mr-8'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="输入消息..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button onClick={sendChatMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              执行 Intent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Intent 类型</label>
              <Select value={selectedIntent} onValueChange={(v) => setSelectedIntent(v as IntentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Payload (JSON)</label>
              <Textarea 
                value={intentPayload}
                onChange={(e) => setIntentPayload(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
            </div>
            <Button 
              onClick={executeIntent} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isLoading ? '执行中...' : '执行 Intent'}
            </Button>
            {intentResult && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <pre className="text-xs overflow-auto max-h-[150px]">{intentResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              事件日志
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEvents}>
              <RefreshCw className="h-3 w-3 mr-1" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="border border-border rounded-lg p-3 h-[200px] overflow-y-auto bg-black text-green-400 font-mono text-xs"
          >
            {events.length > 0 ? (
              events.map((event, idx) => (
                <div key={event.id || idx}>
                  [{event.timestamp}] {event.type}
                </div>
              ))
            ) : (
              <div className="text-gray-500">等待事件...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
