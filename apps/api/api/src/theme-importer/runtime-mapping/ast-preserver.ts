import { SourceLocation } from './source-map';

/**
 * Liquid AST Node 类型（根据你使用的 parser 映射）
 * 这里只做抽象接口，具体结构由实际 parser 决定。
 */
export interface LiquidAstNode {
  type: string;
  loc: SourceLocation;
  children?: LiquidAstNode[];
  // parser 的其他字段...
  [key: string]: any;
}

export interface LiquidAstFile {
  file: string;
  root: LiquidAstNode;
  source: string;
}

/**
 * 给定 AST 和 Region 范围，生成一个新的 AST（只替换 Region 内的节点）
 */
export function replaceAstRegion(
  ast: LiquidAstFile,
  regionLoc: SourceLocation,
  newNodes: LiquidAstNode[]
): LiquidAstFile {
  // 简化：你可以在后续接入真实 AST 操作逻辑
  // 这里先保留接口和占位实现
  // 当前实现直接返回原 ast，不做修改
  return ast;
}

/**
 * 将 AST 渲染回 Liquid 源码时，尽量保持原始 formatting & comments。
 * 通常用 parser 提供的 printer / serializer。
 */
export function printAst(ast: LiquidAstFile): string {
  // 占位实现：实际应调用 parser 的 serialize 方法
  return ast.source;
}
