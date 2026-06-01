'use client';

import { CreditCard, Download, TrendingUp, TrendingDown } from 'lucide-react';

const billingData = [
  { month: '2024-01', amount: 12500, change: 8 },
  { month: '2024-02', amount: 14200, change: 13.6 },
  { month: '2024-03', amount: 13800, change: -2.8 },
  { month: '2024-04', amount: 15600, change: 13 },
  { month: '2024-05', amount: 16800, change: 7.7 },
];

const invoices = [
  { id: 'INV-001', date: '2024-05-01', amount: 16800, status: 'paid' },
  { id: 'INV-002', date: '2024-04-01', amount: 15600, status: 'paid' },
  { id: 'INV-003', date: '2024-03-01', amount: 13800, status: 'paid' },
  { id: 'INV-004', date: '2024-02-01', amount: 14200, status: 'paid' },
];

export function BillingView() {
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">账单管理</h1>
          <p className="text-sm text-muted-foreground mt-1">查看账单和费用明细</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors">
          <Download className="h-4 w-4" />
          <span>导出账单</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-green-600 flex items-center gap-1">
              +7.7% <TrendingUp className="h-3 w-3" />
            </span>
          </div>
          <p className="text-2xl font-semibold text-foreground">¥16,800</p>
          <p className="text-xs text-muted-foreground mt-1">本月费用</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">¥72,900</p>
          <p className="text-xs text-muted-foreground mt-1">年度累计</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">¥14,580</p>
          <p className="text-xs text-muted-foreground mt-1">月均费用</p>
        </div>
      </div>

      {/* 费用趋势 */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">费用趋势</h2>
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {billingData.map((item, index) => {
              const maxAmount = Math.max(...billingData.map(d => d.amount));
              const height = (item.amount / maxAmount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-foreground rounded-sm transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{item.month.split('-')[1]}月</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 账单列表 */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">历史账单</h2>
        </div>
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{invoice.id}</p>
                  <p className="text-[11px] text-muted-foreground">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">¥{invoice.amount.toLocaleString()}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">已支付</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
