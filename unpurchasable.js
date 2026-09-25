'use strict';
// Unpurchasable (zero-stock) review & selection list.
// Data is built by scripts/wayfair-unpurchasable.js, which joins the live Partner Home
// inventory pull with the 90-day sales export and the catalog, and recommends an action
// per part. Nothing here changes anything in the portal — it only helps pick a shortlist.
const fs = require('node:fs');
const path = require('node:path');

const ACTIONS = [
  ['Safe to discontinue', 'bad'],
  ['Review', 'warn'],
  ['Keep \u2014 review equity', 'none'],
  ['Restock \u2014 demand exists', 'good'],
  ['Restock \u2014 do not discontinue', 'good'],
];

// <slug>/unpurchasable.json is the committed copy the deployed site serves. data/exports is
// gitignored, so it only ever exists on the machine that ran the pull.
function loadUnpurchasable(root, slug) {
  const candidates = [path.join(root, slug, 'unpurchasable.json')];
  const dir = path.join(root, slug, 'data', 'exports');
  try {
    const files = fs.readdirSync(dir).filter(f => /unpurchasable.*\.json$/i.test(f)).sort();
    if (files.length) candidates.push(path.join(dir, files[files.length - 1]));
  } catch { /* no local exports on the deployed box */ }
  for (const file of candidates) {
    try {
      const d = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(d.rows) && d.rows.length) return d;
    } catch { /* try the next one */ }
  }
  return null;
}

const CSS = `
main:has(.ubar){max-width:1240px}
.warnbox{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--bad);border-radius:10px;padding:12px 16px;margin:0 0 16px;font-size:14px}
.ufilters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
.ufilters button{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:13px;padding:4px 12px;border:1px solid var(--line);border-radius:999px;color:var(--fg);background:var(--card);cursor:pointer}
.ufilters button:hover{border-color:var(--accent)}
.ufilters button.on{border-color:var(--accent);color:var(--accent)}
.ufilters .dot{box-shadow:none}.ufilters .dot.none{background:var(--line)}
.selall{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600}
#uwrap td:first-child,#uwrap th:first-child{width:34px}
#uwrap input[type=checkbox]{width:16px;height:16px;accent-color:var(--accent);cursor:pointer}
#uwrap td.uname{white-space:normal;min-width:240px;max-width:420px}
#uwrap td:last-child{white-space:normal;min-width:220px}
#uwrap td:last-child .cnote{margin-top:3px}
.ubar{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:14px;padding:12px 16px;
  background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 -2px 12px rgb(0 0 0/.08)}
.ubar span{font-weight:700;margin-right:auto;font-variant-numeric:tabular-nums}
.ubar:not(.on) .btn{opacity:.45;pointer-events:none}
`;

const SCRIPT = `<script>
(function(){
  var rows = JSON.parse(document.getElementById('udata').textContent);
  var body = document.getElementById('ubody'), sel = new Set(), act = '', q = '', sk = '', sd = 1, shown = rows;
  var PDP = 'https://www.wayfair.com/pdp/-id-', PH = 'https://partners.wayfair.com/d/catalog/product/';
  var NUMS = ['revenue_90d','units_90d','unique_visits','review_count','avg_rating','base_cost_usd'];
  var CLS = {};
  CLS['Safe to discontinue'] = 'bad';
  CLS['Review'] = 'warn';
  CLS['Keep \\u2014 review equity'] = 'none';
  CLS['Restock \\u2014 demand exists'] = 'good';
  CLS['Restock \\u2014 do not discontinue'] = 'good';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'; }); }
  function n(v){ return typeof v === 'number' ? v : 0; }
  function money(v){ return n(v) ? '$' + n(v).toFixed(2) : '\\u2014'; }
  function dash(v){ return v ? v : '\\u2014'; }
  function link(href, label){ return '<a class="plink" target="_blank" rel="noopener" href="' + href + '">' + esc(label) + '</a>'; }
  function apply(){
    shown = rows.filter(function(r){
      if (act && r.recommended_action !== act) return false;
      if (!q) return true;
      return (r.part + ' ' + r.wayfair_sku + ' ' + r.product_name + ' ' + r.listing).toLowerCase().indexOf(q) > -1;
    });
    if (sk) shown = shown.slice().sort(function(a, b){
      if (NUMS.indexOf(sk) > -1) return (n(a[sk]) - n(b[sk])) * sd;
      return String(a[sk]).localeCompare(String(b[sk])) * sd;
    });
    body.innerHTML = shown.map(function(r){
      return '<tr><td><input type="checkbox" data-p="' + esc(r.part) + '"' + (sel.has(r.part) ? ' checked' : '') + '></td>'
        + '<td><code>' + esc(r.part) + '</code></td>'
        + '<td>' + (r.wayfair_sku ? link(PDP + encodeURIComponent(r.wayfair_sku) + '.html', r.wayfair_sku) : '\\u2014') + '</td>'
        + '<td class="uname" title="' + esc(r.product_name) + '">' + esc(r.product_name || '\\u2014') + '</td>'
        + '<td>' + (r.listing ? link(PH + encodeURIComponent(r.listing), r.listing) : '\\u2014') + '</td>'
        + '<td>' + money(r.revenue_90d) + '</td><td>' + dash(n(r.units_90d)) + '</td><td>' + dash(n(r.unique_visits)) + '</td>'
        + '<td>' + dash(r.avg_rating) + '</td><td>' + dash(n(r.review_count)) + '</td><td>' + money(r.base_cost_usd) + '</td>'
        + '<td><span class="pill ' + (CLS[r.recommended_action] || 'none') + '">' + esc(r.recommended_action) + '</span>'
        + '<span class="cnote">' + esc(r.reason) + '</span></td></tr>';
    }).join('');
    document.getElementById('ucount').textContent = 'Showing ' + shown.length + ' of ' + rows.length + ' parts.';
    syncAll();
    count();
  }
  function syncAll(){
    document.getElementById('uall').checked = shown.length > 0 && shown.every(function(r){ return sel.has(r.part); });
  }
  function count(){
    document.getElementById('usel').textContent = sel.size + ' selected';
    document.getElementById('ubar').classList.toggle('on', sel.size > 0);
  }
  function picked(){ return rows.filter(function(r){ return sel.has(r.part); }); }
  body.addEventListener('change', function(e){
    var cb = e.target.closest('input[data-p]');
    if (!cb) return;
    if (cb.checked) sel.add(cb.dataset.p); else sel.delete(cb.dataset.p);
    syncAll();
    count();
  });
  document.getElementById('uall').addEventListener('change', function(e){
    shown.forEach(function(r){ if (e.target.checked) sel.add(r.part); else sel.delete(r.part); });
    apply();
  });
  document.getElementById('ufilters').addEventListener('click', function(e){
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    act = b.dataset.act;
    [].forEach.call(this.querySelectorAll('button'), function(x){ x.classList.toggle('on', x === b); });
    apply();
  });
  document.getElementById('usearch').addEventListener('input', function(e){
    q = e.target.value.trim().toLowerCase();
    apply();
  });
  document.querySelector('#uwrap thead').addEventListener('click', function(e){
    var b = e.target.closest('button[data-k]');
    if (!b) return;
    sd = sk === b.dataset.k ? -sd : (NUMS.indexOf(b.dataset.k) > -1 ? -1 : 1);
    sk = b.dataset.k;
    [].forEach.call(this.querySelectorAll('button'), function(x){ x.removeAttribute('data-dir'); });
    b.setAttribute('data-dir', sd === 1 ? 'asc' : 'desc');
    apply();
  });
  document.getElementById('ucopy').addEventListener('click', function(){
    var btn = this, text = picked().map(function(r){ return r.part; }).join('\\n');
    var done = function(){
      btn.textContent = 'Copied ' + sel.size + ' parts';
      setTimeout(function(){ btn.textContent = 'Copy selected parts'; }, 2000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function(){ window.prompt('Copy these part numbers:', text); });
    else window.prompt('Copy these part numbers:', text);
  });
  document.getElementById('ucsv').addEventListener('click', function(){
    var p = picked();
    if (!p.length) return;
    var cols = ['part','wayfair_sku','product_name','listing','revenue_90d','units_90d','unique_visits','avg_rating','review_count','base_cost_usd','recommended_action'];
    var csv = [cols.join(',')].concat(p.map(function(r){
      return cols.map(function(c){
        var s = String(r[c] == null ? '' : r[c]);
        return /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    })).join('\\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'wayfair-discontinue-selection.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('uclear').addEventListener('click', function(){ sel.clear(); apply(); });
  apply();
})();
</script>`;

const COLS = [
  ['part', 'Part'], ['wayfair_sku', 'Wayfair SKU'], ['product_name', 'Product'], ['listing', 'Listing'],
  ['revenue_90d', '90d $'], ['units_90d', 'Units'], ['unique_visits', 'Visits'], ['avg_rating', '\u2605'],
  ['review_count', 'Reviews'], ['base_cost_usd', 'Cost'], ['recommended_action', 'Recommendation'],
];

function unpurchasablePage(p, d, { escapeHtml, hero }) {
  const pills = ACTIONS.filter(([a]) => d.counts[a]).map(([a, cls]) =>
    `<button data-act="${escapeHtml(a)}"><i class="dot ${cls}"></i>${escapeHtml(a)} <b>${d.counts[a]}</b></button>`).join('');
  const risk = Number(d.revenue_at_risk_90d || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const head = COLS.map(([k, label]) => `<th><button data-k="${k}">${label}</button></th>`).join('');
  return `${hero(p, 'Unpurchasable parts \u2014 decide what to discontinue')}
<p><a href="/${encodeURIComponent(p.slug)}/">\u2190 All ${escapeHtml(p.name)} analyzers</a></p>
<div class="summary"><div><strong>${d.total} parts have zero available stock</strong>
<div class="muted">Pulled live from Partner Home \u2192 Inventory \u2192 Availability on ${escapeHtml(d.generated)}. Sales, ratings and cost joined from the 22 Sep exports.<br>
Between them these parts took <strong>$${risk}</strong> in the last 90 days before running dry, so part of this list is a restocking job, not a discontinuation job.</div></div></div>
<div class="warnbox"><strong>Discontinuing cannot be undone.</strong> Wayfair has no \u201cdelete forever\u201d \u2014 the action is <em>Discontinue</em>, which permanently withdraws the part from sale and takes its reviews and sales history with it. Tick only what you are sure about, copy the list, and send it back. Nothing is discontinued until you confirm each batch.</div>
<div class="ufilters" id="ufilters"><button class="on" data-act="">All <b>${d.total}</b></button>${pills}</div>
<div class="dl-head"><label class="selall"><input type="checkbox" id="uall"> Select all shown</label>
<div class="dl-tools"><input id="usearch" type="search" placeholder="Search part, SKU, product, listing" autocomplete="off"></div></div>
<div class="dt-wrap" id="uwrap"><table><thead><tr><th></th>${head}</tr></thead><tbody id="ubody"></tbody></table></div>
<p class="muted dl-note" id="ucount"></p>
<div class="ubar" id="ubar"><span id="usel">0 selected</span>
<button class="btn" id="ucopy">Copy selected parts</button>
<button class="btn ghost" id="ucsv">Download selected CSV</button>
<button class="btn ghost" id="uclear">Clear</button></div>
<script type="application/json" id="udata">${JSON.stringify(d.rows).replace(/</g, '\\u003c')}</script>
${SCRIPT}`;
}

module.exports = { loadUnpurchasable, unpurchasablePage, CSS };
