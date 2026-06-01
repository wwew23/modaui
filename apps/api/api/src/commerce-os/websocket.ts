import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { osEvents, OS_EVENTS } from './events';

export function setupOSWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/os/stream' });

  console.log('[OS WebSocket] Server initialized on /os/stream');

  wss.on('connection', (ws) => {
    console.log('[OS WebSocket] New client connected');

    // Subscribe to OS events and push to WebSocket
    const onAction = (data: any) => ws.send(JSON.stringify({ type: 'action_executed', data }));
    const onPlan = (data: any) => ws.send(JSON.stringify({ type: 'action_plan_update', data }));
    const onRuntime = (data: any) => ws.send(JSON.stringify({ type: 'runtime_diff', data }));

    osEvents.on(OS_EVENTS.ACTION_EXECUTED, onAction);
    osEvents.on(OS_EVENTS.PLAN_UPDATED, onPlan);
    osEvents.on(OS_EVENTS.RUNTIME_CHANGED, onRuntime);

    // Initial message
    ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

    ws.on('close', () => {
      console.log('[OS WebSocket] Client disconnected');
      osEvents.off(OS_EVENTS.ACTION_EXECUTED, onAction);
      osEvents.off(OS_EVENTS.PLAN_UPDATED, onPlan);
      osEvents.off(OS_EVENTS.RUNTIME_CHANGED, onRuntime);
    });

    ws.on('error', (err) => {
      console.error('[OS WebSocket] Error:', err);
    });
  });

  return wss;
}
