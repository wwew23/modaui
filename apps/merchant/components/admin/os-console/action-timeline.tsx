"use client"

import { ActionPlanStep } from "@/lib/types"
import { CheckCircle2, Circle, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface ActionTimelineProps {
  steps: ActionPlanStep[];
  title?: string;
}

export function ActionTimeline({ steps, title = "Action Plan" }: ActionTimelineProps) {
  const getStatusIcon = (status: ActionPlanStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'running': return <Loader2 className="h-4 w-4 text-foreground animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />
      default: return <Circle className="h-4 w-4 text-muted-foreground/30" />
    }
  }

  return (
    <div className="flex items-center gap-6 px-4">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-4 shrink-0">
          <div className={`
            flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
            ${step.status === 'running' ? 'bg-primary/5 border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]' : 'bg-background border-border hover:border-muted-foreground/30'}
          `}>
            <div className="shrink-0">
              {getStatusIcon(step.status)}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[11px] font-bold whitespace-nowrap ${step.status === 'success' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {step.action}
                </span>
                <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase font-normal opacity-50">
                  {step.domain}
                </Badge>
              </div>
              <p className="text-[9px] text-muted-foreground line-clamp-1 max-w-[120px]">
                {step.description}
              </p>
            </div>
          </div>
          
          {i < steps.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
          )}
        </div>
      ))}
    </div>
  )
}
