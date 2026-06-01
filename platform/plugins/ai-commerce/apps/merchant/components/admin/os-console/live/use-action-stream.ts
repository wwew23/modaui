"use client"

import { useEffect, useState } from 'react';
import { ActionPlan } from '@/lib/types';

export interface PlanGraph {
  nodes: any[];
  edges: any[];
}

export function useActionStream() {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<ActionPlan | null>(null);
  const [planGraph, setPlanGraph] = useState<PlanGraph | null>(null);

  useEffect(() => {
    // Standard SSE Endpoint
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://api.modaui.com/api";
    const es = new EventSource(`${apiBase}/os/stream`);

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      const { type, data } = event;

      switch (type) {
        case 'plan.created':
          // ... logic
          break;
        case 'plan.updated':
          // ... logic
          break;
        case 'step.running':
        case 'step.done':
        case 'step.failed':
          // Update steps state
          break;
        case 'shopify.theme.updated':
        case 'shopify.product.updated':
        case 'shopify.campaign.started':
          // Show toast or notification
          break;
      }
    };

    return () => es.close();
  }, []);

  return {
    plans,
    activePlan,
    setActivePlan,
  };
}
