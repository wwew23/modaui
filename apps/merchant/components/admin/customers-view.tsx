'use client';

import { useState, useCallback } from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Plus,
  Download,
  User,
  Mail,
  ShoppingBag,
  DollarSign,
  Clock,
  Eye,
  Sparkles,
  Loader2,
  UserPlus,
  Target,
  Gift,
  MessageSquare,
  TrendingUp,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from '@/lib/api-client';
import type { Customer, AIAction, AIActionResult } from '@/lib/types';

interface CustomersViewProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

// AI Actions for customers
const customerAIActions: AIAction[] = [
  {
    id: "segment-customers",
    type: "analyze",
    label: "智能客户分群",
    description: "AI 分析客户行为并自动分组",
    icon: "Target",
    context: "customers",
    estimatedTime: "约 15 秒",
  },
  {
    id: "predict-churn",
    type: "analyze",
    label: "流失预警",
    description: "预测可能流失的客户",
    icon: "TrendingUp",
    context: "customers",
    estimatedTime: "约 20 秒",
  },
  {
    id: "personalize-offers",
    type: "generate",
    label: "个性化推荐",
    description: "为每位客户生成个性化优惠",
    icon: "Gift",
    context: "customers",
    estimatedTime: "约 12 秒",
  },
  {
    id: "auto-engagement",
    type: "automate",
    label: "自动触达",
    description: "AI 自动发送关怀消息",
    icon: "MessageSquare",
    context: "customers",
    estimatedTime: "约 8 秒",
  },
];

export function CustomersView({ customers, setCustomers }: CustomersViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [aiExecuting, setAiExecuting] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id);
    setAiResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    const messages: Record<string, string> = {
      "segment-customers": "已将客户分为 4 个群组：高价值、活跃、潜力、沉睡",
      "predict-churn": "发现 3 位客户有流失风险，建议立即触达",
      "personalize-offers": "已为 8 位客户生成个性化优惠券",
      "auto-engagement": "已向 5 位客户发送关怀消息",
    };
    
    setAiResult(messages[action.id] || "操作完成");
    setAiExecuting(null);
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: messages[action.id] || "操作完成",
      startTime: new Date().toISOString(),
    };
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 计算统计数据
  const totalRevenue = customers.reduce((sum, c) => sum + c.spent, 0);
  const activeCount = customers.filter(c => c.status === 'active').length;
  const avgOrderValue = customers.length > 0 
    ? totalRevenue / customers.reduce((sum, c) => sum + c.orders, 0) 
    : 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">客户</h1>
              <p className="text-sm text-muted-foreground mt-1">管理您的客户关系，共 {customers.length} 位客户</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button className="gap-2 ai-action-btn" onClick={async () => {
                const name = prompt("请输入客户姓名:") || "陈芳琳 (Mika)"
                const email = prompt("请输入客户邮箱:") || "mika.chen@aerotech.io"
                const newCustomer = {
                  name,
                  email,
                  orders: 1,
                  spent: 1299,
                  lastOrder: new Date().toISOString().split("T")[0],
                  status: "active",
                }

                try {
                  const created = await apiClient.createCustomer(newCustomer)
                  setCustomers([created, ...customers])
                } catch (error) {
                  console.error('Create customer failed:', error)
                }
              }}>
                <UserPlus className="h-4 w-4" />
                添加客户
              </Button>
            </div>
          </div>

          {/* AI Actions Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI 操作</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {customerAIActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => handleAIAction(action)}
                  disabled={aiExecuting === action.id}
                >
                  {aiExecuting === action.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : action.icon === "Target" ? (
                    <Target className="h-3.5 w-3.5" />
                  ) : action.icon === "TrendingUp" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : action.icon === "Gift" ? (
                    <Gift className="h-3.5 w-3.5" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <div className="text-sm text-foreground animate-fade-in flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                {aiResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">总客户数</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{customers.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Star className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">活跃客户</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">总销售额</span>
              </div>
              <p className="text-2xl font-bold text-foreground">¥{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">平均客单价</span>
              </div>
              <p className="text-2xl font-bold text-foreground">¥{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索客户姓名或邮箱..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div className="flex items-center gap-2">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-foreground text-background'
                      : 'bg-card border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {status === 'all' ? '全部' : status === 'active' ? '活跃' : '不活跃'}
                </button>
              ))}
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">客户</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">订单数</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">消费金额</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">最近订单</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">状态</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{customer.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-medium text-foreground">{customer.orders}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-foreground">¥{customer.spent.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {customer.lastOrder}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge 
                        variant="outline" 
                        className={customer.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                          : 'bg-muted text-muted-foreground border-border'
                        }
                      >
                        {customer.status === 'active' ? '活跃' : '不活跃'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="px-4 py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">没有找到客户</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
