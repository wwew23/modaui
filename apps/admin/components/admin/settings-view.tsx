'use client';

import { User, Bell, Shield, Palette, Save } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">系统设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理账户和系统配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设置导航 */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <nav className="divide-y divide-border">
              {[
                { icon: User, label: '个人信息', active: true },
                { icon: Bell, label: '通知设置', active: false },
                { icon: Shield, label: '安全设置', active: false },
                { icon: Palette, label: '外观设置', active: false },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      item.active 
                        ? 'bg-secondary text-foreground font-medium' 
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">个人信息</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">姓名</label>
                <input
                  type="text"
                  defaultValue="管理员"
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">邮箱</label>
                <input
                  type="email"
                  defaultValue="admin@studio.com"
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">电话</label>
                <input
                  type="tel"
                  defaultValue="+86 138 0000 0000"
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">时区</label>
                <select className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Asia/Shanghai (UTC+8)</option>
                  <option>Asia/Tokyo (UTC+9)</option>
                  <option>America/New_York (UTC-5)</option>
                </select>
              </div>
              <div className="pt-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>保存更改</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
