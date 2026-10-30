// 在页面里为每个 [data-qr] 元素生成真实可扫的二维码（qrcode.js），截图前设置 window.ready
window.addEventListener("load", () => {
  for (const el of document.querySelectorAll("[data-qr]")) {
    new QRCode(el, {
      text: el.dataset.qr,
      width: 400,
      height: 400,
      colorDark: "#223344",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  }
  document.title = "ready";
});

// 鼠标指针 SVG
const CURSOR = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 2l16 9.5-7 1.6-3.6 6.9z" fill="#fff" stroke="#223344" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
window.addEventListener("DOMContentLoaded", () => {
  for (const el of document.querySelectorAll(".cursor")) el.innerHTML = CURSOR;
});
