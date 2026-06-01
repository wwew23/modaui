import { osEvents, broadcastEvent } from '../events';

/**
 * OS 执行引擎事件类型定义
 * 所有事件必须通过此流完整广播，确保 UI 获得准确的状态变化
 */
export type OsEvent =
  | { type: 'plan.created'; data: any; timestamp: string }
  | { type: 'plan.updated'; data: any; timestamp: string }
  | { type: 'step.running'; data: any; timestamp: string }
  | { type: 'step.done'; data: any; timestamp: string }
  | { type: 'step.failed'; data: any; timestamp: string }
  | { type: 'tx.applied'; data: any; timestamp: string }
  | { type: 'tx.failed'; data: any; timestamp: string }
  | { type: 'shopify.theme.updated'; data: any; timestamp: string }
  | { type: 'shopify.product.updated'; data: any; timestamp: string }
  | { type: 'shopify.campaign.started'; data: any; timestamp: string }
  | { type: 'shopify.campaign.finished'; data: any; timestamp: string }
  | { type: 'shopify.inventory.changed'; data: any; timestamp: string }
  | { type: 'shopify.discount.created'; data: any; timestamp: string }
  | { type: 'rollback.started'; data: any; timestamp: string }
  | { type: 'rollback.done'; data: any; timestamp: string };

type EventListener = (event: OsEvent) => void;

/**
 * EventStream
 * 执行引擎唯一的事件广播出口
 * 所有状态变化必须经过此类向外广播
 */
export class EventStream {
  private listeners = new Set<EventListener>();

  /**
   * subscribe
   * 本地监听器订阅，返回取消订阅函数
   */
  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    console.log(`[EventStream] Listener subscribed, total: ${this.listeners.size}`);

    return () => {
      this.listeners.delete(listener);
      console.log(`[EventStream] Listener unsubscribed, total: ${this.listeners.size}`);
    };
  }

  /**
   * emit
   * 统一事件广播入口
   * 1. 本地监听者 (内存)
   * 2. 全局事件网关 (SSE/WS)
   * 3. 控制台日志 (调试)
   */
  emit(type: OsEvent['type'], data: any) {
    const event: OsEvent = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    // Log for debugging
    console.log(`[EventStream] Emitting event: ${type}`, JSON.stringify(data).slice(0, 100));

    // 1. 通知本地监听器
    const listeners_array = Array.from(this.listeners);
    for (const listener of listeners_array) {
      try {
        listener(event);
      } catch (err) {
        console.error(`[EventStream] Error in listener:`, err);
      }
    }

    // 2. 全局网关广播 (SSE/WS)
    try {
      osEvents.emit(type, data);
      broadcastEvent(type, data);
    } catch (err) {
      console.error(`[EventStream] Error broadcasting to gateway:`, err);
    }
  }

  /**
   * listenerCount
   * 返回当前的监听器数量
   */
  listenerCount(): number {
    return this.listeners.size;
  }

  /**
   * clearListeners
   * 清除所有本地监听器（通常用于测试或清理）
   */
  clearListeners() {
    this.listeners.clear();
    console.log(`[EventStream] All listeners cleared`);
  }
}

export const eventStream = new EventStream();
