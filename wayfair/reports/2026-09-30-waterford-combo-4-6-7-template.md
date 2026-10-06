# Waterford Template 1 — new listings for COMBO 4, 6, 7

**File:** `Waterford Product Addition Template - COMBO 4-6-7.xlsx`
**Quick Upload file id:** 1430437 — **0 errors / 0 warnings / 247 Ready**
**Status:** validated only. Not submitted (Zafar submits).

## Scope
247 SKUs, built as three listings (one Group Reference ID each):

| Listing | SKUs | Structure |
|---|---|---|
| WATERFORD-COMBO-4 | 76 | 4 sizes x 19 colours — 2/3/4/5 Piece |
| WATERFORD-COMBO-6 | 76 | 4 sizes x 19 colours — 2/3/4/10 Piece (round rugs) |
| WATERFORD-COMBO-7 | 95 | 5 pair sizes x 19 colours |

One Primary Variant per group; Marketing Copy and all 5 feature bullets are
byte-identical inside each group, as Wayfair's variant rules require.

## Pricing
Base Cost and UPC taken from `BWA SETS Price.xlsx` (DROPSHIP PRICE / NEW_UPC),
247/247 matched. MSRP = base cost x 2.2 rounded to the nearest dollar ending .99
(the median MSRP multiple on the already-listed Waterford sets).

Total base cost across the 247 SKUs: $11,210.

Retail landing points:
- COMBO 4: $21 / $34 / $52 / $70
- COMBO 6: $27 / $41 / $59 / $159
- COMBO 7 pairs: $21 / $27 / $37 / $21 / $21

## Validation history
- First pass: 1,679 errors (default-row overrides, primary-variant rule, carton weight).
- After correcting Wayfair's review file: 448 errors, all Dropbox image-fetch
  failures plus cascade to sibling variants — no structural errors.
- Dropbox `dl.dropboxusercontent.com` throttles Wayfair's fetcher. Pressing
  **Refresh** on the upload row re-fetches the images and clears them in batches:
  247 -> 152 -> 0. No re-upload was needed.

## Copy standards applied
- No colour name in the product title (colour is picked by the customer on site).
- "Spray Latex Backing", never "Non-Slip" — these are cotton sets.
- "100% Cotton" / "Pure Cotton" used as keywords in the copy, not in the title.

## Still open
Template 2 — adding new sets as variants to existing listings:
- COMBO 1: 57 SKUs -> FBWX1607 (currently varies by colour only; needs a second
  variant dimension confirmed before building)
- COMBO 3: 38 SKUs -> target listing undecided (WNPP2016 or DRBH6308)
- COMBO 5: 1 SKU -> WNPP2018
