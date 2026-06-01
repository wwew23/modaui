# Commerce OS Spec (v1.3)

## 0. 核心目标 (Core Goals)
- **Unified Reality**: `CommerceOS` 整合了 `Theme`, `Product`, `Campaign` 多个域，形成统一的商业事实源。
- **Domain Runtimes**: 每个业务域拥有独立的 Runtime Kernel，负责该域的一致性与不变量。
- **Cross-Domain Orchestration**: `CommerceOS Kernel` 负责跨域联动（如活动触发主题变更）。
- **AI Native**: 系统设计为可由 AI Planner 直接编排的高级 Action 集合。

---

## 1. 架构层次 (Architecture Layers)
### 1.1 领域运行时 (Domain Runtimes)
- **ThemeRuntime**: 管理视觉结构、Tokens 和源码映射。
- **ProductRuntime**: 管理商品元数据、分类关系与属性。
- **CampaignRuntime**: 管理活动周期、规则与跨域覆盖配置。

### 1.2 编排内核 (Orchestration Kernel)
- `CommerceOSKernel` 作为多域的协调者，确保原子性的跨域事务。

---

## 2. 数据模型与归一化 (Data Model & Normalization)
### 1.1 归一化图 (Normalized Graph)
Runtime 采用「节点 + 关系」的扁平化结构：
- **Nodes**: `sections`, `blocks` 按 ID 存储在 Record 中。
- **Relations**: `pageSections`, `sectionBlocks` 存储 ID 列表，定义层级和顺序。
- **Identity**: `runtimeNodeId` 绝对稳定，不随数组索引变化。

### 1.2 强制归一化 (Normalization Enforcement)
每次事务提交后，必须运行 `normalizeRuntime`：
- 清理孤立节点 (Dangling Nodes)。
- 修复失效关系 (Orphan Relations)。
- 重新计算受影响的层级哈希。

---

## 2. 变更网关 (Mutation Gate)
### 2.1 唯一入口
所有写入操作必须通过 `RuntimeStore.applyTransaction(tx)`。
### 2.2 状态保护
在开发/测试环境下，`ThemeRuntime` 对象被 **Proxy** 包装：
- 任何在事务外部尝试修改属性的行为将直接触发 `MutationOutsideTransactionError`。

---

## 3. 哈希控制平面 (Hash Control Plane)
哈希不仅是优化工具，更是系统的控制逻辑：
- **structureHash**: 结构改变 -> 触发依赖重算、验证。
- **contentHash**: 内容改变 -> 触发预览更新。
- **exportHash**: 源码映射改变 -> 触发 IO 写入。若 Hash 一致，**严禁** 触碰磁盘。

---

## 4. 导出调度 (Export Scheduling)
### 4.1 Compilation Planner
Exporter 升级为调度器，负责：
- **Coalescing**: 合并短时间内的多次变更。
- **Pruning**: 基于 `exportHash` 剪掉未变动的子树。
- **Atomic Write**: 确保文件更新的原子性。

---

## 5. 导入/导出合约 (Import/Export Contracts)
### 5.1 Importer 准则
- **State Initialization**: 只有在首次导入或重大重构时才允许全量生成 Runtime。
- **Source Mapping**: 导入过程必须生成完整的 `SourceMap`，作为后续增量导出的基石。

### 5.2 Exporter 准则
- **AI Managed Regions**: Exporter 只能修改被标记为 `ai-managed` 的区域。
- **Legacy Safety**: 严禁在没有明确 `SourceMap` 对应的情况下修改任何源码。
- **Atomic IO**: 所有文件写入必须是原子的，且经过 `exportHash` 剪枝优化。

---

## 6. 不变量与自动化测试 (Invariants & CI)
### 5.1 核心不变量 (Hard Invariants)
- **Deterministic Replay**: `replay(initial, txs) === current`。
- **Inverse Safety**: `apply(inverse(tx)) === before`。
- **Ownership Guard**: 严禁触碰 `legacy` 源码区域。
### 5.2 CI 门禁
任何对内核代码的修改，必须通过包含 1000 次随机事务重放的 Fuzzing 测试。
