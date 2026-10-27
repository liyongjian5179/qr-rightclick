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
    let res = null;
    // 1) 右键的是图片：直接取图片本身解码，结果就是这张图里的码，不受旁边其他码影响
    if (info.srcUrl) res = await decodeImageUrl(info.srcUrl);

    // 2) 不是图片（canvas / 背景图等）或图片取不到：截屏，按右键位置裁剪解码
    if (!res) {
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      // 右键位置由 content.js 记录（info 不含坐标）；扩展装好前就打开的页面取不到，为 null
      const got = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__qrCtx || null
      }).catch(() => null);
      const ctx = got && got[0] && got[0].result;
      console.log("[qr] 截屏解码，右键位置:", ctx);
      res = await decodeInSw(dataUrl, ctx);
    }

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

// 下载图片本身解码（host_permissions 允许 SW 跨域取图，不受页面 CORS 限制）
// 取不到或解不出返回 null，交给截屏方案
async function decodeImageUrl(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const bmp = await createImageBitmap(await resp.blob());
    // 四周补白边：贴边裁切、没有静区的码图 jsQR 识别不了
    const qr = decodeRegion(bmp, 0, 0, bmp.width, bmp.height, 0.1);
    console.log("[qr] 图片直取解码:", url, qr ? "成功" : "未识别");
    return qr ? { ok: true, data: qr.data.trim() } : null;
  } catch (e) {
    console.warn("[qr] 图片直取失败，改用截屏:", url, e);
    return null;
  }
}

// 全程在 SW 内解码：importScripts 加载的 jsQR 只在 SW 作用域可见
async function decodeInSw(dataUrl, ctx) {
  const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());

  if (ctx) {
    // 截图像素 / 视口 CSS 像素，DPR 和页面缩放都已包含在内
    const k = bmp.width / ctx.vw;
    // 1) 只解右键位置附近：图像元素用其边界（外扩 8%），否则取点击点周围 480px 方块
    const r = ctx.rect
      ? pad(ctx.rect, 0.08)
      : { x: ctx.x - 240, y: ctx.y - 240, w: 480, h: 480 };
    const qr = decodeRegion(bmp, r.x * k, r.y * k, r.w * k, r.h * k);
    if (qr) return { ok: true, data: qr.data.trim() };
  }

  // 2) 回退：全屏解码，多码时取离右键点最近的
  const found = collectAll(bmp);
  if (!found.length) return { ok: false, msg: "未识别到二维码（请确保二维码完整可见）" };
  if (!ctx) {
    // 不知道右键位置时不能随便挑一个，多码直接报错
    if (found.length > 1) return { ok: false, msg: "页面上有多个二维码，无法判断你右键的是哪个，请刷新页面后重试" };
    return { ok: true, data: found[0].code.data.trim() };
  }
  const k = bmp.width / ctx.vw;
  let best = found[0], bestDist = Infinity;
  for (const f of found) {
    const d = distTo(f.code.location, (ctx.x * k) * f.s, (ctx.y * k) * f.s);
    if (d < bestDist) { best = f; bestDist = d; }
  }
  return { ok: true, data: best.code.data.trim() };
}

function pad(r, ratio) {
  const dx = r.w * ratio, dy = r.h * ratio;
  return { x: r.x - dx, y: r.y - dy, w: r.w + dx * 2, h: r.h + dy * 2 };
}

// 解码图像中的一块区域；多尺度重试（小而密的码缩小后反而更易识别）
// margin：四周补白边的比例（相对区域长边）
function decodeRegion(bmp, x, y, w, h, margin = 0) {
  const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(bmp.width, Math.ceil(x + w)), y1 = Math.min(bmp.height, Math.ceil(y + h));
  const rw = x1 - x0, rh = y1 - y0;
  if (rw < 20 || rh < 20) return null;
  const base = Math.min(1, 1200 / Math.max(rw, rh)); // 过大区域先缩小控制耗时
  for (const f of [1, 0.7, 0.5]) {
    const s = base * f;
    const cw = Math.max(1, Math.round(rw * s)), ch = Math.max(1, Math.round(rh * s));
    const m = Math.round(Math.max(cw, ch) * margin);
    const c = new OffscreenCanvas(cw + m * 2, ch + m * 2);
    const cctx = c.getContext("2d");
    // 先铺白底：透明背景的 PNG 码图，透明像素会被 jsQR 当成黑色
    cctx.fillStyle = "#fff";
    cctx.fillRect(0, 0, c.width, c.height);
    cctx.drawImage(bmp, x0, y0, rw, rh, m, m, cw, ch);
    const qr = jsQR(cctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
    if (qr) return qr;
  }
  return null;
}

// 全屏收集所有码：找到一个就涂白遮掉再重扫（上限 5 个）
// 返回 { code, s }，s 为解码画布相对截图的缩放比，用于换算右键坐标
function collectAll(bmp) {
  const found = [];
  for (const f of [1, 0.7, 0.5]) {
    const s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height)) * f;
    const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
    const c = new OffscreenCanvas(w, h);
    const cctx = c.getContext("2d");
    cctx.drawImage(bmp, 0, 0, w, h);
    const idata = cctx.getImageData(0, 0, w, h);
    let qr = jsQR(idata.data, w, h);
    while (qr && found.length < 5) {
      found.push({ code: qr, s });
      // jsQR 的 location 是内部估计值，比实际码边界小，需按边长 15% 外扩才能盖住
      const b = bbox(qr.location);
      maskRegion(idata, b, Math.max(8, Math.round(Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.15)));
      qr = jsQR(idata.data, w, h);
    }
    if (found.length) return found;
  }
  return found;
}

function bbox(loc) {
  const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
  const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

// 右键点到码边界框的距离（在框内为 0）
function distTo(loc, cx, cy) {
  const b = bbox(loc);
  const dx = Math.max(b.minX - cx, 0, cx - b.maxX);
  const dy = Math.max(b.minY - cy, 0, cy - b.maxY);
  return Math.sqrt(dx * dx + dy * dy);
}

// 把边界框区域涂白（ImageData 原地修改）
function maskRegion(idata, b, p) {
  const x0 = Math.max(0, Math.floor(b.minX - p)), x1 = Math.min(idata.width - 1, Math.ceil(b.maxX + p));
  const y0 = Math.max(0, Math.floor(b.minY - p)), y1 = Math.min(idata.height - 1, Math.ceil(b.maxY + p));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * idata.width + x) * 4;
      idata.data[i] = idata.data[i + 1] = idata.data[i + 2] = 255;
    }
  }
}

// SW 环境没有 alert，把提示注入到页面里弹
function notify(tabId, msg) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (m) => alert(m),
    args: [msg]
  }).catch(() => {}); // chrome:// 等特殊页面注入失败时静默，错误已打在 SW 控制台
}
