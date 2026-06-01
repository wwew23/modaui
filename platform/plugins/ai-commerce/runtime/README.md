# apps/api

统一 API 层占位实现（Express）。

提供的示例端点：

- `POST /api/auth/login` — 登录，返回 JWT（演示账户：`admin`/`password`、`merchant`/`password`、`guest`/`password`）。
- `GET /api/stores` — 列表。
- `POST /api/stores` — 创建店铺（需 Authorization: Bearer <token>）。
- `POST /api/ai/generate` — AI 生成占位（需鉴权）。
- `POST /api/ai/generate` — AI 生成占位（需鉴权，支持指定 `template`）。
- `POST /api/ai/generate/quick` — 快速一键生成：只需 `prompt` 与 `store_id`，系统自动选择模板并返回标准 Store DSL。
- `GET /api/components` — 返回可用组件注册表（schema，editable props，category）。
- `GET /api/health` — 健康检查。

快速运行（在 `apps/api` 目录中执行）：

```bash
npm install
JWT_SECRET=your-secret npm start
```

下一步建议：用 `packages` 或 monorepo 工具（pnpm/workspaces）将 `apps/api` 与其他应用统一依赖管理，逐步替换占位逻辑为真实实现（数据库、JWT 用户表、LLM 集成）。
