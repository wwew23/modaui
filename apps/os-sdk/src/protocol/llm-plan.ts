import { Domain } from './action-plan';

export interface LLMPlanStep {
  domain: Domain;
  action: string;
  input: Record<string, any>;
  description: string;
}

export interface LLMPlan {
  title: string;
  steps: LLMPlanStep[];
}
