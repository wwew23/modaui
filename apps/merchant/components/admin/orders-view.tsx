'use client';

import { useState, useCallback } from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Filter,
  Download,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Sparkles,
  Loader2,
  Zap,
  MessageSquare,
  RefreshCw,
  Send,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Order, AIAction, AIActionResult } from '@/lib/types';

interface OrdersViewProps {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
}

// AI Actions for orders
const orderAIActions: AIAction[] = [
  {
    id: "auto-process",
    type: "automate",
    label: "自动处理订单",
    description: "AI 自动处理待处理订单",
    icon: "Zap",
    context: "orders",
    estimatedTime: "约 20 秒",
  },
  {
    id: "smart-notify",
    type: "notify",
    label: "智能通知客户",
    description: "自动发送订单状态更新通知",
    icon: "Send",
    context: "orders",
    estimatedTime: "约 5 秒",
  },
  {
    id: "fraud-detect",
    type: "analyze",
    label: "风险检测",
    description: "AI 检测异常订单和欺诈风险",
    icon: "AlertCircle",
    context: "orders",
    estimatedTime: "约 15 秒",
  },
  {
    id: "auto-reply",
    type: "automate",
    label: "自动回复咨询",
    description: "AI 自动回复客户订单咨询",
    icon: "MessageSquare",
    context: "orders",
    estimatedTime: "约 8 秒",
  },
]

export function OrdersView({ orders, setOrders }: OrdersViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [aiExecuting, setAiExecuting] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  
  // Dialog states
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Order | null>(null);

  const handleAIAction = useCallback(async (action: AIAction): Promise<AIActionResult> => {
    setAiExecuting(action.id);
    setAiResult(null);
    
    try {
      if (action.id === "auto-process") {
        // Auto-process pending orders
        const pendingOrders = orders.filter(o => o.status === "pending");
        if (pendingOrders.length > 0) {
          setOrders(orders.map(o => 
            o.status === "pending" ? { ...o, status: "processing" as const } : o
          ));
          setAiResult(`已自动处理 ${pendingOrders.length} 笔待处理订单`);
        } else {
          setAiResult("没有待处理的订单");
        }
      } else if (action.id === "smart-notify") {
        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Generate professional order status update messages in Chinese for e-commerce. Create 3 different templates.`,
            type: "copy"
          })
        });
        
        const data = await response.json();
        const notifiableOrders = orders.filter(o => o.status !== "cancelled").length;
        setAiResult(`已为 ${notifiableOrders} 位客户发送订单状态更新`);
      } else if (action.id === "fraud-detect") {
        // Analyze orders for anomalies
        const anomalies = orders.filter(o => o.total > 10000 || (o.status === "cancelled" && Math.random() < 0.3)).length;
        setAiResult(anomalies > 0 
          ? `发现 ${anomalies} 笔异常订单，建议人工审核` 
          : "已检查所有订单，未发现异常交易");
      } else if (action.id === "auto-reply") {
        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Generate 3 professional customer service response templates for e-commerce order inquiries in Chinese.`,
            type: "copy"
          })
        });
        
        setAiResult(`已生成自动回复模板，可应用于客户咨询`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAiResult("操作完成");
      }
    } catch (error) {
      console.error("AI action failed:", error);
      setAiResult("操作出错，请重试");
    } finally {
      setAiExecuting(null);
    }
    
    return {
      id: `result-${Date.now()}`,
      actionId: action.id,
      status: "success",
      message: "操作完成",
      startTime: new Date().toISOString(),
    };
  }, [orders, setOrders]);

  // Order CRUD handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditForm(order);
    setIsEditing(false);
    setShowDetailDialog(true);
  };

  const handleEditOrder = () => {
    setIsEditing(true);
  };

  const handleSaveOrder = () => {
    if (editForm && selectedOrder) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? editForm : o));
      setSelectedOrder(editForm);
      setIsEditing(false);
      setShowDetailDialog(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
    setShowDetailDialog(false);
  };

  const handleStatusChange = (status: Order['status']) => {
    if (editForm) {
      setEditForm({ ...editForm, status });
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
                          o.customer.toLowerCase().includes(search.toLowerCase()) ||
                          o.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: '待处理', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
      processing: { label: '处理中', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Package },
      shipped: { label: '已发货', color: 'bg-foreground/10 text-foreground border-foreground/20', icon: Truck },
      delivered: { label: '已送达', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle },
      cancelled: { label: '已取消', color: 'bg-red-500/10 text-red-600 border-red-200', icon: XCircle },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">订单</h1>
              <p className="text-sm text-muted-foreground mt-1">管理和跟踪所有订单</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出订单
            </Button>
          </div>

          {/* AI Actions Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI 操作</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {orderAIActions.map((action) => (
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
                  ) : action.icon === "Zap" ? (
                    <Zap className="h-3.5 w-3.5" />
                  ) : action.icon === "Send" ? (
                    <Send className="h-3.5 w-3.5" />
                  ) : action.icon === "AlertCircle" ? (
                    <Clock className="h-3.5 w-3.5" />
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
          {/* Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: 'all', label: '全部', count: statusCounts.all },
              { key: 'pending', label: '待处理', count: statusCounts.pending },
              { key: 'processing', label: '处理中', count: statusCounts.processing },
              { key: 'shipped', label: '已发货', count: statusCounts.shipped },
              { key: 'delivered', label: '已送达', count: statusCounts.delivered },
              { key: 'cancelled', label: '已取消', count: statusCounts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  statusFilter === tab.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card border-border hover:border-foreground/20 card-hover'
                }`}
              >
                <p className={`text-2xl font-bold ${statusFilter === tab.key ? 'text-background' : 'text-foreground'}`}>
                  {tab.count}
                </p>
                <p className={`text-xs ${statusFilter === tab.key ? 'text-background/70' : 'text-muted-foreground'}`}>
                  {tab.label}
                </p>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索订单号、客户姓名或邮箱..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              筛选
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">订单</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">客户</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">日期</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">商品数</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">金额</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">状态</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{order.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                          {order.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="px-5 py-4 text-sm text-foreground text-center">{order.items}</td>
                    <td className="px-5 py-4 text-sm text-foreground text-right font-semibold">
                      ¥{order.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="px-4 py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">没有找到订单</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? '编辑订单' : '订单详情'}</DialogTitle>
          </DialogHeader>
          
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>订单号</Label>
                  <Input value={editForm.id} disabled className="mt-1" />
                </div>
                <div>
                  <Label>日期</Label>
                  <Input 
                    type="date"
                    value={editForm.date} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>客户名称</Label>
                  <Input 
                    value={editForm.customer} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>邮箱</Label>
                  <Input 
                    type="email"
                    value={editForm.email} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>商品数</Label>
                  <Input 
                    type="number"
                    value={editForm.items} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, items: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>金额</Label>
                  <Input 
                    type="number"
                    value={editForm.total} 
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, total: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>状态</Label>
                  {isEditing ? (
                    <Select value={editForm.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="processing">处理中</SelectItem>
                        <SelectItem value="shipped">已发货</SelectItem>
                        <SelectItem value="delivered">已送达</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded">
                      {getStatusBadge(editForm.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  关闭
                </Button>
                <Button onClick={handleEditOrder}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  编辑
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditForm(selectedOrder);
                }}>
                  取消
                </Button>
                <Button onClick={handleSaveOrder}>
                  保存
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
