export type TaskStatus = 'pending' | 'executing' | 'success' | 'failed' | 'rollback';

export interface AgentTask {
  id: string;
  agentId: string;
  action: string;
  params: any;
  status: TaskStatus;
  result?: any;
  error?: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
  transactionId?: string; // Connected to PatchTransaction
}

export interface AgentInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: 'idle' | 'executing' | 'paused' | 'error';
  model: string;
  taskCount: number;
  tools: string[];
}
