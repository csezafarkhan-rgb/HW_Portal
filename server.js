// Password-protected viewer for the portal reports (login page + signed session cookie).
// Serves <portal>/reports/*.md (rendered) and *.html. Nothing else in the repo is exposed.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { marked } = require('marked');
const PORTALS = require('./portals');

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

// Sessions: signed "<expiry>.<hmac>" cookie. The key is derived from the credentials,
// so changing APP_PASSWORD signs everyone out.
const COOKIE = 'hwp_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const sessionKey = () => process.env.SESSION_SECRET || `${USER}:${PASSWORD}`;
const sign = v => crypto.createHmac('sha256', sessionKey()).update(v).digest('base64url');

function newSession() {
  const exp = String(Date.now() + SESSION_MS);
  return `${exp}.${sign(exp)}`;
}

function getCookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}

function authorized(req) {
  const [exp, sig] = getCookie(req, COOKIE).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

function setCookie(req, res, value, maxAgeSec) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`);
}

// Simple per-IP throttle on failed logins: 10 failures per 15 minutes.
const failures = new Map();
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
}
function tooManyFailures(ip) {
  const f = failures.get(ip);
  if (f && Date.now() - f.since > 15 * 60 * 1000) failures.delete(ip);
  return (failures.get(ip)?.count || 0) >= 10;
}
function recordFailure(ip) {
  const f = failures.get(ip) || { count: 0, since: Date.now() };
  f.count++;
  failures.set(ip, f);
}

function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 10_000) { reject(new Error('Body too large')); req.destroy(); }
    });
    req.on('end', () => resolve(new URLSearchParams(data)));
    req.on('error', reject);
  });
}

function loginPage(next, error) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in · HW Portals</title>
<style>
:root{--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--line:#e7e5e4;--accent:#7b189f;--accent-fg:#fff;--card:#fff;--err:#b91c1c}
@media (prefers-color-scheme:dark){:root{--bg:#1c1917;--fg:#f5f5f4;--muted:#a8a29e;--line:#44403c;--accent:#d8a4ef;--accent-fg:#1c1917;--card:#292524;--err:#fca5a5}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:16px}
form{width:100%;max-width:360px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:28px 24px}
h1{margin:0 0 4px;font-size:22px}
p{margin:0 0 20px;color:var(--muted);font-size:14px}
label{display:block;font-size:14px;font-weight:600;margin:14px 0 6px}
input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg);font:inherit}
input:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
button{width:100%;margin-top:22px;padding:11px;border:0;border-radius:8px;background:var(--accent);color:var(--accent-fg);font:inherit;font-weight:600;cursor:pointer}
.err{color:var(--err);font-size:14px;margin:12px 0 0}
</style></head>
<body>
<form method="post" action="/login">
  <h1>HW Portals</h1>
  <p>HomeWeavers portal analysis. Sign in to continue.</p>
  <input type="hidden" name="next" value="${escapeHtml(next)}">
  <label for="u">Username</label>
  <input id="u" name="username" autocomplete="username" required autofocus>
  <label for="p">Password</label>
  <input id="p" name="password" type="password" autocomplete="current-password" required>
  ${error ? `<div class="err" role="alert">${escapeHtml(error)}</div>` : ''}
  <button type="submit">Sign in</button>
</form>
</body></html>`;
}

function titleCase(s) {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Registered portals first (in registry order), then any other <dir>/reports/ folders found on disk.
function listPortals() {
  const known = new Set(PORTALS.map(p => p.slug));
  const extra = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !SKIP_DIRS.has(d.name) && !known.has(d.name))
    .filter(d => fs.existsSync(path.join(ROOT, d.name, 'reports')))
    .map(d => ({ slug: d.name, name: titleCase(d.name), channel: '', from: '#57534E', to: '#A8A29E', ink: '#fff' }));
  return [...PORTALS, ...extra].map(p => {
    const started = fs.existsSync(path.join(ROOT, p.slug, 'reports'));
    return { ...p, started, reports: started ? listReports(p.slug) : [] };
  });
}

function listReports(portal) {
  return fs.readdirSync(path.join(ROOT, portal, 'reports'))
    .filter(f => /\.(md|html)$/i.test(f))
    .sort();
}

function initials(name) {
  return name.replace(/'/g, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function statusLabel(p) {
  if (p.reports.length) return `${p.reports.length} report${p.reports.length === 1 ? '' : 's'}`;
  return p.started ? 'In progress' : 'Not started';
}

function portalCard(p) {
  return `<a class="portal" href="/${encodeURIComponent(p.slug)}/" style="--from:${p.from};--to:${p.to};--ink:${p.ink}">
  <span class="mono" aria-hidden="true">${escapeHtml(initials(p.name))}</span>
  <span class="pname">${escapeHtml(p.name)}</span>
  <span class="channel">${escapeHtml(p.channel)}</span>
  <span class="status${p.started ? '' : ' idle'}">${statusLabel(p)}</span>
</a>`;
}

function homePage(portals) {
  const started = portals.filter(p => p.started).length;
  const reports = portals.reduce((n, p) => n + p.reports.length, 0);
  return `<h1>HomeWeavers portal analysis</h1>
<p class="muted">${portals.length} portals · ${started} in progress · ${reports} report${reports === 1 ? '' : 's'}</p>
<div class="grid">${portals.map(portalCard).join('')}</div>`;
}

function portalPage(p) {
  const items = p.reports.map(f =>
    `<a class="card" href="/${encodeURIComponent(p.slug)}/${encodeURIComponent(f)}">${escapeHtml(titleCase(f.replace(/\.(md|html)$/i, '')))}</a>`
  ).join('');
  const empty = p.started ? 'Analysis in progress — reports will appear here.' : 'Analysis not started yet.';
  return `<div class="hero" style="--from:${p.from};--to:${p.to};--ink:${p.ink}">
  <span class="mono" aria-hidden="true">${escapeHtml(initials(p.name))}</span>
  <div><h1>${escapeHtml(p.name)}</h1><div class="channel">${escapeHtml(p.channel)}</div></div>
</div>
${items || `<p class="muted">${empty}</p>`}`;
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
header{border-bottom:1px solid var(--line);padding:10px 16px;display:flex;justify-content:space-between;align-items:center}
header form{margin:0}
header button{background:none;border:1px solid var(--line);border-radius:6px;color:var(--muted);font:inherit;font-size:14px;padding:4px 10px;cursor:pointer}
header button:hover{color:var(--fg);border-color:var(--accent)}
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
main:has(.grid){max-width:1180px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:20px}
.portal{position:relative;display:flex;flex-direction:column;min-height:170px;padding:18px;border-radius:14px;text-decoration:none;
  color:var(--ink);background:linear-gradient(135deg,var(--from),var(--to));box-shadow:0 1px 2px rgb(0 0 0/.12);overflow:hidden;
  transition:transform .15s ease,box-shadow .15s ease}
.portal::after{content:"";position:absolute;right:-40px;bottom:-60px;width:180px;height:180px;border-radius:50%;background:rgb(255 255 255/.10)}
.portal:hover,.portal:focus-visible{transform:translateY(-3px);box-shadow:0 10px 24px rgb(0 0 0/.22)}
.portal:focus-visible{outline:3px solid var(--fg);outline-offset:2px}
.mono{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:rgb(255 255 255/.20);font-weight:700;font-size:15px;letter-spacing:.5px;color:var(--ink)}
.pname{margin-top:14px;font-size:20px;font-weight:700;line-height:1.2}
.channel{font-size:13px;opacity:.85;margin-top:2px}
.status{margin-top:auto;align-self:flex-start;position:relative;z-index:1;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgb(255 255 255/.22)}
.status.idle{background:rgb(0 0 0/.18)}
.portal .status{margin-top:18px}
.hero{display:flex;gap:16px;align-items:center;padding:22px;border-radius:14px;margin-bottom:20px;color:var(--ink);background:linear-gradient(135deg,var(--from),var(--to))}
.hero h1{margin:0;font-size:26px}
.hero .mono{width:52px;height:52px;font-size:18px}
@media (prefers-reduced-motion:reduce){.portal{transition:none}.portal:hover{transform:none}}
</style></head>
<body><header><a href="/">HW Portals</a><form method="post" action="/logout"><button type="submit">Sign out</button></form></header><main>${body}</main></body></html>`;
}

function send(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(303, { Location: location, 'Cache-Control': 'no-store' });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  if (!USER || !PASSWORD) {
    return send(res, 503, page('Not configured', '<h1>Not configured</h1><p>Set APP_USER and APP_PASSWORD.</p>'));
  }

  if (url.pathname === '/login') {
    if (req.method === 'POST') {
      const ip = clientIp(req);
      let form;
      try { form = await readBody(req); } catch { return send(res, 413, 'Too large'); }
      const next = safeNext(form.get('next'));
      if (tooManyFailures(ip)) {
        return send(res, 429, loginPage(next, 'Too many failed attempts. Try again in 15 minutes.'));
      }
      if (safeEqual(form.get('username') || '', USER) && safeEqual(form.get('password') || '', PASSWORD)) {
        failures.delete(ip);
        setCookie(req, res, newSession(), SESSION_MS / 1000);
        return redirect(res, next);
      }
      recordFailure(ip);
      return send(res, 401, loginPage(next, 'Incorrect username or password.'));
    }
    if (authorized(req)) return redirect(res, safeNext(url.searchParams.get('next')));
    return send(res, 200, loginPage(safeNext(url.searchParams.get('next')), ''));
  }

  if (url.pathname === '/logout' && req.method === 'POST') {
    setCookie(req, res, '', 0);
    return redirect(res, '/login');
  }

  if (!authorized(req)) {
    return redirect(res, '/login' + (url.pathname !== '/' ? '?next=' + encodeURIComponent(url.pathname) : ''));
  }

  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const portals = listPortals();

  if (parts.length === 0) return send(res, 200, page('HW Portals', homePage(portals)));

  const portal = portals.find(p => p.slug === parts[0]);
  if (!portal) return send(res, 404, page('Not found', '<h1>Not found</h1>'));

  if (parts.length === 1) return send(res, 200, page(portal.name, portalPage(portal)));

  const file = parts[1];
  if (parts.length !== 2 || !portal.reports.includes(file)) return send(res, 404, page('Not found', '<h1>Not found</h1>'));
  const content = fs.readFileSync(path.join(ROOT, portal.slug, 'reports', file), 'utf8');
  // Standalone HTML reports are served as-is, so they carry no sign-out button of their own.
  if (/\.html$/i.test(file)) return send(res, 200, content);
  return send(res, 200, page(titleCase(file.replace(/\.md$/i, '')), marked.parse(content)));
});

server.listen(PORT, () => console.log(`HW Portals listening on ${PORT}`));
