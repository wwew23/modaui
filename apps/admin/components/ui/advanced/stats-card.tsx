'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  trend,
  onClick,
  className
}: StatsCardProps) {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={cn(
        "rounded-lg border border-border bg-card p-6 transition-all",
        isClickable && "cursor-pointer hover:bg-muted/50 hover:border-border/80",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          
          {change && (
            <div className="flex items-center gap-1.5">
              {change.type === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : change.type === 'decrease' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn(
                "text-sm font-medium",
                change.type === 'increase' ? "text-emerald-500" :
                change.type === 'decrease' ? "text-red-500" : "text-muted-foreground"
              )}>
                {change.type === 'increase' ? '+' : ''}{change.value}%
              </span>
              {description && (
                <span className="text-sm text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
