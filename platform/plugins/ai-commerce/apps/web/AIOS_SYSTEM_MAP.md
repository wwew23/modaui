# MODAUI (模搭 AIOS) Developer and AI Agent System Map
此文档记录了 MODAUI (模搭 AIOS) 系统的完整功能全景、底层技术链路、已跑通与未跑通/模拟状态的模块结构。后续任何 AI 助手在迭代本项目时，必须严格遵守此说明，并基于已经存在的、高稳定性的数据结构和后端接口进行扩展。

---

## 🎨 视觉与风格规范 (UI/UX Paradigm)
- **主题基因**: 全系采用极简高对比度轻量化卡片设计，主色调通过 CSS 变量动态锁定。外层容器由温润的极暗黑底（`bg-neutral-950`）与精美的亮白渐变卡片（`bg-white`）构成强烈视觉落差。
- **动态基因**: 所有主打转场均通过 `@motion/react` (即 `motion`) 接管，确保在模板切换、弹窗展现以及 UI 补全加载时拥有极高的流畅度，不得使用 Gratuitous 乱舞动效。
- **图标源规范**: 严格、唯一使用 `lucide-react`。严禁引入自定义 inline SVG 或未声明的第三图标库。

---

## 🛠️ 后端引擎与 API 设计 (`/app/api/gemini/route.ts`)
后端完全采用 Next.js App Router API 路由提供服务，严禁前端暴露任何 API Key。支持以下核心动作（`action`）：

1. **`action === "autocomplete"` (已完美打通 - 核心亮点 🌟)**
   - **输入**: `userTyped: string` (用户输入的一半 Prompts)
   - **输出**: `prediction: string` (灰色 Ghost 续写文本)
   - **智能机制**: 利用 `gemini-3.5-flash` 进行高灵敏度、低延迟（100-300ms）的“下文单词预测”。内置完备的主题敏感度Fallback回退机制。在 `hero-section.tsx` 中配合双层 textarea 重叠层通过 **Tab** 键快速捕获补全。

2. **`action === "chat"` (已完美打通 - 新上多轮状态记忆功能 💬)**
   - **输入**: `messages` (格式为 Google GenAI 规范的多轮角色对话数组)
   - **输出**: `text` (高情商、结合当前模板设计的导购回答)
   - **联动**: 会自动在 System instruction 中注入当前所选品牌的主色调、备用色、热售商品清单，以此生成极为贴近店铺现状的回答。

3. **`action === "tts"` (已完美打通 - 语音合成音频合成 🎙️)**
   - **输入**: `textToSpeak: string`
   - **输出**: `audio` (Base64 格式的 WAV 音频字节流)
   - **运作**: 利用服务端 TTS 生成技术，前端直接利用 `Audio` 对象无缝播放。

4. **`action === "clone" / "generate"` (已打通)**
   - 提供给 Shopify 主题底层元数据生成与重构设计的核心大模型编译器。

---

## 📋 模块功能清单：状态与接通情况 (Features Mapping)

| 功能模块名称 | 交互位置/技术载体 | 系统接通状态 | AI 后续接力指导说明 |
| :--- | :--- | :--- | :--- |
| **Inline Autocomplete (AI 实时文本续写)** | 主输入大框 `id="prompt-textarea"` | **🟢 已完全接通** | 采用双层重叠 Textarea 机制：底层绝对定位注入透明文字+半透明预测 Ghost Text，顶层作为实时交互文本。监听 `onKeyDown` 拦截 `Tab` 键（`e.preventDefault()`），补全瞬间合并词条并刷空 Ghost Text。 |
| **Multi-turn Customizer Session (多轮多模态语音对话状态记忆)** | 模板主视区 `id="customizer-voice-box"` | **🟢 已完全接通** | 用户点击输入框下的快捷气泡（智能对话向导 / 仿真高通麦克风输入），或自己打字，会进入一个多轮对话上下文容器。会同步请求服务端 TTS 产出语音并由前端自动播放。多轮数据保存在 `customizerSessions` 下以 `template.id` 为主键，切换模板不丢失记忆。 |
| **Layout & Color Theme Real-time Sync (多商铺色系基因一键渲染)** | 模板卡片网格与下方配置大底座 | **🟢 已完全接通** | 点选任一模板，会自动将主色、备用色、背景色以及前景色写入 CSS 局部变量（`--shop-primary` 等）。配置大底座完美读取该色系，并提供一键修改色盘。 |
| **Config Backup Engine (JSON 主题本地备份与导出)** | “导出当前定制为 JSON” 按钮 | **🟢 已完全接通** | 自主序列化当前 active 的色彩调色板、正在被定制的商品、当前的 AI 语音会话历史，通过 Blob 生成标准的 `download` 锚点下载为 `moda-theme-<id>-config.json`，方便商家异地本地恢复。 |
| **Shopify ZIP Drag & Drop File Loader (压缩包无缝拖拽解析器)** | 输入框卡片拖动区 | **🟡 视觉及客户端读取** | 已经打通了 HTML5 拖拽事件监听与文件名称展示逻辑。目前处于**高真客户端读取阶段**（展示上传的 Zip 文件名、文件体积、生成 Webhook 调试行），并没有真的将 C++ 形式解压、读取底层 Liquid 模板的 API 写入后端（Shopify 官方不允许线上解打包）。后续可以根据需要扩展在 `/api/upload` 处。 |
| **Multimodal Soundwave Indicator (多模态麦克风波动频谱)** | 语音助手激活面板 | **🟡 视觉/物理仿真** | 语音合成或按下录音时，麦克风会高频无规则伸缩跳跃。非真实 Web Audio API 轨道解析，而是利用带有 `@motion` Stagger 随机动画周期的 SVG Rect 阵列完成高拟真频谱视觉。后续可接通 Web Audio API 的 `AudioContext` 以匹配真实音波。 |
| **Active Store Realtime Push to Admin (一键秒级部署上线)** | 弹出配置页 `id="btn-cloud-deploy"` | **🟡 视觉/模拟日志** | 触发后会出现一条实时递增进度条，模拟向 Shopify 主站、Cloud Run 网关、API Webhook 写入路由的部署态日志。并没有接通真实的 Shopify Partner App Access Token（当前为沙盒展示模式，防止侵入真实商家系统导致商誉受损）。 |

---

## 🔒 TypeScript 坚固性规范
1. **严格类型检验**: 严禁在页面或组件中使用任何 `any`。导入变量时必须严格检验类型。
2. **Tab 键拦截限制**: 只在 Ghost 续写内容存在时（`ghostText !== ""`）拦截 `Tab`，其余时间允许商家使用 Tab 键换行或者切换焦点。
3. **音频播放限制**: 捕获 `sound.play()` 抛出的 Promise reject 错误（防范现代浏览器“因未产生点击而拒绝自动播放多媒体文件”的安全限制）。
