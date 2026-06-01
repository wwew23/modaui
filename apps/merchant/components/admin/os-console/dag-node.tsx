"use client"

import { motion } from 'framer-motion';
import { ActionPlanStep } from '@/lib/types';
import { CheckCircle2, Circle, Loader2, AlertCircle, Zap, Package, Layout, Megaphone } from 'lucide-react';

const domainIcons: Record<string, any> = {
  theme: Layout,
  product: Package,
  campaign: Megaphone,
  shopify: Zap,
};

export function DAGNode({ 
  step, 
  x, 
  y, 
  active, 
  onClick 
}: { 
  step: ActionPlanStep; 
  x: number; 
  y: number; 
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = domainIcons[step.domain.split('.')[0]] || Package;

  const statusColors = {
    pending: 'bg-muted border-border text-muted-foreground',
    running: 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]',
    success: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
    failed: 'bg-red-500/10 border-red-500 text-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute cursor-pointer rounded-xl border-2 p-3 w-48 transition-all duration-300 ${
        statusColors[step.status]
      } ${active ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
      style={{ left: x, top: y }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-background/50">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider truncate flex-1">
          {step.domain}
        </span>
        {step.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
        {step.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
        {step.status === 'failed' && <AlertCircle className="h-3 w-3" />}
      </div>
      
      <p className="text-[11px] font-medium leading-tight mb-2 line-clamp-2">
        {step.action.replace(/([A-Z])/g, ' $1').trim()}
      </p>

      <div className="flex items-center justify-between text-[9px] font-mono opacity-60">
        <span>{step.id}</span>
        {step.startedAt && <span>{Math.floor((Date.now() - step.startedAt) / 1000)}s</span>}
      </div>
    </motion.div>
  );
}
