# ChatGPT ThreadMap

[English](README_EN.md) | 简体中文

> 将冗长的 ChatGPT 对话变成可搜索、可定位的会话地图。

![ChatGPT ThreadMap 使用演示](assets/demo.gif)

ChatGPT ThreadMap 是一个用于浏览 `chatgpt.com` 长对话的轻量级浏览器扩展。它会实时整理当前会话中的用户提问、同步阅读位置，并将你准确带到所选消息。所有处理都在当前页面本地完成。

## 功能

- **实时会话地图**：发送新提问后自动更新，无需手动刷新目录。
- **准确定位**：直接定位可见的用户消息气泡，避免跳到相邻消息。
- **当前位置同步**：滚动对话时，目录自动标记当前阅读位置。
- **快速筛选**：输入提问中的任意文字即可过滤目录。
- **低干扰界面**：入口位于右下角，不占用 ChatGPT 的左右侧栏。
- **键盘快捷键**：按 `Alt + J` 打开或关闭会话地图。
- **隐私友好**：没有后端、分析服务、存储权限或网络权限。

## 安装

### 推荐：安装 Release 精简包

1. 前往 [Releases](https://github.com/Relax-boy/chatgpt-threadmap/releases) 下载最新的 `ChatGPT-ThreadMap-*.zip`。
2. 解压下载的文件。
3. 在 Chrome 打开 `chrome://extensions`，或在 Edge 打开 `edge://extensions`。
4. 开启“开发者模式”。
5. 点击“加载已解压的扩展程序”，选择刚才解压的文件夹。
6. 刷新已经打开的 `chatgpt.com` 页面。

如果此前安装过其他聊天目录扩展，请先将其停用，避免页面出现重复入口。

## 使用方法

1. 在 `chatgpt.com` 打开一段对话。
2. 点击页面右下角的 ThreadMap 按钮。
3. 在列表中选择提问，或先输入关键词筛选。
4. 页面将跳转到对应的用户消息；继续滚动时，当前条目会自动同步。

## 精简安装包内容

Release 中的 ZIP 只包含浏览器运行扩展所必需的文件：

```text
manifest.json
assets/
├── icon-16.png
├── icon-32.png
├── icon-48.png
└── icon-128.png
src/content/
├── navigator.js
└── navigator.css
```

README、演示 GIF、测试和生成脚本只保留在源码仓库中，不会进入扩展安装包。

## 源码结构

```text
chatgpt-threadmap/
├── assets/                 图标与 README 演示 GIF
├── scripts/                演示素材生成脚本
├── src/content/            扩展运行代码
├── tests/                  浏览器夹具与冒烟测试
├── manifest.json           Manifest V3 配置
├── README.md               中文说明
└── README_EN.md            English documentation
```

## 开发与测试

扩展运行时没有第三方依赖。`package.json` 中的开发依赖仅用于浏览器测试和重新生成演示 GIF。
开发调试时，也可以直接在扩展管理页选择本仓库根目录进行“加载已解压的扩展程序”。

```bash
npm install
npm test
npm run demo
```

如需让 Playwright 使用本机 Chrome，可设置 `PLAYWRIGHT_CHROME_EXECUTABLE`。

## 隐私

ThreadMap 只读取当前 ChatGPT 标签页内的消息元素，用于生成本地会话地图。它不会上传、持久化或在页面之外分析你的聊天内容。扩展清单不申请可选权限。

## 兼容性

- Manifest V3
- Google Chrome、Microsoft Edge
- `https://chatgpt.com/*`

ChatGPT 的页面结构可能随时调整。如果目录或定位失效，请提交 Issue，并附上浏览器版本和经过脱敏的页面结构；请勿上传私人对话内容。

## 许可证

[MIT](LICENSE)
