import { ThemeRuntime } from './types';
import { RuntimePatch, PatchOp } from './patch';

/**
 * 应用一组 Patch 到状态对象，返回新状态和操作结果
 */
export function applyPatchSet(
  state: ThemeRuntime,
  patches: RuntimePatch[]
): { success: boolean; state: ThemeRuntime; error?: string } {
  try {
    // 使用深拷贝确保原状态不可变
    let newState = JSON.parse(JSON.stringify(state));

    for (const patch of patches) {
      newState = applySinglePatch(newState, patch);
    }

    return { success: true, state: newState };
  } catch (err: any) {
    return { success: false, state, error: err.message };
  }
}

/**
 * 计算逆向 Patch 集合，用于 Undo 操作
 */
export function computeInversePatchSet(
  stateBefore: ThemeRuntime,
  patches: RuntimePatch[]
): RuntimePatch[] {
  const inversePatches: RuntimePatch[] = [];
  let currentState = JSON.parse(JSON.stringify(stateBefore));

  // 我们需要按顺序应用 Patch，并记录每个 Patch 的逆操作
  // 注意：逆操作应该按相反的顺序应用
  for (const patch of patches) {
    const inverse = computeSingleInversePatch(currentState, patch);
    inversePatches.unshift(inverse); // 放入开头，这样反转后就是正确的顺序
    currentState = applySinglePatch(currentState, patch);
  }

  return inversePatches;
}

// --- 内部辅助函数 ---

function applySinglePatch(obj: any, patch: RuntimePatch): any {
  const parts = patch.path.split('/').filter(p => p !== '');
  
  if (patch.op === 'replace') {
    return setValueAtPath(obj, parts, patch.value);
  } else if (patch.op === 'add') {
    return addValueAtPath(obj, parts, patch.value);
  } else if (patch.op === 'remove') {
    return removeValueAtPath(obj, parts);
  }
  
  throw new Error(`Unsupported patch operation: ${patch.op}`);
}

function computeSingleInversePatch(obj: any, patch: RuntimePatch): RuntimePatch {
  const currentValue = getValueAtPath(obj, patch.path.split('/').filter(p => p !== ''));
  
  if (patch.op === 'replace') {
    return {
      op: 'replace',
      path: patch.path,
      value: currentValue,
      scope: patch.scope,
      actor: 'system',
      description: `Undo: ${patch.description || 'replace'}`
    };
  } else if (patch.op === 'add') {
    return {
      op: 'remove',
      path: patch.path,
      scope: patch.scope,
      actor: 'system',
      description: `Undo: ${patch.description || 'add'}`
    };
  } else if (patch.op === 'remove') {
    return {
      op: 'add',
      path: patch.path,
      value: currentValue,
      scope: patch.scope,
      actor: 'system',
      description: `Undo: ${patch.description || 'remove'}`
    };
  }
  
  throw new Error(`Cannot compute inverse for operation: ${patch.op}`);
}

function getValueAtPath(obj: any, parts: string[]): any {
  let curr = obj;
  for (const part of parts) {
    if (curr === undefined || curr === null) return undefined;
    
    // 处理数组索引
    if (Array.isArray(curr)) {
      const idx = part === '-' ? curr.length - 1 : parseInt(part, 10);
      curr = curr[idx];
    } else {
      curr = curr[part];
    }
  }
  return curr;
}

function setValueAtPath(obj: any, parts: string[], value: any): any {
  if (parts.length === 0) return value;
  
  const [head, ...tail] = parts;
  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    obj[idx] = setValueAtPath(obj[idx], tail, value);
  } else {
    obj[head] = setValueAtPath(obj[head], tail, value);
  }
  return obj;
}

function addValueAtPath(obj: any, parts: string[], value: any): any {
  if (parts.length === 0) return value;
  
  const [head, ...tail] = parts;
  
  if (tail.length === 0) {
    if (Array.isArray(obj)) {
      if (head === '-') {
        obj.push(value);
      } else {
        const idx = parseInt(head, 10);
        obj.splice(idx, 0, value);
      }
    } else {
      obj[head] = value;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    obj[idx] = addValueAtPath(obj[idx], tail, value);
  } else {
    if (!obj[head]) obj[head] = {};
    obj[head] = addValueAtPath(obj[head], tail, value);
  }
  return obj;
}

function removeValueAtPath(obj: any, parts: string[]): any {
  if (parts.length === 0) return undefined;
  
  const [head, ...tail] = parts;
  
  if (tail.length === 0) {
    if (Array.isArray(obj)) {
      const idx = parseInt(head, 10);
      obj.splice(idx, 1);
    } else {
      delete obj[head];
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    obj[idx] = removeValueAtPath(obj[idx], tail);
  } else {
    obj[head] = removeValueAtPath(obj[head], tail);
  }
  return obj;
}
