// Password-protected viewer for the portal reports.
// Serves <portal>/reports/*.md (rendered) and *.html. Nothing else in the repo is exposed.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { marked } = require('marked');

const PORT = process.env.PORT || 3000;
const USER = process.env.APP_USER;
const PASSWORD = process.env.APP_PASSWORD;
const ROOT = __dirname;
const SKIP_DIRS = new Set(['node_modules', 'templates', '.git', '.claude']);

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function authorized(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString();
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  return safeEqual(decoded.slice(0, i), USER) && safeEqual(decoded.slice(i + 1), PASSWORD);
}

function titleCase(s) {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function listPortals() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !SKIP_DIRS.has(d.name))
    .filter(d => fs.existsSync(path.join(ROOT, d.name, 'reports')))
    .map(d => d.name);
}

function listReports(portal) {
  return fs.readdirSync(path.join(ROOT, portal, 'reports'))
    .filter(f => /\.(md|html)$/i.test(f))
    .sort();
}

function page(title, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--line:#e7e5e4;--accent:#7b189f;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#1c1917;--fg:#f5f5f4;--muted:#a8a29e;--line:#44403c;--accent:#d8a4ef;--card:#292524}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}
header{border-bottom:1px solid var(--line);padding:14px 16px}
header a{color:var(--fg);text-decoration:none;font-weight:600}
main{max-width:960px;margin:0 auto;padding:24px 16px 64px}
a{color:var(--accent)}
h1,h2,h3{line-height:1.25}
table{border-collapse:collapse;width:100%;display:block;overflow-x:auto;margin:16px 0}
th,td{border:1px solid var(--line);padding:6px 10px;text-align:left;vertical-align:top}
th{background:var(--card)}
code,pre{font-family:ui-monospace,Consolas,monospace;font-size:14px}
pre{background:var(--card);border:1px solid var(--line);padding:12px;overflow-x:auto;border-radius:6px}
.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px 16px;margin:10px 0;text-decoration:none;color:var(--fg)}
.card:hover{border-color:var(--accent)}
.muted{color:var(--muted)}
</style></head>
<body><header><a href="/">HW Portals</a></header><main>${body}</main></body></html>`;
}

function send(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  if (!USER || !PASSWORD) {
    return send(res, 503, page('Not configured', '<h1>Not configured</h1><p>Set APP_USER and APP_PASSWORD.</p>'));
  }
  if (!authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="HW Portals", charset="UTF-8"' });
    return res.end('Authentication required');
  }

  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const portals = listPortals();

  if (parts.length === 0) {
    const cards = portals.map(p => {
      const n = listReports(p).length;
      return `<a class="card" href="/${encodeURIComponent(p)}/"><strong>${escapeHtml(titleCase(p))}</strong><br><span class="muted">${n} report${n === 1 ? '' : 's'}</span></a>`;
    }).join('');
    return send(res, 200, page('HW Portals', `<h1>HomeWeavers portal analysis</h1>${cards || '<p class="muted">No portals yet.</p>'}`));
  }

  const portal = parts[0];
  if (!portals.includes(portal)) return send(res, 404, page('Not found', '<h1>Not found</h1>'));
  const reports = listReports(portal);

  if (parts.length === 1) {
    const items = reports.map(f =>
      `<a class="card" href="/${encodeURIComponent(portal)}/${encodeURIComponent(f)}">${escapeHtml(titleCase(f.replace(/\.(md|html)$/i, '')))}</a>`
    ).join('');
    return send(res, 200, page(titleCase(portal), `<h1>${escapeHtml(titleCase(portal))}</h1>${items || '<p class="muted">Report in progress.</p>'}`));
  }

  const file = parts[1];
  if (parts.length !== 2 || !reports.includes(file)) return send(res, 404, page('Not found', '<h1>Not found</h1>'));
  const content = fs.readFileSync(path.join(ROOT, portal, 'reports', file), 'utf8');
  if (/\.html$/i.test(file)) return send(res, 200, content);
  return send(res, 200, page(titleCase(file.replace(/\.md$/i, '')), marked.parse(content)));
});

server.listen(PORT, () => console.log(`HW Portals listening on ${PORT}`));
