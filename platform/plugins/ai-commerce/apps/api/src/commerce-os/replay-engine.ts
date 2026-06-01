import { traceStore } from './trace-store';
import { eventStream } from './executor/event-stream';
import { osEvents, OS_EVENTS, broadcastEvent } from './events';

/**
 * ReplayEngine
 * 连接 Executor 与 Event Stream
 * 职责：从 TraceStore 加载历史记录，模拟执行过程，广播事件
 */
export class ReplayEngine {
  /**
   * replay
   * 输入 traceId，重放整个执行过程
   * - 从 TraceStore 加载所有相关的 Trace 记录
   * - 按时间顺序模拟执行
   * - 通过 Event Stream 广播事件（供 UI 可视化）
   */
  async replay(traceId: string, delayMs: number = 500) {
    console.log(
      `[ReplayEngine] Starting replay for traceId=${traceId}, delay=${delayMs}ms`
    );

    // 1. 加载所有相关的 Trace 记录
    const traces = traceStore
      .listTraces({ limit: 1000 })
      .filter(t => t.id.startsWith(traceId));

    if (traces.length === 0) {
      throw new Error(`[ReplayEngine] No traces found for traceId: ${traceId}`);
    }

    // 2. 按时间顺序排序
    const sortedTraces = traces.sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );

    console.log(
      `[ReplayEngine] Loaded ${sortedTraces.length} trace records for replay`
    );

    // 3. 广播计划开始
    eventStream.emit('plan.created', {
      planId: traceId,
      traceId,
      source: 'replay',
      stepCount: sortedTraces.length,
      timestamp: new Date().toISOString(),
      isReplay: true
    });

    // 4. 按顺序重放每个 Trace
    for (const trace of sortedTraces) {
      try {
        // 模拟步骤执行
        eventStream.emit('step.running', {
          planId: traceId,
          stepId: trace.id,
          domain: trace.domain,
          action: trace.action,
          timestamp: new Date().toISOString(),
          isReplay: true
        });

        // 等待一段时间，以便 UI 可以看到执行过程
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // 广播步骤完成或失败
        if (trace.status === 'success') {
          eventStream.emit('step.done', {
            planId: traceId,
            stepId: trace.id,
            patches: trace.patches || [],
            timestamp: new Date().toISOString(),
            isReplay: true
          });
        } else {
          eventStream.emit('step.failed', {
            planId: traceId,
            stepId: trace.id,
            error: trace.output?.error || 'Unknown error',
            timestamp: new Date().toISOString(),
            isReplay: true
          });
        }

        // 如果有事务信息，广播事务事件
        if (trace.patches && trace.patches.length > 0) {
          eventStream.emit('tx.applied', {
            domain: trace.domain,
            txId: `tx_${trace.id}`,
            patches: trace.patches,
            timestamp: new Date().toISOString(),
            isReplay: true
          });
        }
      } catch (err: any) {
        console.error(
          `[ReplayEngine] Error replaying trace ${trace.id}:`,
          err.message
        );
      }
    }

    // 5. 广播计划完成
    eventStream.emit('plan.updated', {
      planId: traceId,
      status: 'success',
      timestamp: new Date().toISOString(),
      isReplay: true
    });

    console.log(`[ReplayEngine] Replay completed: ${traceId}`);

    return {
      success: true,
      stepCount: sortedTraces.length,
      duration: sortedTraces.length * delayMs
    };
  }

  /**
   * replayToEventStream
   * 将一个 Trace 直接转换为 Event Stream 事件
   * （用于单条 Trace 的可视化）
   */
  async replayToEventStream(traceId: string) {
    const trace = traceStore.getTrace(traceId);

    if (!trace) {
      throw new Error(`[ReplayEngine] Trace not found: ${traceId}`);
    }

    console.log(`[ReplayEngine] Converting trace to event stream: ${traceId}`);

    // 广播为一系列事件
    eventStream.emit('step.running', {
      planId: traceId,
      stepId: trace.id,
      domain: trace.domain,
      action: trace.action,
      timestamp: trace.timestamp
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    if (trace.status === 'success') {
      eventStream.emit('step.done', {
        planId: traceId,
        stepId: trace.id,
        patches: trace.patches || [],
        timestamp: trace.timestamp
      });
    } else {
      eventStream.emit('step.failed', {
        planId: traceId,
        stepId: trace.id,
        error: trace.output?.error || 'Unknown error',
        timestamp: trace.timestamp
      });
    }

    return { success: true, traceId };
  }

  /**
   * listReplayable
   * 列出所有可重放的 Trace (分组by traceId)
   */
  listReplayable(): Array<{ traceId: string; stepCount: number; timestamp: string }> {
    const allTraces = traceStore.listTraces({ limit: 10000 });

    // 按 traceId 分组
    const grouped = new Map<string, typeof allTraces>();

    for (const trace of allTraces) {
      const baseTraceId = trace.id.split('_')[0]; // 获取根 traceId
      if (!grouped.has(baseTraceId)) {
        grouped.set(baseTraceId, []);
      }
      grouped.get(baseTraceId)!.push(trace);
    }

    // 转换为列表格式
    return Array.from(grouped.entries()).map(([traceId, traces]) => ({
      traceId,
      stepCount: traces.length,
      timestamp: traces[0]?.timestamp || new Date().toISOString()
    }));
  }
}

export const replayEngine = new ReplayEngine();
