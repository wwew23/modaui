const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Register ts-node to allow requiring TS files
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true
  }
});

const { commerceOS } = require('../commerce-os/factory');
const { globalAgentGateway } = require('../agent-runtime/factory');

/**
 * GET /api/agents
 * List all agents and their status
 */
router.get('/', requireAuth, (req, res) => {
  const agents = globalAgentGateway.getAgents();
  res.json({ ok: true, agents });
});

/**
 * POST /api/agents/run
 * DEPRECATED: Use /api/os/execute instead
 */
router.post('/run', requireAuth, async (req, res) => {
  const { agentId, action, params } = req.body;
  
  try {
    const response = await commerceOS.execute({
      domain: 'agent',
      action: action,
      payload: { ...params, agentId }
    });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
