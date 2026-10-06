# Conditional Offers — first use

Date: 3 Oct 2026
Location: Pricing → Promotions → **Offers** (`/d/promotions/offers`), separate from
Promotion Events. HomeWeavers had **0 offers** before today.

## Offer types available

| Type | Trigger |
|---|---|
| Buy More Save More | Quantity tiers |
| Bundle and Save | Specific products bought together |
| Spend and Save | Basket value threshold |
| Coupon | Code-based |

## Constraints found in Buy More Save More

These blocked parts of the requested structure:

| Requested | Possible? |
|---|---|
| Buy 1 → 5% | **No** — quantity options are 2, 3, 4, 5 only |
| Buy 3 → 7% | **No** — percentages are multiples of 5 (5, 10, 15 … 70) |
| Single tier (buy 4 → 10% only) | **No** — Tier 2 is mandatory and cannot be removed |
| Different tiers on different product scopes in one offer | **No** — one scope per offer |

Target audience (Professional B2B / B2C) is chosen independently per offer.

## Product scoping

The picker selects **by listing, and all variants come with it**. The 152 BWA 4-piece and
5-piece set variants were only **8 listings**, so searching the bulk Part Number box with
one part per listing and using `Select All Eligible` was far quicker than pasting 152
part numbers.

Only 1,314 of 6,213 products are eligible (Bath Rugs & Mats, Area Rugs).

## Offer submitted

**Offer ID 211867** — "B2C Sets Buy More Save More Test - Oct 2026" — **Pending Approval**

- B2C only
- 6 October 2026 → 2 November 2026 (the Offers list renders the end as 3 November)
- Tier 1: buy 2+ → 5% off
- Tier 2: buy 4+ → 10% off
- 8 listings / 152 BWA 4PC and 5PC set variants, base cost $49–$84

## Two warnings on the review screen

- The offer discount is **billed on a separate monthly invoice**.
- It is **applied on top of any wholesale cost discounts**.

So it stacks with promotion event discounts. This offer's window covers Way Day Early
Access and the October Clearout, where B2C discounts of 18–20% were submitted — a 4-set
basket during those could reach roughly **28% off**. Worth watching once live.

## Break-even

A quantity tier only discounts baskets that reach the threshold; single-unit orders are
untouched. If *B* is the current number of 2-unit baskets, the new baskets needed to hold
wholesale revenue flat:

| Tier | New baskets needed |
|---|---|
| 5% | +11% of B |
| 10% | +25% |
| 15% | +43% |

## Still open

- An **all-SKU buy 2 → 5%** offer was not created. To avoid overlapping this sets offer,
  scope it to **singles only**.
- The share of current B2C orders already at 2+ units is unknown. That number decides
  whether these offers create baskets or just discount ones that would have happened.
