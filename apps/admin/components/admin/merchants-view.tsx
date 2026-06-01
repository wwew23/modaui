'use client';

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, TrendingUp, ExternalLink } from 'lucide-react';
import type { MerchantStore } from '@/lib/types';
import { navigateToAdmins } from '@/lib/shared-types';

interface MerchantsViewProps {
  merchants: MerchantStore[];
  setMerchants: (merchants: MerchantStore[]) => void;
}

export function MerchantsView({ merchants, setMerchants }: MerchantsViewProps) {
  const [search, setSearch] = useState('');
  const [dbMerchants, setDbMerchants] = useState<MerchantStore[]>(merchants);
  const [isLoading, setIsLoading] = useState(false);

  const loadMerchants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/merchants');
      if (!response.ok) {
        throw new Error('Failed to fetch merchants');
      }
      const merchantsData: MerchantStore[] = await response.json();
      setDbMerchants(merchantsData);
      setMerchants(merchantsData);
    } catch (error) {
      console.error('[MerchantsView] loadMerchants error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const filteredMerchants = dbMerchants.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.merchantName.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id: string) => {
    const merchant = dbMerchants.find((item) => item.id === id);
    if (!merchant) {
      return;
    }

    try {
      const nextStatus = merchant.status === 'active' ? 'suspended' : 'active';
      const response = await fetch(`/api/merchants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update merchant status');
      }

      const updatedMerchant: MerchantStore = await response.json();
      const updatedList = dbMerchants.map((item) => item.id === id ? updatedMerchant : item);
      setDbMerchants(updatedList);
      setMerchants(updatedList);
    } catch (error) {
      console.error('[MerchantsView] handleToggleStatus error', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">商户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理所有入驻商户和配额</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadMerchants}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
            disabled={isLoading}
          >
            <span>{isLoading ? '刷新中...' : '刷新列表'}</span>
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索商户名称..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* 商户表格 */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">商户</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">负责人</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">套餐</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">AI 用量</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">费用</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">状态</th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredMerchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                      {merchant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{merchant.name}</p>
                      <p className="text-[11px] text-muted-foreground">{merchant.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{merchant.merchantName}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    merchant.plan === 'Enterprise' ? 'bg-foreground text-background' 
                    : merchant.plan === 'Pro' ? 'bg-secondary text-foreground'
                    : 'bg-secondary text-muted-foreground'
                  }`}>
                    {merchant.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{merchant.aiUsage}</span>
                    {merchant.limitPattern === '超限' && (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                  <div className="w-20 h-1 bg-secondary rounded-full mt-1">
                    <div 
                      className={`h-full rounded-full ${
                        merchant.limitPattern === '超限' ? 'bg-destructive' : 'bg-foreground/60'
                      }`}
                      style={{ width: merchant.limitPattern === '超限' ? '100%' : merchant.limitPattern }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground font-mono">${merchant.tokenCost.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => handleToggleStatus(merchant.id)}
                    className="flex items-center gap-2"
                  >
                    <span className={`h-2 w-2 rounded-full ${
                      merchant.status === 'active' ? 'bg-foreground/60' : 'bg-destructive'
                    }`} />
                    <span className="text-sm text-foreground">
                      {merchant.status === 'active' ? '正常' : '暂停'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigateToAdmins(merchant.id, true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs hover:bg-violet-700 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>进入商户后台</span>
                    </button>
                    <button className="p-1 rounded hover:bg-secondary transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
