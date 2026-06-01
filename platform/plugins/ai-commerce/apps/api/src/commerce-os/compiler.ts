import { v4 as uuid } from 'uuid';
import { ActionPlanStep } from '../../../os-sdk/src/protocol/action-plan';
import { ActionPlan } from './types';
import { CommerceOSGateway } from './gateway';
import { broadcastEvent, OS_EVENTS } from './events';
import { LLMPlanner } from './llm-planner';
import { PlanValidator } from './plan-validator';

export class ActionPlanCompiler {
  private planner: LLMPlanner;
  private validator: PlanValidator;

  constructor(private gateway: CommerceOSGateway) {
    this.planner = new LLMPlanner();
    this.validator = new PlanValidator();
  }

  /**
   * compile
   * 核心替换：将 Rule-based 升级为 LLM-driven 流程
   */
  async compile(intent: string): Promise<ActionPlan> {
    const id = uuid();
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[ActionPlanCompiler] Compiling intent via LLM: ${intent}`);

    // 1. LLM Planning
    const rawPlan = await this.planner.plan(intent);

    // 2. Plan Validation
    const validatedPlan = this.validator.validate(rawPlan);

    // 3. Transform to standard ActionPlan
    const steps: ActionPlanStep[] = validatedPlan.steps.map(step => ({
      id: uuid(),
      domain: step.domain,
      action: step.action,
      input: step.input,
      status: 'pending'
    }));

    const plan: ActionPlan = {
      id,
      traceId,
      intent,
      title: validatedPlan.title,
      status: 'pending',
      steps,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    broadcastEvent(OS_EVENTS.PLAN_CREATED, plan);
    return plan;
  }
}
