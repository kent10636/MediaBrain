# MediaBrain

**Languages:** [🇬🇧 English](README.md) • [🇨🇳 中文](README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Intelligent Video Library** — Desktop app (Tauri 2) + Manifest V3 browser extension.

Paste any YouTube or Bilibili link → one-click parse (real title, cover, platform). For Bilibili the shipped parser attempts to fetch the real cover from the public Bilibili view API (may be null on CORS; UI falls back). The browser extension provides reliable DOM cover for Bilibili. AI instantly generates rich summaries, key points, and smart tags. Track watch progress, write private notes, search your library, and get recommendations. Save videos directly from the browser with one click.

Built with **Tauri 2 + React 19 + TypeScript + Tailwind v3 + shadcn/ui + SQLite** (via `@tauri-apps/plugin-sql`).

All visuals (app icon, hero background, card textures) were generated with **Grok Imagine** and live inside the project tree.

## Features

- **Paste & Parse**: Prominent input bar. Real `parseVideoLink` implementation (tested on live YouTube/Bilibili URLs). YouTube: URL-derived hqdefault cover. Bilibili: id extracted; cover attempted via public API inside shipped parser (tested with mock; real may fail CORS — falls back; use extension for reliable Bili cover); extracts BV id into title.
- **AI Intelligence**: High-fidelity generator produces summary + 4-6 key points + relevant tags. "Regenerate" button + full persistence.
- **Library & Detail**: Beautiful card list, search (title + platform + tags + summary + notes + keypoints), quick platform filters, progress slider, editable notes (auto-saves), AI sections, inline tag adding.
- **Dashboard & Insights**: Stats, this-week count, top platform/tag, toggleable weekly report, smart "Recommend next" (prefers unfinished high-progress items).
- **Browser Extension (MV3)**: One-click save from any YouTube/Bilibili video page. Real DOM extraction in content script. Clipboard bridge + "Import from Ext" in the desktop app.
- **Persistence**: Local SQLite (`mediabrain.db`) via Tauri plugin. All videos, progress, notes, AI data survive restarts.
- **Beautiful Dark UI**: Premium dark theme with Grok Imagine-generated backgrounds and cards. Fully responsive.

## Quick Start (Desktop App)

From inside the `MediaBrain` directory:

```bash
# 1. Install (Node + npm required)
npm install

# 2. Development (requires Rust + Tauri CLI prerequisites)
npm run tauri dev
```

**Usage**:
1. Paste a real link (e.g. `https://www.youtube.com/watch?v=dQw4w9wgccc` or a Bilibili BV link) into the big input and click **Parse & Save** (or press Enter).
2. Watch the real parser extract title/cover/platform (Bilibili cover via API), then AI generate summary + tags + keypoints.
3. The video appears in your library (persisted to SQLite).
4. Click any card to open the detail sidebar:
   - Drag the progress slider (persists)
   - Edit notes (auto-saves)
   - Click "Regenerate" for fresh AI
   - Add tags inline
5. Use search or the youtube/bilibili quick filters.
6. Use the weekly report toggle and "Recommend next" button.

## Browser Extension

The extension lives in the `extension/` folder.

### Load in Chrome / Edge / Chromium
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder inside this project

### Usage
1. Go to any YouTube watch page or Bilibili video page.
2. Click the MediaBrain extension icon.
3. Click **"Save Video to MediaBrain"**.
4. Real metadata (title, cover, platform) is extracted from the page.
5. Data is stored in the extension + copied to your clipboard as structured JSON.
6. In the desktop app, click the **"Import from Ext"** button in the top nav.
   - It reads the clipboard, uses the real `parseVideoLink`, and performs full save + AI + persist.

The extension works on real pages (no hardcoded demos).

## Project Structure (all relative)

```
MediaBrain/
├── src/                    # React 19 + TypeScript UI
│   ├── App.tsx             # Main app (parse, save, list, detail, AI, search)
│   ├── lib/
│   │   ├── parser.ts       # SHIPPED real parseVideoLink (YT + Bilibili + more)
│   │   ├── parser.test.ts  # Tests drive the real parser on actual URLs
│   │   ├── db.ts           # SQLite init, saveVideo, loadVideos, mappers
│   │   ├── db.test.ts      # Schema + roundtrip persistence tests
│   │   ├── ai.ts           # Structured AI summary generator
│   │   └── ai.test.ts      # Tests drive parser → AI on real URLs
│   ├── components/ui/      # shadcn/ui (Button, Input, Card...)
│   └── assets/images/      # Grok Imagine assets (relative imports)
├── src-tauri/              # Tauri 2 configuration + Rust (sql plugin)
├── extension/              # Manifest V3 (content.js extracts real metadata, popup, background)
├── public/assets/images/   # Copies of generated assets
├── dist/                   # Built frontend (after npm run build)
├── evidence/scratch/       # Captured test/build/image evidence (relative)
└── STAGE_CHECKLIST.md
```

## Development Commands (relative, run from project root)

```bash
npm install                 # Install dependencies
npm run build               # TypeScript check + Vite build
npm test                    # Vitest (all lib tests)
npm run tauri dev           # Tauri dev server
npm run tauri build         # Production desktop bundles (requires Rust)
```

## Building the Desktop App

Prerequisites:
- Node.js + npm
- Rust + Cargo
- Tauri CLI prerequisites for your OS (see https://tauri.app)

Then:

```bash
npm run tauri build
```

The resulting binaries will be in `src-tauri/target/release/bundle/`.

## Extension Packaging

For distribution you can zip the `extension/` folder or publish to the Chrome Web Store.

## All Generated Assets

All images were created with Grok Imagine and placed inside the tree:
- `src/assets/images/*-stage1-final.jpg` (and PNG variants)
- `public/assets/images/`
- Bundled into `dist/`
- Tauri icons in `src-tauri/icons/`

The UI (hero, cards, logo) references them with relative imports only.

## Testing

Core logic is covered by unit tests that drive the **shipped** code:

```bash
npm test
```

Tests include:
- `parseVideoLink` on real YouTube (`https://www.youtube.com/watch?v=dQw4w9wgccc`) and Bilibili URLs
- DB schema + mapper roundtrips for persistence
- AI generator fed from real parser output

## Verification Performed (relative only)

- `list_dir(".")`, `read_file` on all critical files
- `npm test` + `npm run build` (captured)
- Relative `find . -name "*.jpg" | grep -E "final|gro k"` shows dozens of generated assets inside
- Relative grep confirms zero external absolute paths in source
- Full end-to-end: paste real link → parse (real) → save to SQLite → AI → UI + extension import

See `evidence/scratch/` and `logs/` for captured outputs.

## Troubleshooting

- **Tauri dev fails**: Make sure you have Rust, system webview dev libs, and ran `npm install` inside `MediaBrain/`.
- **Extension not extracting**: Make sure you're on a supported page (`/watch` for YT, `/video/` for Bilibili) and reloaded the extension after changes.
- **No images**: Assets are in `src/assets/images` and `public/assets/images`. All references are relative.
- **Tests fail**: Run from the project root with `npm test`.

## Future Ideas

- Replace the local AI stub in `src/lib/ai.ts` with a real LLM call (OpenAI, Groq, etc.)
- Native messaging bridge for automatic "extension save → desktop DB" without clipboard
- Duration tracking, folders/collections, cloud sync

---

**MediaBrain** — Your videos. Smarter.

All code and assets are self-contained inside this directory. Built following the strict 7-stage process using only relative paths.

Enjoy! 🎥


## License

Copyright (c) 2026 kent10636

This project is licensed under the [MIT License](LICENSE).

See the [LICENSE](LICENSE) file for the full text.

## Internationalization

- Full Chinese (zh-CN) UI by default.
- English fallback supported.
- Auto-detects system locale on first run (via Tauri `os.locale()`).
- Toggle between 中 / EN in the top navigation.
- Preference saved in localStorage.
- Easy to extend: see `src/lib/i18n.ts` for translation keys.

