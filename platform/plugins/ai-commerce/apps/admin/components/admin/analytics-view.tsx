'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Eye, DollarSign } from 'lucide-react';

export function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/merchants/merchant-001/analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return <div className="p-8 text-center">正在加载业务分析数据...</div>;
  }

  const hasData = data.topProducts?.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">数据分析</h1>
        <p className="text-sm text-muted-foreground mt-1">查看销售数据和业务洞察</p>
      </div>

      {!hasData ? (
        <div className="p-12 border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">暂无分析数据</h3>
            <p className="text-xs text-muted-foreground">当前商户尚无销售记录或访问量，数据将在产生首笔交易后开始统计。</p>
          </div>
        </div>
      ) : (
        <>
          {/* 指标卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.metrics.map((metric: any, index: number) => (
              <div key={index} className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  {index === 0 && <DollarSign className="h-5 w-5 text-muted-foreground" />}
                  {index === 1 && <ShoppingCart className="h-5 w-5 text-muted-foreground" />}
                  {index === 2 && <Eye className="h-5 w-5 text-muted-foreground" />}
                  {index === 3 && <Users className="h-5 w-5 text-muted-foreground" />}
                  <span className={`text-[10px] flex items-center gap-1 ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                    {metric.change >= 0 
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
                  {data.trend.map((item: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-foreground/80 rounded-sm transition-all hover:bg-foreground"
                        style={{ height: `${item.value}%` }}
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
                {data.topProducts.map((product: any, index: number) => (
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
        </>
      )}
    </div>
  );
}
