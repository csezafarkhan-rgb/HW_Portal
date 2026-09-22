// Refresh of wayfair/analyzers.json with data re-checked in Partner Home on 22 Sep 2026.
// Run after scripts/wayfair-details.js:  node scripts/wayfair-refresh-2026-09-22.js
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'wayfair', 'analyzers.json');
const a = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const A = a.analyzers;
const PH = 'https://partners.wayfair.com';

a.updated = '2026-09-22';
a.period = 'Aug 2026 vs Aug 2025 · SKU data last 90 days · fulfillment last 4 weeks to 19 Sep';

// ── Portal Health ──
Object.assign(A['portal-health'], {
  score: 70,
  headline: 'Fill rate improving, but 9 exclusivity violations and a new “action required” ticket are open',
  checks: {
    'account-status': { status: 'pass', value: 'Active', note: 'Supplier ID 19440 · HomeWeaversInc · no suspensions' },
    scorecard: { status: 'warn', value: '92.6% fill', note: 'Low Induction Fill Rate alert still open, but up from 87.2% on 19 Sep' },
    'compliance-flags': { status: 'fail', value: '9', note: 'PBSI urgent action: exclusivity violations on the BBE2PC1721 family (listing HSHM2192), 9 colours, all Live' },
    'open-tickets': { status: 'warn', value: '4 open', note: 'New WPI-369776 “Product Question – action required regarding Features” (21 Sep); 2 March tickets still waiting on Wayfair to close' },
    alerts: { status: 'warn', value: '3', note: '8 overdue orders · low fill rate · 1 cancellation in 72h' },
    documents: { status: 'na', note: 'Not visible in Partner Home — check separately' },
  },
  metrics: [
    { label: 'Open tickets', value: 4 },
    { label: 'Action required', value: 1, good: false },
    { label: 'PBSI urgent actions', value: 9, good: false },
    { label: 'Active orders', value: 43 },
  ],
  findings: [
    'Wayfair has raised 9 PBSI urgent actions: exclusivity violations on BBE2PC1721 (Bemis 2-piece set, listing HSHM2192) across 9 colours. These were clear on 19 Sep.',
    'New ticket WPI-369776 (21 Sep) is marked “action required regarding Features” — it needs a reply from Home Weavers.',
    'QAPH-3340280 and QAPH-3331799 remain open; only Wayfair can close them.',
    'Finance ticket DESK-673236 was updated again this morning.',
  ],
  actions: [
    'Open the 9 exclusivity-violation SKUs in Product Management and check where else that set is listed; reply to Wayfair with the correction.',
    'Answer WPI-369776 before its deadline.',
    'Chase Wayfair again on the two March tickets.',
  ],
  scoreNote: '100 − 20 (fill-rate alert open) − 10 (exclusivity violation flagged) = 70.',
  source: 'Home dashboard · Supplier Inbox · Product Management (22 Sep 2026)',
});

// ── Listing Health ──
Object.assign(A['listing-health'], {
  score: 60,
  headline: '95% of products live, but 9 SKUs now carry exclusivity warnings and attributes are still mostly empty',
  checks: {
    'live-rate': { status: 'pass', value: '95.1%', note: '4,452 live + 136 live in some stores of 4,825 active products' },
    suppressed: { status: 'fail', value: '237 SKUs', note: '33 product families Not Live; 3 of them were selling before going offline' },
    warnings: { status: 'fail', value: '9', note: 'Exclusivity violations on the BBE2PC1721 family (was 0 on 19 Sep)' },
    images: { status: 'na', note: 'Image counts not returned by Partner Home for this account' },
    attributes: { status: 'fail', value: '187 median missing', note: '4,261 SKUs (88%) miss > 50 attributes; top-50 sellers miss a median of 133' },
    titles: { status: 'na', note: 'Not scored yet' },
    duplicates: { status: 'pass', value: '0', note: 'No potential-duplicate warnings' },
  },
  scoreNote: '100 − 3.9 (7.7% not fully live × 0.5) − 0.1 (0.2% with warnings × 0.3) − 26.5 (88% missing > 50 attributes × 0.3) − 10 (top-50 sellers missing attributes) = 60.',
  source: 'Product Management — all 4,825 active products, last 90 days (22 Sep 2026)',
});

// ── Promotions ──
Object.assign(A.promotions, {
  headline: 'Way Day and two October events close within days; catalog stays discounted to 19 Nov',
  checks: {
    active: { status: 'pass', value: '8 programs', note: 'Fall Sale (ends today), Q3 Extended Discounts, B2B New Discounts, B2B Bulk Tier, Willow Towels, Inventory Rotation, Closeout Overage, Migrated Closeout' },
    upcoming: { status: 'pass', value: '4 events', note: 'Members Sale 23 Sep · 72 Hour Clearout 26 Sep · Big Furniture Sale 29 Sep · Holiday Deal Week 12 Oct (now submitted)' },
    'ending-soon': { status: 'warn', value: 'Today', note: 'NA Fall Sale ends 22 Sep; Members Sale starts 23 Sep' },
    'sku-coverage': { status: 'warn', value: '100%', note: 'All 4,588 live SKUs discounted every day to 19 Nov' },
    'top-seller-coverage': { status: 'pass', value: '5 / 5', note: 'Top sellers are in every current and upcoming event' },
    'discount-depth': { status: 'warn', value: '10–23% retail', note: 'B2B 12–25%; closeout 30%' },
    performance: { status: 'fail', value: 'No data', note: 'Partner Home still shows no promotion revenue, units, lift or discount' },
    invitations: { status: 'fail', value: '3 open', note: 'WFNA 5 Days of Deals & WFNA 48HR Sale close 25 Sep (3 days); NA Way Day closes 2 Oct. Wayfair recommends 3,687 of your products for each' },
  },
  scoreNote: '100 − 15 (invitations closing within 7 days not submitted) − 15 (catalog discounted every day for the next 60) − 10 (no promotion performance data) = 60.',
  source: 'Promotions (22 Sep 2026) · per-SKU discount terms for all 5,621 parts',
});

// ── Inventory ──
Object.assign(A['inventory-health'], {
  score: 67,
  headline: '1,078 products out of stock — 12 of the top 50 sellers and 17 of the top 100',
  checks: {
    'in-stock-rate': { status: 'warn', value: '77.2%', note: '3,641 of 4,719 active products have stock' },
    'oos-count': { status: 'fail', value: '1,078', note: '152 of them sold $10,040 in the last 90 days (~$3,350 a month)' },
    'top-seller-oos': { status: 'fail', value: '12 / 50', note: '17 of the top 100; includes BWA4PC17212022TC and BLUX2PC1721TC' },
    'feed-freshness': { status: 'warn', value: 'Not re-read', note: 'Feed was current on 19 Sep with 203 SKUs flagged stale; today’s pull returned no stale flags, so this needs a recheck' },
    'lead-time': { status: 'pass', value: '1.5 vs 1.7 days', note: 'Actual vs expected order-to-ship' },
    'warehouse-stock': { status: 'na', value: 'Drop-ship only', note: 'All parts ship from the NJ warehouse; no CastleGate stock' },
  },
  metrics: [
    { label: 'Active products', value: '4,719' },
    { label: 'Out of stock', value: '1,078', good: false },
    { label: 'In-stock rate', value: '77.2%' },
    { label: 'OOS that sold in 90d', value: '152', good: false },
    { label: 'Their 90-day revenue', value: '$10,040', good: false },
    { label: 'Top-50 sellers OOS', value: '12', good: false },
  ],
  scoreNote: 'In-stock rate 77.2 − 10 (top-50 sellers out of stock) = 67.',
  source: 'Home dashboard (22 Sep) · stock rows from the 19 Sep export — Chrome blocked today’s download',
});

// ── Order & Fulfillment ──
Object.assign(A['fulfillment-health'], {
  score: 72,
  headline: 'Induction fill rate up to 92.6%, but 8 orders are stuck waiting for a FedEx scan',
  checks: {
    'active-orders': { status: 'warn', value: 43, note: '28 new to print and ship' },
    overdue: { status: 'fail', value: 8, note: 'All picked up 19 Sep, ship-by 21 Sep, still “awaiting carrier scan”' },
    'on-time': { status: 'pass', value: '0.0% delayed', note: 'Order delay rate 0.0% over 4 weeks' },
    'fill-rate': { status: 'warn', value: '92.6%', note: 'Up from 87.2% on 19 Sep; Wayfair’s alert is still open' },
    cancellations: { status: 'pass', value: '0.1%', note: '1 cancellation in the last 72 hours' },
    tracking: { status: 'pass', value: '99.6%', note: 'ASN fill rate' },
  },
  metrics: [
    { label: 'Orders (4 weeks)', value: '1,177' },
    { label: 'Induction fill rate', value: '92.6%', change: '5.4 pts vs 19 Sep', dir: 'up', good: true },
    { label: 'ASN fill rate', value: '99.6%', good: true },
    { label: 'Overdue orders', value: 8, good: false },
    { label: 'Order-to-ship days', value: '1.5 (target 1.7)', good: true },
    { label: 'Fast-delivery badge', value: '0.5%', good: false },
  ],
  findings: [
    'All 8 overdue orders share one cause: FedEx collected them on 19 Sep but never scanned them, so Wayfair still counts them as unshipped.',
    'Induction fill rate recovered to 92.6%, so the scanning problem is improving but not solved.',
    'Delivery is faster than advertised (4.8 vs 5.3 days), yet only 0.5% of orders carry a fast-delivery badge.',
  ],
  actions: [
    'Send FedEx the 8 order numbers from 19 Sep and ask why they were not scanned at pickup.',
    'Get a scan confirmation at handover each day — this is what Wayfair measures.',
    'Once fill rate holds above ~95%, review lead times to earn fast-delivery badges.',
  ],
  scoreNote: 'Start 92.6 (induction fill rate) − 20 (8 overdue orders, capped) − 0.2 (0.1% cancellations × 2) = 72.',
  source: 'Fulfillment Performance Diagnostic (4 weeks to 19 Sep) · Dropship Orders (22 Sep)',
});

// ── Returns (dashboard showed zeros today — keep 19 Sep values, flagged) ──
A['returns-health'].source = 'Incidents and Resolutions dashboard (18 Mar – 18 Sep 2026). Re-checked 22 Sep: the dashboard returned 0% for every metric, which looks like a Wayfair display fault, so the 19 Sep figures are kept.';

// ── Sales Performance ──
Object.assign(A['sales-performance'], {
  score: 47,
  headline: 'August revenue restated to $21,545 (−25.3% YoY); 72% of live SKUs still sell nothing',
  checks: {
    revenue: { status: 'fail', value: '$21,545', note: '−25.3% vs Aug 2025 (Wayfair restated from $21,696)' },
    units: { status: 'warn', value: '1,362', note: '−5.4% YoY' },
    orders: { status: 'warn', value: '1,223', note: '−7.6% YoY' },
    traffic: { status: 'fail', value: '9,085 visits', note: '−60.0% YoY' },
    conversion: { status: 'pass', value: '6.13%', note: '+116% YoY' },
    'category-mix': { status: 'warn', value: '96.7%', note: 'Bath Rugs & Mats share of August revenue' },
    'zero-sellers': { status: 'fail', value: '3,312', note: '72% of live SKUs had no sales in the last 90 days' },
  },
  metrics: [
    { label: 'Revenue (Aug)', value: '$21,545', change: '25.3% YoY', dir: 'down', good: false },
    { label: 'Units (Aug)', value: '1,362', change: '5.4% YoY', dir: 'down', good: false },
    { label: 'Orders (Aug)', value: '1,223', change: '7.6% YoY', dir: 'down', good: false },
    { label: 'Visits (Aug)', value: '9,085', change: '60.0% YoY', dir: 'down', good: false },
    { label: 'Conversion (Aug)', value: '6.13%', change: '116% YoY', dir: 'up', good: true },
    { label: 'Revenue (last 90 days)', value: '$69,581' },
    { label: 'Units (last 90 days)', value: '4,448' },
    { label: 'SKUs with a sale (90d)', value: '1,346' },
  ],
  scoreNote: '70 − 12.65 (half of −25.3% revenue YoY) − 10 (traffic down > 30%) = 47.',
  source: 'Business Performance (Aug 2026) · Product Management last 90 days (22 Sep 2026)',
});

// ── Advertising: the wallet top-up cleared and spend restarted ──
Object.assign(A.advertising, {
  score: 40,
  headline: 'Ads are running again — wallet $926 — but spend is only ~$10/day and 34 recommendations are unused',
  checks: {
    campaigns: { status: 'warn', value: '3 active', note: 'Campaign table would not load in Partner Home today' },
    scheduled: { status: 'na', value: '0' },
    spend: { status: 'pass', value: '~$574 since 14 Sep', note: 'Wallet went from $1,500 to $926.10' },
    'ad-sales': { status: 'na', value: '—', note: 'Campaign page not loading; recheck once it does' },
    roas: { status: 'na', value: '—', note: 'Not readable today' },
    acos: { status: 'na', value: '—' },
    ctr: { status: 'na', value: '—' },
    cpc: { status: 'na', value: '—' },
    budget: { status: 'warn', value: '~$10/day', note: 'Wayfair estimates 94 days to empty the wallet — far below the $135/day the active campaigns allow' },
    wallet: { status: 'pass', value: '$926.10', note: 'Prepaid invoice cleared. Auto-payments still not set up; $4,000 credit available via voucher deduction' },
    coverage: { status: 'warn', value: 'Unknown', note: 'Campaign products not readable today; “Top Priority SKUs” has not been repointed at the current top 100' },
    recommendations: { status: 'warn', value: '34', note: '1 new-product + 33 high-potential campaigns still not launched' },
  },
  metrics: [
    { label: 'Wallet balance', value: '$926.10', change: 'from $0 on 19 Sep', dir: 'up', good: true },
    { label: 'Spend since 14 Sep', value: '~$574' },
    { label: 'Implied daily spend', value: '~$10', good: false },
    { label: 'Days to empty wallet', value: '94' },
    { label: 'Recommended funding', value: '$5,000' },
  ],
  findings: [
    'The $1,500 top-up cleared and campaigns are serving again — this was the top action from 19 Sep.',
    'Spend is only about $10 a day, so visibility is still a fraction of what the active campaigns allow ($135/day of caps).',
    'Auto-payments are still not configured, so ads will stop again when the wallet empties.',
    'Wayfair’s 34 campaign recommendations are still unused.',
    'The campaign table did not load in Partner Home today, so ROAS could not be re-checked.',
  ],
  actions: [
    'Set up auto-pay by voucher deduction (trigger $300, top-up $1,500) so ads never go dark again.',
    'Raise daily spend towards the $135/day the caps allow, focused on in-stock top sellers.',
    'Launch the 33 high-potential recommendations.',
    'Re-check ROAS when the campaign page loads.',
  ],
  scoreNote: 'Spend has resumed → 50 baseline; − 10 (recommendations not launched) = 40. ROAS unknown, so no ROAS adjustment.',
  source: 'Advertising Wallet (22 Sep 2026); campaign table unavailable',
});

// ── Growth plan, re-ordered for today ──
a.plan = [
  {
    title: 'Fix the FedEx scan problem behind 8 overdue orders',
    impact: 'Protects search ranking', effort: 'Low', check: 'fulfillment-health.overdue',
    why: 'All 8 overdue orders were collected on 19 Sep and never scanned. Wayfair counts them as late, which is what keeps the Low Induction Fill Rate alert open.',
    steps: [
      'Send FedEx the 8 order numbers from 19 Sep and ask why they were not scanned at pickup.',
      'Ask the driver to scan at handover and keep the daily pickup receipt.',
      'Watch induction fill rate weekly; it is already up from 87.2% to 92.6%.',
    ],
    link: `${PH}/d/orders/dropship`, linkLabel: 'Open orders',
  },
  {
    title: 'Restock the 152 out-of-stock SKUs that were selling',
    impact: '~$3,350/mo', effort: 'Medium', check: 'inventory-health.oos-count',
    why: 'They sold $10,040 in the last 90 days and now have zero available. 12 are top-50 sellers.',
    steps: [
      'Open Inventory Health → “Out-of-stock SKUs” (sorted by recent sales) and download the CSV.',
      'Restock the top-50 sellers first, then the rest of the 152.',
      'Submit inventory the day stock lands.',
    ],
    link: `${PH}/d/inventory/availability`, linkLabel: 'Open inventory',
  },
  {
    title: 'Submit to Way Day and the two October sales before the deadlines',
    impact: 'Event traffic in Q4', effort: 'Low', deadline: '25 Sep / 2 Oct', check: 'promotions.invitations',
    why: 'WFNA 5 Days of Deals and WFNA 48HR Sale close on 25 Sep; Way Day closes 2 Oct. Wayfair recommends 3,687 of your products for each.',
    steps: [
      'Submit the in-stock top 100 sellers rather than the whole catalog.',
      'Use a deeper discount for Way Day than the always-on 10%.',
      'Skip out-of-stock SKUs so event traffic lands on products people can buy.',
    ],
    link: `${PH}/d/promotions`, linkLabel: 'Open promotions',
  },
  {
    title: 'Spend the ad wallet: scale to the caps and turn on auto-pay',
    impact: 'Recovers lost traffic', effort: 'Low', check: 'advertising.wallet',
    why: 'Ads are running again but at only ~$10/day against $135/day of caps, while visits are still down 60% YoY.',
    steps: [
      'Set auto-pay (voucher deduction): trigger $300, top-up $1,500.',
      'Launch the Q4 campaign plan in this report on 30 in-stock best sellers.',
      'Launch Wayfair’s 33 high-potential recommendations.',
    ],
    link: 'https://secure.partners.wayfair.com/d/advertising-wallet', linkLabel: 'Open ad wallet',
  },
  {
    title: 'Clear the 9 exclusivity violations',
    impact: 'Avoids delisting', effort: 'Low', check: 'portal-health.compliance-flags',
    why: 'Wayfair raised 9 PBSI urgent actions on the BBE2PC1721 family (listing HSHM2192). Unresolved exclusivity flags can end in suppression.',
    steps: [
      'Open Product Management → the BBE2PC1721 SKUs and read the exclusivity warning detail.',
      'Check where else that set is listed and correct whatever breaks the agreement.',
      'Reply to Wayfair confirming the fix.',
    ],
    link: `${PH}/d/products/product-management/lists/performance`, linkLabel: 'Open products',
  },
  ...a.plan.filter(s => ['listing-health.suppressed', 'sales-performance.conversion', 'listing-health.attributes', 'promotions.sku-coverage', 'sales-performance.zero-sellers', 'reviews.low-rated'].includes(s.check)),
];

fs.writeFileSync(FILE, JSON.stringify(a, null, 2));
const scores = Object.values(A).map(x => x.score);
console.log('analyzers:', scores.length, '· overall:', Math.round(scores.reduce((s, x) => s + x) / scores.length), '· plan steps:', a.plan.length);
