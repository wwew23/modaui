import express from 'express';
import { subscribeOsEvents } from '../os/event-stream';

const router = express.Router();

/**
 * GET /api/os/stream
 * 唯一 UI 数据源端点 (SSE)
 * 所有前端组件（Timeline, DAG, Preview）必须从此订阅变更。
 */
router.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  console.log('[OS Stream] New client connected via SSE');

  const unsubscribe = subscribeOsEvents((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    console.log('[OS Stream] Client disconnected');
    unsubscribe();
  });
});

export default router;
