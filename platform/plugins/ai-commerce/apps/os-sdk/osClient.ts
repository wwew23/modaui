import { OSRequest, OSResponse, ActionTrace, AgentState } from './types';

export class CommerceOSClient {
  private baseUrl: string;
  private token: string;

  constructor(options: { baseUrl: string; token: string }) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `OS API Error: ${res.status}`);
    }

    return res.json();
  }

  async run(domain: string, action: string, payload: any = {}): Promise<OSResponse> {
    return this.request<OSResponse>('/os/execute', {
      method: 'POST',
      body: JSON.stringify({ domain, action, payload }),
    });
  }

  async getTrace(traceId: string): Promise<ActionTrace> {
    const res = await this.request<{ ok: boolean; trace: ActionTrace }>(`/os/trace/${traceId}`);
    return res.trace;
  }

  async getTraces(filters: { domain?: string; limit?: number } = {}): Promise<ActionTrace[]> {
    const query = new URLSearchParams(filters as any).toString();
    const res = await this.request<{ ok: boolean; traces: ActionTrace[] }>(`/os/traces?${query}`);
    return res.traces;
  }

  async getLog(): Promise<ActionTrace[]> {
    const res = await this.request<{ ok: boolean; logs: ActionTrace[] }>('/os/log');
    return res.logs;
  }

  async getAgents(): Promise<AgentState[]> {
    const res = await this.request<{ ok: boolean; agents: AgentState[] }>('/agents');
    return res.agents;
  }

  async runAgent(agentId: string, action: string, params: any = {}): Promise<OSResponse> {
    return this.run('agent', action, { ...params, agentId });
  }

  async replay(traceId: string): Promise<OSResponse> {
    return this.request<OSResponse>(`/os/replay/${traceId}`, { method: 'POST' });
  }

  subscribe(onEvent: (event: { type: string; data: any }) => void) {
    const eventSource = new EventSource(`${this.baseUrl}/os/stream`);
    
    eventSource.onmessage = (event) => {
      // Standard message (optional)
    };

    const eventTypes = ['action_executed', 'plan_updated', 'runtime_changed', 'connected'];
    eventTypes.forEach(type => {
      eventSource.addEventListener(type, (e: any) => {
        onEvent({ type, data: JSON.parse(e.data) });
      });
    });

    return () => eventSource.close();
  }
}
