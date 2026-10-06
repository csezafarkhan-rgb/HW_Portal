# Waterford — the five missing set configurations (COMBO 1 and COMBO 3)

**File:** `Waterford Product Addition Template - COMBO 1-3 SETS.xlsx`
**Quick Upload file id:** 1431021 — **0 errors / 0 warnings / 95 Ready**
**Status:** **SUBMITTED 1 Oct 2026, 95/95.** Zafar submitted; confirmed on the Quick Upload row.
The parts had not yet appeared in Product Management at the time of checking, which is normal
while Wayfair processes a submission.

## Scope

Five set configurations that exist in the PIM but have never been listed. Each is its own
listing varying by colour only, matching how the live Waterford/Morissette set listings are
built. The combo merge was dropped at Zafar's instruction — variation stays set-wise.

| Listing (Group Reference ID) | Set | SKUs | sq ft | Cost | Mult | MSRP | % off |
|---|---|---:|---:|---:|---:|---:|---:|
| WATERFORD-C1-2PC | 18"x18" lid cover + 20"x20" contour | 19 | 5.03 | $21.00 | x2.20 | $45.99 | 40% |
| WATERFORD-C3-2PC | 17"x24" + 20"x20" | 19 | 5.61 | $21.00 | x2.19 | $45.99 | 40% |
| WATERFORD-C1-3PC | 20"x20" + 18"x18" + 10"x22" tank | 19 | 6.56 | $34.00 | x2.18 | $73.99 | 39% |
| WATERFORD-C1-4PC | 17"x24" + 20"x20" + 18"x18" + 10"x22" | 19 | 9.39 | $49.00 | x1.90 | $92.99 | 30% |
| WATERFORD-C3-5PC | 17"x24" + 21"x34" + 20"x20" + 22"x60" + 18"x18" | 19 | 21.99 | $79.00 | x1.80 | $141.99 | 27% |

None of yesterday's 247 COMBO 4/6/7 SKUs are in this file.

Base Cost and UPC are the real values from `BWA SETS Price.xlsx` (DROPSHIP PRICE / NEW_UPC),
95/95 matched, 95 unique UPCs.

## MSRP basis: multiple set per listing

Set explicitly by Zafar on 1 Oct, after reviewing the linear sq-ft taper. MSRP = base cost x the
multiple below, rounded to the nearest dollar ending .99:

| Listing | sq ft | Cost | Multiple | MSRP |
|---|---:|---:|---:|---:|
| C1-2PC | 5.03 | $21 | x2.20 | $45.99 |
| C3-2PC | 5.61 | $21 | x2.19 | $45.99 |
| C1-3PC | 6.56 | $34 | x2.18 | $73.99 |
| C1-4PC | 9.39 | $49 | x1.90 | $92.99 |
| C3-5PC | 21.99 | $79 | x1.80 | $141.99 |

The multiple still falls as the set gets bigger, but it drops much harder from the 4-piece on than
a straight line between the endpoints would - deliberately, to keep the headline price on the
larger sets realistic. x2.20 and x2.19 land on the same $45.99 because both round to $46.

Checked against Wayfair's retail model (retail ~ 1.32x base cost): every listing clears the gap
needed to display a strikethrough, including the sub-$50 sets which need more than $1 of headroom.
Discount runs 40% on the 2-piece sets down to 27% on the 5-piece.

History: started at a flat x2.2, moved to a linear sq-ft taper (x2.50 then x2.20 then x2.19 at the
small end, to x1.80 at 41.27 sq ft), then replaced for these five by the explicit multiples above.
`wf-sqft-taper.js` still holds the curve if it is wanted for the other combos.

## Two things worth noting in the build

**Pieces Included vs the bath-mat count.** COMBO 1's 2-Piece and 3-Piece sets contain no
17"x24" bath mat, but Wayfair rejects a zero `Number of Bath Mats Included`. The contour mat is
counted as the bath mat for that field only — `Pieces Included` still lists it honestly as
"Contour Mat", so the set is described accurately on site.

**No carton splits needed.** Heaviest set is the 5-piece at 8.4 lb, under the 11 lb carton limit.

## Validation

Final state verified from Wayfair's own review file: **95 of 95 rows hold the per-listing MSRP
above**, no Error Summary sheet, 0 errors.

First pass: 95 error rows — 222 image-URL failures plus 6 cascade, no structural errors.
Cleared by pressing the upload row's **Refresh** button, which re-fetches the throttled Dropbox
images against the same upload id: 95 -> 57 -> 0. No re-upload needed.

## Why the combos were not merged

Zafar's call, but it is also not self-service. Wayfair's Product Grouping Standards article
(help article 3183) lists "consolidating listings" as a Merchandising process and says changes
to existing variant groupings require a **Merchandising Enrichment ticket**. The variant-addition
template is one tab per listing and will not re-parent a live part.

If a merge is ever wanted, three things need settling first:
- the listings sit under three Wayfair-assigned identities — Winston Porter/Morissette, Athyrium
  (FBWX1607) and Waterford (FBWX1454, FBWX1425) — and a merge collapses them to one
- colour names differ between listings (Forest Green vs Bottle Green, Navy vs Navy Blue, Linen vs
  Cotton Linen, Yellow vs Butter, Pink vs Pastel Pink)
- reviews sit on the listing, so the survivor should be the one with the most

## Separately: the containment items are back

All four previously paused listings now read Live across every part, and a Not Live filter
returns 0 for each: FBWX1917 44/44, OPCO4702 36/36, FBWX1956 26/26, FBWX2072 24/24 — 130 parts.
The SRM relisting request that followed the POA email to Ben went through. A storefront
spot-check was blocked by Wayfair's bot check, so this is the portal's status, not a confirmed
buyable page.

## Open

- **The 247 COMBO 4/6/7 SKUs keep the flat x2.2 MSRP for now — Zafar's decision, 1 Oct: let them
  go live first, then revisit.** On the per-listing multiples their larger sets would come down
  (COMBO 6 10-piece $349.99, COMBO 4 5-piece $153.99). Do not change these until they are live.
- The live set listings (COMBO 2, COMBO 3 3pc/4pc, COMBO 5, COMBO 1 5pc) are also on the old
  basis; same hold applies.
- WNPP2018 (COMBO 5, 3 Piece) carries **Sage** on site; the PIM has **Green (BWA3PC172124GR)**
  and no Sage. 19 colours either way, so nothing is missing — but the two colour sets disagree.
