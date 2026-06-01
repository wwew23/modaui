import { ActionPlanStep } from '../../../../os-sdk/src/protocol/action-plan';
import { OSResponse, OSRequest } from '../types';

export type StepRunnerFn = (step: ActionPlanStep, traceId: string) => Promise<OSResponse>;

/**
 * createStepRunner
 * 工厂函数，创建一个绑定了 Gateway 执行能力的 StepRunner
 */
export function createStepRunner(gatewayExecute: (req: OSRequest) => Promise<OSResponse>): StepRunnerFn {
  return async (step: ActionPlanStep, traceId: string) => {
    return gatewayExecute({
      domain: step.domain as any,
      action: step.action,
      payload: step.input,
      meta: { traceId }
    });
  };
}
