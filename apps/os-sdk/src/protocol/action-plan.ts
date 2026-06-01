export type Domain = 'theme' | 'product' | 'campaign' | 'agent' | 'system' | 'shopify.theme' | 'shopify.product' | 'shopify.campaign';

export type ActionStatus = 'pending' | 'running' | 'success' | 'failed';

export interface ActionPlan {
  id: string;
  intent: string;
  title: string;
  status: ActionStatus;

  steps: ActionPlanStep[];

  traceId?: string;

  createdAt: number;
  updatedAt: number;
}

export interface ActionPlanStep {
  id: string;
  domain: Domain;
  action: string;
  input: Record<string, any>;
  status: ActionStatus;
  description: string;
  dependsOn?: string[];
  result?: any;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}
