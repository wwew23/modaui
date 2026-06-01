import { ActionPlanCompiler } from './compiler';
import { ActionExecutorRuntime } from './executor/runtime';
import { ActionPlan, OSRequest } from './types';
import { StepResolver } from './executor/step-resolver';
import { TransactionApplier } from './executor/transaction-applier';
import { TransactionEngine } from './executor/transaction';
import { v4 as uuid } from 'uuid';

/**
 * CommerceOSGateway
 * 核心规则：禁止直接调用任何 Store、Library、Service
 * 唯一执行路径：LLMPlan -> Compiler -> Executor
 * 
 * ⚠️ 所有执行必须经过 ActionExecutorRuntime
 * ⚠️ 禁止任何 bypass 或 shortcut
 * ⚠️ 禁止 direct store/library 调用
 */
export class CommerceOSGateway {
  private compiler?: ActionPlanCompiler;
  private executor: ActionExecutorRuntime;

  constructor(
    private transaction: TransactionEngine,
    private stepResolver: StepResolver,
    private transactionApplier: TransactionApplier
  ) {
    // 初始化 Executor，使用 Resolver 和 Applier
    this.executor = new ActionExecutorRuntime(
      this.transaction,
      this.stepResolver,
      this.transactionApplier
    );
  }

  /**
   * setCompiler
   * 注入 Compiler，用于 LLM 计划编译
   */
  setCompiler(compiler: ActionPlanCompiler) {
    this.compiler = compiler;
    console.log('[CommerceOSGateway] Compiler initialized');
  }

  /**
   * processIntent (PUBLIC)
   * ✅ AI 唯一入口：自然语言意图编译为计划并执行
   * 执行路径：意图 -> Compiler -> ActionPlan -> Executor
   */
  async processIntent(
    intent: string,
    source: ActionPlan['source'] = 'sidekick'
  ): Promise<ActionPlan> {
    if (!this.compiler) {
      throw new Error(
        '[CommerceOSGateway] Compiler not initialized. Call setCompiler() first.'
      );
    }

    console.log(`[CommerceOSGateway] Processing intent: "${intent}" from source=${source}`);

    try {
      // 1. 编译意图为计划
      const plan = await this.compiler.compile(intent);

      // 2. 设置来源
      plan.source = source;

      // 3. 交给 Executor（异步执行）
      this.executor.execute(plan).catch(err => {
        console.error('[CommerceOSGateway] Plan execution failed:', err.message);
      });

      return plan;
    } catch (err: any) {
      throw new Error(`Intent compilation failed: ${err.message}`);
    }
  }

  /**
   * processIntentWithPlan (PUBLIC)
   * ✅ 显式执行已编译的计划
   * 用于直接执行已知的 ActionPlan 对象
   */
  async processIntentWithPlan(
    plan: ActionPlan,
    source: ActionPlan['source'] = 'sidekick'
  ): Promise<ActionPlan> {
    plan.source = source;

    console.log(
      `[CommerceOSGateway] Processing plan: planId=${plan.id}, steps=${plan.steps.length}, source=${source}`
    );

    // 唯一的执行入口：交给 Executor
    this.executor.execute(plan).catch(err => {
      console.error('[CommerceOSGateway] Plan execution failed:', err.message);
    });

    return plan;
  }

  /**
   * runSingleAction (PUBLIC)
   * ✅ 执行单个原子指令
   * 自动包装成 1-step ActionPlan 并通过 Executor 运行
   */
  async runSingleAction(req: OSRequest): Promise<ActionPlan> {
    console.log(
      `[CommerceOSGateway] Running single action: domain=${req.domain}, action=${req.action}`
    );

    // 自动构建 ActionPlan
    const plan: ActionPlan = {
      id: uuid(),
      traceId: req.meta?.traceId || `trace_${Date.now()}`,
      intent: `Execute: ${req.domain}.${req.action}`,
      title: `Action: ${req.action}`,
      status: 'pending',
      steps: [
        {
          id: uuid(),
          domain: req.domain as any,
          action: req.action,
          input: req.payload,
          status: 'pending'
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: 'api'
    };

    // 交给 Executor（异步执行）
    this.executor.execute(plan).catch(err => {
      console.error('[CommerceOSGateway] Single action execution failed:', err.message);
    });

    return plan;
  }

  // ⚠️ 禁止以下访问模式
  // ❌ private/internal methods that violate execution chain
  // ❌ direct store access
  // ❌ direct library calls without going through Executor + Resolver + Applier

  /**
   * DEPRECATED: Direct execution bypass
   * ⚠️ 此方法禁止使用，已由 Executor + Resolver 完全取代
   * 所有执行必须经过 ActionExecutorRuntime
   */
  async _deprecated_directExecute(req: OSRequest) {
    throw new Error(
      '[CommerceOSGateway] Direct execution is FORBIDDEN. ' +
        'Use runSingleAction() or processIntent() instead. ' +
        'All execution must go through ActionExecutorRuntime.'
    );
  }
}
