'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download } from 'lucide-react';

export function BillingView() {
  const [billingData, setBillingData] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ monthly: 0, yearly: 0, avg: 0 });

  useEffect(() => {
    // 异步加载真实账单数据
    const loadBillingData = async () => {
      try {
        const res = await fetch('/api/billing?merchantId=MRCH-901');
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        
        // 计算月均和年度累计
        const monthlyAmount = data.invoices?.[0]?.amount || 0;
        const yearlyAmount = (data.invoices || []).reduce((acc: number, inv: any) => acc + inv.amount, 0);
        const avgAmount = data.invoices?.length > 0 ? yearlyAmount / data.invoices.length : 0;

        setBillingData(data.trends || []);
        setInvoices(data.invoices || []);
        
        // 实时同步统计卡片
        setStats({
          monthly: monthlyAmount,
          yearly: yearlyAmount,
          avg: avgAmount
        });

      } catch (err) {
        console.error('Failed to load billing data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBillingData();
  }, []);

  if (isLoading) return <div className="p-6">加载中...</div>;

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
          </div>
          <p className="text-2xl font-semibold text-foreground">¥{stats.monthly.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">本月费用</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">¥{stats.yearly.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">年度累计</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">¥{stats.avg.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">月均费用</p>
        </div>
      </div>

      {/* 费用趋势 */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">费用趋势</h2>
        </div>
        <div className="p-4">
          {billingData.length > 0 ? (
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
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-muted-foreground italic">
              暂无趋势数据
            </div>
          )}
        </div>
      </div>

      {/* 账单列表 */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">历史账单</h2>
        </div>
        <div className="divide-y divide-border">
          {invoices.length > 0 ? invoices.map((invoice) => (
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${invoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {invoice.status === 'paid' ? '已支付' : '待支付'}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              暂无历史账单
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
