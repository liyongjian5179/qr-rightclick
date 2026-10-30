<div align="center">

# 🖱️ QR Right-Click

**Right-click any QR code to open it**

English | [简体中文](README.zh-CN.md)

[![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate)
[![jsQR](https://img.shields.io/badge/Decoder-jsQR%201.4.0-000000?style=flat-square)](https://github.com/cozmo/jsQR)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20local-blueviolet?style=flat-square)](#-privacy)

Scan QR codes on any web page from the native right-click menu. Links open in a new tab; text is copied to your clipboard.<br>
Decoding runs locally. **No images are uploaded.**

</div>

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🖱️ Native context menu | Right-click a QR code → `Scan QR code & open link` |
| 🔗 Smart handling | http/https links open in a new tab; other text is copied to the clipboard |
| 🧩 Works everywhere | Image QR codes, canvas pop-ups, CSS background images, Shadow DOM |
| 🎯 Picks the right code | When several QR codes sit side by side, only the one you right-clicked is decoded |
| 🔒 Local decoding | jsQR runs on your machine. No uploads, no tracking, no clutter |

## 🚀 Install (about 30 seconds)

```bash
git clone https://github.com/liyongjian5179/qr-rightclick.git
```

1. Open `chrome://extensions/` in Chrome
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and select the `qr-rightclick` folder
4. Done ✅ Refresh any open page to start using it

> You can also download the ZIP from [Releases](https://github.com/liyongjian5179/qr-rightclick/releases), unzip it, and load it the same way.

## 📖 Usage

```
 Right-click a visible QR code
              │
              ▼
  Scan QR code & open link
              │
        ┌─────┴─────┐
        ▼           ▼
      Link        Text
        │           │
  Open new tab   Copy + notify
```

## 🛠 How it works

Two decoding paths, tried in order:

```
Right-click image ──→ fetch the image itself ──→ jsQR decode ──┐
   │ not an image / fetch failed                               ├─→ open link / copy text
   └──→ captureVisibleTab screenshot ──→ decode the clicked area ──┘
```

1. **Direct image fetch**: when you right-click an `<img>`, the extension's background worker downloads that image and decodes it. The result comes only from the image you clicked, so nearby QR codes can't interfere. The background request isn't subject to the page's CORS rules, so hotlink-protected images work too.
2. **Screenshot fallback**: QR codes drawn on a canvas, set as a CSS background, or inside Shadow DOM have no image URL. For these, the extension captures the visible page and decodes only the area around your right-click, which `content.js` records.

## ⚠️ Limitations

1. Non-image QR codes (canvas / background images) use the screenshot path and must be fully visible on screen
2. Pages opened before the extension was installed or updated need **one refresh** so the click position can be recorded. Without it, pages with several QR codes will ask you to retry
3. Chromium-based browsers only (Chrome / Edge)

## 🔒 Privacy

- All decoding happens locally in the service worker. **No images or results are uploaded**
- The only network request: when you right-click an image, the extension fetches that same image again (usually served from the browser cache). Nothing is sent anywhere else
- No page content is collected or stored. No analytics, no tracking
- The `<all_urls>` permission is used only to take screenshots and fetch images for decoding

## ☕ Buy me a coffee

If this extension saves you time, consider buying me a coffee ☕

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Buy%20me%20a%20coffee-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/liyongjian5179)

Users in China can tip via WeChat Pay or Alipay. See the [Chinese README](README.zh-CN.md#-请作者喝杯咖啡).

## 📁 Project structure

```
qr-rightclick/
├─ manifest.json      # MV3 manifest
├─ bg.js              # Service worker: fetch / screenshot, decode, open link
├─ content.js         # Records the right-click position (for the screenshot fallback)
├─ popup.*            # Toolbar popup: usage + support links
├─ donate/            # Payment QR codes (shared by the popup and README)
├─ jsQR.min.js        # QR decoding library (MIT)
├─ _locales/          # English and Chinese strings
└─ icons/             # Extension icons (4 sizes)
```

## 🧩 Dependencies

- [jsQR 1.4.0](https://github.com/cozmo/jsQR): pure JavaScript QR code decoder, MIT license

## 📜 License

MIT. Use it only on pages you are authorized to access. Do not use it for illegal purposes or to bypass security measures.

---

<div align="center">

**If you find this extension useful, a ⭐ Star is appreciated**

</div>
