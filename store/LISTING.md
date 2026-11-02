# Chrome Web Store 上架资料

提交时逐项复制粘贴。图片都在本目录，重新生成：`zsh store/src/render.sh`

> 商店页面没有独立的「更新说明」字段，变更历史写进「详细说明」结尾，每次发版手动加一行。

---

## 1. 商品详情 / Store listing

### 名称 Name
来自 `_locales`，不用填：英文 `QR Right-Click`，中文 `QR Right-Click · 右键扫码`

### 摘要 Summary（manifest description，132 字符内，自动读取）
- EN: Right-click any QR code on a web page to open its link or copy its text. Decoded locally on your device, nothing is uploaded.
- 中文：右键一下，二维码秒变链接。本地离线解码不上传，支持图片/Canvas/背景图二维码，链接直接新开标签。

### 详细说明 Description — English

```
Scan QR codes on any web page without reaching for your phone.

Right-click a QR code and choose "Scan QR code":
• Links open in a new tab right away
• Wi-Fi codes show the network name and password (password copied for you)
• Contact cards save as a .vcf file you can import
• WeChat / Alipay / app-only codes get a clear hint instead of a dead page
• Anything else (coupon codes, plain text) is copied to your clipboard
• Results appear as a small toast that fades away — no blocking pop-ups

WORKS ON ANY QR CODE
• Regular images, including hotlink-protected ones
• QR codes drawn on a canvas, such as login pop-ups
• CSS background images and Shadow DOM

PICKS THE RIGHT ONE
When several QR codes sit side by side, only the one you right-clicked is decoded.

PRIVATE BY DESIGN
• Decoding runs entirely on your device with the open-source jsQR library
• No images or results are uploaded
• No analytics, no ads, no accounts
• Open source: https://github.com/liyongjian5179/qr-rightclick

Available in English and Chinese, with a one-click language switch in the toolbar popup.

Like it? You can buy me a coffee from the toolbar popup, or at ko-fi.com/liyongjian5179. The extension is completely free.

Changelog
1.8 — Redesigned toolbar popup with a shorter how-to and a quick link to rate the extension; the right-click menu item is now simply "Scan QR code".
1.7 — Results now appear as a light toast instead of a blocking dialog; URLs without a scheme are filled in automatically; new Chinese display name.
1.5 — Wi-Fi codes show the network name and password; contact cards save as .vcf; WeChat / Alipay / official-account codes get a clear hint; email links open in your mail client.
1.4 — First public release: right-click any QR code to open its link or copy its text, with multi-code detection, English and Chinese UI, and a toolbar popup.
```

### 详细说明 Description — 中文

```
不用掏手机，直接识别网页上的二维码。

在二维码上右键，选择「识别二维码」：
• 链接直接新开标签打开
• Wi-Fi 码直接显示网络名和密码，密码自动复制
• 名片码保存为 .vcf 文件，可直接导入通讯录
• 微信 / 支付宝 / App 专用码给出明确提示，而不是打开一个空白页
• 其他内容（优惠码、普通文本）自动复制到剪贴板
• 识别结果以轻量提示条显示，几秒后自动消失，不再弹阻塞式对话框

支持各种二维码
• 普通图片，包括防盗链图片
• Canvas 绘制的二维码，比如登录弹窗
• CSS 背景图和 Shadow DOM 里的二维码

多个码也不会认错
页面上几个二维码挨在一起时，只识别你右键的那一个。

注重隐私
• 解码完全在本机完成，使用开源的 jsQR 库
• 不上传任何图片或识别结果
• 无统计、无广告、无需登录
• 开源：https://github.com/liyongjian5179/qr-rightclick

支持中英文，可在工具栏弹窗里一键切换语言。

觉得好用的话，可以在工具栏弹窗里请作者喝杯咖啡。扩展完全免费。海外用户可用 Ko-fi：ko-fi.com/liyongjian5179

更新记录
1.8 — 工具栏弹窗改版，使用说明更简洁，新增「去商店评分」入口；右键菜单文案精简为「识别二维码」。
1.7 — 识别结果改为轻量提示条，不再弹阻塞式对话框；没写协议的网址自动补全；中文名更新为「QR Right-Click · 右键扫码」。
1.5 — Wi-Fi 码显示网络名和密码，密码自动复制；名片码保存为 .vcf；微信 / 支付宝 / 公众号码给出明确提示；邮件链接交给系统邮件客户端。
1.4 — 首次上架：右键识别网页二维码，链接直接打开、文本复制，支持多码场景，中英文界面，工具栏弹窗。
```

### 类别 Category
`Productivity / 效率`（也可选 `Tools / 工具`）

### 语言 Language
English（主要），另外添加 中文（简体）

### 图片 Graphics
| 项目 | 文件 | 尺寸 |
|---|---|---|
| 商店图标 | `icons/icon128.png` | 128×128 |
| 屏幕截图（按此顺序上传） | `1-context-menu.png` `2-multiple-codes.png` `3-links-and-text.png` `4-privacy.png` `5-popup.png` | 1280×800 |
| 小型宣传图块（必填） | `promo-small-440x280.png` | 440×280 |
| 顶部宣传图块（选填） | `promo-marquee-1400x560.png` | 1400×560 |

### 其他字段
- 官方网址 / Homepage: `https://github.com/liyongjian5179/qr-rightclick`
- 支持网址 / Support: `https://github.com/liyongjian5179/qr-rightclick/issues`

---

## 2. 隐私权 / Privacy practices

### 单一用途 Single purpose
```
Decode a QR code that the user right-clicks on a web page, then open the link in a new tab or copy the text to the clipboard.
```

### 权限理由 Permission justification

**contextMenus**
```
Adds the "Scan QR code" item to the right-click menu. This is the only way the user starts a scan.
```

**scripting**
```
After a scan, injects a small function into the current tab to copy the decoded text to the clipboard and show a notice, because the service worker cannot access the clipboard or show alerts. It also reads the right-click position recorded by the extension's own content script. It never reads or modifies page content.
```

**Host permission (<all_urls>)**
```
QR codes can appear on any website, so the extension needs access to all sites to (1) capture the visible tab with chrome.tabs.captureVisibleTab when the user right-clicks a QR code drawn on a canvas or CSS background, and (2) fetch the right-clicked image so it can be decoded even when the site blocks cross-origin reads. Both happen only after the user chooses "Scan QR code". The screenshot and image are decoded locally in memory and discarded. Nothing is uploaded.
```

**Content script on all pages (content.js)**（如果有单独的说明栏）
```
content.js listens for the right-click event and records only the cursor position and the bounding box of the clicked image or canvas, so that when several QR codes are on screen, only the one under the cursor is decoded. It does not read text, forms, or any other page content, and the data never leaves the page.
```

### 远程代码 Remote code
选 **No, I am not using remote code**。所有脚本（包括 jsQR）都打包在扩展里。

### 数据使用 Data usage
所有数据类型都**不勾选**（个人身份信息、健康、财务、身份验证、通信、位置、网络历史、用户活动、网站内容都不收集）。

然后勾选三项声明：
- [x] I do not sell or transfer user data to third parties, outside of the approved use cases
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

> 关于「网站内容」：截图和图片只在本地内存解码、不保存不上传，按 Google 的定义不算“收集”。如果审核员追问，可以引用上面 host permission 的说明。

### 隐私权政策网址 Privacy policy URL
```
https://github.com/liyongjian5179/qr-rightclick/blob/main/PRIVACY.md
```

---

## 3. 分发 / Distribution
- 付款：免费 Free
- 公开范围：公开 Public
- 地区：所有地区 All regions

---

## 4. 提交包
上传 `dist/qr-rightclick-v<版本号>.zip`（不是 CRX）。打包命令见 README 或直接运行 `zsh store/pack.sh`。
