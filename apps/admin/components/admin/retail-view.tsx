"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Package, 
  Activity, 
  Cpu, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface StoreData {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'inactive' | 'maintenance';
  health: number; // 0-100
  inventoryLevel: number; // 0-100
  dailyOrders: number;
  latitude: number;
  longitude: number;
}

export function RetailView() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [orderStream, setOrderStream] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRetailData = async () => {
      try {
        const res = await fetch('/api/merchants/merchant-001/retail');
        const json = await res.json();
        
        // Transform DB stores to StoreData interface
        const transformedStores = (json.stores || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          city: s.city,
          status: s.status,
          health: 100, // Real health logic would go here
          inventoryLevel: s.inventory?.length > 0 ? 75 : 0, // Simplified logic
          latitude: s.latitude || 0,
          longitude: s.longitude || 0,
        }));
        
        setStores(transformedStores);
        
        // Transform DB orders to stream format
        const transformedOrders = (json.stores || []).flatMap((s: any) => 
          (s.orders || []).map((o: any) => ({
            id: o.id,
            store: s.name,
            amount: o.amount,
            time: new Date(o.createdAt).toLocaleTimeString(),
            type: o.type === 'walk_in' ? 'POS' : 'Online'
          }))
        ).sort((a: any, b: any) => b.id.localeCompare(a.id));

        setOrderStream(transformedOrders);
      } catch (err) {
        console.error('Failed to fetch retail data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetailData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">加载零售运行时数据...</div>;
  }

  if (stores.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">暂无门店数据</h2>
          <p className="text-muted-foreground">当前商户尚未创建任何零售门店，请先在商户管理中添加门店。</p>
        </div>
        <Button>创建首个门店</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Retail Operations Console</h1>
          <p className="text-muted-foreground">实时监控全球门店状态、库存热力及 AI 调度链路</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            系统健康: 99.9%
          </Button>
          <Button size="sm" className="bg-primary">
            <Zap className="mr-2 h-4 w-4" />
            AI 智能调度已开启
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 地图视图 */}
        <Card className="lg:col-span-2 overflow-hidden h-[500px] relative bg-slate-900 border-slate-800">
          <CardHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-950/80 to-transparent">
            <CardTitle className="text-white flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-400" />
              全球门店分布 (Map Runtime)
            </CardTitle>
          </CardHeader>
          <div className="w-full h-full flex items-center justify-center relative">
            {/* 模拟地图背景 */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/0,0,1/800x600?access_token=mock')] bg-cover" />
            
            {/* 模拟门店 Pin */}
            {stores.map(store => (
              <div 
                key={store.id}
                className="absolute transition-transform hover:scale-125 cursor-pointer"
                style={{ 
                  left: `${((store.longitude - 100) / 30) * 100}%`, 
                  top: `${((45 - store.latitude) / 25) * 100}%` 
                }}
              >
                <div className={`h-4 w-4 rounded-full animate-pulse ${store.status === 'active' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-slate-700">
                  {store.name}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 实时订单流 */}
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-green-500" />
              实时订单流 (OS Stream)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {orderStream.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.store}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{order.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{order.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">¥{order.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{order.id}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 库存热力图模拟 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-orange-500" />
              库存压力热力图
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="inventoryLevel" radius={[4, 4, 0, 0]}>
                  {stores.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.inventoryLevel < 50 ? '#ef4444' : entry.inventoryLevel < 80 ? '#f97316' : '#22c55e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 门店健康监控 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-red-500" />
              门店健康状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stores.slice(0, 3).map(store => (
              <div key={store.id} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{store.name}</span>
                  <span className={store.health > 90 ? 'text-green-500' : 'text-orange-500'}>{store.health}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${store.health > 90 ? 'bg-green-500' : 'bg-orange-500'}`} 
                    style={{ width: `${store.health}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI 调度面板 */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Cpu className="mr-2 h-5 w-5" />
              Sidekick AI 调度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-md bg-background border border-primary/10 text-xs text-muted-foreground italic">
              "检测到上海店库存告急，建议从北京店调拨 50 件商品..."
            </div>
            <Button size="sm" className="w-full">执行调拨计划</Button>
            <div className="pt-2 border-t border-primary/10">
              <p className="text-[10px] font-semibold uppercase text-primary/70 mb-2">活跃计划</p>
              <div className="flex items-center justify-between text-xs">
                <span>北京 ↔ 上海 库存同步</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">运行中</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
