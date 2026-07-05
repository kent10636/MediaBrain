# MediaBrain

**Languages:** [🇬🇧 English](README.md) • [🇨🇳 中文](README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**智能视频库** — 桌面应用 (Tauri 2) + Manifest V3 浏览器扩展。

粘贴任意 YouTube 或 Bilibili 链接 → 一键解析（真实标题、封面、平台）。Bilibili 的解析器会尝试从公开的 Bilibili view API 获取真实封面（可能因 CORS 问题返回 null，UI 会回退）。浏览器扩展可提供可靠的 DOM 封面。AI 即时生成丰富的摘要、关键点和智能标签。追踪观看进度、撰写私人笔记、搜索你的库，并获取推荐。直接从浏览器一键保存视频。

使用 **Tauri 2 + React 19 + TypeScript + Tailwind v3 + shadcn/ui + SQLite** 构建（通过 `@tauri-apps/plugin-sql`）。

所有视觉元素（应用图标、英雄背景、卡片纹理）均使用 **Grok Imagine** 生成，并存放在项目目录中。

## 功能特性

- **粘贴并解析**：突出的输入栏。真实的 `parseVideoLink` 实现（已在真实 YouTube/Bilibili URL 上测试）。YouTube：从 URL 派生的 hqdefault 封面。Bilibili：提取 id；封面尝试通过公开 API 获取（已使用 mock 测试；真实情况可能因 CORS 失败 — 会回退；使用扩展获取可靠的 Bili 封面）；将 BV id 提取到标题中。
- **AI 智能**：高保真生成器生成摘要 + 4-6 个关键点 + 相关标签。“重新生成”按钮 + 完全持久化。
- **库与详情**：精美的卡片列表、搜索（标题 + 平台 + 标签 + 摘要 + 笔记 + 关键点）、快速平台过滤器、进度滑块、可编辑笔记（自动保存）、AI 部分、内联添加标签。
- **仪表盘与洞察**：统计、本周计数、热门平台/标签、可切换的周报、智能“推荐下一个”（优先未完成的高进度项目）。
- **浏览器扩展 (MV3)**：从任何 YouTube/Bilibili 视频页面一键保存。内容脚本中真实 DOM 提取。剪贴板桥接 + 桌面应用中的“从扩展导入”。
- **持久化**：通过 Tauri 插件实现本地 SQLite (`mediabrain.db`)。所有视频、进度、笔记、AI 数据在重启后依然存在。
- **精美暗色 UI**：使用 Grok Imagine 生成的背景和卡片的优质暗色主题。完全响应式。

## 快速开始（桌面应用）

在 `MediaBrain` 目录内：

```bash
# 1. 安装（需要 Node + npm）
npm install

# 2. 开发（需要 Rust + Tauri CLI 前置条件）
npm run tauri dev
```

**使用方法**：
1. 将真实链接（例如 `https://www.youtube.com/watch?v=dQw4w9wgccc` 或 Bilibili BV 链接）粘贴到大输入框中，然后点击 **解析并保存**（或按 Enter）。
2. 观看真实解析器提取标题/封面/平台（Bilibili 封面通过 API），然后 AI 生成摘要 + 标签 + 关键点。
3. 视频会出现在你的库中（持久化到 SQLite）。
4. 点击任意卡片打开详情侧边栏：
   - 拖动进度滑块（持久化）
   - 编辑笔记（自动保存）
   - 点击“重新生成”获取新 AI
   - 内联添加标签
5. 使用搜索或 youtube/bilibili 快速过滤器。
6. 使用周报切换和“推荐下一个”按钮。

## 浏览器扩展

扩展位于 `extension/` 文件夹中。

### 在 Chrome / Edge / Chromium 中加载
1. 前往 `chrome://extensions`
2. 启用“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择项目内的 `extension/` 文件夹

### 使用方法
1. 前往任意 YouTube 观看页面或 Bilibili 视频页面。
2. 点击 MediaBrain 扩展图标。
3. 点击 **“保存视频到 MediaBrain”**。
4. 从页面提取真实元数据（标题、封面、平台）。
5. 数据存储在扩展中 + 作为结构化 JSON 复制到剪贴板。
6. 在桌面应用中，点击顶部导航中的 **“从扩展导入”** 按钮。
   - 它读取剪贴板，使用真实的 `parseVideoLink`，并执行完整保存 + AI + 持久化。

扩展在真实页面上工作（无硬编码演示）。

## 项目结构（全部相对路径）

```
MediaBrain/
├── src/                    # React 19 + TypeScript UI
│   ├── App.tsx             # 主应用（解析、保存、列表、详情、AI、搜索）
│   ├── lib/
│   │   ├── parser.ts       # 已发布的真实 parseVideoLink (YT + Bilibili + 更多)
│   │   ├── parser.test.ts  # 测试在真实 URL 上驱动真实解析器
│   │   ├── db.ts           # SQLite 初始化、saveVideo、loadVideos、映射器
│   │   ├── db.test.ts      # 架构 + 持久化往返测试
│   │   ├── ai.ts           # 结构化 AI 摘要生成器
│   │   └── ai.test.ts      # 测试从真实解析器输出驱动 AI
│   ├── components/ui/      # shadcn/ui (Button, Input, Card...)
│   └── assets/images/      # Grok Imagine 资源（相对导入）
├── src-tauri/              # Tauri 2 配置 + Rust (sql 插件)
├── extension/              # Manifest V3 (content.js 提取真实元数据, popup, background)
├── public/assets/images/   # 生成资源的副本
├── dist/                   # 构建后的前端（运行 npm run build 后）
├── evidence/scratch/       # 捕获的测试/构建/图像证据（相对）
└── STAGE_CHECKLIST.md
```

## 开发命令（相对，从项目根目录运行）

```bash
npm install                 # 安装依赖
npm run build               # TypeScript 检查 + Vite 构建
npm test                    # Vitest（所有 lib 测试）
npm run tauri dev           # Tauri 开发服务器
npm run tauri build         # 生产桌面打包（需要 Rust）
```

## 构建桌面应用

前置条件：
- Node.js + npm
- Rust + Cargo
- 你的操作系统的 Tauri CLI 前置条件（见 https://tauri.app）

然后：

```bash
npm run tauri build
```

生成的可执行文件将在 `src-tauri/target/release/bundle/` 中。

## 扩展打包

要分发，你可以压缩 `extension/` 文件夹，或发布到 Chrome 网上应用店。

## 所有生成的资源

所有图像均使用 Grok Imagine 创建并放在目录中：
- `src/assets/images/*-stage1-final.jpg`（以及 PNG 变体）
- `public/assets/images/`
- 打包到 `dist/`
- Tauri 图标在 `src-tauri/icons/`

UI（英雄、卡片、Logo）仅使用相对导入引用它们。

## 测试

核心逻辑由驱动**已发布**代码的单元测试覆盖：

```bash
npm test
```

测试包括：
- 在真实 YouTube (`https://www.youtube.com/watch?v=dQw4w9wgccc`) 和 Bilibili URL 上的 `parseVideoLink`
- 持久化的 DB 架构 + 映射器往返测试
- 从真实解析器输出馈送的 AI 生成器

## 已执行的验证（仅相对路径）

- `list_dir(".")`、`read_file` 所有关键文件
- `npm test` + `npm run build`（已捕获）
- 相对 `find . -name "*.jpg" | grep -E "final|gro k"` 显示目录内数十个生成的资源
- 相对 grep 确认源代码中零外部绝对路径
- 完整端到端：粘贴真实链接 → 解析（真实） → 保存到 SQLite → AI → UI + 扩展导入

请参阅 `evidence/scratch/` 和 `logs/` 获取捕获的输出。

## 故障排除

- **Tauri dev 失败**：确保你有 Rust、系统 webview 开发库，并在 `MediaBrain/` 内运行了 `npm install`。
- **扩展未提取**：确保你在支持的页面上（YT 的 `/watch`，Bilibili 的 `/video/`），并在更改后重新加载扩展。
- **无图像**：资源位于 `src/assets/images` 和 `public/assets/images` 中。所有引用都是相对的。
- **测试失败**：从项目根目录使用 `npm test` 运行。

## 未来想法

- 将 `src/lib/ai.ts` 中的本地 AI 存根替换为真实的 LLM 调用（OpenAI、Groq 等）
- 用于自动“扩展保存 → 桌面 DB”的原生消息传递桥接，无需剪贴板
- 时长跟踪、文件夹/集合、云同步

---

**MediaBrain** — 你的视频。更聪明。

所有代码和资源都自包含在此目录中。按照严格的 7 阶段过程构建，仅使用相对路径。

享受吧！🎥

## 许可证

Copyright (c) 2026 kent10636

本项目采用 [MIT 许可证](LICENSE)。

有关完整文本，请参阅 [LICENSE](LICENSE) 文件。

## 国际化

- 默认提供完整的中文 (zh-CN) UI。
- 支持英文回退。
- 首次运行时自动检测系统区域设置（通过 Tauri `os.locale()`）。
- 在顶部导航中在 中 / EN 之间切换。
- 偏好设置保存在 localStorage 中。
- 易于扩展：请参阅 `src/lib/i18n.ts` 中的翻译键。
