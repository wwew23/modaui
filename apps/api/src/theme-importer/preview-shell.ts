import { ThemeRuntime } from './runtime-core/types';
import { ThemeLocalRenderer } from './runtime-renderer';
import { diffPreview, DiffResult, UIChange } from './preview-diff-engine';
import { RuntimeHistory } from './runtime-history';
import { RuntimeSnapshot } from './runtime-snapshot';

/**
 * Preview Shell
 * 管理预览状态，执行局部更新逻辑 (Selective DOM Patching)
 */
export class ThemePreviewShell {
  private renderer: ThemeLocalRenderer;
  private currentRuntime: ThemeRuntime | null = null;
  private history: RuntimeHistory = new RuntimeHistory();

  constructor() {
    this.renderer = new ThemeLocalRenderer();
  }

  /**
   * 初始化全量渲染
   */
  bootstrap(runtime: ThemeRuntime, pageId: string, container: HTMLElement) {
    this.currentRuntime = JSON.parse(JSON.stringify(runtime));
    container.innerHTML = this.renderer.renderPage(runtime, pageId);
    
    // 初始快照
    this.history.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      runtime: JSON.parse(JSON.stringify(runtime)),
      meta: { source: 'system' }
    });
  }

  /**
   * 更新 Runtime 并记录历史 (主入口)
   */
  updateRuntime(
    nextRuntime: ThemeRuntime, 
    container: HTMLElement,
    pageId: string,
    actionMeta?: RuntimeSnapshot['action']
  ) {
    const snapshot: RuntimeSnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      runtime: JSON.parse(JSON.stringify(nextRuntime)),
      action: actionMeta,
      meta: { source: actionMeta ? 'ai' : 'user' }
    };

    this.history.push(snapshot);
    this.applyRuntime(nextRuntime, pageId, container);
  }

  /**
   * 撤销
   */
  undo(container: HTMLElement, pageId: string) {
    const snap = this.history.undo();
    if (snap) {
      this.applyRuntime(snap.runtime, pageId, container);
    }
  }

  /**
   * 重做
   */
  redo(container: HTMLElement, pageId: string) {
    const snap = this.history.redo();
    if (snap) {
      this.applyRuntime(snap.runtime, pageId, container);
    }
  }

  /**
   * 执行增量更新 (The Core Pipeline)
   */
  private applyRuntime(newRuntime: ThemeRuntime, pageId: string, container: HTMLElement) {
    if (!this.currentRuntime) {
      this.bootstrap(newRuntime, pageId, container);
      return;
    }

    // 1. 计算 Diff
    const diff = diffPreview(this.currentRuntime, newRuntime);
    
    // 2. 检查全局变更
    if (diff.tokensChanged || diff.globalSettingsChanged) {
      console.log('[PreviewShell] Global change detected, re-rendering page.');
      container.innerHTML = this.renderer.renderPage(newRuntime, pageId);
      this.currentRuntime = JSON.parse(JSON.stringify(newRuntime));
      return;
    }

    // 3. 执行 Selective DOM Patch
    this.patchDOM(diff.changes, newRuntime, container);

    this.currentRuntime = JSON.parse(JSON.stringify(newRuntime));
  }

  private patchDOM(changes: UIChange[], runtime: ThemeRuntime, container: HTMLElement) {
    // 优先处理 Section 更新
    const sectionChanges = changes.filter(c => c.type === 'section');
    
    for (const change of sectionChanges) {
      const element = container.querySelector(`[data-node-id="section:${change.nodeId}"]`);
      
      switch (change.op) {
        case 'remove':
          element?.remove();
          break;
        case 'update':
          if (element) {
            const newHtml = this.renderer.renderSection(runtime, change.nodeId);
            const temp = document.createElement('div');
            temp.innerHTML = newHtml;
            element.replaceWith(temp.firstElementChild!);
          }
          break;
        case 'add':
          // 简化的新增逻辑：如果找不到位置，就全量重绘或者追加到末尾
          // 在实际工程中，应该根据 relations.pageSections 的顺序找到前一个兄弟节点插入
          const newHtml = this.renderer.renderSection(runtime, change.nodeId);
          const temp = document.createElement('div');
          temp.innerHTML = newHtml;
          container.querySelector('.theme-preview')?.appendChild(temp.firstElementChild!);
          break;
      }
    }

    // Block 更新通常包含在 Section 更新中 (因为 Section 重新渲染会包含其 Blocks)
    // 但如果只改了 Block 且没触发 Section Hash 变化 (不应该发生)，则需要额外处理
  }
}
