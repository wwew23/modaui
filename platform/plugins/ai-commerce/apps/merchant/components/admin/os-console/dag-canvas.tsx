"use client"

import { useMemo } from 'react';
import { ActionPlanStep } from '@/lib/types';
import { DAGNode } from './dag-node';

export function DAGCanvas({ 
  steps, 
  onStepClick,
  selectedStepId 
}: { 
  steps: ActionPlanStep[]; 
  onStepClick?: (step: ActionPlanStep) => void;
  selectedStepId?: string | null;
}) {
  // Simple layout engine: levels based on dependencies
  const { nodes, edges } = useMemo(() => {
    const levels: Record<string, number> = {};
    const processed = new Set<string>();
    
    // Assign levels
    let changed = true;
    while (changed) {
      changed = false;
      steps.forEach(step => {
        if (processed.has(step.id)) return;
        
        const deps = step.dependsOn || [];
        if (deps.length === 0) {
          levels[step.id] = 0;
          processed.add(step.id);
          changed = true;
        } else if (deps.every(d => processed.has(d))) {
          levels[step.id] = Math.max(...deps.map(d => levels[d])) + 1;
          processed.add(step.id);
          changed = true;
        }
      });
    }

    const levelCounts: Record<number, number> = {};
    const nodes = steps.map(step => {
      const level = levels[step.id] || 0;
      const index = levelCounts[level] || 0;
      levelCounts[level] = index + 1;
      
      return {
        step,
        x: 40 + level * 260,
        y: 60 + index * 120,
      };
    });

    const edges = steps.flatMap(step => 
      (step.dependsOn || []).map(depId => {
        const from = nodes.find(n => n.step.id === depId);
        const to = nodes.find(n => n.step.id === step.id);
        if (!from || !to) return null;
        return { from, to };
      })
    ).filter(Boolean);

    return { nodes, edges };
  }, [steps]);

  return (
    <div className="relative w-full h-full overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const x1 = (edge?.from.x ?? 0) + 192;
          const y1 = (edge?.from.y ?? 0) + 40;
          const x2 = (edge?.to.x ?? 0);
          const y2 = (edge?.to.y ?? 0) + 40;
          
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
              className="opacity-40"
            />
          );
        })}
      </svg>
      
      {nodes.map((node) => (
        <DAGNode
          key={node.step.id}
          step={node.step}
          x={node.x}
          y={node.y}
          active={selectedStepId === node.step.id}
          onClick={() => onStepClick?.(node.step)}
        />
      ))}
    </div>
  );
}
