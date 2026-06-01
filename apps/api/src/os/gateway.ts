import { ActionPlan } from '../../../os-sdk/src/protocol/action-plan';
import { commerceOS } from '../commerce-os/factory';

/**
 * 系统级统一入口：
 * - 所有 AI / 用户 / legacy 指令，都必须从这里进入执行层
 * - 禁止从别处直接 new Executor 或直接调 domain action
 */

export type ExecSource = 'ai' | 'user' | 'legacy' | 'system';

export type GatewayOptions = {
  source: ExecSource;
  intentText?: string;   // 原始自然语言 / 命令文本
  requestId?: string;
  userId?: string;
  sessionId?: string;
};

/**
 * runActionPlanFromSource
 * 系统级统一入口实现
 */
export async function runActionPlanFromSource(
  plan: ActionPlan,
  options: GatewayOptions
) {
  console.log(`[OS Gateway] [${options.requestId || 'no-id'}] Dispatching plan from source: ${options.source}`);
  
  // 注入上下文信息
  plan.source = options.source as any;
  if (options.intentText) {
    plan.intent = options.intentText;
  }

  // 集中做审计、速率限制等可以在此扩展
  
  // 调用底层的 OS Gateway 执行能力
  return commerceOS.gateway.processIntentWithPlan(plan, options.source as any);
}

/**
 * runLegacyInstruction
 * 针对一些简单场景的辅助函数：从一条 legacy 指令字符串跑出 plan 并执行
 */
export async function runLegacyInstruction(
  instruction: string,
  compileToPlan: (instruction: string) => ActionPlan
) {
  const plan = compileToPlan(instruction);
  return runActionPlanFromSource(plan, {
    source: 'legacy',
    intentText: instruction,
    requestId: `legacy_${Date.now()}`
  });
}
