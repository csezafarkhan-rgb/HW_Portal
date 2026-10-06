# ENRICH-1491438 — corrected file to post

**Ticket:** ENRICH-1491438 · US - Media - Add New Media · raised 1:34 PM 30 Sep 2026
**Status:** In Progress · Wayfair's estimate: ~45 hours
**Attachment to replace:** `Waterford-ImagesUrls-20260930075216891.xlsx`
**New file:** `Waterford - Images Urls with Swatch Link.xlsx`

---

## What was wrong with the attached file

Your edits to the structure were right — Color in column C, SWATCH as a column instead of a
second sheet, and the picture order you chose. The **Color and Swatch values match the PIM
exactly, all 208 rows, zero differences.**

The problem is the **row-2 labels are off by one against the data for 170 of the 208 rows.**

Row 2 reads: `LIV | WBG | DIM | F1 | F2/SI | ABSORBENT | BACKING | WASH | WBG1 | Shade | Multiple Sizes`

But only **38 rows** actually follow that — the 38 parts that have a LIV lifestyle shot. The
other **170 rows have no LIV**, so everything was packed one column to the left: Lead Image holds
WBG, Picture-2 holds DIM, and so on, with Picture-11 left empty.

| Column | Row-2 label says | 170 rows actually hold |
|---|---|---|
| Lead Image | LIV | **WBG** |
| Picture-2 | WBG | **DIM** |
| Picture-3 | DIM | **F1** |
| Picture-4 | F1 | **F2/SI** |
| … | … | … |
| Picture-11 | Multiple Sizes | **empty** |

Left as is, Wayfair would load the studio shot as the lifestyle lead, the dimension chart as the
studio shot, and drop Multiple Sizes entirely — on 170 of 208 parts.

## What the corrected file does

One consistent order for **every** row, with row 2 matching the data:

`WBG | DIM | F1 | F2/SI | ABSORBENT | BACKING | WASH | WBG1 | Shade | Multiple Sizes | LIV`

- **WBG leads on all 208** — it is the studio shot and the right lead image
- **LIV moved to Picture-11**, filled on the 38 parts that have one, blank on the rest
- Color (column C) and SWATCH (column P) kept exactly as you had them
- The ENRICH-1491438 note kept in the corner

208 rows, single sheet, no separate swatch tab.

---

## Comment to post on ENRICH-1491438

```
Hi Team,

Please use the corrected file attached here instead of the one on the original request.

Waterford - Images Urls with Swatch Link.xlsx

What changed
In the first file the image labels in row 2 did not line up with the URLs for 170 of the 208
rows, so the shots would have been loaded into the wrong slots.
The corrected file uses one consistent order for every row, and row 2 now matches the data
exactly.

Column order in the corrected file
Column A: Wayfair Listing
Column B: Supplier Part Number
Column C: Color
Lead Image: WBG, the studio shot on a white background
Picture-2: DIM, dimensions
Picture-3: F1
Picture-4: F2 / SI
Picture-5: Absorbent
Picture-6: Backing
Picture-7: Wash
Picture-8: WBG1
Picture-9: Shade
Picture-10: Multiple Sizes
Picture-11: LIV, lifestyle. This is filled on 38 parts only. Where it is blank there is no
lifestyle shot for that part, so please leave the slot empty rather than keeping the old image.
Column P: SWATCH, the colour swatch image

Everything else is unchanged. Still 208 parts across the same 11 listings, still a request to
remove all existing image associations first and then load the new images and swatches.

One note on FBWX1454
We uploaded the new images for the 19 parts on FBWX1454 ourselves earlier today, so those are
already in the system. The old images on that listing still need removing.

Thank you,
Zafar K.
Ecom Manager
Home Weavers Inc.
```

---

## Checks run on the corrected file

| Check | Result |
|---|---|
| Rows | 208, one per part |
| Listings | 11, unchanged |
| Part numbers | from PIM column C — green is SA on six listings, GR on four |
| Colour values vs PIM | 208 of 208 match |
| Swatch values vs PIM | 208 of 208 match |
| LIV populated | 38 of 208, in Picture-11 |
| Blank picture cells | 170 — all Picture-11, all genuinely without a lifestyle shot |
| URLs | all 1,174 unique links verified live on 30 Sep |
