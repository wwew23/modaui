import { eventStream } from '../commerce-os/executor/event-stream';

// 复用底层的事件定义
export type OsEvent = any;

type Listener = (event: OsEvent) => void;
const listeners = new Set<Listener>();

// 自动桥接 Executor EventStream 到 OS Stream
eventStream.subscribe((event) => {
  emitOsEvent(event);
});

/**
 * subscribeOsEvents
 * 唯一合法的 UI 状态变更订阅入口
 */
export function subscribeOsEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * emitOsEvent
 * 系统内核事件发出入口
 */
export function emitOsEvent(event: OsEvent) {
  // 发给本地 Node.js 监听者
  for (const l of listeners) {
    try {
      l(event);
    } catch (err) {
      console.error('[OS Stream] Error in listener:', err);
    }
  }
}
