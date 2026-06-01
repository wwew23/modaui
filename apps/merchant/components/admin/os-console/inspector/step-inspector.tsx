"use client"

import { ActionPlan } from '../../../../os-sdk/src/protocol/action-plan';
import { Box, Code2, ShieldCheck, Activity } from 'lucide-react';
import { DiffExplainer } from '../../diff-explainer';

export function StepInspector({ plan }: { plan: ActionPlan | null }) {
  const step = plan?.steps?.find((s: any) => s.status === 'running' || s.status === 'failed') || plan?.steps?.[0];

  if (!step) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 p-8 text-center">
        <ShieldCheck className="h-8 w-8 opacity-20" />
        <p className="text-xs">Select a step to inspect system mutations</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Inspector</h3>
          <p className="text-[10px] text-zinc-400 font-mono uppercase">{step.domain} / {step.action}</p>
        </div>
        <Activity className="h-3.5 w-3.5 text-zinc-700" />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Input Params */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
            <Box className="h-3 w-3" />
            Input Parameters
          </div>
          <pre className="text-[10px] p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono overflow-auto">
            {JSON.stringify(step.input, null, 2)}
          </pre>
        </section>

        {/* Patch Explorer */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
            <Code2 className="h-3 w-3" />
            Kernel Mutators (Patches)
          </div>
          {step.result?.patch && step.result.patch.length > 0 ? (
            <div className="rounded-lg overflow-hidden border border-zinc-800">
               <DiffExplainer 
                 patches={step.result.patch} 
                 description={step.action}
                 actor="os-kernel"
               />
            </div>
          ) : (
            <div className="p-8 rounded-lg border border-dashed border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-600 italic">No patches generated for this step</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
