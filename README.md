<div align="center">

# 🖱️ 极简右键扫码

**右键一下，二维码直接打开**

[![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate)
[![jsQR](https://img.shields.io/badge/解码-jsQR%201.4.0-000000?style=flat-square)](https://github.com/cozmo/jsQR)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Privacy](https://img.shields.io/badge/隐私-纯本地离线-blueviolet?style=flat-square)](#-隐私)

原生右键菜单识别网页二维码 —— 是链接就新开标签，是文本就复制剪贴板。<br>
纯本地解码，**不上传任何图片**。

</div>

---

## ✨ 功能一览

| 能力 | 说明 |
|:---|:---|
| 🖱️ 原生右键菜单 | 任意二维码上右键 → `识别二维码并打开链接` |
| 🔗 智能分流 | http/https 链接自动新开标签；普通文本复制到剪贴板 |
| 🧩 全场景支持 | 图片二维码、Canvas 弹窗、CSS 背景图、Shadow DOM 一网打尽 |
| 🔒 纯本地解码 | jsQR 本地运行，无网络请求、无埋点、无多余界面 |

## 🚀 安装（约 30 秒）

```bash
git clone https://github.com/liyongjian5179/qr-rightclick.git
```

1. Chrome 打开 `chrome://extensions/`
2. 右上角开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**，选中 `qr-rightclick` 文件夹
4. 完成 ✅ 刷新网页即可使用

> 也支持直接下载 ZIP 解压后加载，效果相同。

## 📖 使用方式

```
   在可见的二维码上右键
        │
        ▼
 识别二维码并打开链接
        │
   ┌────┴────┐
   ▼         ▼
 链接      文本
   │         │
新开标签   复制+提示
```

## 🛠 技术方案

采用**截屏解码**（同类插件通用做法）：

```
右键 → captureVisibleTab 截屏 → Service Worker 内 jsQR 解码 → 分流处理
```

不访问页面 DOM 元素，天然绕开传统方案的所有限制：

- ❌ 跨域防盗图图片（CORS）
- ❌ Shadow DOM 内部 Canvas
- ❌ CSS 背景图二维码
- ❌ Canvas 弹窗二维码

## ⚠️ 限制 & 已知问题

1. 二维码需在**可见区域内**（截屏方案无法识别视口外的内容）
2. 仅支持 Chromium 内核浏览器（Chrome / Edge）
3. 文件名区分大小写，所有文件保持在同一层级

## 🔒 隐私

- 解码全程在本地 Service Worker 内完成，**不发起任何网络请求**
- 不收集、不上传、不存储任何页面内容或图片
- 权限仅为截屏解码所需的最小集合

## 📁 项目结构

```
qr-rightclick/
├─ manifest.json      # MV3 清单
├─ bg.js              # Service Worker（全部逻辑 ~100 行）
├─ jsQR.min.js        # 二维码解码库（MIT）
└─ icons/             # 扩展图标（4 尺寸）
```

## 🧩 依赖

- [jsQR 1.4.0](https://github.com/cozmo/jsQR) — 纯前端二维码解码库，MIT 协议

## 📜 License

MIT — 仅可用于你拥有访问授权的页面，禁止用于违规、破解相关场景。

---

<div align="center">

**如果这个扩展帮到了你，欢迎点一个 ⭐ Star**

</div>
