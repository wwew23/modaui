# MODAUI (模搭 AIOS) Developer and AI Agent System Guidelines
This document is automatically loaded by the AI Studio Workspace platform. If you are a developers or an AI Coding Agent continuing the work on this project, please adhere to these strict engineering layouts, state definitions, and state persistence structures.

---

## 🛠️ Dynamic State Map & Component Hierarchy
All main dashboard states are placed in `/components/landing/hero-section.tsx`.
Key elements and state connections are managed as follows:

1. **AI Inline Autocomplete (Ghost Predictive Suggestion Engine):**
   - **Textarea Location:** `id="prompt-textarea"`, overlaps a hidden element for text styling synchronize.
   - **State hooks:** `prompt` (active string), `ghostText` (half-transparent gray prediction from AI).
   - **API Hook:** Calls `/api/gemini` with body `{ action: "autocomplete", userTyped: prompt }` debounced at 450ms.
   - **Capture mechanism:** `onKeyDown` intercepts `Tab` only if `ghostText !== ""` via `e.preventDefault()`, concats the suggestion, and clears the suggestion hook.

2. **Multimodal Soundwave Dialog & Voice Customizer (`customizerSessions`):**
   - **State hook:** `customizerSessions` is a dictionary: `Record<string, { role: "user" | "model", text: string }[]>` mapped by template-ID to sustain multi-turn conversational persistence.
   - **Multi-turn Logic:** Merges brand palettes, active items and past talks, sending them structured for Gemini chat endpoints. Returns raw conversation + triggers text-to-speech WAV audio base64 streams from `/api/gemini` with `action: "tts"` for spoken dialogue assistance.

3. **Backup Export Trigger Engine:**
   - **Trigger Button:** `id="btn-export-theme-json"` & `id="sidebar-export-theme-json"`
   - **Aesthetics & Code Integrity:** Triggered as an anonymous arrow function `onClick={() => handleExportThemeJSON()}` to prevent type clash with MouseEvent parameters. Packs active palettes, chat memories, and widgets into a compliant JSON download.

4. **Template Quick-View Screen Modal:**
   - **Trigger:** Configured on show template detail cards to display responsive side overlays.

---

## 📂 Backend Core Services (`/app/api/gemini/route.ts`)
- Calls `/api/gemini` exclusively over HTTP POST requests on the server-side to hide API key allocations.
- Never write API credentials or access schemes client-side. Keep all Gemini interactions inside the API endpoint middleware layer.

*Refer to `AIOS_SYSTEM_MAP.md` for complete feature maps & mock status guidelines.*
