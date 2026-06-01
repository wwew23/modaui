import { ActionRuntimeExecutor, ActionPlan } from './action-runtime-executor';
import { RollbackEngine } from './rollback-engine';
import { ThemeRuntime } from './runtime-core/types';
const legacyPlanner = require('../ai-setup/planner');

export type LegacyInstruction = string;

export type LegacyActionPlan = {
  prompt: string;
  steps: Array<{
    id: string;
    instruction: string;
  }>;
  meta?: {
    source?: string;
    intentText?: string;
  };
};

export type CommerceKernelResult = {
  success: boolean;
  runtime: ThemeRuntime;
  stepsProcessed: number;
  results: any[];
};

/**
 * Commerce OS Kernel Adapter (Hardened v2)
 * 包装 legacy engine.js 逻辑，桥接旧指令到新执行流
 */
export class CommerceOSKernelAdapter {
  constructor(
    private executor: ActionRuntimeExecutor,
    private rollbackEngine: RollbackEngine
  ) {}

  /**
   * 运行旧版指令 (Legacy Instruction)
   * 流程：Legacy Planner -> Action Plan -> New Executor -> New Rollback
   */
  async runLegacyInstruction(
    instruction: LegacyInstruction, 
    container: any, 
    pageId: string
  ): Promise<CommerceKernelResult> {
    console.log(`[Adapter] Intercepting legacy instruction: "${instruction}"`);

    // 1. 调用旧版 Planner 解析指令为步骤 (Legacy Execution Flow)
    const legacyPlan: LegacyActionPlan = legacyPlanner.planFromPrompt(instruction);
    
    // 2. 将旧版步骤转换为现代 Action Plan 契约
    const actionPlan: ActionPlan = legacyPlan.steps.map((step) => {
      return this.mapLegacyStepToAction(step, pageId);
    });

    // 3. 使用新内核 Executor 执行 (Hardened Kernel Flow)
    const results = await this.executor.executePlan(actionPlan, 'ai', container, pageId);

    // 4. 自动记录 Snapshot (由 executor 内部完成，此处返回最终状态)
    const finalState = this.executor['store'].getState();

    return {
      success: results.every(r => r.success),
      runtime: finalState,
      stepsProcessed: results.length,
      results
    };
  }

  /**
   * 内部映射逻辑：Legacy Step -> Modern Action
   */
  private mapLegacyStepToAction(step: { id: string; instruction: string }, pageId: string) {
    switch (step.id) {
      case 'theme':
        return { action: 'applyBrandProfile', params: [{ tone: 'luxury' }] };
      case 'homepage':
        return { action: 'createLuxuryHeroSection', params: [pageId, { tone: 'luxury', withCta: true }] };
      case 'collections':
        return { action: 'bindCollectionToSection', params: ['hero-1', 'trending'] };
      default:
        // 兜底：映射为通用设置更新
        return { 
          action: 'updateSectionSettings', 
          params: ['hero-1', { title: step.instruction }] 
        };
    }
  }
}
