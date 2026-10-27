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
    // 右键坐标（视口 CSS 像素）× 设备像素比 = 截图像素坐标，用于多码时就近选择
    const [dpi] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.devicePixelRatio || 1
    });
    const px = info.x * (dpi?.result || 1);
    const py = info.y * (dpi?.result || 1);
    const res = await decodeInSw(dataUrl, px, py);

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
// clickX/clickY：右键位置在截图中的像素坐标，用于多码场景就近选择
async function decodeInSw(dataUrl, clickX, clickY) {
  const blob = await (await fetch(dataUrl)).blob();
  const bmp = await createImageBitmap(blob);

  // 截图是设备像素（retina 为 2x），过大时等比缩小控制解码耗时
  const MAX = 2400;
  const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  // 右键坐标随截图同比例缩放
  const cx = (clickX || 0) * scale;
  const cy = (clickY || 0) * scale;

  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.drawImage(bmp, 0, 0, w, h);
  const idata = ctx.getImageData(0, 0, w, h);
  const qr = jsQR(idata.data, w, h);
  if (!qr) return { ok: false, msg: "未识别到二维码（请确保二维码完整可见）" };

  // 多码场景：jsQR 只返回找到的第一个码，若它离右键点较远，
  // 对其周边区域遮罩后重扫，取离右键点最近的码
  let best = qr;
  let bestDist = distTo(qr.location, cx, cy);
  let attempt = 0;
  while (attempt < 4) {
    if (bestDist < 40) break; // 已经足够近（模块级误差）
    // 注意：jsQR 的 location 四角是内部估计值，比实际码边界小，
    // 遮罩需按码边长的 15% 外扩才能完全盖住（pad 小了残缺定位环仍可解）
    const side = Math.max(
      Math.abs(best.location.topRightCorner.x - best.location.topLeftCorner.x),
      Math.abs(best.location.bottomLeftCorner.y - best.location.topLeftCorner.y)
    );
    maskRegion(idata, best.location, Math.max(8, Math.round(side * 0.15)));
    const next = jsQR(idata.data, w, h);
    if (!next) break; // 没有别的码了
    const d = distTo(next.location, cx, cy);
    if (d < bestDist) {
      best = next;
      bestDist = d;
    } else {
      break; // 新找到的码更远，保留当前结果
    }
    attempt++;
  }
  return { ok: true, data: best.data.trim() };
}

// 右键点到码 bounding box 的距离（在框内为 0）
function distTo(loc, cx, cy) {
  const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
  const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const dx = Math.max(minX - cx, 0, cx - maxX);
  const dy = Math.max(minY - cy, 0, cy - maxY);
  return Math.sqrt(dx * dx + dy * dy);
}

// 把某个码的区域涂白遮罩（ImageData 原地修改）
function maskRegion(idata, loc, pad) {
  const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
  const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
  const minX = Math.max(0, Math.floor(Math.min(...xs) - pad));
  const maxX = Math.min(idata.width - 1, Math.ceil(Math.max(...xs) + pad));
  const minY = Math.max(0, Math.floor(Math.min(...ys) - pad));
  const maxY = Math.min(idata.height - 1, Math.ceil(Math.max(...ys) + pad));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = (y * idata.width + x) * 4;
      idata.data[i] = idata.data[i + 1] = idata.data[i + 2] = 255; // 涂白（码背景色）
    }
  }
  return idata;
}

// SW 环境没有 alert，把提示注入到页面里弹
function notify(tabId, msg) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (m) => alert(m),
    args: [msg]
  }).catch(() => {}); // chrome:// 等特殊页面注入失败时静默，错误已打在 SW 控制台
}
