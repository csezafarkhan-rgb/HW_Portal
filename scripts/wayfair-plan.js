// Applies inventory corrections (from the full stock export) and the ranked growth plan to wayfair/analyzers.json.
// Run after scripts/wayfair-details.js:  node scripts/wayfair-plan.js
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'wayfair', 'analyzers.json');
const a = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const PH = 'https://partners.wayfair.com';

// ── Inventory: corrected with the full stock export (4,719 active parts) ──
Object.assign(a.analyzers['inventory-health'], {
  score: 67,
  headline: '1,080 active products are out of stock — including 12 of the top 50 sellers',
  checks: {
    'in-stock-rate': { status: 'warn', value: '77.1%', note: '3,639 of 4,719 active products have stock available' },
    'oos-count': { status: 'fail', value: '1,080', note: '155 of them sold $10,352 in the last 90 days (15% of Wayfair revenue)' },
    'top-seller-oos': { status: 'fail', value: '12 / 50', note: 'Incl. #3 BWA4PC17212022TC and #5 BLUX2PC1721TC' },
    'feed-freshness': { status: 'warn', value: '203 stale', note: 'Feed updated within the hour, but Wayfair flags 203 SKUs as stale inventory (81 of them sold in 90 days)' },
    'lead-time': { status: 'pass', value: '1.6 vs 1.7 days', note: 'Actual vs expected order-to-ship; Wayfair suggests reviewing lead-time settings' },
    'warehouse-stock': { status: 'na', value: 'Drop-ship only', note: 'All 4,719 parts ship from the NJ warehouse — no CastleGate stock' },
  },
  metrics: [
    { label: 'Active products', value: '4,719' },
    { label: 'Out of stock', value: '1,080', good: false },
    { label: 'In-stock rate', value: '77.1%' },
    { label: 'OOS that sold in 90d', value: '155', good: false },
    { label: 'Their 90-day revenue', value: '$10,352', good: false },
    { label: 'Top-50 sellers OOS', value: '12', good: false },
  ],
  findings: [
    '155 out-of-stock SKUs sold $10,352 in the last 90 days — about $3,450 a month of demand that can’t currently be filled.',
    '12 of the top 50 sellers have no stock, including BWA4PC17212022TC ($621 in 90 days), BLUX2PC1721TC ($431, 24 units) and TWI12PC131627YE ($379).',
    '925 out-of-stock products had no sales in 3 months — Wayfair recommends discontinuing them or submitting stock.',
    '120 products are inactive but still show stock in the drop-ship feed (Wayfair: reactivate or submit zero).',
    'Everything ships drop-ship from Home Weavers Inc. NJ 08854; no CastleGate inventory.',
  ],
  actions: [
    'Restock the 155 OOS SKUs that sold recently — start with the 12 top-50 sellers.',
    'Discontinue the out-of-stock SKUs with no sales in 3 months so they stop diluting the catalog.',
    'Clear the 203 stale-inventory flags by re-submitting inventory for those SKUs.',
  ],
  scoreNote: 'In-stock rate 77.1 − 10 (top-50 sellers out of stock) = 67. Feed updated within 24h, so no feed deduction.',
});

// ── Ranked growth plan ──
a.plan = [
  {
    title: 'Top up the ad wallet and turn on auto-pay',
    impact: 'Up to ~$7,100/mo', effort: 'Low', check: 'advertising.wallet',
    why: 'Ads have served nothing for 28+ days and visits are down 60% YoY. August revenue was $7,100 below last year; restoring sponsored visibility is the fastest way to win part of that back.',
    steps: [
      'Confirm prepaid invoice 1581388 ($1,500) has cleared.',
      'Wallet → Set Up Automatic Payments: trigger at $300, top up $1,500.',
      'Raise the wallet daily cap from $100 to at least $135 (sum of active campaign caps).',
      'Point “Top Priority SKUs” at the current top 100 sellers (see Sales Performance → revenue list).',
    ],
    link: 'https://secure.partners.wayfair.com/d/advertising-wallet', linkLabel: 'Open ad wallet',
  },
  {
    title: 'Restock the 155 out-of-stock SKUs that were selling',
    impact: '~$3,450/mo', effort: 'Medium', check: 'inventory-health.oos-count',
    why: 'These SKUs sold $10,352 in the last 90 days and now have zero available. 12 are top-50 sellers.',
    steps: [
      'Open Inventory Health → “Out-of-stock SKUs” (sorted by recent sales) and download the CSV.',
      'Restock the top rows first (BLUX2PC1721TC, BWA4PC17212022TC, BHAM2154GY/NA, BALL3PC172120PI, TWI12PC131627YE…).',
      'Submit inventory in Partner Home the same day stock lands.',
    ],
    link: `${PH}/d/inventory/availability`, linkLabel: 'Open inventory',
  },
  {
    title: 'Relist the three Not Live families that were selling',
    impact: '~$700/mo', effort: 'Low', check: 'listing-health.suppressed',
    why: 'FBWX1917 (Bruss Luxury, 44 variants), OPCO4702 and FBWX1956 sold $2,101 in 90 days before going offline.',
    steps: [
      'Product Management → filter Status: Not Live → search FBWX1917, OPCO4702, FBWX1956.',
      'Check the reason shown (stock, compliance, content) and fix it; submit inventory if it is a stock issue.',
    ],
    link: `${PH}/d/products/product-management/lists/performance?statuses=unpurchasable`, linkLabel: 'Open Not Live products',
  },
  {
    title: 'Submit best sellers to Way Day, 5 Days of Deals and the October 48HR sales',
    impact: 'Event lift on top sellers', effort: 'Low', deadline: '25 Sep / 2 Oct', check: 'promotions.invitations',
    why: 'Four events are open and not submitted. WFNA 5 Days of Deals and WFNA 48HR Sale close 25 Sep; Way Day and NA 48HR Sale close 2 Oct.',
    steps: [
      'Submit only the top 100 sellers (Promotions → Top 100 sellers list) rather than the whole catalog.',
      'Use a deeper discount for Way Day than the always-on 10% so the event actually stands out.',
    ],
    link: `${PH}/d/promotions`, linkLabel: 'Open promotions',
  },
  {
    title: 'Fix the 263 high-traffic, low-conversion listings',
    impact: 'High (1,000s of visits/mo)', effort: 'Medium', check: 'sales-performance.conversion',
    why: 'These live SKUs get ≥ 50 visits but convert under 1% — e.g. BMO1724PI (1,964 visits, 0.61%), BWA1724LI (1,827, 0.22%). Shoppers find them but don’t buy.',
    steps: [
      'Open Sales Performance → “High traffic, low conversion” and work down the list.',
      'For each: compare price vs similar Wayfair listings, check photos and size/colour accuracy, read the latest reviews.',
      'Fill missing attributes (sizes, materials) so the listing matches filters.',
    ],
    link: `${PH}/d/products/product-management/lists/performance`, linkLabel: 'Open products',
  },
  {
    title: 'Fill missing attributes on the top 100 sellers',
    impact: 'Medium (findability)', effort: 'Medium', check: 'listing-health.attributes',
    why: 'The top 100 SKUs earn 32% of revenue but miss a median of 133 attributes. Attributes power Wayfair filters and search ranking.',
    steps: [
      'Download the Listing Health → attributes list (sorted by revenue).',
      'Product Management → Update from File → download the attribute template for those SKUs, fill it, upload.',
    ],
    link: `${PH}/d/products/product-management/lists/performance`, linkLabel: 'Open products',
  },
  {
    title: 'Stop always-on discounting; test full price',
    impact: '~$2,000/mo margin', effort: 'Low', check: 'promotions.sku-coverage',
    why: 'Every live SKU carries the 10% Q3 Extended discount through 19 Nov, with events stacked on top. Average selling price fell ~20% YoY while units fell only 5%.',
    steps: [
      'Pick 200 steady sellers and remove them from the next extended-discount event.',
      'Compare their conversion and units for 2 weeks against similar SKUs still discounted.',
      'Keep discounts for event days only if full price holds conversion.',
    ],
    link: `${PH}/d/promotions`, linkLabel: 'Open promotions',
  },
  {
    title: 'Prune or fix 3,325 zero-sale SKUs',
    impact: 'Cleaner catalog', effort: 'Medium', check: 'sales-performance.zero-sellers',
    why: '72% of live SKUs sold nothing in 90 days; 883 of them are also out of stock. 387 get ≥ 20 visits and just need a better offer.',
    steps: [
      'Discontinue out-of-stock zero-sellers you won’t restock.',
      'For zero-sellers with ≥ 20 visits, check price and content first.',
    ],
    link: `${PH}/d/inventory/availability`, linkLabel: 'Open inventory',
  },
  {
    title: 'Fix the low-rated families and the #1 seller’s 3.81★',
    impact: 'Conversion lift', effort: 'Medium', check: 'reviews.low-rated',
    why: 'BWA4PC17212022 is the #1 seller but rates 3.81★ across 1,117 reviews; six families rate below 3.5★.',
    steps: [
      'Read the most recent 1–2★ reviews for each family and list the recurring complaint.',
      'Fix the product or the listing (size/colour accuracy), or delist families below 3.3★.',
    ],
    link: `${PH}/d/products/product-management/lists/performance`, linkLabel: 'Open products',
  },
  {
    title: 'Earn fast-delivery badges',
    impact: 'Conversion lift', effort: 'Low',  check: 'fulfillment-health.fill-rate',
    why: 'Orders ship in 1.6 days and arrive in 4.7, yet only 1% show a fast-delivery badge. Fixing carrier induction (87.2%) and lead times unlocks badges.',
    steps: [
      'Get FedEx to scan parcels on pickup day (fixes induction fill rate).',
      'Review lead-time settings; set 1-day handling where the NJ warehouse can meet it.',
    ],
    link: `${PH}/d/fulfillment-performance-dashboard`, linkLabel: 'Open fulfillment dashboard',
  },
];

fs.writeFileSync(FILE, JSON.stringify(a, null, 2));
const scores = Object.values(a.analyzers).map(x => x.score);
console.log('plan steps:', a.plan.length, '· overall:', Math.round(scores.reduce((s, x) => s + x) / scores.length));
