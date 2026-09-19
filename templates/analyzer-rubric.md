# Analyzer scoring rubric

Every analyzer scores 0–100 so portals can be compared side by side. Score bands:

| Score | Status | Meaning |
|---|---|---|
| 80–100 | Healthy | No action needed beyond routine monitoring |
| 50–79 | Needs attention | Clear gaps; fix within the next few weeks |
| 0–49 | Critical | Losing sales or at risk of penalties; fix now |

Start at 100 and deduct per analyzer. Record the deductions in `scoreNote` so the score can be audited.

## Portal Health
- −10 per open compliance / catalog suspension flag (max −40)
- −5 per unresolved ticket older than 7 days (max −20)
- −20 if any scorecard metric is below the portal's stated threshold

## Listing Health
- −(share of catalog not live/purchasable × 100) × 0.5
- −(share of live SKUs with warnings/content problems × 100) × 0.3
- −(share of SKUs missing > 50 attributes × 100) × 0.3
- −10 if top-50 sellers have missing images/attributes

## Pricing Health
- −(share of SKUs with price/cost violations × 100) × 0.5
- −15 if no active promotions on top sellers
- −10 if price-competitiveness flags exist on top-50 sellers

## Promotions
- −15 if open promotion invitations close within 7 days and aren't submitted
- −15 if the catalog is under a discount on > 80% of the next 60 days (promo fatigue / margin erosion)
- −20 if top-10 sellers are missing from upcoming events
- −10 if the portal shows no promotion performance data (lift can't be measured)

## Inventory Health
- Score = in-stock rate % across purchasable SKUs, −10 if top-50 sellers have any OOS, −10 if feed older than 24h

## Order & Fulfillment
- Start from the portal's headline on-time metric (Wayfair: induction fill rate; Amazon: on-time delivery; Walmart: on-time shipment)
- −5 per overdue order (max −20); −(cancellation % × 2)

## Returns & Chargebacks
- −(return rate % × 3); −(damage rate % × 3); −10 if chargebacks/fees rising period over period

## Sales Performance
- 70 baseline; +/− half the YoY revenue % change (capped ±30); −10 if traffic down > 30% YoY

## Advertising
- No active campaigns, or no spend in the last 28 days → 30; else 50 + (ROAS − 3) × 10 (capped 0–100); −10 if recommendations unreviewed

## Reviews & Ratings
- (average rating ÷ 5 × 100); −10 if < 20% of top sellers have ≥ 5 reviews
