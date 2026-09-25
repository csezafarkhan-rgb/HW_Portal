'use strict';
// Unpurchasable review & action list.
//
// Data is built by scripts/wayfair-unpurchasable.js from a live Partner Home inventory pull
// joined with the 90-day sales export and the catalog. Every part here is one Wayfair reports as
// UNPURCHASABLE - either out of stock, or holding stock behind a listing that is not live.
//
// Wayfair has no per-SKU discontinue API. Its tool (Inventory -> Availability -> More Actions ->
// Discontinue or Reactivate Products, i.e. ?show=discontinuation) takes a CSV upload with a single
// "Part Numbers" column. So the row buttons here mark a part for discontinuation or reactivation
// and the page exports Wayfair's exact upload file; the upload itself stays a deliberate human step.
const fs = require('node:fs');
const path = require('node:path');

const WF_TOOL = 'https://partners.wayfair.com/d/inventory/availability?show=discontinuation';

const ACTIONS = [
  ['Safe to discontinue', 'bad'],
  ['Review', 'warn'],
  ['Keep \u2014 review equity', 'none'],
  ['Reactivate \u2014 stock is sitting idle', 'good'],
  ['Restock \u2014 demand exists', 'good'],
  ['Restock \u2014 demand forecast', 'good'],
  ['Restock \u2014 already inbound', 'good'],
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
/* Same page width as every other page; the table columns are percentages so they scale to it. */
.warnbox{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--bad);border-radius:10px;padding:12px 16px;margin:0 0 16px;font-size:14px}
.ufilters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
.ufilters button{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:13px;padding:4px 12px;border:1px solid var(--line);border-radius:999px;color:var(--fg);background:var(--card);cursor:pointer}
.ufilters button:hover{border-color:var(--accent)}
.ufilters button.on{border-color:var(--accent);color:var(--accent)}
.ufilters .dot{box-shadow:none}.ufilters .dot.none{background:var(--line)}
.umark{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px}
.umark b{font-weight:600}
/* No inner scroll box: the whole list scrolls with the page so every part is reachable. */
#uwrap{overflow:visible;border:1px solid var(--line);border-radius:10px;margin-top:10px}
#uwrap table{display:table;table-layout:fixed;width:100%;margin:0;font-size:13.5px}
#uwrap th{position:sticky;top:0;z-index:2;padding:0;border-top:0;background:var(--card)}
#uwrap th button{all:unset;display:block;padding:8px 8px;cursor:pointer;font-weight:600;font-size:12.5px}
#uwrap th button[data-dir=asc]::after{content:" \\25B2"}
#uwrap th button[data-dir=desc]::after{content:" \\25BC"}
#uwrap th.plain{padding:8px;font-size:12.5px}
#uwrap td,#uwrap th{border-left:0;border-right:0;vertical-align:top;overflow-wrap:anywhere}
/* The shared .dt-wrap rule sets white-space:nowrap; long product names and reasons must wrap here. */
#uwrap td,#uwrap td .cnote{padding:7px 8px;white-space:normal}
#uwrap td .cnote{padding:0;margin-top:3px}
#uwrap td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
/* Percentages so the columns always add up to the table width at any window size. */
#uwrap col.c-act{width:8.5%}#uwrap col.c-part{width:9%}#uwrap col.c-sku{width:7%}
#uwrap col.c-name{width:15.5%}#uwrap col.c-list{width:6%}#uwrap col.c-why{width:7%}
#uwrap col.c-n{width:3.6%}#uwrap col.c-money{width:5%}#uwrap col.c-rec{width:15.4%}
#uwrap tr.d-on{background:color-mix(in srgb,var(--bad) 12%,transparent)}
#uwrap tr.r-on{background:color-mix(in srgb,var(--good) 12%,transparent)}
.rowbtns{display:flex;gap:4px}
.rowbtn{font:inherit;font-size:11.5px;font-weight:700;line-height:1;white-space:nowrap;padding:5px 7px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--muted);cursor:pointer}
.rowbtn:hover{border-color:var(--accent);color:var(--accent)}
.rowbtn.d.on{background:var(--bad);border-color:var(--bad);color:var(--card)}
.rowbtn.r.on{background:var(--good);border-color:var(--good);color:var(--card)}
.ubar{position:sticky;bottom:0;z-index:3;display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:14px;padding:12px 16px;
  background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 -2px 12px rgb(0 0 0/.14)}
.ubar .tally{font-weight:700;margin-right:auto;font-variant-numeric:tabular-nums}
.ubar .tally i{font-style:normal;font-weight:600;color:var(--muted)}
.ubar .btn[disabled]{opacity:.4;pointer-events:none}
@media (max-width:720px){#uwrap table{table-layout:auto}#uwrap col{width:auto!important}}
`;

const SCRIPT = `<script>
(function(){
  var rows = JSON.parse(document.getElementById('udata').textContent);
  var body = document.getElementById('ubody');
  var disc = new Set(), react = new Set();
  var act = '', q = '', sk = '', sd = 1, shown = rows;
  var PDP = 'https://www.wayfair.com/pdp/-id-', PH = 'https://partners.wayfair.com/d/product-merchandising/';
  var NUMS = ['available','in_stock','on_order','revenue_90d','units_90d','unique_visits','review_count','avg_rating','forecast_3m','base_cost_usd','retail_price'];
  var CLS = {};
  CLS['Safe to discontinue'] = 'bad';
  CLS['Review'] = 'warn';
  CLS['Keep \\u2014 review equity'] = 'none';
  CLS['Reactivate \\u2014 stock is sitting idle'] = 'good';
  CLS['Restock \\u2014 demand exists'] = 'good';
  CLS['Restock \\u2014 demand forecast'] = 'good';
  CLS['Restock \\u2014 already inbound'] = 'good';
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
      var d = disc.has(r.part), x = react.has(r.part);
      return '<tr class="' + (d ? 'd-on' : x ? 'r-on' : '') + '">'
        + '<td><div class="rowbtns">'
        + '<button class="rowbtn d' + (d ? ' on' : '') + '" data-act="d" data-p="' + esc(r.part) + '" title="Mark this part for discontinuation">Disc</button>'
        + '<button class="rowbtn r' + (x ? ' on' : '') + '" data-act="r" data-p="' + esc(r.part) + '" title="Mark this part for reactivation">React</button>'
        + '</div></td>'
        + '<td><code>' + esc(r.part) + '</code></td>'
        + '<td>' + (r.wayfair_sku ? link(PDP + encodeURIComponent(r.wayfair_sku) + '.html', r.wayfair_sku) : '\\u2014') + '</td>'
        + '<td>' + esc(r.product_name || '\\u2014') + '</td>'
        + '<td>' + (r.listing ? link(PH + encodeURIComponent(r.listing) + '?brand=WF&country=US&locale=en-US', r.listing) : '\\u2014') + '</td>'
        + '<td>' + esc(r.why_unpurchasable) + '</td>'
        + '<td class="num">' + dash(n(r.available)) + '</td>'
        + '<td class="num">' + dash(n(r.in_stock)) + '</td>'
        + '<td class="num">' + dash(n(r.on_order)) + '</td>'
        + '<td class="num">' + money(r.revenue_90d) + '</td>'
        + '<td class="num">' + dash(n(r.units_90d)) + '</td>'
        + '<td class="num">' + dash(n(r.unique_visits)) + '</td>'
        + '<td class="num">' + dash(r.avg_rating) + '</td>'
        + '<td class="num">' + dash(n(r.review_count)) + '</td>'
        + '<td class="num">' + dash(n(r.forecast_3m)) + '</td>'
        + '<td class="num">' + money(r.base_cost_usd) + '</td>'
        + '<td><span class="pill ' + (CLS[r.recommended_action] || 'none') + '">' + esc(r.recommended_action) + '</span>'
        + '<span class="cnote">' + esc(r.reason) + '</span></td></tr>';
    }).join('');
    document.getElementById('ucount').textContent = 'Showing ' + shown.length + ' of ' + rows.length + ' parts. Scroll the page for the rest.';
    tally();
  }
  function tally(){
    document.getElementById('utally').innerHTML =
      '<b>' + disc.size + '</b> to discontinue <i>&middot;</i> <b>' + react.size + '</b> to reactivate';
    document.getElementById('udl').disabled = !disc.size;
    document.getElementById('url').disabled = !react.size;
    document.getElementById('ucopy').disabled = !(disc.size + react.size);
  }
  body.addEventListener('click', function(e){
    var b = e.target.closest('.rowbtn');
    if (!b) return;
    var p = b.dataset.p;
    if (b.dataset.act === 'd') { react.delete(p); if (disc.has(p)) disc.delete(p); else disc.add(p); }
    else { disc.delete(p); if (react.has(p)) react.delete(p); else react.add(p); }
    apply();
  });
  document.getElementById('umarkall').addEventListener('click', function(e){
    var b = e.target.closest('button[data-mark]');
    if (!b) return;
    var m = b.dataset.mark;
    shown.forEach(function(r){
      disc.delete(r.part); react.delete(r.part);
      if (m === 'd') disc.add(r.part);
      else if (m === 'r') react.add(r.part);
    });
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
  // Wayfair's upload template is a single "Part Numbers" column - match it exactly.
  function download(set, name){
    var csv = 'Part Numbers\\n' + Array.from(set).join('\\n') + '\\n';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  document.getElementById('udl').addEventListener('click', function(){ download(disc, 'PartsToDiscontinue.csv'); });
  document.getElementById('url').addEventListener('click', function(){ download(react, 'PartsToReactivate.csv'); });
  document.getElementById('ucopy').addEventListener('click', function(){
    var btn = this, text = '';
    if (disc.size) text += 'DISCONTINUE (' + disc.size + '):\\n' + Array.from(disc).join('\\n') + '\\n';
    if (react.size) text += (text ? '\\n' : '') + 'REACTIVATE (' + react.size + '):\\n' + Array.from(react).join('\\n') + '\\n';
    var done = function(){
      var was = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function(){ btn.textContent = was; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function(){ window.prompt('Copy this list:', text); });
    else window.prompt('Copy this list:', text);
  });
  document.getElementById('uclear').addEventListener('click', function(){ disc.clear(); react.clear(); apply(); });
  apply();
})();
</script>`;

const COLS = [
  ['', 'Action', 'c-act'], ['part', 'Part', 'c-part'], ['wayfair_sku', 'Wayfair SKU', 'c-sku'],
  ['product_name', 'Product', 'c-name'], ['listing', 'Listing', 'c-list'],
  ['why_unpurchasable', 'Why blocked', 'c-why'],
  ['available', 'Avail', 'c-n'], ['in_stock', 'In stock', 'c-n'], ['on_order', 'On order', 'c-n'],
  ['revenue_90d', '90d $', 'c-money'], ['units_90d', 'Units', 'c-n'], ['unique_visits', 'Visits', 'c-n'],
  ['avg_rating', '\u2605', 'c-n'], ['review_count', 'Revws', 'c-n'], ['forecast_3m', 'Fcst', 'c-n'],
  ['base_cost_usd', 'Cost', 'c-money'], ['recommended_action', 'Recommendation', 'c-rec'],
];

function unpurchasablePage(p, d, { escapeHtml, hero }) {
  const money = v => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pills = ACTIONS.filter(([a]) => d.counts[a]).map(([a, cls]) =>
    `<button data-act="${escapeHtml(a)}"><i class="dot ${cls}"></i>${escapeHtml(a)} <b>${d.counts[a]}</b></button>`).join('');
  const cols = COLS.map(([, , cls]) => `<col class="${cls}">`).join('');
  const head = COLS.map(([k, label]) =>
    k ? `<th><button data-k="${k}">${label}</button></th>` : `<th class="plain">${label}</th>`).join('');
  const idle = d.idle_stock_value
    ? `<br>A further <strong>$${money(d.idle_stock_value)}</strong> of stock is sitting behind listings that are not live — that is stock you already own and cannot sell.`
    : '';
  return `${hero(p, 'Unpurchasable parts \u2014 discontinue, reactivate or restock')}
<p><a href="/${encodeURIComponent(p.slug)}/">\u2190 All ${escapeHtml(p.name)} analyzers</a></p>
<div class="summary"><div><strong>${d.total} parts are unpurchasable</strong>
<div class="muted">Live from Partner Home \u2192 Inventory \u2192 Availability on ${escapeHtml(d.generated)} (every part Wayfair flags <code>UNPURCHASABLE</code>). Sales, ratings and cost joined from the 22 Sep exports.<br>
These parts took <strong>$${money(d.revenue_at_risk_90d)}</strong> in the last 90 days before running dry.${idle}</div></div></div>
<div class="warnbox"><strong>Discontinuing cannot be undone from here.</strong> Wayfair has no \u201cdelete forever\u201d and no per-SKU button \u2014 its tool takes a CSV upload of part numbers. <em>Disc</em> and <em>React</em> below only mark a part; nothing reaches Wayfair until someone uploads the file. Discontinuing withdraws the part from sale and takes its reviews and sales history with it, so mark only what you are sure about.</div>
<div class="ufilters" id="ufilters"><button class="on" data-act="">All <b>${d.total}</b></button>${pills}</div>
<div class="dl-head"><div class="umark" id="umarkall">Mark all shown:
<button class="btn ghost" data-mark="d">Discontinue</button>
<button class="btn ghost" data-mark="r">Reactivate</button>
<button class="btn ghost" data-mark="">Clear</button></div>
<div class="dl-tools"><input id="usearch" type="search" placeholder="Search part, SKU, product, listing" autocomplete="off"></div></div>
<div class="dt-wrap" id="uwrap"><table><colgroup>${cols}</colgroup><thead><tr>${head}</tr></thead><tbody id="ubody"></tbody></table></div>
<p class="muted dl-note" id="ucount"></p>
<div class="ubar" id="ubar"><span class="tally" id="utally"></span>
<button class="btn" id="udl" disabled>Download PartsToDiscontinue.csv</button>
<button class="btn" id="url" disabled>Download PartsToReactivate.csv</button>
<button class="btn ghost" id="ucopy" disabled>Copy list</button>
<a class="btn ghost" href="${WF_TOOL}" target="_blank" rel="noopener">Open Wayfair tool</a>
<button class="btn ghost" id="uclear">Clear</button></div>
<script type="application/json" id="udata">${JSON.stringify(d.rows).replace(/</g, '\\u003c')}</script>
${SCRIPT}`;
}

module.exports = { loadUnpurchasable, unpurchasablePage, CSS };
