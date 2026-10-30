# Privacy Policy — QR Right-Click

_Last updated: 2026-10-30_

QR Right-Click ("the extension") is a Chrome extension that decodes QR codes on web pages when you right-click them. This policy explains what the extension does with data.

## Summary

The extension does not collect, store, sell, or transmit any personal data. QR codes are decoded entirely on your device.

## What the extension accesses, and why

| Data | When | Purpose | Leaves your device? |
|---|---|---|---|
| Screenshot of the visible tab | Only after you choose **Scan QR code & open link** | Decode a QR code drawn on a canvas, set as a CSS background, or inside Shadow DOM | No. Decoded in memory and discarded |
| The image you right-clicked | Only after you choose **Scan QR code & open link** on an image | Decode the QR code in that image. The extension re-requests the image from its original address, usually served from the browser cache | No data is sent anywhere except the normal request back to the image's own server |
| Right-click position on the page | Each time you right-click (kept in the page's memory only) | Decode only the QR code under your cursor when several are on screen | No. Not stored or transmitted |
| Decoded QR content | After decoding | Open it in a new tab (links) or copy it to your clipboard (text) | No. Not stored or transmitted |
| Popup language preference | When you switch language in the popup | Remember your choice | No. Stored locally in the extension |

The extension does **not** read page text, form fields, passwords, cookies, browsing history, or any other page content.

## Permissions

- **`<all_urls>` (host permission)**: needed to capture the visible tab and fetch the right-clicked image on any site, so QR codes can be decoded wherever you find them.
- **`contextMenus`**: adds the **Scan QR code & open link** item to the right-click menu.
- **`scripting`**: shows the result on the page (copy the text and display a notice), and reads the right-click position recorded by the extension's own content script.

## Third parties

The extension contains no analytics, advertising, or tracking code, and makes no requests to any server operated by the developer.

The toolbar popup contains links to Ko-fi and GitHub, and shows WeChat Pay / Alipay QR codes. Nothing is loaded from these services until you click a link. If you do, their own privacy policies apply.

## Changes

If this policy changes, the updated version will be published at this address with a new date.

## Contact

Questions? Open an issue at https://github.com/liyongjian5179/qr-rightclick/issues

---

# 隐私政策 — 极简右键扫码打开

_最后更新：2026-10-30_

本扩展不收集、不存储、不出售、不传输任何个人数据。二维码完全在你的设备上解码。

- **截屏**：只在你点击「识别二维码并打开链接」后截取当前可见页面，用于识别 Canvas、CSS 背景图、Shadow DOM 中的二维码。截图只在内存中处理，用完即丢弃。
- **右键的图片**：只在你对图片使用本功能时，从图片原地址重新获取一次（通常直接命中浏览器缓存），不会发往其他地址。
- **右键位置**：每次右键时记录在页面内存中，用于多个二维码时判断你点的是哪个，不存储、不上传。
- **识别结果**：链接直接新开标签，文本复制到剪贴板，不存储、不上传。
- **弹窗语言设置**：保存在扩展本地。

本扩展不读取页面文字、表单、密码、Cookie 或浏览记录，不含任何统计、广告或追踪代码。弹窗中的 Ko-fi、GitHub 链接和微信/支付宝收款码，只有在你主动点击或扫码时才会访问对应服务。

如有疑问，请在 https://github.com/liyongjian5179/qr-rightclick/issues 提交 issue。
