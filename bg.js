importScripts('jsQR.min.js');

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "scan_qr_open",
    title: "识别二维码并打开链接",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    // 截取当前可见页面解码（同类插件通用做法）：
    // 不访问页面元素，天然绕开跨域防盗图 / Shadow DOM / CSS 背景图等所有限制
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const res = await decodeInSw(dataUrl);

    if (!res.ok) {
      notify(tab.id, res.msg);
      return;
    }
    const txt = res.data;
    if (/^https?:\/\//.test(txt)) {
      chrome.tabs.create({ url: txt });
    } else {
      // SW 无法访问 alert/clipboard，注入页面执行复制与提示
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => {
          navigator.clipboard.writeText(text).then(
            () => alert(`内容已复制：${text}`),
            () => alert(`识别结果：${text}`)
          );
        },
        args: [txt]
      });
    }
  } catch (e) {
    console.error(e);
    notify(tab.id, `识别失败：${e && e.message ? e.message : e}`);
  }
});

// 全程在 SW 内解码：importScripts 加载的 jsQR 只在 SW 作用域可见
async function decodeInSw(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const bmp = await createImageBitmap(blob);

  // 截图是设备像素（retina 为 2x），过大时等比缩小控制解码耗时
  const MAX = 2400;
  const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.drawImage(bmp, 0, 0, w, h);
  const idata = ctx.getImageData(0, 0, w, h);
  const qr = jsQR(idata.data, w, h);
  if (!qr) return { ok: false, msg: "未识别到二维码（请确保二维码完整可见）" };
  return { ok: true, data: qr.data.trim() };
}

// SW 环境没有 alert，把提示注入到页面里弹
function notify(tabId, msg) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (m) => alert(m),
    args: [msg]
  }).catch(() => {}); // chrome:// 等特殊页面注入失败时静默，错误已打在 SW 控制台
}
