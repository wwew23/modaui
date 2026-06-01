"use client"

import { RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RollbackPanel({ snapshots = [] }: { snapshots?: any[] }) {
  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-orange-500" />
          原子回滚
        </h3>
        <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-medium">
          {snapshots.length} 个快照
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {snapshots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">暂无可用快照</p>
            </div>
          ) : (
            snapshots.map((snap) => (
              <div key={snap.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-foreground">{snap.domain}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(snap.timestamp).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1">
                    <RotateCcw className="h-3 w-3" />
                    恢复
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  "{snap.description || '无描述'}"
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-orange-500/5">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-orange-600 leading-normal">
            回滚操作将撤销所有已应用的 Patch，并将 Shopify 店铺状态恢复到执行前的快照点。请谨慎操作。
          </p>
        </div>
      </div>
    </div>
  );
}
