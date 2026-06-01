import { osEvents, OS_EVENTS, broadcastEvent } from './events';
import { ActionPlanStep } from '../../../os-sdk/src/protocol/action-plan';
import { ActionPlan } from './types';
import { CommerceOSKernel } from './kernel';
import { traceStore } from './trace-store';

export class ActionExecutorRuntime {
  constructor(
    private kernel: CommerceOSKernel,
    private stepRunner: (step: ActionPlanStep, traceId: string) => Promise<any>
  ) {}

  /**
   * execute
   * 核心执行流程：事务包装 + 步骤循环 + 事件广播
   */
  async execute(plan: ActionPlan) {
    const traceId = plan.traceId || `trace_${Date.now()}`;
    
    broadcastEvent(OS_EVENTS.PLAN_UPDATED_SSE, { ...plan, status: 'running' });
    osEvents.emit('plan.started', { planId: plan.id, traceId });

    // 1. Begin Atomic Transaction
    await this.kernel.beginTransaction(traceId);

    try {
      for (const step of plan.steps) {
        await this.runStep(step, traceId, plan.id);
      }

      // 2. Commit if all steps succeeded
      await this.kernel.commitTransaction(traceId);
      
      plan.status = 'success';
      plan.updatedAt = Date.now();
      broadcastEvent(OS_EVENTS.PLAN_UPDATED_SSE, plan);
      osEvents.emit('plan.finished', { planId: plan.id, status: 'success' });

    } catch (err: any) {
      console.error(`[ActionExecutorRuntime] Execution failed, rolling back trace ${traceId}:`, err);
      
      // 3. Rollback on any failure
      await this.kernel.rollbackTransaction(traceId);

      plan.status = 'failed';
      plan.updatedAt = Date.now();
      broadcastEvent(OS_EVENTS.PLAN_UPDATED_SSE, plan);
      osEvents.emit('plan.finished', { planId: plan.id, status: 'failed', error: err.message });
      
      throw err;
    }
  }

  private async runStep(step: ActionPlanStep, traceId: string, planId: string) {
    step.status = 'running';
    step.startedAt = Date.now();
    
    broadcastEvent(OS_EVENTS.STEP_UPDATED, { planId, step });
    osEvents.emit('step.running', { stepId: step.id, planId });

    try {
      // Execute the actual business logic via stepRunner
      const response = await this.stepRunner(step, traceId);

      if (response.status === 'failed') {
        throw new Error(response.error || `Step ${step.action} failed`);
      }

      step.status = 'success';
      step.result = response.result;
      step.finishedAt = Date.now();

      broadcastEvent(OS_EVENTS.STEP_UPDATED, { planId, step });
      osEvents.emit('step.done', { stepId: step.id, result: step.result });

      // Record in trace store
      traceStore.addTrace({
        id: `${traceId}_${step.id}`,
        domain: step.domain as any,
        action: step.action,
        input: step.input,
        output: step.result,
        status: 'success',
        timestamp: new Date().toISOString(),
        patches: response.patches || []
      });

    } catch (err: any) {
      step.status = 'failed';
      step.error = err.message;
      step.finishedAt = Date.now();

      broadcastEvent(OS_EVENTS.STEP_UPDATED, { planId, step });
      osEvents.emit('step.failed', { stepId: step.id, error: err.message });

      throw err;
    }
  }
}
