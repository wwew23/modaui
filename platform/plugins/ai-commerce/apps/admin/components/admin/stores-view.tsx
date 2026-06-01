'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Store, Plus, Search, MapPin, Phone, MoreHorizontal } from 'lucide-react';

export function StoresView() {
  const params = useParams();
  const merchantId = params?.merchantId as string || 'merchant-001';

  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      // 真实查询：通过 merchantId 获取对应门店
      const res = await fetch(`/api/merchants/${merchantId}/retail`);
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setStores(json.stores || []);
    } catch (err) {
      console.error('Failed to fetch stores', err);
      setStores([]); // 确保出错时也清空
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateLocalStore = async () => {
    setIsCreatingStore(true);
    try {
      const response = await fetch(`/api/merchants/${merchantId}/retail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `本地门店 ${new Date().toLocaleString('zh-CN')}`,
          address: '上海市黄浦区南京东路 100 号',
          city: '上海',
          status: 'active',
          latitude: 31.2304,
          longitude: 121.4737,
        }),
      });
      if (!response.ok) {
        throw new Error('Create store failed');
      }
      await fetchStores();
      alert('本地门店已创建。');
    } catch (err) {
      console.error('Failed to create local store', err);
      alert('本地门店创建失败，请稍后重试。');
    } finally {
      setIsCreatingStore(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">加载中...</div>;
  }
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">店铺管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理所有门店信息</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateLocalStore}
            disabled={isCreatingStore}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreatingStore ? '创建中...' : '添加本地门店'}</span>
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索店铺..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* 店铺卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stores.length > 0 ? stores.map((store) => (
          <div
            key={store.id}
            className="p-4 rounded-lg bg-card border border-border hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Store className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{store.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{store.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${
                  store.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'
                }`} />
                <button className="p-1 rounded hover:bg-secondary transition-colors" title="更多选项">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{store.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{store.phone}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 p-12 border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">暂无门店</h3>
              <p className="text-xs text-muted-foreground">当前尚未配置零售门店，点击右上角按钮添加您的首个门店。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
