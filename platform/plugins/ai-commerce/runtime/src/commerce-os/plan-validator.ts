import { LLMPlan, LLMPlanStep } from '../../../os-sdk/src/protocol/llm-plan';
import { ACTION_REGISTRY } from './action-registry';

export class PlanValidator {
  validate(plan: any): LLMPlan {
    if (!plan || typeof plan !== 'object') {
      throw new Error('Invalid plan: Not an object');
    }

    if (!plan.title || !Array.isArray(plan.steps)) {
      throw new Error('Invalid plan: Missing title or steps array');
    }

    const validatedSteps: LLMPlanStep[] = plan.steps.map((step: any, index: number) => {
      const { domain, action, input, description } = step;

      if (!ACTION_REGISTRY[domain as keyof typeof ACTION_REGISTRY]) {
        throw new Error(`Invalid domain at step ${index}: ${domain}`);
      }

      const allowedActions = ACTION_REGISTRY[domain as keyof typeof ACTION_REGISTRY];
      if (!allowedActions.includes(action)) {
        throw new Error(`Invalid action at step ${index}: ${domain}.${action}`);
      }

      return {
        domain: domain as any,
        action,
        input: input || {},
        description: description || `${domain}.${action}`
      };
    });

    return {
      title: plan.title,
      steps: validatedSteps
    };
  }
}
