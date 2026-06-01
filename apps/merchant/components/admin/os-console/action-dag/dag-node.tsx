"use client"

import { ActionStep } from '../../../../os-sdk/src/protocol/action-plan';
import { Layers, Palette, Zap, Cpu, Check, Loader2, AlertCircle } from 'lucide-react';

export function DagNode({ step }: { step: ActionStep }) {
  const getIcon = (domain: string) => {
    switch (domain) {
      case 'theme': return <Palette className="h-3 w-3" />
      case 'product': return <Zap className="h-3 w-3" />
      case 'campaign': return <Layers className="h-3 w-3" />
      default: return <Cpu className="h-3 w-3" />
    }
  }

  const getStatusInfo = (status: ActionStep['status']) => {
    switch (status) {
      case 'success': return { color: 'text-green-400', icon: <Check className="h-2.5 w-2.5" /> }
      case 'running': return { color: 'text-yellow-400', icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> }
      case 'failed': return { color: 'text-red-400', icon: <AlertCircle className="h-2.5 w-2.5" /> }
      default: return { color: 'text-zinc-500', icon: null }
    }
  }

  const { color, icon } = getStatusInfo(step.status);

  return (
    <div className={`flex items-center gap-3 text-[10px] font-medium relative z-10 ${color}`}>
      <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center bg-zinc-950 border border-current shadow-sm`}>
        {icon || <div className="h-1 w-1 rounded-full bg-current" />}
      </div>
      <div className="flex items-center gap-1.5 opacity-90">
        <span className="opacity-50">{getIcon(step.domain)}</span>
        <span>{step.domain}</span>
        <span className="opacity-30">/</span>
        <span className="text-zinc-300 group-hover:text-white transition-colors">{step.action}</span>
      </div>
    </div>
  );
}
