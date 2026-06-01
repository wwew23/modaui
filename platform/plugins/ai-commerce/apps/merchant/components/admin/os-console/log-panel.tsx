"use client"

import { Terminal, Search, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

export function LogPanel({ logs = [] }: { logs?: any[] }) {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-zinc-300 font-mono">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-500" />
          <span className="text-[11px] font-bold tracking-wider uppercase">Runtime Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
            <Input 
              className="h-6 w-32 bg-white/5 border-white/10 text-[10px] pl-7 focus-visible:ring-emerald-500/50" 
              placeholder="Filter logs..."
            />
          </div>
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <Trash2 className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {logs.length === 0 ? (
            <div className="text-[10px] text-zinc-600 italic py-4 text-center">
              Waiting for runtime events...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-[10px] group hover:bg-white/5 p-1 rounded transition-colors">
                <span className="text-zinc-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`shrink-0 font-bold ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warn' ? 'text-orange-400' : 
                  'text-emerald-400'
                }`}>
                  {log.level || 'INFO'}
                </span>
                <span className="text-zinc-400 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
