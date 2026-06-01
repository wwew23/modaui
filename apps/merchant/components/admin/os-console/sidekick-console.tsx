"use client"

import { useState } from 'react';
import { Command, Layout, List, Search, Zap, HelpCircle } from 'lucide-react';
import { DagView } from './action-dag/dag-view';
import { ActionTimeline } from './timeline/action-timeline';
import { StepInspector } from './inspector/step-inspector';
import { useActionStream } from './live/use-action-stream';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SidekickConsole() {
  const { plans, activePlan, setActivePlan, planGraph } = useActionStream();
  const [viewMode, setViewMode] = useState<'dag' | 'list'>('dag');

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Top OS Header */}
      <header className="h-14 flex-shrink-0 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
            <Command className="h-4 w-4 text-white" />
            <span className="text-xs font-bold tracking-tighter uppercase">OS SIDEKICK</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Kernel v1.2</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Deploy Black Friday theme, sort products by conversion..." 
              className="w-full h-9 pl-11 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-full text-xs placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all relative z-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 z-10">
              <Badge variant="outline" className="h-5 px-1 bg-zinc-950 border-zinc-800 text-[10px] text-zinc-500">⌘ K</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><HelpCircle className="h-4 w-4" /></Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border border-white/20 shadow-lg" />
        </div>
      </header>

      {/* Main OS Workspace */}
      <main className="flex-1 flex min-h-0 relative">
        
        {/* LEFT: Action DAGs / Plans */}
        <aside className="w-[320px] flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950/40">
           <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Layout className="h-3.5 w-3.5 text-zinc-400" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plan Browser</span>
              </div>
              <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                 <button 
                   onClick={() => setViewMode('dag')}
                   title="Switch to DAG view"
                   className={`p-1 rounded-md transition-colors ${viewMode === 'dag' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600'}`}
                 >
                   <List className="h-3 w-3" />
                 </button>
              </div>
           </div>
           <div className="flex-1 overflow-hidden">
              <DagView graph={planGraph} plans={plans} activePlan={activePlan} onSelect={setActivePlan} />
           </div>
        </aside>

        {/* CENTER: Timeline */}
        <section className="flex-1 flex flex-col min-h-0 bg-zinc-950/20">
           <ActionTimeline plan={activePlan} />
        </section>

        {/* RIGHT: Inspector */}
        <aside className="w-[380px] flex-shrink-0 border-l border-zinc-800 bg-zinc-950/40 flex flex-col">
           <StepInspector plan={activePlan} />
        </aside>

        {/* Floating AI Status */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
           <div className="px-4 py-2 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-medium text-zinc-300">Sidekick is analyzing intents...</span>
              <div className="h-3 w-px bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                 <Zap className="h-3 w-3 text-yellow-500" />
                 <span className="text-[10px] text-zinc-500 font-mono">412ms</span>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
