// Build the review list of Wayfair parts that are UNPURCHASABLE, joined with 90-day sales and
// the catalog, with a recommended action per part.
//
// Source of truth is a live pull of phiSupplierPartsInventoryUi from Partner Home ->
// Inventory -> Availability, filtered to purchasabilityStatus === 'UNPURCHASABLE'. That is the
// same set the portal's own "unpurchasable" badge counts. Sales, product names and cost come
// from the 22 Sep exports in wayfair/data/raw.
//
// Usage: node scripts/wayfair-unpurchasable.js <packed-live-file>
// Each line of the packed file holds 10 records separated by '~'; each record is
//   part|listing|wayfairSku|available|inStock|onOrder|sub|retail|cost|phasingOut|forecast3m|aged90
// where sub is U = unavailable, N = not live, B = both.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'wayfair', 'data', 'raw');
const LIVE = process.argv[2];
const GENERATED = '2026-09-25';

function parseCsv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
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

const SUB = { U: 'Out of stock', N: 'Listing not live', B: 'Out of stock and listing not live' };

const live = [];
for (const line of fs.readFileSync(LIVE, 'utf8').split('\n')) {
  for (const rec of line.trim().split('~')) {
    if (!rec) continue;
    const f = rec.split('|');
    live.push({
      part: f[0], listing: f[1], wayfair_sku: f[2],
      available: +f[3] || 0, in_stock: +f[4] || 0, on_order: +f[5] || 0,
      sub: f[6], retail_price: +f[7] || 0, wholesale_cost: +f[8] || 0,
      phasing_out: f[9] === '1', forecast_3m: +f[10] || 0, aged_units_90d: +f[11] || 0,
    });
  }
}

const prod = new Map(), cat = new Map();
for (const r of parseCsv(path.join(RAW, 'wayfair-products-90d.csv'))) prod.set(r.part_number.toUpperCase(), r);
for (const r of parseCsv(path.join(RAW, 'wayfair-catalog.csv'))) cat.set(r.part_number.toUpperCase(), r);

const num = v => { const n = parseFloat(String(v).replace(/[$,%\s]/g, '')); return Number.isFinite(n) ? n : 0; };

const rows = live.map(o => {
  const k = o.part.toUpperCase();
  const p = prod.get(k) || {}, c = cat.get(k) || {};
  const rev = num(p.revenue_90d), units = num(p.units_90d), visits = num(p.unique_visits);
  const reviews = num(p.review_count), rating = num(p.avg_rating);
  const known = prod.has(k) || cat.has(k);

  let action, why;
  if (o.sub === 'N') {
    // Has stock sitting in the warehouse but the listing is switched off - a listing fix, never a discontinue.
    action = 'Reactivate — stock is sitting idle';
    why = `${o.in_stock} units in stock but the listing is not live, so none of it can sell. Reactivate the part.`;
  } else if (units > 0) {
    action = 'Restock — do not discontinue';
    why = `Sold ${units} unit${units === 1 ? '' : 's'} / $${rev.toFixed(2)} in the last 90 days before running dry.`;
  } else if (o.on_order > 0) {
    action = 'Restock — already inbound';
    why = `${o.on_order} units already on order. Stock is coming, do not discontinue.`;
  } else if (o.forecast_3m >= 3) {
    action = 'Restock — demand forecast';
    why = `Wayfair forecasts ${o.forecast_3m} units over the next 3 months. Discontinuing forfeits that.`;
  } else if (visits >= 50) {
    action = 'Restock — demand exists';
    why = `${visits} visits in 90 days with nothing to sell. Losing traffic, not demand.`;
  } else if (reviews >= 3 && rating >= 4) {
    action = 'Keep — review equity';
    why = `${reviews} reviews at ${rating.toFixed(1)}★. Discontinuing throws away the review history.`;
  } else if (visits > 0 || o.forecast_3m > 0) {
    action = 'Review';
    why = `No sales in 90 days${visits ? `, but ${visits} visits` : ''}${o.forecast_3m ? `, forecast ${o.forecast_3m} units` : ''}. Decide on margin.`;
  } else {
    action = 'Safe to discontinue';
    why = 'No sales, no visits and no forecast demand.';
  }
  if (!known && o.sub !== 'N') {
    action = 'Safe to discontinue';
    why = 'Not present in the 90-day sales or catalog export — dead part.';
  }
  if (o.phasing_out) why += ' Already flagged as phasing out.';

  return {
    part: o.part,
    listing: o.listing || p.listing_sku || c.listing_sku || '',
    wayfair_sku: o.wayfair_sku,
    product_name: c.product_name || '',
    class: c.class || '',
    why_unpurchasable: SUB[o.sub] || 'Unknown',
    available: o.available, in_stock: o.in_stock, on_order: o.on_order,
    revenue_90d: rev, units_90d: units, unique_visits: visits,
    avg_rating: rating || '', review_count: reviews,
    forecast_3m: o.forecast_3m,
    retail_price: o.retail_price, base_cost_usd: o.wholesale_cost,
    recommended_action: action, reason: why,
  };
});

const RANK = [
  'Safe to discontinue', 'Review', 'Keep — review equity', 'Reactivate — stock is sitting idle',
  'Restock — demand exists', 'Restock — demand forecast', 'Restock — already inbound', 'Restock — do not discontinue',
];
rows.sort((a, b) =>
  (RANK.indexOf(a.recommended_action) - RANK.indexOf(b.recommended_action)) ||
  (b.revenue_90d - a.revenue_90d) || a.part.localeCompare(b.part));

const counts = {};
for (const r of rows) counts[r.recommended_action] = (counts[r.recommended_action] || 0) + 1;
const lostRev = rows.filter(r => r.units_90d > 0).reduce((s, r) => s + r.revenue_90d, 0);
const idleStock = rows.filter(r => r.why_unpurchasable === 'Listing not live')
  .reduce((s, r) => s + r.in_stock * r.base_cost_usd, 0);

const payload = {
  generated: GENERATED,
  source: 'phiSupplierPartsInventoryUi live pull (purchasabilityStatus = UNPURCHASABLE) + 90-day products export (22 Sep) + catalog (22 Sep)',
  total: rows.length,
  counts,
  revenue_at_risk_90d: +lostRev.toFixed(2),
  idle_stock_value: +idleStock.toFixed(2),
  rows,
};

const cols = Object.keys(rows[0]);
const esc = v => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const outDir = path.join(ROOT, 'wayfair', 'data', 'exports');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `wayfair-unpurchasable-${GENERATED}.csv`),
  [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n') + '\n');
fs.writeFileSync(path.join(outDir, `wayfair-unpurchasable-${GENERATED}.json`), JSON.stringify(payload, null, 1));
// The site reads this copy; exports/ is gitignored, so Render would never see the file there.
fs.writeFileSync(path.join(ROOT, 'wayfair', 'unpurchasable.json'), JSON.stringify(payload));

console.log('total', rows.length);
console.log(counts);
console.log('90d revenue from parts that sold before running dry: $' + lostRev.toFixed(2));
console.log('idle stock value behind dead listings: $' + idleStock.toFixed(2));
console.log('listings affected', new Set(rows.map(r => r.listing)).size);
