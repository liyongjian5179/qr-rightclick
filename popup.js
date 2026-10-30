// 海外赞赏链接（Creem 支付页），开通后填入；留空时英文界面不显示赞赏区
const CREEM_URL = "";

for (const el of document.querySelectorAll("[data-i18n]")) {
  el.textContent = chrome.i18n.getMessage(el.dataset.i18n);
}
document.getElementById("ver").textContent = "v" + chrome.runtime.getManifest().version;

// 按实际显示的语言包选择赞赏方式，保证文案语言与支付方式一致
if (chrome.i18n.getMessage("donateRegion") === "cn") {
  document.getElementById("donate-cn").hidden = false;
} else if (CREEM_URL) {
  const a = document.getElementById("donate-intl");
  a.href = CREEM_URL;
  a.hidden = false;
} else {
  document.querySelector(".donate").hidden = true;
}
