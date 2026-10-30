// 海外赞赏链接；留空时英文界面不显示赞赏区
const DONATE_URL = "https://ko-fi.com/liyongjian5179";
const LANGS = ["zh_CN", "en"];

// chrome.i18n 只能跟随浏览器语言，手动切换时自己读语言包
let msgs = {};
const t = (k) => (msgs[k] && msgs[k].message) || chrome.i18n.getMessage(k);

// 默认跟随 Chrome 实际选用的语言包；用户切换过则用上次的选择
function initialLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (LANGS.includes(saved)) return saved;
  } catch {}
  return chrome.i18n.getMessage("donateRegion") === "cn" ? "zh_CN" : "en";
}

async function render(lang) {
  try {
    msgs = await (await fetch(`_locales/${lang}/messages.json`)).json();
  } catch {
    msgs = {};
  }
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
  }
  document.getElementById("lang").textContent = lang === "en" ? "中文" : "EN";

  // 赞赏方式随语言切换：中文显示微信/支付宝，英文显示 Ko-fi
  const cn = t("donateRegion") === "cn";
  document.getElementById("donate-cn").hidden = !cn;
  const a = document.getElementById("donate-intl");
  a.hidden = cn || !DONATE_URL;
  if (DONATE_URL) a.href = DONATE_URL;
  document.querySelector(".donate").hidden = !cn && !DONATE_URL;
}

let lang = initialLang();
document.getElementById("ver").textContent = "v" + chrome.runtime.getManifest().version;
document.getElementById("lang").addEventListener("click", () => {
  lang = lang === "en" ? "zh_CN" : "en";
  try {
    localStorage.setItem("lang", lang);
  } catch {}
  render(lang);
});
render(lang);

// 在弹窗里右键收款码时没有网页可注入，识别结果由 bg.js 发到这里显示
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.type !== "qr-result") return;
  const el = document.getElementById("result");
  el.textContent = msg.text;
  el.hidden = false;
  if (msg.copy) {
    navigator.clipboard.writeText(msg.copy).catch(() => {
      if (msg.fail) el.textContent = msg.fail;
    });
  }
});
