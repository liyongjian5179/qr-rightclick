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

    // 目标码定位：优先用右键图片元素的真实位置（info.srcUrl 定位 img，
    // getBoundingClientRect 取视口坐标，无任何换算误差）；
    // 非图片元素时回退 info.x/y × devicePixelRatio
    let px, py;
    const [pos] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (srcUrl, x, y) => {
        if (srcUrl) {
          const imgs = [...document.images];
          const img = imgs.find((el) => el.src === srcUrl || el.currentSrc === srcUrl);
          if (img) {
            const r = img.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            // 中心点：视口 CSS 坐标 × DPR = 截图像素坐标
            return { x: (r.left + r.width / 2) * dpr, y: (r.top + r.height / 2) * dpr };
          }
        }
        const dpr = window.devicePixelRatio || 1;
        return { x: x * dpr, y: y * dpr };
      },
      args: [info.srcUrl, info.x, info.y]
    });
    px = pos?.result?.x || 0;
    py = pos?.result?.y || 0;

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

  // 多尺度解码：小码（渲染尺寸小/模块密）在缩小的图上反而更易识别，
  // 单一尺度漏检时按 0.75 / 0.55 逐级重试
  let qr = jsQR(idata.data, w, h);
  if (!qr) {
    for (const f of [0.75, 0.55]) {
      const sw = Math.round(w * f), sh = Math.round(h * f);
      const sc = new OffscreenCanvas(sw, sh);
      const sctx = sc.getContext("2d");
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(bmp, 0, 0, sw, sh);
      const sd = sctx.getImageData(0, 0, sw, sh);
      qr = jsQR(sd.data, sw, sh);
      if (qr) {
        // location 坐标除以 f 回到主尺度坐标系
        for (const k of ["topLeftCorner", "topRightCorner", "bottomLeftCorner", "bottomRightCorner"]) {
          qr.location[k].x /= f;
          qr.location[k].y /= f;
        }
        break;
      }
    }
  }
  if (!qr) return { ok: false, msg: "未识别到二维码（请确保二维码完整可见）" };

  // 多码场景：收集屏幕上所有码（遮罩重扫逐个剔除，上限 5 个），
  // 再从中选离右键点最近的——不依赖首轮坐标的精确性
  const found = [qr];
  {
    let cur = qr;
    for (let i = 0; i < 4; i++) {
      // jsQR 的 location 四角是内部估计值，比实际码边界小，
      // 遮罩需按码边长的 15% 外扩才能完全盖住（pad 小了残缺定位环仍可解）
      const side = Math.max(
        Math.abs(cur.location.topRightCorner.x - cur.location.topLeftCorner.x),
        Math.abs(cur.location.bottomLeftCorner.y - cur.location.topLeftCorner.y)
      );
      maskRegion(idata, cur.location, Math.max(8, Math.round(side * 0.15)));
      const next = jsQR(idata.data, w, h);
      if (!next) break; // 没有别的码了
      found.push(next);
      cur = next;
    }
  }
  // 右键坐标无效（0,0 兜底）或只有一个码：取第一个
  if (found.length === 1 || (cx <= 0 && cy <= 0)) {
    return { ok: true, data: found[0].data.trim() };
  }
  // 包含优先：右键点落在码的边界框内 → 直接确定目标
  for (const c of found) {
    const box = bbox(c.location);
    // 边界框按 15% 放宽（jsQR location 偏小，实际码更大）
    const bw = (box.maxX - box.minX) * 0.15, bh = (box.maxY - box.minY) * 0.15;
    if (cx >= box.minX - bw && cx <= box.maxX + bw &&
        cy >= box.minY - bh && cy <= box.maxY + bh) {
      return { ok: true, data: c.data.trim() };
    }
  }
  // 兜底：距离最近
  let best = found[0], bestDist = Infinity;
  for (const c of found) {
    const d = distTo(c.location, cx, cy);
    if (d < bestDist) { best = c; bestDist = d; }
  }
  return { ok: true, data: best.data.trim() };
}

// 码的边界框
function bbox(loc) {
  const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
  const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
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
