"use client"

import { useState, useEffect, useCallback } from 'react';
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
import { RuntimeView } from '@/components/admin/runtime-view';
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: '您好，我是智能助理。请输入指令或问题，我会为您处理。', time: '12:00' },
  ]);

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

      let responseText = '';
      let targetTab: ActiveTab | null = null;

      if (lower.includes('订单') || lower.includes('order') || lower.includes('日志') || lower.includes('log') || lower.includes('查')) {
        targetTab = 'logs';
        responseText = '已为您切换至操作日志视图，可查看所有交易和操作记录。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'logs' }));
        addNotification('导航服务', '已切换至日志页面', 'success');
      } else if (lower.includes('商品') || lower.includes('product') || lower.includes('创建')) {
        targetTab = 'queues';
        responseText = '已为您打开任务队列，商品创建任务已加入队列。';
        addLog('工具调用', 'success', '商品助理', JSON.stringify({ tool: 'create_product', queue: 'product-generation' }));
      } else if (lower.includes('商户') || lower.includes('merchant') || lower.includes('客户')) {
        targetTab = 'merchants';
        responseText = '已切换至商户管理视图，可查看和管理所有商户信息。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'merchants' }));
      } else if (lower.includes('店铺') || lower.includes('store')) {
        targetTab = 'stores';
        responseText = '已切换至店铺视图，可管理店铺配置。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'stores' }));
      } else if (lower.includes('智能体') || lower.includes('助理') || lower.includes('agent')) {
        targetTab = 'agents';
        responseText = '已切换至智能助理视图，可查看各助理状态。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'agents' }));
      } else if (lower.includes('队列') || lower.includes('queue') || lower.includes('任务')) {
        targetTab = 'queues';
        responseText = '已切换至任务队列视图，可查看任务执行状态。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'queues' }));
      } else if (lower.includes('账单') || lower.includes('billing') || lower.includes('计费')) {
        targetTab = 'billing';
        responseText = '已切换至账单视图，可查看用量和费用明细。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'billing' }));
      } else if (lower.includes('分析') || lower.includes('统计') || lower.includes('analytics')) {
        targetTab = 'analytics';
        responseText = '已切换至数据分析视图，可查看业务指标。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'analytics' }));
      } else if (lower.includes('设置') || lower.includes('setting') || lower.includes('配置')) {
        targetTab = 'settings';
        responseText = '已切换至系统设置视图。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'settings' }));
      } else if (lower.includes('退款') || lower.includes('refund') || lower.includes('提现')) {
        responseText = '检测到大额财务指令，已建立待审核任务。主管可在仪表盘签名确认。';
        const amount = (Math.random() * 500 + 400).toFixed(2);
        const newApproval: ApprovalItem = {
          id: `APP-${Date.now()}`,
          type: 'refund',
          target: `退款申请 ($${amount})`,
          status: 'pending',
          requestedBy: '智能客服',
          severity: 'Critical',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          payload: { refundAmount: parseFloat(amount), orderId: `O-${Math.floor(Math.random() * 9000) + 1000}` },
          limits: '单笔限额触发',
        };
        setApprovals((prev) => [newApproval, ...prev]);
        addLog('审批创建', 'executing', '财务助理', JSON.stringify(newApproval.payload), 'MRCH-902');
        addNotification('审批提醒', `新的退款审批请求: $${amount}`, 'warning');
      } else if (lower.includes('广告') || lower.includes('营销') || lower.includes('推广') || lower.includes('campaign')) {
        responseText = '已为您生成营销文案草稿，可在日志中查看详情。';
        addLog('生成文案', 'success', '营销助理', JSON.stringify({ copy: '新品上市，限时优惠' }), 'MRCH-901');
      } else if (lower.includes('概览') || lower.includes('首页') || lower.includes('dashboard') || lower.includes('home')) {
        targetTab = 'dashboard';
        responseText = '已切换至概览视图。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'dashboard' }));
      } else if (lower.includes('runtime') || lower.includes('运行时')) {
        targetTab = 'runtime';
        responseText = '已切换至Runtime控制中心。';
        addLog('页面导航', 'success', '导航助理', JSON.stringify({ target: 'runtime' }));
      } else {
        responseText = `已收到指令: "${command}"。正在进行语义分析和处理。`;
        addLog('命令解析', 'success', '智能助理', JSON.stringify({ command }));
      }

      if (targetTab) {
        setActiveTab(targetTab);
      }

      setTimeout(() => {
        addChatMessage('ai', responseText);
      }, 300);
    },
    [addChatMessage, addLog, addNotification]
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
          />
        );
      case 'merchants':
        return <MerchantsView merchants={merchants} setMerchants={setMerchants} />;
      case 'stores':
        return <StoresView merchants={merchants} />;
      case 'agents':
        return <AgentsView agents={agents} setAgents={setAgents} />;
      case 'queues':
        return <QueuesView queues={queues} />;
      case 'logs':
        return <LogsView logs={logs} />;
      case 'billing':
        return <BillingView merchants={merchants} />;
      case 'analytics':
        return <AnalyticsView merchants={merchants} agents={agents} />;
      case 'settings':
        return <SettingsView safetyRules={safetyRules} setSafetyRules={setSafetyRules} activeRole={activeRole} setActiveRole={setActiveRole} />;
      case 'runtime':
        return <RuntimeView />;
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
            {renderContent()}
          </main>

          <AIPanel chatMessages={chatMessages} logs={logs} activeTab={activeTab} onSendMessage={handleCommand} />
        </div>

        <CommandBar onCommand={handleCommand} />
      </div>
    </I18nProvider>
  );
}
