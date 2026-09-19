// Analyzers run for every portal, in display order. Each has a fixed checklist so every portal is checked the same way.
// Results live in <portal>/analyzers.json → { updated, period, analyzers: { <key>: result } }.
// A result: { score 0-100, headline, checks: { <checkId>: { status:'pass'|'warn'|'fail'|'na', value?, note? } },
//             metrics:[{label,value,change?,dir?:'up'|'down'|'flat',good?:bool}],
//             tables:[{ title, columns:[string], rows:[[cell]] }]   ← full detail lists (every promotion, every campaign…)
//             findings:[], actions:[], source, scoreNote? }
// Scoring rubric: templates/analyzer-rubric.md
module.exports = [
  {
    key: 'portal-health', name: 'Portal Health', icon: 'shield',
    desc: 'Account standing, scorecards, compliance flags and open tickets',
    checks: [
      { id: 'account-status', name: 'Account status / standing' },
      { id: 'scorecard', name: 'Supplier scorecard / performance rating' },
      { id: 'compliance-flags', name: 'Compliance & policy warnings' },
      { id: 'open-tickets', name: 'Open support tickets' },
      { id: 'alerts', name: 'Critical alerts & notifications' },
      { id: 'documents', name: 'Certificates, insurance & tax documents current' },
    ],
  },
  {
    key: 'listing-health', name: 'Listing Health', icon: 'list',
    desc: 'Live vs. suppressed SKUs, content quality, images and attributes',
    checks: [
      { id: 'live-rate', name: 'Share of catalog live & purchasable' },
      { id: 'suppressed', name: 'Suppressed / unfindable / failed-to-launch SKUs' },
      { id: 'warnings', name: 'SKUs with warnings or content problems' },
      { id: 'images', name: 'Missing or too few images' },
      { id: 'attributes', name: 'Missing required attributes' },
      { id: 'titles', name: 'Title & description quality' },
      { id: 'duplicates', name: 'Duplicate / variation issues' },
    ],
  },
  {
    key: 'pricing-health', name: 'Pricing Health', icon: 'tag',
    desc: 'Price competitiveness, cost / MAP violations and promotions',
    checks: [
      { id: 'violations', name: 'Cost / price violations' },
      { id: 'competitiveness', name: 'Price competitiveness vs. market' },
      { id: 'map', name: 'MAP compliance' },
      { id: 'pending-changes', name: 'Pending price-change requests' },
    ],
  },
  {
    key: 'promotions', name: 'Promotions', icon: 'gift',
    desc: 'Every current and upcoming promotion — dates, SKUs, discounts and results',
    checks: [
      { id: 'active', name: 'Active promotions' },
      { id: 'upcoming', name: 'Upcoming / scheduled promotions' },
      { id: 'ending-soon', name: 'Promotions ending in the next 7 days' },
      { id: 'sku-coverage', name: 'SKUs covered by a promotion' },
      { id: 'top-seller-coverage', name: 'Top sellers in a promotion' },
      { id: 'discount-depth', name: 'Average discount depth' },
      { id: 'performance', name: 'Promotion sales lift / results' },
      { id: 'invitations', name: 'Open promotion invitations / eligible events' },
    ],
  },
  {
    key: 'inventory-health', name: 'Inventory Health', icon: 'box',
    desc: 'In-stock rate, out-of-stock SKUs and feed freshness',
    checks: [
      { id: 'in-stock-rate', name: 'In-stock rate' },
      { id: 'oos-count', name: 'Out-of-stock SKUs' },
      { id: 'top-seller-oos', name: 'Top sellers out of stock' },
      { id: 'feed-freshness', name: 'Inventory feed last updated' },
      { id: 'lead-time', name: 'Lead / handling time accuracy' },
      { id: 'warehouse-stock', name: 'Marketplace warehouse stock (CastleGate / FBA / WFS)' },
    ],
  },
  {
    key: 'fulfillment-health', name: 'Order & Fulfillment', icon: 'truck',
    desc: 'On-time shipping, overdue orders, cancellations and fill rate',
    checks: [
      { id: 'active-orders', name: 'Active / open orders' },
      { id: 'overdue', name: 'Overdue orders' },
      { id: 'on-time', name: 'On-time ship rate' },
      { id: 'fill-rate', name: 'Fill rate' },
      { id: 'cancellations', name: 'Supplier cancellations' },
      { id: 'tracking', name: 'Valid tracking uploaded' },
    ],
  },
  {
    key: 'returns-health', name: 'Returns & Chargebacks', icon: 'undo',
    desc: 'Return and damage rates, chargebacks and compliance fees',
    checks: [
      { id: 'return-rate', name: 'Return rate' },
      { id: 'damage-rate', name: 'Damage / defect rate' },
      { id: 'pending-rmas', name: 'Pending RMAs' },
      { id: 'chargebacks', name: 'Chargebacks' },
      { id: 'fees', name: 'Compliance fees / deductions' },
    ],
  },
  {
    key: 'sales-performance', name: 'Sales Performance', icon: 'chart',
    desc: 'Revenue, units, traffic, conversion and top / bottom SKUs',
    checks: [
      { id: 'revenue', name: 'Revenue vs. last year' },
      { id: 'units', name: 'Units sold vs. last year' },
      { id: 'orders', name: 'Orders vs. last year' },
      { id: 'traffic', name: 'Customer visits / traffic' },
      { id: 'conversion', name: 'Conversion rate' },
      { id: 'category-mix', name: 'Category concentration' },
      { id: 'zero-sellers', name: 'Live SKUs with no sales' },
    ],
  },
  {
    key: 'advertising', name: 'Advertising', icon: 'mega',
    desc: 'Every campaign — spend, sales, ROAS, clicks, budgets and recommendations',
    checks: [
      { id: 'campaigns', name: 'Active campaigns' },
      { id: 'scheduled', name: 'Scheduled / upcoming campaigns' },
      { id: 'spend', name: 'Ad spend' },
      { id: 'ad-sales', name: 'Ad-attributed sales' },
      { id: 'roas', name: 'Return on ad spend (ROAS)' },
      { id: 'acos', name: 'Ad cost of sales (ACoS)' },
      { id: 'ctr', name: 'Click-through rate (CTR)' },
      { id: 'cpc', name: 'Cost per click (CPC)' },
      { id: 'budget', name: 'Budget utilisation / campaigns capped' },
      { id: 'wallet', name: 'Ad wallet balance' },
      { id: 'coverage', name: 'Top sellers covered by ads' },
      { id: 'recommendations', name: 'Open campaign / budget recommendations' },
    ],
  },
  {
    key: 'reviews', name: 'Reviews & Ratings', icon: 'star',
    desc: 'Average rating, review volume and negative review themes',
    checks: [
      { id: 'avg-rating', name: 'Average rating' },
      { id: 'review-volume', name: 'Top sellers with enough reviews' },
      { id: 'low-rated', name: 'Low-rated SKUs (< 3.5★)' },
      { id: 'themes', name: 'Negative review themes' },
      { id: 'questions', name: 'Unanswered customer questions' },
    ],
  },
];
