import { ActionTrace } from './types';

class TraceStore {
  private traces: Map<string, ActionTrace> = new Map();

  addTrace(trace: ActionTrace) {
    this.traces.set(trace.id, trace);
  }

  getTrace(traceId: string): ActionTrace | undefined {
    return this.traces.get(traceId);
  }

  listTraces(filters?: { domain?: string; agentId?: string; limit?: number }): ActionTrace[] {
    let allTraces = Array.from(this.traces.values());

    if (filters?.domain) {
      allTraces = allTraces.filter(t => t.domain === filters.domain);
    }

    // Agent filter logic can be added here if agentId is in trace meta

    return allTraces
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, filters?.limit || 100);
  }
}

export const traceStore = new TraceStore();
