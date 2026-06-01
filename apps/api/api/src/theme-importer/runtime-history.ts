import { RuntimeSnapshot } from './runtime-snapshot';

/**
 * Runtime History (v1)
 * 负责时间轴管理：存 / 取 / 切换
 */
export class RuntimeHistory {
  private stack: RuntimeSnapshot[] = [];
  private cursor = -1;
  private max = 100;

  push(snapshot: RuntimeSnapshot) {
    // 丢弃当前光标之后的 redo 分支 (Git 语义)
    this.stack = this.stack.slice(0, this.cursor + 1);
    this.stack.push(snapshot);
    this.cursor++;

    // 限制栈深度
    if (this.stack.length > this.max) {
      this.stack.shift();
      this.cursor--;
    }
  }

  undo(): RuntimeSnapshot | null {
    if (this.cursor <= 0) return null;
    this.cursor--;
    return this.stack[this.cursor];
  }

  redo(): RuntimeSnapshot | null {
    if (this.cursor >= this.stack.length - 1) return null;
    this.cursor++;
    return this.stack[this.cursor];
  }

  current(): RuntimeSnapshot | null {
    return this.stack[this.cursor] ?? null;
  }

  getStack(): RuntimeSnapshot[] {
    return [...this.stack];
  }

  clear() {
    this.stack = [];
    this.cursor = -1;
  }
}
