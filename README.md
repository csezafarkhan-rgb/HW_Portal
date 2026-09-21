# HW Portals

Analysis of HomeWeavers' marketplace / retailer partner portals — what each portal offers, what data can be pulled from it, and how HomeWeavers is performing there.

## Portals

| Portal | Folder | Status |
|---|---|---|
| Wayfair Partner Home | [wayfair/](wayfair/) | In progress |
| Amazon (Vendor/Seller Central) | — | Planned |

## Layout

```
<portal>/
  reports/       Analysis reports (Markdown / HTML)
  data/          Summarised, non-sensitive data used in reports
  data/raw/      Raw portal exports — NOT committed (see .gitignore)
  screenshots/   Portal screenshots referenced by reports — NOT committed
templates/       Reusable report / portal-map templates for new portals
```

## Report structure (per portal)

1. **Portal feature map** — every section, what it does, what data/exports it provides
2. **Sales & performance** — revenue, units, top/bottom SKUs, trends
3. **Listing quality** — content scores, images, attributes, reviews
4. **Operations** — orders, fulfillment, returns, chargebacks, inventory
5. **Findings & recommended actions**

## How a portal's analysis is built

```
<portal>/data/raw/*.csv        Portal exports (local only, not committed)
                               Wayfair: products-90d, inventory, catalog, skus (part → Wayfair SKU / mplvId)
scripts/<portal>-details.js    → <portal>/details/*.json   click-through SKU list per check (+ index.json)
scripts/<portal>-plan.js       → <portal>/analyzers.json   scores, checks, findings, ranked growth plan
<portal>/playbook.json         Best-solution steps + "Fix in portal" link per check
analyzers.js                   The analyzers and checklists every portal is scored on
templates/analyzer-rubric.md   How scores are calculated
```

Refresh Wayfair after new exports: `node scripts/wayfair-details.js && node scripts/wayfair-plan.js`

## Web viewer (Render)

`server.js` serves `<portal>/reports/*.md|html` behind a login page (signed session cookie, 7-day sessions, 10 failed attempts per IP per 15 min) — nothing else in the repo is exposed. Changing `APP_PASSWORD` signs everyone out.
Deployed as a Render web service (see `render.yaml`) with `APP_USER` / `APP_PASSWORD` env vars set in the Render dashboard.

```bash
npm install
APP_USER=me APP_PASSWORD=secret npm start   # http://localhost:3000
```

## Data handling

Raw exports and screenshots can contain customer PII, pricing and cost data. They stay local and are excluded from git. Keep this repository **private**.
