export type ActorType = 'user' | 'ai' | 'system';
export type PatchOp = 'add' | 'remove' | 'replace' | 'move' | 'copy';
export interface RuntimePatch {
  op: PatchOp;
  path: string;
  value?: any;
  from?: string;
  scope?: string;
  actor?: ActorType;
  description?: string;
}

export type OSDomain = 'theme' | 'product' | 'campaign' | 'agent' | 'system';

export interface OSRequest {
  domain: OSDomain;
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
  domain: OSDomain;
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
  id: string;
  requestId?: string;
  userId?: string;
  merchantId?: string;
  domain: OSDomain;
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
  runningTask?: string;
  lastActiveAt: string;
  tools: string[];
}
