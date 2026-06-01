"use client"

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { AIPanel } from '@/components/admin/ai-panel';
import { CommandBar } from '@/components/admin/command-bar';
import { DashboardView } from '@/components/admin/dashboard-view';
import { MerchantsView } from '@/components/admin/merchants-view';
import { StoresView } from '@/components/admin/stores-view';
import { AgentsView } from '@/components/admin/agents-view';
import { LogsView } from '@/components/admin/logs-view';
import { BillingView } from '@/components/admin/billing-view';
import { AnalyticsView } from '@/components/admin/analytics-view';
import { SettingsView } from '@/components/admin/settings-view';
import { QueuesView } from '@/components/admin/queues-view';
import { RetailView } from '@/components/admin/retail-view';
import { I18nProvider } from '@/hooks/use-i18n';
import type {
  ActiveTab,
  RuntimeLog,
  MerchantStore,
  AgentInfo,
  BullQueue,
  ApprovalItem,
  Notification,
  ChatMessage,
  SafetyRules,
  UserRole,
} from '@/lib/types';

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [queues, setQueues] = useState<BullQueue[]>([]);
  const [merchants, setMerchants] = useState<MerchantStore[]>([]);
  const [logs, setLogs] = useState<RuntimeLog[]>([]);

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [safetyRules, setSafetyRules] = useState<SafetyRules>({
    maxRefund: 1000,
    maxPriceChangePct: 50,
    allowDangerousBulkDelete: false,
    requireAdminForPayouts: true,
  });

  const [activeRole, setActiveRole] = useState<UserRole>('super_admin');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const requestedTab = searchParams?.get('tab') as ActiveTab | null;
    if (requestedTab && ['dashboard','merchants','stores','agents','queues','logs','billing','analytics','settings'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    // 初始欢迎消息
    setChatMessages([
      { id: '1', sender: 'ai', text: '您好，CommerceOS 运行时已就绪。您可以开始管理您的商户和零售业务。', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) },
    ]);

    // 异步加载真实数据
    const loadInitialData = async () => {
      try {
        // 在加载主数据前先进行 DB 健康检测
        try {
          const hRes = await fetch('/api/health');
          setDbHealthy(hRes.ok);
          if (!hRes.ok) {
            setNotifications((prev) => [{ id: `N-${Date.now()}`, type: 'failure', title: '数据库连接异常', text: '无法连接到主数据库，请检查服务或环境变量。', timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), read: false }, ...prev]);
          }
        } catch (err) {
          setDbHealthy(false);
          setNotifications((prev) => [{ id: `N-${Date.now()}`, type: 'failure', title: '数据库连接异常', text: '无法连接到主数据库，请检查服务或环境变量。', timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), read: false }, ...prev]);
        }

        const [mRes, aRes, eRes, lRes, qRes] = await Promise.all([
          fetch('/api/merchants'),
          fetch('/api/agents'),
          fetch('/api/events?merchantId=merchant-001'),
          fetch('/api/audit-logs'),
          fetch('/api/merchants/merchant-001/tasks'),
        ]);

        if (mRes.ok) {
          const mData = await mRes.json();
          setMerchants(Array.isArray(mData) ? mData : []);
        } else {
          setMerchants([]);
        }

        if (aRes.ok) {
          const aData = await aRes.json();
          setAgents(Array.isArray(aData) ? aData : []);
        } else {
          setAgents([]);
        }

        if (lRes.ok) {
          const lData = await lRes.json();
          setLogs(Array.isArray(lData) ? lData : []);
        } else {
          setLogs([]);
        }

        if (qRes.ok) {
          const qData = await qRes.json();
          setQueues(qData.tasks || []);
        } else {
          setQueues([]);
        }
        
        if (eRes.ok) {
          const events = await eRes.json();
          setNotifications((events || []).map((e: any) => ({
            id: e.id,
            type: e.eventType?.includes('failed') ? 'failure' : 'quota',
            title: e.eventType || 'System Event',
            text: e.payload?.message || JSON.stringify(e.payload) || '',
            timestamp: new Date(e.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            read: e.status === 'processed'
          })));
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
        setMerchants([]);
        setAgents([]);
        setLogs([]);
        setQueues([]);
        setNotifications([]);
      }
    };

    loadInitialData();

    // 4. 接入实时事件流 (SSE)
    console.log('[SSE] Connecting to OS Stream...');
    const eventSource = new EventSource('http://localhost:3005/api/os/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Received event:', data);

        // 根据事件类型更新 UI 状态
        if (data.type === 'plan.created' || data.type === 'step.completed') {
          loadInitialData(); // 刷新任务队列
        }

      } catch (err) {
        console.error('[SSE] Failed to parse event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      eventSource.close();
    };

    return () => {
      console.log('[SSE] Closing connection');
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('[data-command-input]');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = useCallback((title: string, text: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `N-${Date.now()}`,
      type,
      title,
      text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const addLog = useCallback(
    (action: string, status: RuntimeLog['status'], executor: string, payload = '{}', merchantId = '') => {
      const newLog: RuntimeLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action,
        payload,
        merchantId,
        status,
        executor,
      };
      setLogs((prev) => [newLog, ...prev]);
      return newLog;
    },
    []
  );

  const addChatMessage = useCallback((sender: 'user' | 'ai', text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  }, []);

  const handleCommand = useCallback(
    (command: string) => {
      if (!command.trim()) return;

      const lower = command.toLowerCase();
      addChatMessage('user', command);

      let responseText = `已收到指令: "${command}"。正在分析意图...`;
      let targetTab: ActiveTab | null = null;

      // 仅保留基础导航逻辑
      if (lower.includes('订单') || lower.includes('日志')) {
        targetTab = 'logs';
        responseText = '正在为您切换至操作日志。';
      } else if (lower.includes('商户') || lower.includes('客户')) {
        targetTab = 'merchants';
        responseText = '正在为您切换至商户管理。';
      } else if (lower.includes('店铺') || lower.includes('零售')) {
        targetTab = 'retail';
        responseText = '正在为您切换至零售 Runtime 控制台。';
      } else if (lower.includes('助理') || lower.includes('agent')) {
        targetTab = 'agents';
        responseText = '正在为您切换至智能助理监控。';
      } else if (lower.includes('概览') || lower.includes('首页')) {
        targetTab = 'dashboard';
        responseText = '正在返回系统概览。';
      }

      if (targetTab) {
        setActiveTab(targetTab);
      }

      setTimeout(() => {
        addChatMessage('ai', responseText);
      }, 300);
    },
    [addChatMessage]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            agents={agents}
            merchants={merchants}
            logs={logs}
            approvals={approvals}
            setApprovals={setApprovals}
            notifications={notifications}
            setNotifications={setNotifications}
            onNavigate={setActiveTab}
          />
        );
      case 'merchants':
        return <MerchantsView merchants={merchants} setMerchants={setMerchants} />;
      case 'stores':
        return <StoresView />;
      case 'agents':
        return <AgentsView agents={agents} />;
      case 'queues':
        return <QueuesView />;
      case 'logs':
        return <LogsView logs={logs} />;
      case 'billing':
        return <BillingView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;

      case 'retail':
        return <RetailView />;
      default:
        return <DashboardView agents={agents} merchants={merchants} logs={logs} approvals={approvals} setApprovals={setApprovals} notifications={notifications} setNotifications={setNotifications} />;
    }
  };

  return (
    <I18nProvider>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 overflow-y-auto bg-muted/30">
            {dbHealthy === false && (
              <div className="p-3 rounded-md mx-4 my-2 bg-red-50 border border-red-200 text-red-800 text-sm">
                <strong>错误：</strong> 无法连接到主数据库，请检查 `DATABASE_URL` 或在服务器上运行 `npm run seed:defaults` 初始化示例数据。
              </div>
            )}
            {renderContent()}
          </main>

          <AIPanel chatMessages={chatMessages} logs={logs} activeTab={activeTab} onSendMessage={handleCommand} />
        </div>

        <CommandBar onCommand={handleCommand} />
      </div>
    </I18nProvider>
  );
}
