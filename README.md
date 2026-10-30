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
| 🎯 多码精准识别 | 页面上多个二维码挨在一起时，只识别你右键的那一个 |
| 🔒 纯本地解码 | jsQR 本地运行，不上传、无埋点、无多余界面 |

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

两条解码路径，按顺序尝试：

```
右键图片 ──→ 扩展后台取图片本身 ──→ jsQR 解码 ──┐
   │ 不是图片 / 取图失败                         ├─→ 链接新开标签 / 文本复制
   └──→ captureVisibleTab 截屏 ──→ 只解码右键处 ──┘
```

1. **图片直取**：右键的是 `<img>` 时，扩展后台直接下载这张图解码，结果只来自被点的这张图，不受旁边其他码影响。后台请求不受页面 CORS 限制，防盗链图片也能取到。
2. **截屏兜底**：Canvas、CSS 背景图、Shadow DOM 里的码没有图片地址，改为截取可见页面，按 `content.js` 记录的右键位置裁剪后解码。

## ⚠️ 限制 & 已知问题

1. 非图片类二维码（Canvas / 背景图）走截屏，需在**可见区域内**完整显示
2. 安装或更新扩展前就已打开的页面，需**刷新一次**才能记录右键位置；未刷新时多码页面会提示重试
3. 仅支持 Chromium 内核浏览器（Chrome / Edge）

## 🔒 隐私

- 解码全程在本地 Service Worker 内完成，**不上传任何图片或识别结果**
- 唯一的网络请求：右键图片时重新获取这张图片本身（通常直接命中浏览器缓存），不会发往其他地址
- 不收集、不存储任何页面内容；无统计、无埋点
- `<all_urls>` 权限仅用于截屏和取图解码

## ☕ 请作者喝杯咖啡

如果这个扩展帮到了你，欢迎请作者喝杯咖啡 ☕

**海外用户**：[![Ko-fi](https://img.shields.io/badge/Ko--fi-Buy%20me%20a%20coffee-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/liyongjian5179)

**国内用户**：微信 / 支付宝扫码

**试试用这个扩展扫一扫下面的收款码** —— 毕竟它就是干这个的 😄

<div align="center">

| 微信 | 支付宝 |
|:---:|:---:|
| <img src="donate/wechat.png" width="220" alt="微信收款码"> | <img src="donate/alipay.png" width="220" alt="支付宝收款码"> |

</div>

## 📁 项目结构

```
qr-rightclick/
├─ manifest.json      # MV3 清单
├─ bg.js              # Service Worker：取图 / 截屏、解码、打开链接
├─ content.js         # 记录右键位置（截屏兜底时定位用）
├─ popup.*            # 工具栏弹窗：使用说明 + 赞赏
├─ donate/            # 收款码（弹窗与 README 共用）
├─ jsQR.min.js        # 二维码解码库（MIT）
├─ _locales/          # 中英文扩展名与描述
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
