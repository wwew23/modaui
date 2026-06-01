# MODA-AIOS (模搭智造) 前端多模态系统功能索引与状态图谱
> 本文档旨在为后续承接任务的 AI 助理、规划算法以及资深开发工程师提供极致清晰的“功能地图（Interface Capabilities Map）”。它全面归纳了系统的前端功能组件、运作机制、链路打通状态及扩展说明。

---

## 🗺️ 核心功能全景图树

```text
MODA-AIOS Enterprise Setup
 ├── 🎨 独立站多模态主输入枢纽 (AI Engine Terminal)
 │    ├── 💡 幽灵文本实时自动补全 (Inline Ghost Text Autocomplete via Tab)
 │    ├── ✨ 设计灵感与智能对话向导 (Preset Context-aware Inspiration Chips)
 │    └── 📦 Shopify ZIP 主题直接拖入解构 (Drag & Drop Liquid Theme Assets)
 │
 ├── 🧪 独立站美学实验室 (Merchant Customizer Simulator Area)
 │    ├── 🚦 系统就绪与密钥自检指示灯 (Secrets Environment Verification Indicator)
 │    ├── 🎛️ 深度色域实时控制台 (Custom CSS Variable & Master Palettes Synchronizer)
 │    ├── 📱 多端高保真效果实时渲染区 (Fully Simulated Mockup Screen Layer)
 │    └── 💾 导出品类/视觉 JSON 备份 (Local Backup & Asset Distribution Schema-JSON Export)
 │
 ├── 🎙️ 情境模拟多模态 3D AI 语音定制助手 (Contextual Voice Custormizer Terminal)
 │    ├── 🧠 多轮个性化定制会话记忆 (Persistent Single-session State Memory Machine)
 │    ├── 🎤 仿真高通麦克风快捷输入 (Simulated Mic Quick Dictation Transcripts)
 │    └── 🔊 实时声波合成与人声重现 (Gemini TTS Multimodal Base64 Audio Stream Player)
 │
 └── 🚀 全功能高灵敏交互组件 (High Sensitivity UI Components)
      ├── 🔍 Bento 级极速预览面板 (Detailed Bento Quick-View Modal Window)
      └── 📊 指标大屏、架构说明与生态互联 (Analytics Indicators, Dev Guide & App ecosystems)
```

---

## 🚦 功能全景打通矩阵 (Capabilities Status Matrix)

| 功能名称 (Feature Name) | 所属区域 | 技术机制 (Underlying Technology) | 状态级别 (Status) | 后端接通端点 | 交互描述 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **实时幽灵文本自动补全 (Inline Autocomplete)** | 主输入区 | 监听输入时延 (Debounce 450ms) + 叠加绝对定位透明图层 & 拦截 `Tab` 键 | 🟢 **完备打通 (Fully Operational)** | `POST /api/gemini` `{action: "autocomplete"}` | 打字时出现灰色预测字符，按下 `Tab` 键实现顺滑物理补全，完美体验。 |
| **设计灵感/向导芯片 (Inspiration Chips)** | 主输入区 | Heuristic 即刻置入 Prompt 刷新 autocomplete 主逻辑 | 🟢 **完备打通 (Fully Operational)** | `POST /api/gemini` `{action: "autocomplete"}` | 点击下方小气泡，一键载入不同风格方案，预测机制随之自动重置并贴合。 |
| **密钥就绪自检指示灯 (Environment Status)** | 侧边栏顶部 | 发送静默包至底层 API，动态读取 `GEMINI_API_KEY` 存在性 | 🟢 **完备打通 (Fully Operational)** | `POST /api/gemini` `{action: "env_status"}` | 侧边栏顶部呼吸闪烁。绑定密钥则亮绿灯“系统就绪”，缺密钥则亮红灯“配置缺失”。 |
| **多温区大师艺术色盘 (Premium Palettes)** | 侧边栏偏上 | CSS 变量实时渲染 + `setSelectedPalette` 变轨响应 | 🟢 **完备打通 (Fully Operational)** | 🟢 *Client-Side Native CSS* | 用户点击极简、霓虹服饰、高奢和牛等色盘时，右边大卡片及子组件背景、文字色迅速零时延发生变轨。 |
| **多模态 3D 语音定制交互 (Voice Customizer)** | 侧边栏侧中 | 浏览器端按 Template ID 自治的状态会话记录，会话隔离，支持记忆多轮提问 | 🟢 **完备打通 (Fully Operational)** | `POST /api/gemini` `{action: "chat"}` | 支持用户多轮连续打字交谈。AI 了解你当前的色盘、主推产品等，高情商带 Emoji 幽默对话，不丢失上文。 |
| **声波 TTS 朗读重现 (Audio System)** | 侧边栏底侧 | `Audio` 语轨加载，直接拉取 Base64 音频。支持消息一键重放。 | 🟢 **完备打通 (Fully Operational)** | `POST /api/gemini` `{action: "tts"}` | 语音助手收到文字反馈后全自动合成语音音轨并实时播放，波形闪烁。 |
| **品类/视觉 JSON 导出 (Schema Export)** | 定制大模态 | 主题底层 Schema 递归拼接 + 自动挂载虚拟 `Anchor` 调起原生 Downloader | 🟢 **完备打通 (Fully Operational)** | 🟢 *Client-Side Native IO* | 一键备份本地。符合 Shopify JSON Theme template 格式要求，可用于独立站完美离线恢复。 |
| **Bento Bento 级极速预览 (Quick View Modal)** | 模版网格层 | 独立隔离的预览模态视窗，采用高透双滤镜毛玻璃作为大底 | 🟢 **完备打通 (Fully Operational)** | 🟢 *Client-Side UI Portal* | 点击“极速预览”一秒开启大窗口，不仅有卡片放大版，还支持独立结算防锁交互的即兴演练。 |
| **Shopify ZIP 自动检测与编译 (Theme Uplink)** | 主输入区 | 拖入 ZIP (或手动选择) 提取解析元数据，调用流水线日志模拟渲染器 | 🟡 **深度仿真 (Simulated Frame)** | 🟡 *Progress Logger Simulation* | 拖入任何 `.zip` 压缩包（模拟 Shopify Liquid 文件）会自动进入华丽的“多段分布式部署控制台”，提供全流程模拟日志。 |

---

## 🛠️ 后端 Gemini 路由分流设计 (Route Actions Design)

应用的前后端通信全部基于最安全的 **全栈代理 (Full-stack Server Proxy)** 架构，API 密钥完全托管在服务器端，不会暴露于浏览器客户端。

前端调用端点均为：`/api/gemini` (Method: `POST`)
通过 `action: string` 区分业务核：
1. **`action: "env_status"`**
   - 目的：自检。
   - 返回：`{ success: true, isConfigured: boolean }`
2. **`action: "autocomplete"`**
   - 目的：轻量预测。为了极致体验，带有 15 字符最大输出限制。当网络超时或底层中断时，无缝切换为具有行业特征的**内置专业模板兜底规则**。
3. **`action: "chat"`**
   - 目的：上下文多轮问答。把当前的品牌色彩、主要卖点与聊天历史拼接，保持高度的角色情境感。
4. **`action: "tts"`**
   - 目的：声学音频流转换。通过 Gemini-3.5 内置的多模态音频合成音质直接提供给前端波形音轨。

---

## 💡 给新到访 AI 助理的极速开发建议 (Tips for Next AI/Dev Agents)
1. **如何调整 Ghost 预测倾向？**
   - 修改 `/app/api/gemini/route.ts` 中 `action === "autocomplete"` 的 `autocompletePrompt` 规则，你可以调整让其多讲英文、突出 SEO 卖点、或是增加专业营销组件名称。
2. **如何接入真实的 Shopify API 部署？**
   - 在 `components/landing/hero-section.tsx` 中的 `handleUploadComplete` 寻找部署调用逻辑，你可以绑定真正的 Shopify Admin Rest API 端点 `themes.json` 以部署你上传的主题压缩包静态资源。
3. **性能调优注意点：**
   - 如果遇到输入卡顿，可将 `/components/landing/hero-section.tsx` 内 `handlePromptChange` 下的 `debounce` 延时（目前为 450ms）适当微调。

---
*MODA-UI 团队倾心打造 | 极高保真 e-commerce 体验架构模组*
