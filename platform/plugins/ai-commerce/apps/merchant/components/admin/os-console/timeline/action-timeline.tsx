"use client"

import { ActionPlan } from '../../../../os-sdk/src/protocol/action-plan';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ActionTimeline({ plan }: { plan: ActionPlan | null }) {
  if (!plan) return (
    <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
      <Clock className="h-8 w-8 opacity-20" />
      <p className="text-xs">No active execution plan</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Execution Timeline</h3>
        <p className="text-xs text-zinc-400 font-mono">Trace: {plan.traceId}</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {plan.steps.map((step) => (
          <div key={step.id} className="relative pl-6">
            {/* Vertical Line Segment */}
            <div className="absolute left-[7px] top-4 bottom-[-16px] w-px bg-zinc-800 last:hidden" />
            
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-zinc-200">
                  {step.domain}.{step.action}
                </div>
                {step.status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                 step.status === 'running' ? <Loader2 className="h-3.5 w-3.5 text-yellow-500 animate-spin" /> :
                 step.status === 'failed' ? <AlertCircle className="h-3.5 w-3.5 text-red-500" /> :
                 <div className="h-3.5 w-3.5 rounded-full border border-zinc-700" />}
              </div>

              {step.result && (
                <div className="mt-3">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Output Result</div>
                  <pre className="text-[10px] p-3 rounded-lg bg-black/50 text-green-400/90 font-mono overflow-auto border border-zinc-800/30">
                    {JSON.stringify(step.result, null, 2)}
                  </pre>
                </div>
              )}
              
              {step.error && (
                <div className="mt-3">
                  <div className="text-[10px] text-red-400/50 uppercase font-bold mb-1.5">Error Log</div>
                  <div className="text-[10px] p-3 rounded-lg bg-red-950/20 text-red-400 border border-red-900/30">
                    {step.error}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
