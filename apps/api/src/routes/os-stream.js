const express = require('express');
const router = express.Router();
const { osEvents, OS_EVENTS } = require('../commerce-os/events');

/**
 * GET /api/os/stream
 * SSE endpoint for real-time OS updates
 */
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onAction = (data) => sendEvent('trace.updated', data);
  const onPlan = (data) => {
    // data here is { type: 'plan.created' | 'plan.updated' | 'step.updated', ... }
    sendEvent(data.type, data);
  };

  osEvents.on(OS_EVENTS.ACTION_EXECUTED, onAction);
  osEvents.on(OS_EVENTS.PLAN_UPDATED, onPlan);

  sendEvent('connected', { timestamp: new Date().toISOString() });

  req.on('close', () => {
    osEvents.off(OS_EVENTS.ACTION_EXECUTED, onAction);
    osEvents.off(OS_EVENTS.PLAN_UPDATED, onPlan);
  });
});

module.exports = router;
