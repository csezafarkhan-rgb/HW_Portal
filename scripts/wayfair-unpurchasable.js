// Build the review list of Wayfair parts with zero available stock ("unpurchasable"),
// joined with 90-day sales, catalog cost and the Wayfair SKU, with a recommended action.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'wayfair', 'data', 'raw');
const OOS_SRC = process.argv[2];

function parseCsv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

const oos = [];
for (const line of fs.readFileSync(OOS_SRC, 'utf8').split('\n')) {
  for (const pair of line.trim().split(';')) {
    if (!pair) continue;
    const [part, listing] = pair.split('~');
    oos.push({ part: part.trim(), listing: (listing || '').trim() });
  }
}

const prod = new Map(), cat = new Map(), wfsku = new Map();
for (const r of parseCsv(path.join(RAW, 'wayfair-products-90d.csv'))) prod.set(r.part_number.toUpperCase(), r);
for (const r of parseCsv(path.join(RAW, 'wayfair-catalog.csv'))) cat.set(r.part_number.toUpperCase(), r);
for (const r of parseCsv(path.join(RAW, 'wayfair-skus.csv'))) if (r.wayfair_sku) wfsku.set(r.part_number.toUpperCase(), r.wayfair_sku);

const num = v => { const n = parseFloat(String(v).replace(/[$,%\s]/g, '')); return Number.isFinite(n) ? n : 0; };

const rows = oos.map(o => {
  const k = o.part.toUpperCase();
  const p = prod.get(k) || {}, c = cat.get(k) || {};
  const rev = num(p.revenue_90d), units = num(p.units_90d), visits = num(p.unique_visits);
  const reviews = num(p.review_count), rating = num(p.avg_rating);
  const inCatalog = cat.has(k) || prod.has(k);

  let action, why;
  if (units > 0) {
    action = 'Restock — do not discontinue';
    why = `Sold ${units} unit${units === 1 ? '' : 's'} / $${rev.toFixed(2)} in the last 90 days while out of stock.`;
  } else if (visits >= 50) {
    action = 'Restock — demand exists';
    why = `${visits} visits in 90 days with no stock to sell. Losing traffic, not demand.`;
  } else if (reviews >= 3 && rating >= 4) {
    action = 'Keep — review equity';
    why = `${reviews} reviews at ${rating.toFixed(1)}★. Discontinuing throws away the review history.`;
  } else if (visits > 0) {
    action = 'Review';
    why = `No sales in 90 days but ${visits} visits. Decide on margin.`;
  } else {
    action = 'Safe to discontinue';
    why = 'No sales, no units, no visits in the last 90 days.';
  }
  if (!inCatalog) { action = 'Safe to discontinue'; why = 'Not present in the 90-day sales or catalog export — dead part.'; }

  return {
    part: o.part,
    listing: o.listing || p.listing_sku || c.listing_sku || '',
    wayfair_sku: wfsku.get(k) || '',
    product_name: c.product_name || '',
    class: c.class || '',
    status: p.status || c.status || 'unknown',
    revenue_90d: rev, units_90d: units, unique_visits: visits,
    avg_rating: rating || '', review_count: reviews,
    base_cost_usd: num(c.base_cost_usd) || '',
    on_closeout: c.on_closeout || '',
    recommended_action: action, reason: why,
  };
});

const rank = { 'Safe to discontinue': 0, 'Review': 1, 'Keep — review equity': 2, 'Restock — demand exists': 3, 'Restock — do not discontinue': 4 };
rows.sort((a, b) => (rank[a.recommended_action] - rank[b.recommended_action]) || (b.revenue_90d - a.revenue_90d) || a.part.localeCompare(b.part));

const cols = Object.keys(rows[0]);
const esc = v => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const outDir = path.join(ROOT, 'wayfair', 'data', 'exports');
fs.mkdirSync(outDir, { recursive: true });
const csvPath = path.join(outDir, 'wayfair-unpurchasable-2026-09-25.csv');
fs.writeFileSync(csvPath, [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n') + '\n');

const counts = {};
for (const r of rows) counts[r.recommended_action] = (counts[r.recommended_action] || 0) + 1;
const lostRev = rows.filter(r => r.units_90d > 0).reduce((s, r) => s + r.revenue_90d, 0);

const payload = { generated: '2026-09-25', source: 'phiSupplierPartsInventoryUi (live) + 90-day products export (22 Sep) + catalog (22 Sep)', total: rows.length, counts, revenue_at_risk_90d: +lostRev.toFixed(2), rows };
fs.writeFileSync(path.join(outDir, 'wayfair-unpurchasable-2026-09-25.json'), JSON.stringify(payload, null, 1));
// The site reads this copy; exports/ is gitignored, so Render would never see the file there.
fs.writeFileSync(path.join(ROOT, 'wayfair', 'unpurchasable.json'), JSON.stringify(payload));

console.log('total', rows.length);
console.log(counts);
console.log('90d revenue from parts that sold while out of stock: $' + lostRev.toFixed(2));
console.log('listings affected', new Set(rows.map(r => r.listing)).size);
console.log('wayfair sku known for', rows.filter(r => r.wayfair_sku).length);
console.log(csvPath);
