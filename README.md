# ChatGPT ThreadMap

> Turn long ChatGPT conversations into a searchable map.

![ChatGPT ThreadMap demo](assets/demo.gif)

ChatGPT ThreadMap is a lightweight browser extension for navigating long conversations on `chatgpt.com`. It indexes your prompts in real time, shows where you are, and jumps directly to the selected message—without sending or storing conversation data.

**中文简介：** 将 ChatGPT 长对话变成可搜索的提问地图，实时同步当前位置，并快速定位到任意一条用户消息。

## Features

- **Live conversation map** — new prompts appear automatically.
- **Accurate navigation** — targets the visible user-message bubble instead of an unstable wrapper.
- **Current-position tracking** — the active entry follows your reading position.
- **Instant filtering** — find a prompt by typing part of its text.
- **Unobtrusive interface** — a compact floating button keeps ChatGPT's sidebars untouched.
- **Keyboard access** — press `Alt + J` to open or close the map.
- **Lightweight and private** — no backend, analytics, storage permission, or network permission.

## Install

### Chrome / Edge (unpacked)

1. Download this repository and unzip it.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the repository folder.
5. Refresh any open `chatgpt.com` tab.

When updating from another conversation-navigation extension, disable the old extension first to avoid duplicate controls.

## Usage

1. Open a conversation on `chatgpt.com`.
2. Select the ThreadMap button near the lower-right corner.
3. Search or select any prompt to jump to it.
4. Continue scrolling—the active entry updates with your position.

## Project structure

```text
chatgpt-threadmap/
├── assets/                 icons and demo
├── scripts/                reproducible demo generator
├── src/content/
│   ├── navigator.js        indexing, tracking and navigation
│   └── navigator.css       extension interface
├── tests/                  browser fixture and smoke test
└── manifest.json           Manifest V3 configuration
```

## Development

The extension has no runtime dependencies. The optional development dependencies are only used for browser checks and regenerating the demo.

```bash
npm install
npm test
npm run demo
```

Set `PLAYWRIGHT_CHROME_EXECUTABLE` if Playwright should use an existing Chrome installation.

## Privacy

ThreadMap reads message elements only inside the current ChatGPT page to build the local map. It does not transmit, persist, or analyze your conversations outside that tab. The manifest requests no optional permissions.

## Compatibility

- Manifest V3
- Google Chrome and Microsoft Edge
- `https://chatgpt.com/*`

ChatGPT's page structure changes over time. If indexing or navigation stops working, please open an issue with the browser version and a sanitized DOM sample—never include private conversation text.

## License

[MIT](LICENSE)
