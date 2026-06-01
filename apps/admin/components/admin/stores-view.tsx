'use client';

import { Store, Plus, Search, MapPin, Phone, MoreHorizontal } from 'lucide-react';

const stores = [
  { id: 'STR-001', name: '旗舰店 - 北京', address: '北京市朝阳区建国路88号', phone: '010-88888888', status: 'active' },
  { id: 'STR-002', name: '体验店 - 上海', address: '上海市浦东新区陆家嘴', phone: '021-66666666', status: 'active' },
  { id: 'STR-003', name: '概念店 - 深圳', address: '深圳市南山区科技园', phone: '0755-55555555', status: 'active' },
  { id: 'STR-004', name: '专卖店 - 广州', address: '广州市天河区珠江新城', phone: '020-44444444', status: 'inactive' },
];

export function StoresView() {
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">店铺管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理所有门店信息</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          <span>添加店铺</span>
        </button>
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
        {stores.map((store) => (
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
                <button className="p-1 rounded hover:bg-secondary transition-colors">
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
        ))}
      </div>
    </div>
  );
}
