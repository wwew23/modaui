import { ActorType, RuntimePatch, PatchTransaction as BasePatchTransaction } from '../theme-importer/runtime-core/patch';
import { Snapshot } from '../theme-importer/runtime-core/snapshot';

import { ActionPlan as BaseActionPlan, ActionPlanStep, Domain, ActionStatus } from '../../../os-sdk/src/protocol/action-plan';

// 扩展 ActionPlan 添加 source 字段
export interface ActionPlan extends BaseActionPlan {
  source?: 'sidekick' | 'api' | 'replay' | 'user' | 'ai' | 'legacy';
}

// 重导出不扩展（避免冲突）
export type PatchTransaction = BasePatchTransaction;

export type OSDomain = Domain;
export type ActionStatus_Type = ActionStatus;
export type PlanStatus = ActionStatus;

export { ActionPlanStep, Domain, ActionStatus };

export interface OSRequest {
  domain: Domain | 'multi';
  action: string;
  payload: any;
  meta?: {
    requestId?: string;
    userId?: string;
    traceId?: string;
    merchantId?: string;
  };
}

export interface OSResponse {
  traceId: string;
  status: 'success' | 'failed' | 'pending';
  domain: Domain | 'multi';
  action: string;
  result: any;
  patches?: RuntimePatch[];
  policyDecision?: any;
  runtimeRevision?: number;
  error?: string;
  timestamp: string;
  duration?: number;
}

export interface ActionTrace {
  id: string; // traceId
  requestId?: string;
  userId?: string;
  merchantId?: string;
  domain: Domain | 'multi';
  action: string;
  input: any;
  output: any;
  status: 'success' | 'failed';
  patches: RuntimePatch[];
  policyDecision?: any;
  timestamp: string;
  duration: number;
  revision?: number;
}

export interface AgentState {
  id: string;
  name: string;
  displayName: string;
  status: 'idle' | 'executing' | 'paused' | 'error';
  model: string;
  taskCount: number;
  completedTasks: number;
  runningTask?: string; // taskId or traceId
  lastActiveAt: string;
  tools: string[];
}

export { ActorType, RuntimePatch, BasePatchTransaction };
