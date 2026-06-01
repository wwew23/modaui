"use client"

import { DagNode } from './dag-node';
import { ActionPlan } from '../../../../os-sdk/src/protocol/action-plan';

export function DagView({ 
  plans, 
  activePlan, 
  onSelect 
}: { 
  plans: ActionPlan[], 
  activePlan: ActionPlan | null, 
  onSelect: (plan: ActionPlan) => void 
}) {
  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Action DAGs</h3>
      {plans.map((plan: ActionPlan) => (
        <div 
          key={plan.id} 
          onClick={() => onSelect(plan)} 
          className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer 
            ${activePlan?.id === plan.id 
              ? 'bg-zinc-900 border-zinc-700 ring-1 ring-zinc-700 shadow-xl' 
              : 'bg-zinc-950 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50'}
          `}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold truncate pr-4">{plan.title}</div>
            <div className={`h-1.5 w-1.5 rounded-full ${plan.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : plan.status === 'running' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'}`} />
          </div>

          <div className="space-y-2.5 relative">
             {/* Simple vertical connection line */}
             <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />
             {plan.steps.map(step => (
               <DagNode key={step.id} step={step} />
             ))}
          </div>
        </div>
      ))}
    </div>
  );
}
