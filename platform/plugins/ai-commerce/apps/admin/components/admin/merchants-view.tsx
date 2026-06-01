'use client';

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, TrendingUp, ExternalLink, Trash2, Plus, X } from 'lucide-react';
import type { MerchantStore, ActiveTab } from '@/lib/types';
import { navigateToAdmins } from '@/lib/shared-types';

interface MerchantsViewProps {
  merchants: MerchantStore[];
  setMerchants: (merchants: MerchantStore[]) => void;
}

export function MerchantsView({ merchants, setMerchants }: MerchantsViewProps) {
  const [search, setSearch] = useState('');
  const [dbMerchants, setDbMerchants] = useState<MerchantStore[]>([]); // 初始化为空数组
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ 
    name: '',
    merchantName: '',
    shopDomain: '',
    plan: 'Starter' as const
  });

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
      setError(null)
    } catch (error) {
      console.error('[MerchantsView] loadMerchants error', error);
      // In REAL_DATA_ONLY mode, surface an explicit error instead of silently falling back
      const REAL_DATA_ONLY = process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true' || process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true'
      if (REAL_DATA_ONLY) {
        setError('SYSTEM NOT CONNECTED TO REAL DATA SOURCE: /api/merchants failed')
      } else {
        setDbMerchants([]) // 非真实模式仍可清空并继续
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin'
        },
        body: JSON.stringify(newMerchant)
      });
      
      if (!response.ok) throw new Error('Failed to create merchant');
      
      await loadMerchants();
      setIsCreateModalOpen(false);
      setNewMerchant({ name: '', merchantName: '', shopDomain: '', plan: 'Starter' });
      setError(null)
    } catch (error) {
      console.error('[MerchantsView] handleCreateMerchant error', error);
      const REAL_DATA_ONLY = process.env.NEXT_PUBLIC_REAL_DATA_ONLY === '1' || process.env.NEXT_PUBLIC_REAL_DATA_ONLY === 'true' || process.env.REAL_DATA_ONLY === '1' || process.env.REAL_DATA_ONLY === 'true'
      if (REAL_DATA_ONLY) setError('SYSTEM NOT CONNECTED TO REAL DATA SOURCE: create merchant failed')
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMerchants = dbMerchants.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.merchantName.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/merchants/${id}/status`, {
        method: 'POST',
        headers: { 'x-user-id': 'admin' }
      });
      if (response.ok) {
        await loadMerchants();
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('[MerchantsView] handleToggleStatus error', errorData)
      }
    } catch (error) {
      console.error('[MerchantsView] handleToggleStatus error', error);
    }
  };

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm('确定要删除该商户及其所有关联数据吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/merchants/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'admin' }
      });

      if (!response.ok) {
        throw new Error('Failed to delete merchant');
      }

      const updatedList = dbMerchants.filter((item) => item.id !== id);
      setDbMerchants(updatedList);
      setMerchants(updatedList);
    } catch (error) {
      console.error('[MerchantsView] handleDeleteMerchant error', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800">
          <strong>错误：</strong> {error}
        </div>
      )}
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">商户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理所有入驻商户和配额</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-foreground text-background text-sm hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>新增商户</span>
          </button>
          <button 
            onClick={loadMerchants}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
            disabled={isLoading}
          >
            <span>{isLoading ? '刷新中...' : '刷新列表'}</span>
          </button>
          <button
            onClick={async () => {
              setIsLoading(true)
              try {
                const res = await fetch('/api/admin/seed-defaults', { method: 'POST' })
                const data = await res.json()
                if (!res.ok) throw new Error(data?.error || 'seed failed')
                // 若已存在则提示已存在
                if (data?.message) {
                  alert(`Seed result: ${data.message}`)
                } else {
                  alert('示例数据已初始化')
                }
                await loadMerchants()
                setError(null)
              } catch (err: any) {
                console.error('[MerchantsView] seed error', err)
                setError('初始化示例数据失败，请检查后端日志')
              } finally {
                setIsLoading(false)
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors"
            disabled={isLoading}
          >
            <span>初始化示例数据</span>
          </button>
        </div>
      </div>

      {/* 创建商户 Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">新增商户租户</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground" title="关闭窗口">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMerchant} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="merchant-name" className="text-xs font-medium text-muted-foreground uppercase">商户品牌名称</label>
                <input 
                  id="merchant-name"
                  required
                  type="text" 
                  value={newMerchant.name}
                  onChange={e => setNewMerchant({...newMerchant, name: e.target.value})}
                  placeholder="例如: 极简科技旗舰店"
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="owner-name" className="text-xs font-medium text-muted-foreground uppercase">负责人姓名</label>
                <input 
                  id="owner-name"
                  required
                  type="text" 
                  value={newMerchant.merchantName}
                  onChange={e => setNewMerchant({...newMerchant, merchantName: e.target.value})}
                  placeholder="例如: 张三"
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="shop-domain" className="text-xs font-medium text-muted-foreground uppercase">店铺域名 (可选)</label>
                <input 
                  id="shop-domain"
                  type="text" 
                  value={newMerchant.shopDomain}
                  onChange={e => setNewMerchant({...newMerchant, shopDomain: e.target.value})}
                  placeholder="example-store.com"
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="plan-select" className="text-xs font-medium text-muted-foreground uppercase">套餐计划</label>
                <select 
                  id="plan-select"
                  value={newMerchant.plan}
                  onChange={e => setNewMerchant({...newMerchant, plan: e.target.value as any})}
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  title="选择套餐计划"
                >
                  <option value="Starter">Starter (500K Tokens)</option>
                  <option value="Pro">Pro (2M Tokens)</option>
                  <option value="Enterprise">Enterprise (5M Tokens)</option>
                </select>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-md bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '正在初始化租户...' : '立即创建商户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            {filteredMerchants.length > 0 ? filteredMerchants.map((merchant) => (
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
                    <button 
                      onClick={() => handleDeleteMerchant(merchant.id)}
                      className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      title="删除商户"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 rounded hover:bg-secondary transition-colors" title="更多">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground italic">
                  {search ? '未找到匹配的商户' : '暂无商户数据，请点击右上方添加或刷新'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
