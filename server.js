// Password-protected viewer for the portal reports (login page + signed session cookie).
// Serves <portal>/reports/*.md (rendered) and *.html. Nothing else in the repo is exposed.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { marked } = require('marked');
const PORTALS = require('./portals');
const ANALYZERS = require('./analyzers');

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

// Theme: 'light' | 'dark' | 'system' (follows the OS), stored in a cookie so the server renders it without a flash.
const THEME_COOKIE = 'hwp_theme';
function getTheme(req) {
  const t = getCookie(req, THEME_COOKIE);
  return t === 'light' || t === 'dark' ? t : 'system';
}

const LIGHT = '--bg:#fafaf9;--fg:#1c1917;--muted:#78716c;--line:#e7e5e4;--accent:#7b189f;--accent-fg:#fff;--card:#fff;--err:#b91c1c;--good:#15803d;--warn:#b45309;--bad:#b91c1c;color-scheme:light';
const DARK = '--bg:#1c1917;--fg:#f5f5f4;--muted:#a8a29e;--line:#44403c;--accent:#d8a4ef;--accent-fg:#1c1917;--card:#292524;--err:#fca5a5;--good:#4ade80;--warn:#fbbf24;--bad:#f87171;color-scheme:dark';
const THEME_CSS = `:root{${LIGHT}}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){${DARK}}}
:root[data-theme=dark]{${DARK}}
.theme{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--line);border-radius:8px;background:var(--card)}
.theme button{all:unset;display:grid;place-items:center;width:28px;height:26px;border-radius:6px;color:var(--muted);cursor:pointer}
.theme button:hover{color:var(--fg)}
.theme button[aria-pressed=true]{background:var(--accent);color:var(--accent-fg)}
.theme button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.theme svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}`;

const THEME_TOGGLE = `<div class="theme" role="group" aria-label="Colour theme">
<button type="button" data-set-theme="light" aria-label="Light theme" title="Light"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
<button type="button" data-set-theme="system" aria-label="Match device theme" title="Auto (match device)"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg></button>
<button type="button" data-set-theme="dark" aria-label="Dark theme" title="Dark"><svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg></button>
</div>
<script>
(function () {
  var cur = (document.cookie.match(/(?:^|; )${THEME_COOKIE}=(\\w+)/) || [])[1] || 'system';
  var btns = document.querySelectorAll('[data-set-theme]');
  btns.forEach(function (b) {
    b.setAttribute('aria-pressed', String(b.dataset.setTheme === cur));
    b.addEventListener('click', function () {
      var t = b.dataset.setTheme;
      document.cookie = '${THEME_COOKIE}=' + t + '; Path=/; Max-Age=31536000; SameSite=Lax';
      if (t === 'system') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', t);
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  });
})();
</script>`;

function loginPage(next, error) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in · HW Portals</title>
<style>
${THEME_CSS}
.corner{position:fixed;top:12px;right:12px}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;padding:16px}
form{width:100%;max-width:360px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:28px 24px}
h1{margin:0 0 4px;font-size:22px}
p{margin:0 0 20px;color:var(--muted);font-size:14px}
label{display:block;font-size:14px;font-weight:600;margin:14px 0 6px}
input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg);font:inherit}
input:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
form button{width:100%;margin-top:22px;padding:11px;border:0;border-radius:8px;background:var(--accent);color:var(--accent-fg);font:inherit;font-weight:600;cursor:pointer}
.err{color:var(--err);font-size:14px;margin:12px 0 0}
</style></head>
<body>
<div class="corner">${THEME_TOGGLE}</div>
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
    const reports = fs.existsSync(path.join(ROOT, p.slug, 'reports')) ? listReports(p.slug) : [];
    const started = reports.length > 0 || fs.existsSync(path.join(ROOT, p.slug, 'analyzers.json'));
    return { ...p, started, reports, analysis: loadAnalysis(p.slug), details: loadDetailsIndex(p.slug), playbook: loadPlaybook(p.slug) };
  });
}

function listReports(portal) {
  return fs.readdirSync(path.join(ROOT, portal, 'reports'))
    .filter(f => /\.(md|html)$/i.test(f))
    .sort();
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

const loadAnalysis = slug => readJson(path.join(ROOT, slug, 'analyzers.json'), { analyzers: {} });
// <portal>/details/index.json → { "<analyzer>.<check>": { title, count } } — lists behind each check (built by scripts/*-details.js)
const loadDetailsIndex = slug => readJson(path.join(ROOT, slug, 'details', 'index.json'), {});
// <portal>/playbook.json → { links: {…}, fixes: { "<analyzer>.<check>": { solution:[…], link, linkLabel } } }
const loadPlaybook = slug => readJson(path.join(ROOT, slug, 'playbook.json'), { fixes: {} });

function initials(name) {
  return name.replace(/'/g, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Score bands from templates/analyzer-rubric.md
function band(score) {
  if (typeof score !== 'number') return { cls: 'none', label: 'Not analysed' };
  if (score >= 80) return { cls: 'good', label: 'Healthy' };
  if (score >= 50) return { cls: 'warn', label: 'Needs attention' };
  return { cls: 'bad', label: 'Critical' };
}

function overallScore(analysis) {
  const scores = Object.values(analysis.analyzers || {}).map(a => a.score).filter(s => typeof s === 'number');
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
}

const ICONS = {
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
  truck: 'M2 6h12v10H2zM14 10h4l4 3v3h-8M6 19.5a1.5 1.5 0 1 0 0-.01M18 19.5a1.5 1.5 0 1 0 0-.01',
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  chart: 'M3 20h18M6 16v-5M11 16V6M16 16v-8M21 16v-3',
  mega: 'M3 10v4l12 5V5zM15 9a3 3 0 0 1 0 6M6 15l1.5 5h3L9 16',
  star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5l-5.5 2.9 1-6.3L3 9.7l6.2-.9z',
  gift: 'M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9C10 5 6.5 5 6.5 7S9 9 12 9zM12 9c2-4 5.5-4 5.5-2S15 9 12 9z',
};

// Full detail tables (every promotion, campaign, SKU…) with a filter box and click-to-sort headers.
function dataTable(t, i, links = []) {
  const head = t.columns.map((c, j) => `<th><button type="button" data-col="${j}">${escapeHtml(c)}</button></th>`).join('');
  const byCol = new Map(links.map(l => [t.columns.indexOf(l.column), l]).filter(([j]) => j >= 0));
  const cell = (c, j) => {
    const v = c == null ? '' : String(c);
    const l = byCol.get(j);
    if (l && /^[A-Za-z0-9]{5,15}$/.test(v)) return `<td><a class="plink" href="${escapeHtml(l.url.replace('{sku}', encodeURIComponent(v)))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(l.label || '')}">${escapeHtml(v)} ↗</a></td>`;
    return `<td>${escapeHtml(v)}</td>`;
  };
  const body = t.rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('');
  return `<section class="dtable">
  <div class="dt-head"><h2>${escapeHtml(t.title)} <span class="muted">(${t.rows.length})</span></h2>
  <input type="search" placeholder="Filter…" aria-label="Filter ${escapeHtml(t.title)}" data-filter="dt${i}"></div>
  ${t.note ? `<p class="muted">${escapeHtml(t.note)}</p>` : ''}
  <div class="dt-wrap"><table id="dt${i}"><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${t.columns.length}" class="muted">None</td></tr>`}</tbody></table></div>
</section>`;
}

const TABLE_SCRIPT = `<script>
document.querySelectorAll('[data-filter]').forEach(inp => inp.addEventListener('input', () => {
  const q = inp.value.toLowerCase();
  document.querySelectorAll('#' + inp.dataset.filter + ' tbody tr').forEach(tr => { tr.hidden = q && !tr.textContent.toLowerCase().includes(q); });
}));
document.querySelectorAll('.dtable th button').forEach(btn => btn.addEventListener('click', () => {
  const table = btn.closest('table'), col = +btn.dataset.col, tbody = table.tBodies[0];
  const dir = btn.dataset.dir === 'asc' ? 'desc' : 'asc';
  table.querySelectorAll('th button').forEach(b => delete b.dataset.dir);
  btn.dataset.dir = dir;
  const num = s => { const n = parseFloat(s.replace(/[$,%x★]/g, '')); return isNaN(n) ? null : n; };
  [...tbody.rows].sort((a, b) => {
    const x = a.cells[col]?.textContent || '', y = b.cells[col]?.textContent || '';
    const nx = num(x), ny = num(y);
    const r = nx !== null && ny !== null ? nx - ny : x.localeCompare(y);
    return dir === 'asc' ? r : -r;
  }).forEach(tr => tbody.appendChild(tr));
}));
</script>`;
const icon = name => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name] || ''}"/></svg>`;

function ring(score, big) {
  const b = band(score);
  const p = typeof score === 'number' ? score : 0;
  return `<span class="ring ${b.cls}${big ? ' big' : ''}" style="--p:${p}" role="img" aria-label="${typeof score === 'number' ? `Score ${score} of 100, ${b.label}` : b.label}"><b>${typeof score === 'number' ? score : '–'}</b></span>`;
}

function statusLabel(p) {
  const done = Object.keys(p.analysis.analyzers || {}).length;
  if (done) return `${done}/${ANALYZERS.length} analyzers`;
  if (p.reports.length) return `${p.reports.length} report${p.reports.length === 1 ? '' : 's'}`;
  return p.started ? 'In progress' : 'Not started';
}

const CHECK = {
  pass: { cls: 'good', mark: '✓', label: 'OK' },
  warn: { cls: 'warn', mark: '!', label: 'Needs attention' },
  fail: { cls: 'bad', mark: '✕', label: 'Problem' },
  na: { cls: 'none', mark: '–', label: 'Not applicable' },
};
const checkState = s => CHECK[s] || { cls: 'none', mark: '–', label: 'Not checked' };

function checkCounts(analysis) {
  const counts = { pass: 0, warn: 0, fail: 0, total: 0 };
  for (const a of ANALYZERS) {
    for (const c of a.checks) {
      counts.total++;
      const s = analysis.analyzers?.[a.key]?.checks?.[c.id]?.status;
      if (s in counts) counts[s]++;
    }
  }
  return counts;
}

const safeUrl = u => (/^https:\/\//.test(u || '') ? u : '');

// Columns whose values link out (e.g. "Wayfair SKU" → the live product page). Set per portal in playbook.json.
function productLinks(p) {
  const raw = p?.playbook?.productLinks || (p?.playbook?.productLink ? [p.playbook.productLink] : []);
  return raw.filter(l => l && l.column && safeUrl(l.url));
}

// Each check is a row; when it has a SKU list or a fix playbook it expands (click) to show them.
function checksTable(a, r, p) {
  const rows = a.checks.map(c => {
    const res = r?.checks?.[c.id] || {};
    const st = checkState(res.status);
    const key = `${a.key}.${c.id}`;
    const list = p?.details?.[key];
    const fix = p?.playbook?.fixes?.[key];
    const link = safeUrl(fix?.link || p?.playbook?.links?.[a.key]);
    // ⓘ next to the name: plain-language "what does this mean?" shown on hover / focus / tap
    // short line first; the full explanation opens with "More info"
    const info = fix?.explain ? `<span class="info" tabindex="0" role="button" aria-label="What does this mean?" data-info>i<span class="tip" role="tooltip">${escapeHtml(fix.short || fix.explain)}${fix.short ? `<button type="button" class="more-info" aria-expanded="false">More info ▸</button><span class="tip-more" hidden>${escapeHtml(fix.explain)}</span>` : ''}</span></span>` : '';
    const head = `<span class="cmark ${st.cls}" title="${st.label}">${st.mark}</span>
    <span class="cmain"><span class="cname">${escapeHtml(c.name)}${info}</span>${res.note ? `<span class="cnote">${escapeHtml(res.note)}</span>` : ''}</span>
    <span class="cval">${res.value != null ? escapeHtml(String(res.value)) : '<span class="muted">—</span>'}</span>`;
    if (!list && !fix?.solution?.length) return `<div class="check">${head}</div>`;
    const chips = [
      list ? `<span class="chip">${list.count.toLocaleString('en-US')} ${list.count === 1 ? 'row' : 'rows'}</span>` : '',
      fix?.solution?.length && res.status && res.status !== 'pass' ? '<span class="chip fixchip">How to fix</span>' : '',
    ].join('');
    const solution = fix?.solution?.length ? `<div class="fix"><strong>${res.status === 'pass' ? 'Keep it healthy' : 'Best solution'}</strong><ol>${fix.solution.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>${fix.impact ? `<p class="impact">Expected impact: ${escapeHtml(fix.impact)}</p>` : ''}</div>` : '';
    const actions = link ? `<a class="btn" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(fix?.linkLabel || 'Fix in portal')} ↗</a>` : '';
    const plAttrs = list && productLinks(p).length ? ` data-plinks="${escapeHtml(JSON.stringify(productLinks(p)))}"` : '';
    return `<details class="check"${list ? ` data-src="/${encodeURIComponent(p.slug)}/details/${encodeURIComponent(key)}.json"` : ''}${plAttrs}>
  <summary>${head}<span class="chips">${chips}<span class="caret" aria-hidden="true">▸</span></span></summary>
  <div class="cbody">${solution}${actions ? `<div class="cactions">${actions}</div>` : ''}${list ? '<div class="dl" aria-live="polite"><p class="muted">Loading…</p></div>' : ''}</div>
</details>`;
  }).join('');
  return `<div class="checks">${rows}</div>`;
}

// Loads a check's SKU list on first open; filter, sort, show-more and CSV download all run client-side.
const CHECK_SCRIPT = `<script>
(function () {
  var PAGE = 200;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(s) { var n = parseFloat(String(s).replace(/[$,%★]/g, '')); return isNaN(n) ? null : n; }
  function csv(d) {
    var q = function (v) { v = v == null ? '' : String(v); return /[",\\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return [d.columns].concat(d.rows).map(function (r) { return r.map(q).join(','); }).join('\\n');
  }
  function render(box, d, state) {
    var q = state.q.toLowerCase();
    var rows = q ? d.rows.filter(function (r) { return r.join(' ').toLowerCase().indexOf(q) >= 0; }) : d.rows.slice();
    if (state.col != null) rows.sort(function (a, b) {
      var x = a[state.col], y = b[state.col], nx = num(x), ny = num(y);
      var c = nx !== null && ny !== null ? nx - ny : String(x).localeCompare(String(y));
      return state.dir === 'asc' ? c : -c;
    });
    var shown = rows.slice(0, state.limit);
    var head = d.columns.map(function (c, i) { return '<th><button type="button" data-col="' + i + '"' + (state.col === i ? ' data-dir="' + state.dir + '"' : '') + '>' + esc(c) + '</button></th>'; }).join('');
    var byCol = {};
    (state.plinks || []).forEach(function (l) { var i = d.columns.indexOf(l.column); if (i >= 0) byCol[i] = l; });
    var cell = function (c, i) {
      var l = byCol[i];
      if (l && /^[A-Za-z0-9]{5,15}$/.test(String(c))) return '<td><a class="plink" href="' + esc(l.url.replace('{sku}', encodeURIComponent(c))) + '" target="_blank" rel="noopener noreferrer" title="' + esc(l.label || '') + '">' + esc(c) + ' ↗</a></td>';
      return '<td>' + esc(c) + '</td>';
    };
    var body = shown.map(function (r) { return '<tr>' + r.map(cell).join('') + '</tr>'; }).join('')
      || '<tr><td colspan="' + d.columns.length + '" class="muted">None</td></tr>';
    box.querySelector('.dl-count').textContent = (q ? rows.length.toLocaleString() + ' of ' : '') + d.rows.length.toLocaleString() + ' rows';
    box.querySelector('.dl-table').innerHTML = '<table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>';
    var more = box.querySelector('.dl-more');
    more.hidden = rows.length <= state.limit;
    more.textContent = 'Show all ' + rows.length.toLocaleString() + ' rows';
  }
  function load(det) {
    var box = det.querySelector('.dl');
    fetch(det.dataset.src, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      var state = { q: '', col: null, dir: 'asc', limit: PAGE, plinks: det.dataset.plinks ? JSON.parse(det.dataset.plinks) : [] };
      box.innerHTML = '<div class="dl-head"><strong>' + esc(d.title) + '</strong> <span class="muted dl-count"></span>'
        + '<span class="dl-tools"><input type="search" placeholder="Filter…" aria-label="Filter rows"><button type="button" class="btn ghost dl-csv">Download CSV</button></span></div>'
        + (d.note ? '<p class="muted dl-note">' + esc(d.note) + '</p>' : '')
        + '<div class="dt-wrap dl-table"></div><button type="button" class="btn ghost dl-more" hidden></button>';
      box.querySelector('input').addEventListener('input', function (e) { state.q = e.target.value; state.limit = PAGE; render(box, d, state); });
      box.querySelector('.dl-more').addEventListener('click', function () { state.limit = Infinity; render(box, d, state); });
      box.querySelector('.dl-table').addEventListener('click', function (e) {
        var b = e.target.closest('th button'); if (!b) return;
        var col = +b.dataset.col; state.dir = state.col === col && state.dir === 'asc' ? 'desc' : 'asc'; state.col = col; render(box, d, state);
      });
      box.querySelector('.dl-csv').addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv(d)], { type: 'text/csv' }));
        a.download = det.dataset.src.split('/').pop().replace('.json', '.csv');
        a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      render(box, d, state);
    }).catch(function () { box.innerHTML = '<p class="muted">Couldn’t load this list.</p>'; det.dataset.loaded = ''; });
  }
  // ⓘ inside a clickable row: tapping/clicking shows the tip instead of opening the row
  document.querySelectorAll('[data-info]').forEach(function (el) {
    // keep the tip inside the screen: below the icon (above if no room), clamped left/right
    function place() {
      var tip = el.querySelector('.tip'), r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
      var top = r.bottom + 8 + h > innerHeight && r.top - 8 - h > 0 ? r.top - 8 - h : r.bottom + 8;
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
    }
    el.addEventListener('mouseenter', place);
    el.addEventListener('focus', place);
    var more = el.querySelector('.more-info');
    if (more) more.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var box = el.querySelector('.tip-more'), open = box.hidden;
      box.hidden = !open; more.setAttribute('aria-expanded', String(open)); more.textContent = open ? 'Less ▴' : 'More info ▸';
      el.classList.add('show'); place();   // pin it open while reading
    });
    el.querySelector('.tip').addEventListener('click', function (e) { e.stopPropagation(); if (e.target.closest('.tip') && !e.target.closest('.more-info')) e.preventDefault(); });
    function toggle(e) { e.preventDefault(); e.stopPropagation(); var on = !el.classList.contains('show'); document.querySelectorAll('[data-info].show').forEach(function (x) { x.classList.remove('show'); }); el.classList.toggle('show', on); if (on) place(); }
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') toggle(e); if (e.key === 'Escape') el.classList.remove('show'); });
  });
  document.addEventListener('click', function () { document.querySelectorAll('[data-info].show').forEach(function (x) { x.classList.remove('show'); }); });
  document.querySelectorAll('details.check[data-src]').forEach(function (det) {
    det.addEventListener('toggle', function () { if (det.open && !det.dataset.loaded) { det.dataset.loaded = '1'; load(det); } });
  });
})();
</script>`;

// Ranked "what to do next" list: analysis.plan → [{ title, why, steps:[], impact, effort, priority, check }]
function growthPlan(p) {
  const plan = p.analysis.plan || [];
  if (!plan.length) return '';
  const items = plan.map((s, i) => `<li class="plan-item">
  <div class="plan-head"><span class="rank">${i + 1}</span><div class="plan-title"><strong>${escapeHtml(s.title)}</strong>
  <div class="plan-tags">${s.impact ? `<span class="tag impact">${escapeHtml(s.impact)}</span>` : ''}${s.effort ? `<span class="tag">Effort: ${escapeHtml(s.effort)}</span>` : ''}${s.deadline ? `<span class="tag due">Due ${escapeHtml(s.deadline)}</span>` : ''}</div></div></div>
  ${s.why ? `<p class="muted">${escapeHtml(s.why)}</p>` : ''}
  ${s.steps?.length ? `<ol>${s.steps.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ol>` : ''}
  <div class="cactions">${s.check ? `<a class="btn ghost" href="#${escapeHtml(s.check.split('.')[0])}">See the data</a>` : ''}${safeUrl(s.link) ? `<a class="btn" href="${escapeHtml(s.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.linkLabel || 'Open in portal')} ↗</a>` : ''}</div>
</li>`).join('');
  return `<details class="plan">
<summary><span class="plan-sum"><h2>Best next steps to grow sales</h2><span class="muted">${plan.length} actions ranked by expected revenue impact · top: ${escapeHtml(plan[0].title)}</span></span><span class="caret" aria-hidden="true">▸</span></summary>
<p class="muted">Estimates are based on this portal's own numbers (see each step).</p>
<ol class="plan-list">${items}</ol></details>`;
}

function portalCard(p) {
  const score = overallScore(p.analysis);
  const counts = checkCounts(p.analysis);
  const rows = ANALYZERS.map(a => {
    const s = p.analysis.analyzers?.[a.key]?.score;
    return `<span class="arow"><i class="dot ${band(s).cls}"></i><span>${escapeHtml(a.name)}</span><b>${typeof s === 'number' ? s : '–'}</b></span>`;
  }).join('');
  const flagged = counts.warn + counts.fail;
  return `<a class="portal" href="/${encodeURIComponent(p.slug)}/" style="--from:${p.from};--to:${p.to};--ink:${p.ink}">
  <span class="top"><span class="mono" aria-hidden="true">${escapeHtml(initials(p.name))}</span>${score !== null ? `<span class="overall"><b>${score}</b><small>/100</small></span>` : ''}</span>
  <span class="pname">${escapeHtml(p.name)}</span>
  <span class="channel">${escapeHtml(p.channel)}</span>
  <span class="arows">${rows}</span>
  <span class="status${p.started ? '' : ' idle'}">${counts.pass + flagged ? `${flagged} of ${counts.total} checks flagged` : statusLabel(p)}</span>
</a>`;
}

function homePage(portals) {
  const started = portals.filter(p => p.started).length;
  const legend = ['good', 'warn', 'bad', 'none'].map(c => `<span><i class="dot ${c}"></i>${band({ good: 90, warn: 60, bad: 10 }[c]).label}</span>`).join('');
  return `<h1>HomeWeavers portal analysis</h1>
<p class="muted">${portals.length} portals · ${started} in progress · ${ANALYZERS.length} analyzers per portal</p>
<div class="legend">${legend}</div>
<div class="grid">${portals.map(portalCard).join('')}</div>`;
}

function hero(p, sub) {
  return `<div class="hero" style="--from:${p.from};--to:${p.to};--ink:${p.ink}">
  <span class="mono" aria-hidden="true">${escapeHtml(initials(p.name))}</span>
  <div><h1>${escapeHtml(p.name)}</h1><div class="channel">${sub}</div></div>
</div>`;
}

function portalPage(p) {
  const { analysis } = p;
  const score = overallScore(analysis);
  const meta = [analysis.period && `Period: ${escapeHtml(analysis.period)}`, analysis.updated && `Updated ${escapeHtml(analysis.updated)}`].filter(Boolean).join(' · ');
  const counts = checkCounts(analysis);
  const sections = ANALYZERS.map(a => {
    const r = analysis.analyzers?.[a.key];
    const b = band(r?.score);
    return `<section class="analyzer ${b.cls}" id="${a.key}">
  <div class="an-head">${icon(a.icon)}<div class="an-title"><h2>${escapeHtml(a.name)}</h2><div class="muted">${escapeHtml(r?.headline || a.desc)}</div></div>${ring(r?.score)}</div>
  ${checksTable(a, r, p)}
  <a class="more" href="/${encodeURIComponent(p.slug)}/${a.key}">${r ? `Findings, actions & metrics${r.tables?.length ? ` · ${r.tables.map(t => `${t.rows.length} ${t.title.toLowerCase()}`).join(' · ')}` : ''} →` : 'Details →'}</a>
</section>`;
  }).join('');
  const jump = ANALYZERS.map(a => `<a href="#${a.key}"><i class="dot ${band(analysis.analyzers?.[a.key]?.score).cls}"></i>${escapeHtml(a.name)}</a>`).join('');
  const reports = p.reports.map(f =>
    `<a class="card" href="/${encodeURIComponent(p.slug)}/${encodeURIComponent(f)}">${escapeHtml(titleCase(f.replace(/\.(md|html)$/i, '')))}</a>`
  ).join('');
  return `${hero(p, escapeHtml(p.channel))}
<div class="summary">${ring(score, true)}<div><strong>Overall portal score</strong><div class="muted">${score !== null ? `${band(score).label} · average of ${Object.keys(analysis.analyzers).length} analyzers` : p.started ? 'Analysis in progress' : 'Analysis not started yet'}${meta ? `<br>${meta}` : ''}</div></div>
<div class="counts"><span class="good">${counts.pass} OK</span><span class="warn">${counts.warn} attention</span><span class="bad">${counts.fail} problems</span><span class="none">${counts.total - counts.pass - counts.warn - counts.fail} not checked</span></div></div>
${growthPlan(p)}
<nav class="jump">${jump}</nav>
${sections}
${reports ? `<h2>Reports</h2>${reports}` : ''}
${CHECK_SCRIPT}`;
}

function analyzerPage(p, a) {
  const r = p.analysis.analyzers?.[a.key];
  const back = `<p><a href="/${encodeURIComponent(p.slug)}/">← All ${escapeHtml(p.name)} analyzers</a></p>`;
  const head = `${hero(p, `${escapeHtml(a.name)} · ${escapeHtml(a.desc)}`)}${back}`;
  if (!r) return `${head}<p class="muted">This analyzer hasn't been run for ${escapeHtml(p.name)} yet. It will check:</p>${checksTable(a, null, p)}`;
  const b = band(r.score);
  const list = (title, items) => items?.length ? `<h2>${title}</h2><ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : '';
  const metrics = (r.metrics || []).map(m => {
    const tone = m.good === true ? 'pos' : m.good === false ? 'neg' : '';
    const arrow = { up: '▲', down: '▼', flat: '■' }[m.dir] || '';
    return `<div class="metric"><div class="mlabel">${escapeHtml(m.label)}</div><div class="mvalue">${escapeHtml(String(m.value))}</div>${m.change ? `<div class="mchange ${tone}">${arrow} ${escapeHtml(m.change)}</div>` : ''}</div>`;
  }).join('');
  return `${head}
<div class="summary">${ring(r.score, true)}<div><strong>${escapeHtml(r.headline || a.name)}</strong><div class="muted"><span class="pill ${b.cls}">${b.label}</span>${p.analysis.period ? ` · ${escapeHtml(p.analysis.period)}` : ''}</div></div></div>
${metrics ? `<div class="metrics">${metrics}</div>` : ''}
<h2>Checks</h2>
${checksTable(a, r, p)}
${CHECK_SCRIPT}
${list('Findings', r.findings)}
${list('Recommended actions', r.actions)}
${(r.tables || []).map((t, i) => dataTable(t, i, productLinks(p))).join('')}
${r.tables?.length ? TABLE_SCRIPT : ''}
${r.scoreNote ? `<h2>How this was scored</h2><p class="muted">${escapeHtml(r.scoreNote)}</p>` : ''}
${r.source ? `<p class="muted">Source: ${escapeHtml(r.source)}</p>` : ''}`;
}

function page(title, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${THEME_CSS}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}
header{border-bottom:1px solid var(--line);padding:10px 16px;display:flex;justify-content:space-between;align-items:center}
header form{margin:0}
.hright{display:flex;align-items:center;gap:10px}
header form button{background:none;border:1px solid var(--line);border-radius:6px;color:var(--muted);font:inherit;font-size:14px;padding:4px 10px;cursor:pointer}
header form button:hover{color:var(--fg);border-color:var(--accent)}
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
.portal .status{margin-top:14px}
.top{display:flex;justify-content:space-between;align-items:flex-start}
.overall{background:rgb(255 255 255/.22);border-radius:10px;padding:2px 10px;font-size:13px}
.overall b{font-size:20px}
.arows{position:relative;z-index:1;display:grid;gap:3px;margin-top:14px;padding:10px 12px;border-radius:10px;background:rgb(0 0 0/.16);font-size:12.5px}
.arow{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px}
.arow b{font-variant-numeric:tabular-nums;opacity:.9}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;flex:none;box-shadow:0 0 0 1.5px rgb(255 255 255/.7)}
.dot.good{background:var(--good)}.dot.warn{background:var(--warn)}.dot.bad{background:var(--bad)}.dot.none{background:rgb(255 255 255/.25)}
.legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend .dot{box-shadow:none}.legend .dot.none,.jump .dot.none{background:var(--line)}
.summary{display:flex;flex-wrap:wrap;gap:16px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
.summary>div:nth-child(2){flex:1;min-width:200px}
.counts{display:flex;flex-wrap:wrap;gap:8px;font-size:13px;font-weight:600}
.counts span{padding:3px 10px;border-radius:999px;background:var(--bg);border:1px solid var(--line)}
.counts .good{color:var(--good)}.counts .warn{color:var(--warn)}.counts .bad{color:var(--bad)}.counts .none{color:var(--muted)}
.ring{--c:var(--line);position:relative;display:inline-grid;place-items:center;flex:none;width:46px;height:46px;border-radius:50%;
  background:conic-gradient(var(--c) calc(var(--p)*1%),var(--line) 0)}
.ring::before{content:"";position:absolute;inset:5px;border-radius:50%;background:var(--card)}
.ring b{position:relative;font-size:15px;font-variant-numeric:tabular-nums}
.ring.big{width:72px;height:72px}.ring.big::before{inset:7px}.ring.big b{font-size:24px}
.ring.good{--c:var(--good)}.ring.warn{--c:var(--warn)}.ring.bad{--c:var(--bad)}
.jump{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.jump a{display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:4px 10px;border:1px solid var(--line);border-radius:999px;color:var(--fg);text-decoration:none;background:var(--card)}
.jump a:hover{border-color:var(--accent)}
.jump .dot{box-shadow:none}
.analyzer{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:12px;padding:16px;margin:0 0 14px;scroll-margin-top:12px}
.analyzer.good{border-left-color:var(--good)}.analyzer.warn{border-left-color:var(--warn)}.analyzer.bad{border-left-color:var(--bad)}
.an-head{display:flex;gap:12px;align-items:center}
.an-title{flex:1;min-width:0}.an-title h2{margin:0;font-size:18px}.an-title .muted{font-size:14px}
.ico{width:24px;height:24px;flex:none;fill:none;stroke:var(--accent);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.checks{margin:12px 0 6px;font-size:14px}
.check{border-top:1px solid var(--line)}
div.check,.check>summary{display:grid;grid-template-columns:22px 1fr auto;gap:4px 12px;align-items:start;padding:8px 0}
.check>summary{grid-template-columns:22px 1fr auto auto;cursor:pointer;list-style:none;border-radius:6px}
.check>summary::-webkit-details-marker{display:none}
.check>summary:hover .cmain{color:var(--accent)}
.check>summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cmain{min-width:0}
.cval{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;font-weight:600}
.cnote{display:block;color:var(--muted);font-size:13px}
.chips{display:flex;gap:6px;align-items:center;white-space:nowrap}
.chip{font-size:12px;font-weight:600;padding:1px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.fixchip{border-color:var(--accent);color:var(--accent)}
.caret{color:var(--muted);transition:transform .15s}
.check[open] .caret{transform:rotate(90deg)}
.cbody{padding:4px 0 14px 34px}
.fix{background:var(--bg);border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:8px;padding:10px 14px;margin-bottom:10px}
.info{position:relative;display:inline-grid;place-items:center;width:17px;height:17px;margin-left:6px;vertical-align:1px;border-radius:50%;border:1.5px solid var(--muted);color:var(--muted);font:italic 700 11px/1 Georgia,serif;cursor:help}
.info:hover,.info:focus-visible,.info.show{border-color:var(--accent);color:var(--accent);outline:none}
.tip{display:none;position:fixed;z-index:20;left:8px;top:0;width:max-content;max-width:min(300px,calc(100vw - 16px));padding:10px 12px;border-radius:10px;background:var(--fg);color:var(--bg);font:400 13.5px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;text-align:left;box-shadow:0 8px 24px rgb(0 0 0/.25);cursor:auto}
.tip::after{content:"";position:absolute;left:0;right:0;top:-10px;bottom:-10px;z-index:-1}
.more-info{all:unset;display:block;margin-top:6px;font-size:12.5px;font-weight:600;color:var(--bg);opacity:.75;cursor:pointer;text-decoration:underline}
.more-info:hover,.more-info:focus-visible{opacity:1}
.tip-more{display:block;margin-top:6px;padding-top:6px;border-top:1px solid rgb(127 127 127/.35);opacity:.9}
.tip-more[hidden]{display:none}
.info:hover .tip,.info:focus-visible .tip,.info.show .tip{display:block}
.fix ol{margin:6px 0 0;padding-left:20px}
.fix li{margin:3px 0}
.impact{margin:8px 0 0;font-size:13px;font-weight:600;color:var(--good)}
.cactions{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.btn{display:inline-block;padding:6px 12px;border-radius:8px;background:var(--accent);color:var(--accent-fg);font:inherit;font-size:13px;font-weight:600;text-decoration:none;border:1px solid var(--accent);cursor:pointer}
.btn.ghost{background:transparent;color:var(--accent)}
.btn:hover{filter:brightness(1.08)}
.dl-head{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-top:6px}
.dl-tools{display:flex;gap:8px;margin-left:auto}
.dl-tools input{padding:5px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit;font-size:13px;min-width:180px}
.dl-note{margin:6px 0 0;font-size:13px}
.dl .dt-wrap{max-height:60vh}
.dl-more{margin-top:8px}
.plink{color:var(--accent);text-decoration:none;font-weight:600;white-space:nowrap}
.plink:hover{text-decoration:underline}
@media (max-width:640px){.check>summary{grid-template-columns:22px 1fr auto}.chips{grid-column:2/-1}.cbody{padding-left:0}.dl-tools{margin-left:0;width:100%}.dl-tools input{flex:1;min-width:0}}
.plan{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:0 0 16px}
.plan h2{margin:0 0 2px}
.plan>summary{display:flex;gap:12px;align-items:center;justify-content:space-between;cursor:pointer;list-style:none;border-radius:8px}
.plan>summary::-webkit-details-marker{display:none}
.plan>summary:hover h2{color:var(--accent)}
.plan>summary:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.plan[open]>summary .caret{transform:rotate(90deg)}
.plan-sum{min-width:0}.plan-sum .muted{font-size:14px}
.plan>p{margin:12px 0 0}
.plan-list{list-style:none;padding:0;margin:12px 0 0;counter-reset:none}
.plan-item{border-top:1px solid var(--line);padding:12px 0}
.plan-item ol{margin:6px 0;padding-left:20px;font-size:14px}
.plan-item p{margin:6px 0;font-size:14px}
.plan-head{display:flex;gap:12px;align-items:flex-start}
.rank{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--accent-fg);font-weight:700;font-size:14px}
.plan-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.tag{font-size:12px;font-weight:600;padding:1px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.tag.impact{border-color:var(--good);color:var(--good)}
.tag.due{border-color:var(--bad);color:var(--bad)}
.plan-item .cactions{margin-left:40px}
.cmark{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;color:var(--card);background:var(--line)}
.cmark.good{background:var(--good)}.cmark.warn{background:var(--warn)}.cmark.bad{background:var(--bad)}.cmark.none{color:var(--muted)}
.more{font-size:14px;text-decoration:none}
.pill{display:inline-block;font-size:12px;font-weight:600;padding:2px 9px;border-radius:999px;border:1px solid currentColor}
.pill.good{color:var(--good)}.pill.warn{color:var(--warn)}.pill.bad{color:var(--bad)}.pill.none{color:var(--muted)}
.metrics{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:0 0 8px}
.metric{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
.mlabel{font-size:13px;color:var(--muted)}.mvalue{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.mchange{font-size:13px}.mchange.pos{color:var(--good)}.mchange.neg{color:var(--bad)}
.dtable{margin-top:24px}
.dt-head{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between}
.dt-head h2{margin:0}
.dt-head input{padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit;font-size:14px;min-width:200px}
.dt-wrap{overflow:auto;max-height:70vh;border:1px solid var(--line);border-radius:10px;margin-top:10px}
.dt-wrap table{display:table;margin:0;font-size:14px}
.dt-wrap th{position:sticky;top:0;z-index:1;padding:0;border-top:0}
.dt-wrap th button{all:unset;display:block;padding:8px 10px;cursor:pointer;font-weight:600;white-space:nowrap}
.dt-wrap th button[data-dir=asc]::after{content:" ▲"}.dt-wrap th button[data-dir=desc]::after{content:" ▼"}
.dt-wrap td{white-space:nowrap}
.dt-wrap td,.dt-wrap th{border-left:0;border-right:0}
.hero{display:flex;gap:16px;align-items:center;padding:22px;border-radius:14px;margin-bottom:20px;color:var(--ink);background:linear-gradient(135deg,var(--from),var(--to))}
.hero h1{margin:0;font-size:26px}
.hero .mono{width:52px;height:52px;font-size:18px}
@media (prefers-reduced-motion:reduce){.portal{transition:none}.portal:hover{transform:none}}
</style></head>
<body><header><a href="/">HW Portals</a><div class="hright">${THEME_TOGGLE}<form method="post" action="/logout"><button type="submit">Sign out</button></form></div></header><main>${body}</main></body></html>`;
}

function send(res, status, html) {
  if (res.theme && res.theme !== 'system') html = html.replace('<html lang="en">', `<html lang="en" data-theme="${res.theme}">`);
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(303, { Location: location, 'Cache-Control': 'no-store' });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.theme = getTheme(req);

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

  // Click-through lists: /<portal>/details/<analyzer>.<check>.json (only keys listed in the portal's index)
  if (parts.length === 3 && parts[1] === 'details') {
    const key = parts[2].replace(/\.json$/, '');
    if (!portal.details[key]) return send(res, 404, page('Not found', '<h1>Not found</h1>'));
    const raw = fs.readFileSync(path.join(ROOT, portal.slug, 'details', `${key}.json`));
    const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-cache', ...(gzip && { 'Content-Encoding': 'gzip' }) });
    return res.end(gzip ? zlib.gzipSync(raw) : raw);
  }

  const analyzer = ANALYZERS.find(a => a.key === parts[1]);
  if (parts.length === 2 && analyzer) return send(res, 200, page(`${analyzer.name} · ${portal.name}`, analyzerPage(portal, analyzer)));

  const file = parts[1];
  if (parts.length !== 2 || !portal.reports.includes(file)) return send(res, 404, page('Not found', '<h1>Not found</h1>'));
  const content = fs.readFileSync(path.join(ROOT, portal.slug, 'reports', file), 'utf8');
  // Standalone HTML reports are served as-is, so they carry no sign-out button of their own.
  if (/\.html$/i.test(file)) return send(res, 200, content);
  return send(res, 200, page(titleCase(file.replace(/\.md$/i, '')), marked.parse(content)));
});

server.listen(PORT, () => console.log(`HW Portals listening on ${PORT}`));
