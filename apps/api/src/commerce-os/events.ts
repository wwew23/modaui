import { EventEmitter } from 'events';

export const osEvents = new EventEmitter();

export const OS_EVENTS = {
  ACTION_EXECUTED: 'action_executed',
  PLAN_UPDATED: 'plan_updated',
  RUNTIME_CHANGED: 'runtime_changed',
  PLAN_CREATED: 'plan.created',
  PLAN_UPDATED_SSE: 'plan.updated',
  STEP_UPDATED: 'step.updated',
  TRACE_UPDATED: 'trace.updated'
};

export function broadcastEvent(type: string, data: any) {
  osEvents.emit(type, data);
}
