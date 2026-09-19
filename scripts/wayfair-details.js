// Builds the click-through SKU lists for each Wayfair check.
// Input:  wayfair/data/raw/wayfair-products-90d.csv, wayfair-inventory.csv, wayfair-catalog.csv  (Partner Home exports)
// Output: wayfair/details/<analyzer>.<check>.json  →  { title, note, columns, rows }
// Run:    node scripts/wayfair-details.js
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'wayfair');
const RAW = path.join(ROOT, 'data', 'raw');
const OUT = path.join(ROOT, 'details');

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter(r => r.length === head.length).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
const load = f => parseCsv(fs.readFileSync(path.join(RAW, f), 'utf8'));

const products = load('wayfair-products-90d.csv');
const inventory = load('wayfair-inventory.csv');
const catalog = load('wayfair-catalog.csv');

const inv = new Map(inventory.map(r => [r.part_number, r]));
const cat = new Map(catalog.map(r => [r.part_number, r]));
const prod = new Map(products.map(r => [r.part_number, r]));

const n = v => (v === '' || v == null ? null : Number(v));
const money = v => (v == null ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const isLive = s => s === 'Live' || s === 'Live (Some Stores)';
const byRev = (a, b) => n(b.revenue_90d) - n(a.revenue_90d);
const stock = pn => (inv.has(pn) ? Number(inv.get(pn).available) : '—');
const cls = pn => cat.get(pn)?.class || '';
const cost = pn => (cat.get(pn)?.base_cost_usd ? money(cat.get(pn).base_cost_usd) : '—');

// Common product columns
const PCOLS = ['Part #', 'Listing', 'Status', 'Revenue (90d)', 'Units (90d)', 'Visits (90d)', 'Conversion', 'Rating', 'Reviews', 'Available stock'];
const prow = r => [r.part_number, r.listing_sku, r.status, money(n(r.revenue_90d)), n(r.units_90d), n(r.unique_visits), r.conversion_pct ? `${r.conversion_pct}%` : '—', r.avg_rating || '—', n(r.review_count) || 0, stock(r.part_number)];

const out = {};
const add = (key, title, columns, rows, note) => { out[key] = { title, note, columns, rows }; };

// ── Listing Health ─────────────────────────────────────────
add('listing-health.live-rate', 'All active products by status', PCOLS,
  [...products].sort((a, b) => a.status.localeCompare(b.status) || byRev(a, b)).map(prow));
add('listing-health.suppressed', 'Not Live / partly live SKUs', PCOLS,
  products.filter(r => r.status !== 'Live').sort(byRev).map(prow),
  'Sorted by 90-day revenue — SKUs at the top were selling before they went offline.');
add('listing-health.warnings', 'SKUs with warnings or problems', [...PCOLS, 'Warnings', 'Problems'],
  products.filter(r => r.warnings || r.problems).map(r => [...prow(r), r.warnings, r.problems]));
add('listing-health.attributes', 'SKUs missing attributes', ['Part #', 'Listing', 'Status', 'Missing attributes', 'Revenue (90d)', 'Units (90d)', 'Visits (90d)', 'Class'],
  products.filter(r => n(r.attributes_missing) > 0).sort((a, b) => byRev(a, b) || n(b.attributes_missing) - n(a.attributes_missing))
    .map(r => [r.part_number, r.listing_sku, r.status, n(r.attributes_missing), money(n(r.revenue_90d)), n(r.units_90d), n(r.unique_visits), cls(r.part_number)]),
  'Sorted by revenue so the attributes that matter most are fixed first.');
add('listing-health.duplicates', 'Potential duplicates', PCOLS, []);

// ── Pricing Health ─────────────────────────────────────────
const liveCat = catalog.filter(r => isLive(r.status));
const listingOf = r => r.listing_sku || prod.get(r.part_number)?.listing_sku || '';
add('pricing-health.map', 'Live SKUs without MAP', ['Part #', 'Listing', 'Class', 'Product', 'Base cost', 'MSRP', 'Revenue (90d)', 'Units (90d)'],
  liveCat.filter(r => !r.map_usd).map(r => [r.part_number, listingOf(r), r.class, r.product_name, money(n(r.base_cost_usd)), r.msrp_usd ? money(n(r.msrp_usd)) : '—', money(n(prod.get(r.part_number)?.revenue_90d) || 0), n(prod.get(r.part_number)?.units_90d) || 0])
    .sort((a, b) => b[7] - a[7]));
add('pricing-health.violations', 'SKUs with pricing violations', PCOLS, products.filter(r => r.pricing_violation).map(prow));

// ── Promotions ─────────────────────────────────────────────
const PROMO_COLS = ['Part #', 'Listing', 'Status', 'Class', 'Base cost', 'Current retail discounts', 'Upcoming retail events', 'Revenue (90d)', 'Units (90d)'];
const promoRow = r => [r.part_number, listingOf(r), r.status, r.class, money(n(r.base_cost_usd)), r.current_retail_discounts || '—', r.upcoming_retail_events || '—', money(n(prod.get(r.part_number)?.revenue_90d) || 0), n(prod.get(r.part_number)?.units_90d) || 0];
const byUnits = (a, b) => b[8] - a[8];
add('promotions.active', 'SKUs in a current promotion', PROMO_COLS, catalog.filter(r => r.current_retail_discounts).map(promoRow).sort(byUnits));
add('promotions.upcoming', 'SKUs in upcoming events', PROMO_COLS, catalog.filter(r => r.upcoming_retail_events).map(promoRow).sort(byUnits));
add('promotions.ending-soon', 'SKUs in NA Fall Sale (ends 22 Sep)', PROMO_COLS, catalog.filter(r => /Fall Sale/.test(r.current_retail_discounts)).map(promoRow).sort(byUnits));
add('promotions.sku-coverage', 'Live SKUs and their discounts today', PROMO_COLS, liveCat.map(promoRow).sort(byUnits));
const top100 = [...products].sort(byRev).slice(0, 100);
add('promotions.top-seller-coverage', 'Top 100 sellers — promotions', ['#', ...PROMO_COLS],
  top100.map((p, i) => [i + 1, ...promoRow(cat.get(p.part_number) || { part_number: p.part_number, status: p.status })]));
add('promotions.discount-depth', 'Current retail discount per live SKU', PROMO_COLS, liveCat.map(promoRow).sort(byUnits));

// ── Inventory Health ───────────────────────────────────────
const INV_COLS = ['Part #', 'Listing', 'Status', 'Class', 'Available', 'On order', 'Revenue (90d)', 'Units (90d)', 'Visits (90d)', 'Base cost', 'Stale feed', 'Last submitted'];
const invRow = r => { const p = prod.get(r.part_number) || {}; return [r.part_number, r.listing_sku, p.status || r.part_status, cls(r.part_number), n(r.available), n(r.on_order), money(n(p.revenue_90d) || 0), n(p.units_90d) || 0, n(p.unique_visits) || 0, cost(r.part_number), r.stale_inventory || '', (r.last_submitted || '').slice(0, 10)]; };
const byInvRev = (a, b) => b[7] - a[7] || b[8] - a[8];
const oos = inventory.filter(r => !n(r.available));
add('inventory-health.oos-count', 'Out-of-stock SKUs', INV_COLS, oos.map(invRow).sort(byInvRev),
  'Sorted by units sold in the last 90 days — restock the ones at the top first.');
add('inventory-health.in-stock-rate', 'Stock by SKU (all active products)', INV_COLS, inventory.map(invRow).sort(byInvRev));
add('inventory-health.top-seller-oos', 'Top 50 sellers — stock', INV_COLS,
  top100.slice(0, 50).map(p => inv.get(p.part_number)).filter(Boolean).map(invRow));
add('inventory-health.feed-freshness', 'SKUs flagged with stale inventory', INV_COLS, inventory.filter(r => r.stale_inventory).map(invRow).sort(byInvRev));

// ── Sales Performance ──────────────────────────────────────
const liveProducts = products.filter(r => isLive(r.status));
add('sales-performance.revenue', 'All SKUs by revenue (90 days)', PCOLS, [...products].sort(byRev).map(prow));
add('sales-performance.units', 'All SKUs by units (90 days)', PCOLS, [...products].sort((a, b) => n(b.units_90d) - n(a.units_90d)).map(prow));
add('sales-performance.traffic', 'SKUs by visits (90 days)', PCOLS, [...products].sort((a, b) => n(b.unique_visits) - n(a.unique_visits)).map(prow));
add('sales-performance.conversion', 'High traffic, low conversion (≥ 50 visits, < 1%)', PCOLS,
  liveProducts.filter(r => n(r.unique_visits) >= 50 && n(r.conversion_pct) < 1).sort((a, b) => n(b.unique_visits) - n(a.unique_visits)).map(prow),
  'Shoppers are finding these but not buying — check price, photos, reviews and delivery speed.');
add('sales-performance.zero-sellers', 'Live SKUs with no sales in 90 days', [...PCOLS, 'Missing attributes'],
  liveProducts.filter(r => !n(r.units_90d)).sort((a, b) => n(b.unique_visits) - n(a.unique_visits)).map(r => [...prow(r), n(r.attributes_missing)]),
  'Sorted by visits. SKUs with visits but no sales need a better offer; SKUs with no visits need findability (attributes, ads) or pruning.');

// ── Reviews ────────────────────────────────────────────────
const rated = products.filter(r => r.avg_rating);
add('reviews.avg-rating', 'All rated SKUs', PCOLS, [...rated].sort((a, b) => n(a.avg_rating) - n(b.avg_rating)).map(prow));
add('reviews.low-rated', 'SKUs rated below 3.5★', PCOLS, rated.filter(r => n(r.avg_rating) < 3.5).sort((a, b) => n(a.avg_rating) - n(b.avg_rating)).map(prow));
add('reviews.review-volume', 'Live SKUs with fewer than 5 reviews', PCOLS, liveProducts.filter(r => (n(r.review_count) || 0) < 5).sort(byRev).map(prow));

// ── Advertising ────────────────────────────────────────────
add('advertising.coverage', 'Top 100 sellers — no ad coverage', PCOLS, top100.map(prow),
  'None of these are receiving ads while the wallet is empty.');

// ── Tables already in analyzers.json → reuse as click-through lists ──
const analysis = JSON.parse(fs.readFileSync(path.join(ROOT, 'analyzers.json'), 'utf8'));
const table = (a, title) => analysis.analyzers[a]?.tables?.find(t => t.title === title);
const reuse = (key, a, title) => { const t = table(a, title); if (t) out[key] = { title: t.title, note: t.note, columns: t.columns, rows: t.rows }; };
reuse('portal-health.open-tickets', 'portal-health', 'Open tickets');
reuse('fulfillment-health.active-orders', 'fulfillment-health', 'Open orders');
reuse('fulfillment-health.cancellations', 'fulfillment-health', 'Weekly delays & cancellations');
reuse('fulfillment-health.on-time', 'fulfillment-health', 'Weekly delays & cancellations');
reuse('advertising.campaigns', 'advertising', 'All campaigns');
reuse('advertising.wallet', 'advertising', 'Wallet activity (last 7 days)');
reuse('advertising.recommendations', 'advertising', 'Wayfair campaign recommendations');
reuse('sales-performance.category-mix', 'sales-performance', 'Categories (August 2026)');
reuse('promotions.invitations', 'promotions', 'Promotion events calendar');
const openOrders = table('fulfillment-health', 'Open orders');
if (openOrders) out['fulfillment-health.overdue'] = { title: 'Overdue orders', columns: openOrders.columns, rows: openOrders.rows.filter(r => /OVERDUE/.test(r[5])) };

// ── Write ──────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.json')) fs.unlinkSync(path.join(OUT, f));
for (const [key, data] of Object.entries(out)) fs.writeFileSync(path.join(OUT, `${key}.json`), JSON.stringify(data));
// Index the site reads to know which checks can be clicked open and how many rows each has
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(Object.fromEntries(
  Object.entries(out).map(([key, d]) => [key, { title: d.title, count: d.rows.length }]))));

// Facts used by the playbook / growth plan
const sum = (arr, f) => arr.reduce((s, r) => s + (n(f(r)) || 0), 0);
const oosSold = oos.filter(r => n(prod.get(r.part_number)?.units_90d) > 0);
const facts = {
  files: Object.keys(out).length,
  oos: oos.length,
  oosWithSales90d: oosSold.length,
  oosRevenue90d: Math.round(sum(oosSold, r => prod.get(r.part_number)?.revenue_90d)),
  stale: inventory.filter(r => r.stale_inventory).length,
  liveNoMap: liveCat.filter(r => !r.map_usd).length,
  zeroSellersLive: liveProducts.filter(r => !n(r.units_90d)).length,
  zeroSellersWithVisits: liveProducts.filter(r => !n(r.units_90d) && n(r.unique_visits) > 0).length,
  zeroSellersOos: liveProducts.filter(r => !n(r.units_90d) && inv.has(r.part_number) && !n(inv.get(r.part_number).available)).length,
  highTrafficLowConv: liveProducts.filter(r => n(r.unique_visits) >= 50 && n(r.conversion_pct) < 1).length,
  fewReviewsLive: liveProducts.filter(r => (n(r.review_count) || 0) < 5).length,
  top100Revenue90d: Math.round(sum(top100, r => r.revenue_90d)),
  totalRevenue90d: Math.round(sum(products, r => r.revenue_90d)),
};
console.log(JSON.stringify(facts, null, 2));
