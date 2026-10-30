// 素材渲染服务：/ 下是素材页面，/ext/ 下是仓库里的扩展文件（popup.html 注入 chrome.* 模拟）
const http = require("http"), fs = require("fs"), path = require("path");
const STORE = process.argv[2], REPO = process.argv[3], PORT = +process.argv[4];
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json" };

function stubFor(lang) {
  const m = JSON.parse(fs.readFileSync(path.join(REPO, `_locales/${lang}/messages.json`), "utf8"));
  const flat = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.message]));
  return `<script>
    try { localStorage.setItem("lang", ${JSON.stringify(lang)}); } catch {}
    window.chrome = { i18n: { getMessage: (k) => (${JSON.stringify(flat)})[k] || "" },
      runtime: { getManifest: () => ({ version: ${JSON.stringify(JSON.parse(fs.readFileSync(path.join(REPO, "manifest.json"), "utf8")).version)} }), onMessage: { addListener() {} } } };
  </script>`;
}

http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  let rel = decodeURIComponent(u.pathname), root = STORE;
  if (rel.startsWith("/ext/")) { root = REPO; rel = rel.slice(4); }
  if (rel === "/icon128.png") { root = REPO; rel = "/icons/icon128.png"; }
  const p = path.normalize(path.join(root, rel));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  let body = fs.readFileSync(p);
  if (root === REPO && p.endsWith("popup.html")) body = body.toString().replace("<head>", "<head>" + stubFor(u.searchParams.get("lang") || "en"));
  if (root === STORE && p.endsWith("shot5-popup.html")) body = body.toString().replace("POPUP_URL", "/ext/popup.html?lang=" + (u.searchParams.get("lang") || "en"));
  res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
  res.end(body);
}).listen(PORT, () => console.log("listening " + PORT));
