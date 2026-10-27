// 记录右键位置：contextMenus.onClicked 的 info 里没有点击坐标，只能在页面里取
document.addEventListener("contextmenu", (e) => {
  let el = e.composedPath()[0], rect = null;
  // 向上找最近的图像类元素，用它的边界作为识别区域
  for (let i = 0; el && el.tagName && i < 4; i++, el = el.parentElement) {
    if (/^(img|canvas|svg|video|picture)$/i.test(el.tagName) ||
        getComputedStyle(el).backgroundImage.startsWith("url(")) {
      const r = el.getBoundingClientRect();
      if (r.width >= 40 && r.height >= 40) rect = { x: r.left, y: r.top, w: r.width, h: r.height };
      break;
    }
  }
  window.__qrCtx = { x: e.clientX, y: e.clientY, vw: window.innerWidth, rect };
}, true);
