#!/usr/bin/env npx ts-node
import * as http from 'http';

const API_BASE = 'http://localhost:4000/api/os';

async function request(path: string, method: string = 'GET', body?: any) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token' // Mock token for CLI
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const [,, command, ...args] = process.argv;

async function main() {
  switch (command) {
    case 'run': {
      const [domain, action, payloadStr] = args;
      const payload = payloadStr ? JSON.parse(payloadStr) : {};
      const res = await request('/execute', 'POST', { domain, action, payload });
      console.log(JSON.stringify(res, null, 2));
      break;
    }
    case 'trace': {
      const [traceId] = args;
      const res = await request(`/trace/${traceId}`);
      console.log(JSON.stringify(res, null, 2));
      break;
    }
    case 'log': {
      const res = await request('/log');
      console.log(JSON.stringify(res, null, 2));
      break;
    }
    case 'agent': {
      const [sub, agentId] = args;
      if (sub === 'run') {
        const res = await request('/execute', 'POST', { domain: 'agent', action: 'run', payload: { agentId } });
        console.log(JSON.stringify(res, null, 2));
      } else {
        const res = await request(`/agent/${agentId}/status`);
        console.log(JSON.stringify(res, null, 2));
      }
      break;
    }
    default:
      console.log(`
CommerceOS CLI
Usage:
  os run <domain> <action> <payload_json>
  os trace <traceId>
  os log
  os agent status <agentId>
  os agent run <agentId>
      `);
  }
}

main().catch(console.error);
