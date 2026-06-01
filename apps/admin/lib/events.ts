import { publishRuntimeEvent } from './audit';

/**
 * emitOsEvent
 * 系统内核事件发出入口 (Admin App 封装)
 * 兼容 API 层的 emitOsEvent 命名，内部调用 publishRuntimeEvent 持久化到数据库
 */
export async function emitOsEvent(params: { type: string; merchantId: string; payload: any }) {
  return publishRuntimeEvent({
    merchantId: params.merchantId,
    eventType: params.type,
    payload: params.payload
  });
}
