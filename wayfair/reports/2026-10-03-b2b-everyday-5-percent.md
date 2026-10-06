# Everyday B2B discount → 5% on all

Date: 3 Oct 2026
Source: Pricing Home → B2B Discounts → Active (`/d/pricing-home/discounts/active`)

## Current state

Four active discount projects:

| Project | # | Type | Products | Effective |
|---|---|---|---|---|
| 15% B2B for MOQ 3 | 16548344 | **Quantity** | 4,446 | 13/05/2025 |
| B2B New Discounts | 16604405 | Everyday | 4,769 | 10/10/2025 |
| Inventory Rotation | 16669756 | Everyday | 158 | 15/05/2026 |
| Willow Towels 15 % | 16669757 | Everyday | 341 | 15/05/2026 |

Only the three **Everyday** projects set the everyday rate. `15% B2B for MOQ 3` is a
quantity-break discount and is a separate mechanism.

Everyday rate as it reaches the promo export (4,789 rows):

| Rate | Parts |
|---|---|
| 12% | 3,684 |
| (none) | 606 |
| 15% | 343 |
| 20% | 151 |
| 18% | 5 |

Per-part snapshot saved to `B2B everyday discount - state before change 2026-10-03.csv`
at the repo root — this is the restore list if the change has to be backed out.

## What the portal allows

- The Active list's row actions offer only **End** (bulk selection offers only End too).
  But **View Products** on an active project exposes an editable
  **"Everyday Discount: New %"** per product, which saves on blur — so an active project
  *can* be changed in place, with no gap in B2B pricing and nothing ended.
- Typing into that column one row at a time is not viable at this scale: 10 rows per page,
  5,268 products across the three Everyday projects, and the edit is flaky (one of three
  test edits silently failed to commit).
- The bulk route is **Export Product Spreadsheet → edit → Import Product Spreadsheet**.
  `Import Product Spreadsheet` still cannot be driven by automation (no file input is ever
  created in the DOM), so the import itself has to be done by hand.
- **End is immediate** and takes no date: the dialog is just
  "Would you like to end this B2B Discount containing N product(s)?" — so ending before a
  replacement is live would drop B2B customers to no everyday discount in the meantime.

## Template

`Wayfair_Pricing_B2B Everyday Discounts_<date>.xlsx`, sheet 2:

| Row | Contents |
|---|---|
| 1 | Section headers (Product Details / Pricing Details) |
| 2 | Field keys (`SupplierPartNumber`, `CurrentB2bDiscountPercent`, `B2bDiscountPercent`, …) |
| 3 | Labels |
| 4 | Input rules |
| 5+ | Data |

| Col | Field | Editable |
|---|---|---|
| A | Supplier Part Number | pre-filled |
| D | Current Base Cost | pre-filled |
| E | B2B Everyday Discount: Current % | pre-filled |
| **F** | **B2B Everyday Discount: New %** | **yes** |
| G | B2B Everyday Discount: New Base Cost | yes (left blank so Wayfair derives it) |
| H / I | B2B Quantity Discount current % / min qty | pre-filled |

## What was done

Draft project **16701648** (B2B Everyday Discount, effective 06/10/2026) covers the full
catalogue of **6,213 products**. Its export was filled with **F = 5** on every row and G
left blank:

**`B2B Everyday 5 percent - all products.xlsx`** — 6,213 rows, all at 5%.

Current rates it replaces, across the full catalogue:

| Current | Parts |
|---|---|
| 12% | 4,611 |
| none | 1,103 |
| 15% | 343 |
| 20% | 151 |
| 18% | 5 |

By status: 4,653 Live, 796 Discontinued, 628 Unpurchasable, 136 Live/Some Stores. The
1,103 with no discount today will gain 5%, per "5% everyday on all".

One SKU, **BMIM3PC212417GR**, was set to 5% directly while testing whether in-place editing
persists. It is now at the target rate, so no correction is needed.

## Remaining steps

1. Import `B2B Everyday 5 percent - all products.xlsx` into draft **16701648**
   (Select Products → Import Product Spreadsheet), then Continue → Adjust Details →
   Review → submit.
2. Once that project is **Active** and a sample product reads 5%, end the three old
   Everyday projects: 16604405, 16669756, 16669757. Leave `15% B2B for MOQ 3` (16548344)
   alone — it is a quantity discount, not everyday.

Doing it in this order avoids any window where B2B has no everyday discount.

## Promotion files

With everyday at 5%, the "everyday + 2" lift that shaped the B2B column no longer applies.

| File | Project | Status |
|---|---|---|
| 5 Days of Deals | 23978361 | **No change needed** — already flat 18% / 19% (plus floor step-downs to 10/10 and 7/8); the lift never fired |
| Q3 Priority Product Discounts | 23990071 | **Rebuilt** — B2B was 14 / 17 / 20 / 22% purely from everyday+2 |
| 72 Hour Clearout | 24003445 | Already imported; left as-is |
| Loyalty Way Day Early Access | 24049818 | Already imported; left as-is |

**`Q3 Priority Product Discounts - 8 B2C 10 B2B.xlsx`** — 4,769 rows at 8% B2C / 10% B2B,
20 rows with a base under $8 at 7% / 8%, $8.00 floor respected, cost columns left blank.

---

## Outcome (3 Oct, 12:05)

All three Everyday projects are ended:

| Project | # | Products | Ended by |
|---|---|---|---|
| B2B New Discounts | 16604405 | 4,769 | Zafar |
| Inventory Rotation | 16669756 | 158 | this session |
| Willow Towels 15 % | 16669757 | 341 | this session |

`15% B2B for MOQ 3` (16548344, Quantity, 4,446 products) is **still active** — it is a
volume break, not an everyday rate, and was deliberately left alone.

New project scheduled:

- **B2B Discount 5% Everyday**, project **16701648**
- Everyday, effective **04/10/2026** (3 AM ET)
- **4,769 products**, every "New %" verified at 5

### Gap: 1,444 products not included

The imported file carried the old `B2B New Discounts` product set, so the project covers
4,769 of the catalogue's 6,213. The remaining **1,444** would go live with no everyday
discount at all:

| | Parts |
|---|---|
| Live | 947 |
| Unpurchasable | 497 |
| *of which previously on 15% (the Willow Towels set)* | *341* |
| *of which previously had no everyday discount* | *1,103* |

The 341 Willow Towels parts are the urgent ones — they were on 15% until their project was
ended today, so without a top-up they drop to zero rather than to 5%.

`B2B Everyday 5 percent - remaining 1444.xlsx` holds exactly those 1,444 rows at 5%, ready
to import into a second Everyday project effective 04/10/2026.
`B2B 5 percent - missing products.csv` lists them with status, base cost and prior rate.
