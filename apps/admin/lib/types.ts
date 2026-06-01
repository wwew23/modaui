// 智能体信息
export interface AgentInfo {
  id: string;
  name: string;
  displayName: string;
  status: "idle" | "executing" | "paused" | "error";
  model: string;
  taskCount: number;
  memory: string;
  tools: string[];
  logs: string[];
}

// 任务队列
export interface BullQueue {
  name: string;
  displayName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  jobs: BullJob[];
}

export interface BullJob {
  id: string;
  name: string;
  status: "waiting" | "active" | "completed" | "failed" | "retrying";
  payload: string;
  timestamp: string;
}

// 运行日志
export interface RuntimeLog {
  id: string;
  timestamp: string;
  action: string;
  payload: string;
  merchantId: string;
  status: "success" | "executing" | "failed" | "rollback";
  executor: string;
}

// 商户店铺
export interface MerchantStore {
  id: string;
  name: string;
  merchantName: string;
  plan: "Starter" | "Pro" | "Enterprise";
  aiUsage: string;
  limitPattern: string;
  status: "active" | "suspended";
  tokenCost: number;
}

// 审批项
export interface ApprovalItem {
  id: string;
  type: "refund" | "payout" | "bulk_edit" | "price_change";
  target: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  timestamp: string;
  payload: Record<string, unknown>;
  limits: string;
}

// 安全规则
export interface SafetyRules {
  maxRefund: number;
  maxPriceChangePct: number;
  allowDangerousBulkDelete: boolean;
  requireAdminForPayouts: boolean;
}

// 通知
export interface Notification {
  id: string;
  type: "quota" | "failure" | "warning" | "success";
  title: string;
  text: string;
  timestamp: string;
  read: boolean;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

// 时间线事件
export interface TimelineEvent {
  time: string;
  author: string;
  type: "marketing" | "staff" | "theme" | "order" | "system";
  text: string;
}

// 账单统计
export interface BillingStats {
  aiQuotaUsed: number;
  agentNodeCost: number;
  apiSurcharges: number;
  databaseVCPUHours: number;
}

// 活动标签页
export type ActiveTab = 
  | "dashboard"
  | "merchants"
  | "stores"
  | "agents"
  | "queues"
  | "logs"
  | "billing"
  | "analytics"
  | "settings"
  | "runtime";

// 用户角色
export type UserRole = "super_admin" | "operator" | "support" | "finance" | "developer";

// 系统模式
export type SystemMode = "developer" | "business";

// Runtime 状态
export interface RuntimeStatus {
  status: "running" | "stopped" | "error";
  events: number;
  workflows: number;
  agents: number;
  uptime?: string;
}

// Runtime 事件
export interface RuntimeEvent {
  id: string;
  type: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

// Intent 类型
export type IntentType = 
  | "chat.general"
  | "workflow.run"
  | "agent.run"
  | "inventory.forecast"
  | "trend.discover"
  | "store.generate"
  | "task.create";
