import { ThemeActionLibrary } from './theme-actions';
import { ThemePolicyEngine, PolicyResult } from './theme-policy';
import { RuntimeStore } from './runtime-core/store';
import { ThemePreviewShell } from './preview-shell';
import { ThemeSourceMap } from './runtime-mapping/source-map';
import { explainAction } from './runtime-explainer';
import { COMMERCE_ACTIONS, isValidCommerceAction } from './domain-action-registry';

export interface ActionPlanItem {
  action: keyof ThemeActionLibrary | string; // 允许扩展商业动作
  params: any[];
}

export type ActionPlan = ActionPlanItem[];

/**
 * Action Runtime Executor
 * 负责执行 AI 输出的 Action Plan，并集成 Policy Gate 与 Explainer
 */
export class ActionRuntimeExecutor {
  constructor(
    public store: RuntimeStore, // 修改为 public 以便适配器访问
    private actionLibrary: ThemeActionLibrary,
    private policyEngine: ThemePolicyEngine,
    private sourceMap: ThemeSourceMap,
    private previewShell?: ThemePreviewShell
  ) {}

  /**
   * 执行 Action Plan
   * 流程：AI -> Action Plan -> Policy Engine (GATE) -> Executor -> Patch -> Explain -> Runtime
   */
  async executePlan(plan: ActionPlan, actor: string = 'ai', container?: any, pageId?: string) {
    const results = [];

    console.log(`[ActionExecutor] Executing plan with ${plan.length} actions from actor: ${actor}`);

    for (const item of plan) {
      const runtimeBefore = this.store.getState();

      // 1. Policy Gate (Pre-execution)
      const decision = await this.policyEngine.evaluateAction(item as any, runtimeBefore, actor);
      
      if (decision.decision === 'deny') {
        console.warn(`[ActionExecutor] Action ${item.action} DENIED: ${decision.reason}`);
        results.push({ action: item.action, success: false, error: decision.reason, decision: 'deny' });
        continue;
      }

      // 2. Execution (Action -> Patch -> Transaction)
      try {
        let transactionResult: any;

        if (isValidCommerceAction(String(item.action))) {
          // 处理通用商业动作 (来自 Domain Action Registry)
          console.log(`[ActionExecutor] Executing commerce domain action: ${item.action}`);
          const tool = COMMERCE_ACTIONS[item.action as string];
          const toolResult = await tool.execute(item.params[0] || {}, { source: actor as any });
          
          // 包装成类似事务的结果
          transactionResult = {
            success: true,
            state: runtimeBefore, 
            transaction: { id: `domain-${Date.now()}`, patches: [] }
          };
        } else {
          // 处理主题特定动作 (来自 Theme Action Library)
          const actionFn = (this.actionLibrary as any)[item.action];
          if (typeof actionFn !== 'function') {
            throw new Error(`Unknown action: ${String(item.action)}`);
          }
          transactionResult = await actionFn.apply(this.actionLibrary, item.params);
        }
        
        if (transactionResult.success) {
          const runtimeAfter = transactionResult.state;
          const patches = transactionResult.transaction.patches;

          // 3. Explain the change
          const explanation = await explainAction({
            actionName: String(item.action),
            actor: actor as 'ai' | 'user',
            runtimeBefore,
            runtimeAfter,
            patches,
            sourceMap: this.sourceMap
          });

          // 4. Secondary Policy Check
          const postDecision = await this.policyEngine.evaluateWithExplanation(String(item.action), explanation);
          
          results.push({ 
            action: item.action, 
            success: true, 
            transaction: transactionResult.transaction,
            explanation,
            decision: postDecision
          });
          
          // 5. 更新预览并记录历史
          if (this.previewShell && container && pageId) {
            this.previewShell.updateRuntime(
              runtimeAfter, 
              container, 
              pageId, 
              { type: String(item.action), label: explanation.title }
            );
          }
        } else {
          results.push({ action: item.action, success: false, errors: transactionResult.errors });
        }
      } catch (error: any) {
        console.error(`[ActionExecutor] Error executing ${String(item.action)}:`, error);
        results.push({ action: item.action, success: false, error: error.message });
      }
    }

    return results;
  }
}
