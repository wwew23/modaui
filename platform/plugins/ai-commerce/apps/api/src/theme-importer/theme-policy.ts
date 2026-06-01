import { ThemeRuntime } from './runtime-core/types';
import { RuntimePatch } from './runtime-core/patch';
import { HumanChangeSummary } from './runtime-explainer';

export type PolicyDecision = 'allow_auto' | 'require_confirmation' | 'deny';

export interface PolicyResult {
  decision: PolicyDecision;
  reason?: string;
}

/**
 * 主题策略引擎 (AI 边界控制)
 * 定义 AI 可以和不可以做的事情
 */
export class ThemePolicyEngine {
  /**
   * 针对 Action 的预检 (Pre-execution)
   */
  async evaluateAction(
    action: { action: string; params: any[] },
    runtime: ThemeRuntime,
    actor: string
  ): Promise<PolicyResult> {
    if (actor !== 'ai') return { decision: 'allow_auto' };

    // 示例规则
    if (action.action === 'applyBrandProfile' && action.params[0]?.colors?.brand) {
      return { decision: 'require_confirmation', reason: 'Changing brand colors requires manual approval.' };
    }

    if (action.action === 'reorderSections' && action.params[1]?.length > 10) {
      return { decision: 'require_confirmation', reason: 'Reordering a large number of sections requires review.' };
    }

    return { decision: 'allow_auto' };
  }

  /**
   * 基于解释器的摘要进行更精细的准入控制
   */
  async evaluateWithExplanation(
    actionName: string,
    explanation: HumanChangeSummary
  ): Promise<PolicyDecision> {
    const { risk, diffs } = explanation;

    if (risk === 'low') return 'allow_auto';

    // 如果只是 token 轻微变动，比如对比度微调，可以根据 diffs 更精细判断
    const onlySmallTokenChange = 
      explanation.diffs.length === 1 && 
      explanation.diffs[0].scope === 'tokens' && 
      explanation.diffs[0].label?.includes('text');

    if (risk === 'medium' && onlySmallTokenChange) {
      return 'require_confirmation';
    }

    if (risk === 'high') {
      return 'require_confirmation';
    }

    return 'require_confirmation';
  }

  /**
   * 评估一个事务是否符合策略
   */
  async evaluate(
    runtime: ThemeRuntime,
    patches: RuntimePatch[],
    actor: string
  ): Promise<PolicyResult> {
    if (actor !== 'ai') return { decision: 'allow_auto' };

    for (const patch of patches) {
      // 1. 禁止 AI 修改品牌主色 (示例)
      if (patch.path.includes('/tokens/colors/brand')) {
        return { decision: 'require_confirmation', reason: 'AI is not allowed to change brand colors automatically.' };
      }

      // 2. 禁止 AI 删页面
      if (patch.op === 'remove' && patch.path.startsWith('/pages')) {
        return { decision: 'deny', reason: 'AI is not allowed to delete pages.' };
      }

      // 3. 敏感设置需要确认
      if (patch.path.includes('api_key') || patch.path.includes('password')) {
        return { decision: 'deny', reason: 'AI cannot touch sensitive settings.' };
      }

      // 4. 大规模结构变动需要确认
      if (patch.scope === 'structure' && patches.length > 5) {
        return { decision: 'require_confirmation', reason: 'Large structural changes require human review.' };
      }
    }

    return { decision: 'allow_auto' };
  }
}
