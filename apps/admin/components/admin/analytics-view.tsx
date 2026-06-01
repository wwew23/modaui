'use client';

import { TrendingUp, TrendingDown, Users, ShoppingCart, Eye, DollarSign } from 'lucide-react';

const metrics = [
  { label: '总销售额', value: '¥128,450', change: 12.5, trend: 'up' },
  { label: '订单数', value: '1,284', change: 8.3, trend: 'up' },
  { label: '访问量', value: '45,678', change: -2.1, trend: 'down' },
  { label: '转化率', value: '2.8%', change: 0.5, trend: 'up' },
];

const topProducts = [
  { name: '极简科技手表', sales: 234, revenue: 46800 },
  { name: '简约商务背包', sales: 189, revenue: 28350 },
  { name: '无线蓝牙耳机', sales: 156, revenue: 23400 },
  { name: '智能运动手环', sales: 123, revenue: 18450 },
  { name: '便携充电宝', sales: 98, revenue: 9800 },
];

export function AnalyticsView() {
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">数据分析</h1>
        <p className="text-sm text-muted-foreground mt-1">查看销售数据和业务洞察</p>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              {index === 0 && <DollarSign className="h-5 w-5 text-muted-foreground" />}
              {index === 1 && <ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              {index === 2 && <Eye className="h-5 w-5 text-muted-foreground" />}
              {index === 3 && <Users className="h-5 w-5 text-muted-foreground" />}
              <span className={`text-[10px] flex items-center gap-1 ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-500'
              }`}>
                {metric.trend === 'up' ? '+' : ''}{metric.change}%
                {metric.trend === 'up' 
                  ? <TrendingUp className="h-3 w-3" />
                  : <TrendingDown className="h-3 w-3" />
                }
              </span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 销售趋势 */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">销售趋势</h2>
          </div>
          <div className="p-4">
            <div className="h-48 flex items-end justify-between gap-1">
              {[65, 78, 52, 89, 95, 72, 88, 76, 92, 85, 98, 90].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-foreground/80 rounded-sm transition-all hover:bg-foreground"
                    style={{ height: `${value}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>1月</span>
              <span>6月</span>
              <span>12月</span>
            </div>
          </div>
        </div>

        {/* 热销商品 */}
        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">热销商品</h2>
          </div>
          <div className="divide-y divide-border">
            {topProducts.map((product, index) => (
              <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-4">{index + 1}</span>
                  <span className="text-sm text-foreground">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{product.sales} 件</span>
                  <span className="text-sm font-medium text-foreground">¥{product.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
