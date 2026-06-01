import { useState, useEffect } from 'react';
import { CommerceOSClient } from './client';
import { AgentState, ActionTrace } from './types';

export function useOSAgents(client: CommerceOSClient) {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getAgents().then(data => {
      setAgents(data);
      setLoading(false);
    });
  }, [client]);

  return { agents, loading };
}

export function useOSTraces(client: CommerceOSClient, filters = {}) {
  const [traces, setTraces] = useState<ActionTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getTraces(filters).then(data => {
      setTraces(data);
      setLoading(false);
    });
  }, [client, JSON.stringify(filters)]);

  return { traces, loading };
}
