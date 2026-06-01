const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Register ts-node if not already registered (usually handled in index.js or previous routes)
try {
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true
    }
  });
} catch (e) {
  // Already registered or not needed
}

const { commerceOS } = require('../commerce-os/factory');
const { traceStore } = require('../commerce-os/trace-store');
const { globalAgentGateway } = require('../agent-runtime/factory');

const { manifestGenerator } = require('../agent-runtime/manifest-generator');
const { osEvents, OS_EVENTS } = require('../commerce-os/events');

const osStreamRouter = require('./os-stream').default;
router.use('/stream', osStreamRouter);

/**
 * GET /api/os/stream (MOVED TO os-stream.js)
 */

/**
 * GET /api/os/agents
 * Standardized agent list for OS Console
 */
router.get('/agents', requireAuth, (req, res) => {
  const agents = globalAgentGateway.getAgents();
  res.json({ ok: true, agents });
});

/**
 * GET /api/os/manifest
 * Export Sidekick Manifest for AI Agents
 */
router.get('/manifest', requireAuth, (req, res) => {
  const manifest = manifestGenerator.generate();
  res.json({ ok: true, manifest });
});

/**
 * POST /api/os/chat
 * High-level AI intent entry point
 */
router.post('/chat', requireAuth, async (req, res) => {
  const { intent, source } = req.body;
  if (!intent) return res.status(400).json({ error: 'Intent is required' });

  try {
    const plan = await commerceOS.gateway.processIntent(intent, source || 'chat');
    res.json({ ok: true, planId: plan.id, traceId: plan.traceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/os/execute
 * The single entry point for all Commerce OS operations
 * Unified entry: all requests must go through executor.execute(plan)
 */
router.post('/execute', requireAuth, async (req, res) => {
  const { intent, domain, action, payload, meta } = req.body;

  try {
    let plan;
    if (intent) {
      // Natural language intent
      plan = await commerceOS.gateway.processIntent(intent, meta?.source || 'sidekick');
    } else if (domain && action) {
      // Direct action: wrap in single-step plan
      plan = await commerceOS.gateway.runSingleAction({
        domain,
        action,
        payload: payload || {},
        meta: meta || {}
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Missing intent or domain/action'
      });
    }

    // Always return plan metadata, UI subscribes to /os/stream for results
    res.json({ ok: true, planId: plan.id, traceId: plan.traceId });
  } catch (err) {
    console.error('[OS Route] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/os/replay/:traceId
 */
router.post('/replay/:traceId', requireAuth, async (req, res) => {
  const { traceId } = req.params;
  try {
    const response = await commerceOS.replay.replay(traceId);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/os/trace/:traceId
 * Retrieve standardized details for a specific trace
 */
router.get('/trace/:traceId', requireAuth, (req, res) => {
  const { traceId } = req.params;
  const trace = traceStore.getTrace(traceId);
  if (!trace) return res.status(404).json({ error: 'Trace not found' });
  
  res.json({
    ok: true,
    trace: {
      traceId: trace.id,
      domain: trace.domain,
      action: trace.action,
      input: trace.input,
      output: trace.output,
      patch: trace.patches,
      policyDecision: trace.policyDecision,
      duration: trace.duration,
      timestamp: trace.timestamp
    }
  });
});

/**
 * GET /api/os/traces
 * List traces with optional filters
 */
router.get('/traces', requireAuth, (req, res) => {
  const { domain, limit } = req.query;
  const traces = traceStore.listTraces({ domain, limit: limit ? parseInt(limit) : undefined });
  res.json({ ok: true, traces });
});

/**
 * GET /api/os/log
 * Retrieve OS execution log (alias for traces)
 */
router.get('/log', requireAuth, (req, res) => {
  const { domain } = req.query;
  const logs = traceStore.listTraces({ domain });
  res.json({ ok: true, logs });
});

/**
 * GET /api/os/agent/:agentId/status
 * Get agent status and task count
 */
router.get('/agent/:agentId/status', requireAuth, (req, res) => {
  const { agentId } = req.params;
  const agents = globalAgentGateway.getAgents();
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ ok: true, agent });
});

module.exports = router;
