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

// 产品
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  category: string;
  image?: string;
  description?: string;
}

// 订单
export interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  date: string;
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
  | "orders"
  | "products"
  | "customers"
  | "marketing"
  | "discounts"
  | "content"
  | "analytics"
  | "merchants"
  | "stores"
  | "storefront"
  | "agents"
  | "os-console"
  | "ai-studio"
  | "queues"
  | "logs"
  | "billing"
  | "settings"
  | "runtime"
  | "notifications";

// 在线商店子标签页
export type StorefrontSubTab =
  | "ai-canvas"
  | "templates"
  | "importer"
  | "pages"
  | "navigation"
  | "domains"
  | "seo";

// 通知类型
export type NotificationType = "email" | "sms" | "push";

// 通知状态
export type NotificationStatus = "pending" | "sent" | "failed" | "scheduled";

// 商店通知
export interface StoreNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

// 通知配置
export interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
};

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

// 客户
export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastOrder: string;
  status: "active" | "inactive";
}

// 折扣
export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  usageCount: number;
  usageLimit: number;
  status: "active" | "expired" | "scheduled";
  startDate: string;
  endDate: string;
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

// AI Action 类型
export type AIActionType =
  | "create"
  | "update"
  | "delete"
  | "analyze"
  | "generate"
  | "optimize"
  | "batch"
  | "export"
  | "import"
  | "notify"
  | "automate";

// AI Action 状态
export type AIActionStatus = "idle" | "pending" | "executing" | "success" | "error";

// AI Action 定义
export interface AIAction {
  id: string;
  type: AIActionType;
  label: string;
  description: string;
  icon: string;
  context: ActiveTab;
  estimatedTime?: string;
  requiresConfirmation?: boolean;
  parameters?: AIActionParameter[];
}

// AI Action 参数
export interface AIActionParameter {
  name: string;
  type: "text" | "number" | "select" | "boolean" | "date";
  label: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
}

// AI Action 执行结果
export interface AIActionResult {
  id: string;
  actionId: string;
  status: AIActionStatus;
  message: string;
  data?: Record<string, unknown>;
  startTime: string;
  endTime?: string;
  progress?: number;
}

// AI 上下文
export interface AIContext {
  currentTab: ActiveTab;
  selectedItems?: string[];
  filters?: Record<string, unknown>;
  userData?: Record<string, unknown>;
}

// AI 建议
export interface AISuggestion {
  id: string;
  type: "action" | "insight" | "warning" | "optimization";
  title: string;
  description: string;
  action?: AIAction;
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: string;
}
