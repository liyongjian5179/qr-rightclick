# 极简右键扫码打开（Chrome 扩展）
一个极简 Manifest V3 Chrome 本地扩展，原生右键菜单识别网页二维码，链接直接新开标签，支持普通图片二维码与 Canvas 弹窗二维码，**纯本地离线解码，不上传图片**。

## ✨ 功能
- 原生右键菜单选项：`识别二维码并打开链接`
- 识别为 http/https 链接：自动新开标签访问
- 识别为普通文本：自动复制到剪贴板并弹窗提示
- 支持 `<img>` 图片二维码、Canvas 绘制的登录弹窗二维码
- 无广告、无埋点、无多余界面

## 📁 文件结构

qr-rightclick/
├─ manifest.json
├─ bg.js
├─ jsQR.min.js
└─ README.md

## 🚀 安装步骤
1. 本地新建文件夹 `qr-rightclick`
2. 在文件夹内依次创建下面 3 个文件并填入内容
   - `manifest.json`
   - `bg.js`
   - `jsQR.min.js`（内容复制自：https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js）
   > 注意：复制 jsQR 的文本内容，不要直接保存网页
3. Chrome 打开扩展管理页：`chrome://extensions/`
4. 右上角开启 **开发者模式**
5. 点击【加载已解压的扩展程序】，选中 `qr-rightclick` 文件夹
6. 刷新网页，右键菜单即可出现新选项

## 📖 使用方式
1. 在**可见区域内**的二维码上右键（截图方案需要二维码完整显示在屏幕上）
2. 选择：`识别二维码并打开链接`
3. 识别成功：
   - URL：自动新开标签打开链接
   - 文本：复制到剪贴板 + 弹窗展示内容
4. 识别失败弹出具体原因提示

## 🛠 技术方案
采用**截屏解码**（同类插件通用做法）：`chrome.tabs.captureVisibleTab` 截取当前可见页面，在 Service Worker 内用 jsQR 解码。不访问页面 DOM 元素，天然绕开以下所有限制：
- 跨域防盗图图片（CORS）
- Shadow DOM 内部 Canvas
- CSS 背景图二维码
- Canvas 弹窗二维码

## ⚠️ 限制 & 已知问题
1. 二维码必须在**可见区域内**（截屏方案无法识别视口外的二维码）
2. 仅支持 Chromium 内核浏览器（Chrome / Edge），Safari / Firefox 不兼容
3. 文件名区分大小写，所有文件放在同一层级，不要嵌套目录

## 🧩 依赖
- jsQR 1.4.0：前端本地二维码解码库，MIT 开源协议

## 📜 License
MIT，仅限自用，仅可用于你拥有访问授权的页面，禁止用于违规、破解相关场景。
