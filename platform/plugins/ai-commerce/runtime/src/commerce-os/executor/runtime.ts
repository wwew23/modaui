import { ActionPlanStep } from '../../../../os-sdk/src/protocol/action-plan';
import { ActionPlan } from '../types';
import { TransactionEngine } from './transaction';
import { StepResolver } from './step-resolver';
import { TransactionApplier } from './transaction-applier';
import { eventStream } from './event-stream';
import { allow, ActionSource } from '../action-registry';
import { traceStore } from '../trace-store';
import { prisma } from '../../lib/prisma';

/**
 * ActionExecutorRuntime
 * CommerceOS 唯一执行入口，严格闭合执行链
 * 职责：事务管理 + 权限检查 + 步骤编排 + 事件广播
 */
export class ActionExecutorRuntime {
  constructor(
    private transaction: TransactionEngine,
    private resolver: StepResolver,
    private applier: TransactionApplier
  ) {}

  /**
   * execute
   * 核心执行流程：Plan -> Permission -> Resolve -> Apply -> Broadcast
   * 所有执行必须经过此入口，禁止任何绕过
   */
  async execute(plan: ActionPlan) {
    const traceId = plan.traceId || `trace_${Date.now()}`;
    const source = (plan.source || 'user') as ActionSource;
    const merchantId = plan.merchantId || 'system';

    plan.status = 'running';
    plan.updatedAt = Date.now();

    console.log(
      `[ExecutorRuntime] Starting execution: planId=${plan.id}, traceId=${traceId}, steps=${plan.steps.length}`
    );

    // 1. 持久化 ActionPlan 到数据库
    try {
      await prisma.actionPlan.upsert({
        where: { id: plan.id },
        update: { status: 'running' },
        create: {
          id: plan.id,
          traceId,
          intent: plan.intent,
          title: plan.title,
          status: 'running',
          source: plan.source || 'user',
          merchantId,
        }
      });
    } catch (err) {
      console.error('[ExecutorRuntime] Failed to persist action plan:', err);
    }

    // 2. 广播计划开始
    eventStream.emit('plan.created', {
      planId: plan.id,
      traceId,
      source,
      merchantId,
      stepCount: plan.steps.length,
      timestamp: new Date().toISOString()
    });

    // 2. 开启原子事务
    await this.transaction.begin(traceId);

    try {
      for (const step of plan.steps) {
        // 3. 权限验证
        if (!allow(step.domain, step.action, source)) {
          const error = `Permission Denied: ${step.domain}.${step.action} for source=${source}`;
          console.warn(`[ExecutorRuntime] ${error}`);
          eventStream.emit('step.failed', {
            planId: plan.id,
            stepId: step.id,
            error,
            timestamp: new Date().toISOString()
          });
          throw new Error(error);
        }

        // 4. 执行步骤
        await this.runStep(step, plan.id, traceId);
      }

      // 5. 提交事务
      await this.transaction.commit(traceId);

      plan.status = 'success';
      plan.updatedAt = Date.now();

      console.log(`[ExecutorRuntime] Execution succeeded: planId=${plan.id}, traceId=${traceId}`);

      eventStream.emit('plan.updated', {
        planId: plan.id,
        status: 'success',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error(`[ExecutorRuntime] Execution failed, rolling back ${traceId}:`, err.message);

      // 6. 异常回滚
      eventStream.emit('rollback.started', { planId: plan.id, traceId, timestamp: new Date().toISOString() });
      await this.transaction.rollback(traceId);
      eventStream.emit('rollback.done', { planId: plan.id, traceId, timestamp: new Date().toISOString() });

      plan.status = 'failed';
      plan.updatedAt = Date.now();

      eventStream.emit('plan.updated', {
        planId: plan.id,
        status: 'failed',
        error: err.message,
        timestamp: new Date().toISOString()
      });

      throw err;
    }
  }

  /**
   * runStep
   * 单步执行：解析 -> 应用 -> 记录 -> 广播
   */
  private async runStep(step: ActionPlanStep, planId: string, traceId: string) {
    step.status = 'running';
    step.startedAt = Date.now();

    console.log(`[ExecutorRuntime] Running step: domain=${step.domain}, action=${step.action}`);

    eventStream.emit('step.running', {
      planId,
      stepId: step.id,
      domain: step.domain,
      action: step.action,
      timestamp: new Date().toISOString()
    });

    try {
      // Step 1: 业务动作解析 (Step -> PatchTransaction[])
      const transactions = await this.resolver.resolve(step);

      if (!transactions || transactions.length === 0) {
        console.warn(
          `[ExecutorRuntime] Step resolved to no transactions: ${step.domain}.${step.action}`
        );
        step.status = 'success';
        step.result = { success: true, patches: [] };
        step.finishedAt = Date.now();

        eventStream.emit('step.done', {
          planId,
          stepId: step.id,
          patches: [],
          timestamp: new Date().toISOString()
        });

        return;
      }

      // Step 2: 事务应用 (PatchTransaction -> Kernel)
      let allPatches: any[] = [];
      for (const tx of transactions) {
        const res = await this.applier.apply(step.domain as any, tx);
        if (res?.transaction?.patches) {
          allPatches = allPatches.concat(res.transaction.patches);
        }
      }

      step.status = 'success';
      step.result = { success: true, patches: allPatches };
      step.finishedAt = Date.now();

      // Step 3: 记录跟踪
      traceStore.addTrace({
        id: `${traceId}_${step.id}`,
        domain: step.domain as any,
        action: step.action,
        input: step.input,
        output: step.result,
        status: 'success',
        patches: allPatches,
        timestamp: new Date().toISOString(),
        duration: step.finishedAt - step.startedAt!
      });

      // Step 4: 广播完成
      eventStream.emit('step.done', {
        planId,
        stepId: step.id,
        patches: allPatches,
        timestamp: new Date().toISOString()
      });

      console.log(`[ExecutorRuntime] Step completed: domain=${step.domain}, action=${step.action}`);
    } catch (err: any) {
      step.status = 'failed';
      step.error = err.message;
      step.finishedAt = Date.now();

      console.error(
        `[ExecutorRuntime] Step failed: domain=${step.domain}, action=${step.action}, error=${err.message}`
      );

      // 记录失败的跟踪
      traceStore.addTrace({
        id: `${traceId}_${step.id}`,
        domain: step.domain as any,
        action: step.action,
        input: step.input,
        output: { error: err.message },
        status: 'failed',
        patches: [],
        timestamp: new Date().toISOString(),
        duration: step.finishedAt - step.startedAt!
      });

      // 广播失败
      eventStream.emit('step.failed', {
        planId,
        stepId: step.id,
        error: err.message,
        timestamp: new Date().toISOString()
      });

      throw err;
    }
  }
}
