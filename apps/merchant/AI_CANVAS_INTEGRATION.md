# Merchant AI 画布（集成指南）

目的：把 Merchant 前端的 AI 画布连接到后台 API，实时从 AI 生成 Theme DSL 并通过 Puck 渲染为可编辑页面（Data Binding 到真实产品/集合）。

关键 API：

- `GET /api/components` — 返回组件注册表（schema、bindingSchema、editableProps、category）。
- `GET /api/templates` — 列出可用模板（metadata）。
- `GET /api/templates/:id` — 获取模板详情（template.json，包含 sections 与 types）。
- `POST /api/templates/:id/generate` — 基于模板与 prompt 生成 Store DSL（需鉴权、需 `store_id`）。
- `POST /api/ai/generate` — 通用生成（可指定 template）；`POST /api/ai/generate/quick` — 一句话快速生成（自动选模板）。
- `GET /api/products?store_id=...` — 返回真实产品数据（Puck 在渲染 ProductGrid 时会根据 section.binding 发起请求）。
- `GET /api/collections?store_id=...` — 返回集合数据。

Puck 渲染建议：

1. 启动时从 `/api/components` 取到组件注册表并本地缓存，用于渲染表单与验证 props/binding。
2. 在用户选择模板或 AI 生成后，获取 Store DSL（`template, theme, pages, sections`）。
3. Puck 只负责：渲染 DSL、拖拽 Sections、编辑 `props` 与 `binding`，不管理业务数据或鉴权。
4. 对于带有 `binding` 的 Section（例如 `ProductGrid`），Puck 在展示时调用对应 API：
   - `binding.source === 'collection'` → `GET /api/collections?store_id=...` 或 `GET /api/collections?store_id=...&handle=...`
   - `binding.source === 'manual'` → Puck 从 `binding.ids` 中读取商品 id，并调用 `GET /api/products?store_id=...&ids=...`
5. 编辑 props 或 binding 时，Puck 向后端发送保存请求（可选：实现 /api/themes/:id 保存草稿），但 Puck 不负责同步到商店 runtime，保存后由后台或部署流水线将 DSL 发布到线上。

安全性与校验：

- Puck 在发送生成请求前应验证当前用户的 `store_id` 与 JWT 权限。后台已强制校验 `requireStoreAccess`。 
- Puck 在渲染前应对每个 section 使用 `component.schema` 与 `bindingSchema` 验证 props 与 binding，AJV 可在前端复用相同 JSON schema（或通过 `/api/components` 获取）。

Typical flow（一键生成 V0）：

1. Merchant 在 AI 画布输入一句话 Prompt。前端调用 `POST /api/ai/generate/quick`（body: `{prompt, store_id}`）
2. 后端选模板、调用 LLM、返回严格的 Store DSL（只包含 `template,theme,pages,sections`，sections 含 `binding` 指向 `collection` 或手动绑定）。
3. 前端 Puck 接收 DSL，渲染页面并对带 binding 的组件实时调用 `/api/collections` 和 `/api/products` 填充内容。
4. Merchant 调整 props 与 binding，保存草稿或发布。

注意事项：

- AI 不应该生成 HTML/JSX/CSS，必须输出 DSL。后台会校验组件是否在注册表中，以及 props/binding 的 schema 合法性。
- 真实商品/集合数据由 `/api/products` 和 `/api/collections` 提供。启动时请为目标 `store_id` seed 或连接真实数据库。

接下来我可以：
- 在该仓库中为 `store_id=1` seed 一组产品/集合示例并演示快速生成（需要我在服务器上安装依赖并运行）。
- 或者你指定要接入的真实数据源（数据库/Shopify API），我把数据适配层接入 `/api/products` 与 `/api/collections`。

