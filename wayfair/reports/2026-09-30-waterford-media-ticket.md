# Wayfair ticket — replace all Waterford set imagery

**Draft, not raised.** 30 Sep 2026 · SUID 19440
**Attachments:** `Waterford - Images Urls.xlsx`, `Waterford - Swatch Images Urls.xlsx`

---

## Ticket body

```
SUID: 19440 (HomeWeaversInc)
Subject: Replace all product images for the Waterford bath rug sets - 208 parts, 11 listings

We have re-shot the Waterford set range and would like the existing images removed and replaced
with the new ones.

What we are asking for
1. Remove all current image associations on the 208 part numbers listed in the attached file.
2. Upload and associate the new images from the URLs in the same file.
3. Replace the colour swatches from the second attached file.

Attachments
Waterford - Images Urls.xlsx
Column A is the Wayfair Listing, column B the Supplier Part Number, then Lead Image and
Picture-2 to Picture-11. Row 2 names the shot in each column.
208 rows, one per part.

Waterford - Swatch Images Urls.xlsx
Column A is the Wayfair Listing, column B the colour, column C the swatch URL.
208 rows.

Listings affected
DRBH6308, DRBH6313, DRBH6314, FBWX1425, FBWX1454, FBWX1607,
WNPP2016, WNPP2018, WNPP2032, WNPP2041, WNPP2042

Why we are doing this
The current imagery does not show what is in each set, and in at least one case the artwork is
from a different product. On FBWX1454 the dimension image shows a 24" x 17" rug, which belongs
to the Morissette set on DRBH6313. On FBWX1454 that rug is 21" x 34".
This is already the subject of ticket WPI-371528, where a customer did not realise a toilet lid
cover was included in the set.
The new images show every piece in the set with its size labelled, plus the backing, absorbency
and wash shots.

Notes
All URLs are public and were checked on 30 September 2026. Every one returns a JPEG.
Where the Picture-11 column is blank there is no lifestyle shot for that part; please leave that
slot empty rather than keeping the old image.
Part numbers in the file are the Wayfair part numbers. Please note the green colourway is
carried as GR on some listings and SA on others; the file uses whichever applies to each part,
so please load them exactly as given.

Thank you,
Zafar K.
Ecom Manager
Home Weavers Inc.
```

---

## What is in the files

| | Images file | Swatch file |
|---|---:|---:|
| Data rows | **208** | **208** |
| Listings | 11 | 11 |
| Image columns | Lead + Picture-2…11 | Swatch |
| Distinct colours | — | 19 |

**Layout matches the BALL files exactly** — same two header rows, same column names, same order.

Column map in row 2 of the images file:

| Column | Shot |
|---|---|
| Lead Image | WBG (studio, white background) |
| Picture-2 | WBG1 |
| Picture-3 | DIM (dimensions) |
| Picture-4 | F1 |
| Picture-5 | F2 / SI |
| Picture-6 | Absorbent |
| Picture-7 | Backing |
| Picture-8 | Wash |
| Picture-9 | Shade |
| Picture-10 | Multiple Sizes |
| Picture-11 | LIV (lifestyle) — populated on 38 of 208 |

## Checks run before drafting

- **Scope from column C of the PIM**, as you said — 208 of the 551 Waterford set SKUs are listed
  on Wayfair; the other 343 read "NOT LISTED ON WAYFAIR" and are excluded.
- **Part numbers taken from column C, not the item code.** They differ on six rows, all the green
  colourway. Worth knowing: green is carried as **SA** on DRBH6308, DRBH6313, DRBH6314, FBWX1425,
  FBWX1454 and WNPP2016, but as **GR** on FBWX1607, WNPP2032, WNPP2041 and WNPP2042. It is not a
  blanket rename, so the file follows column C row by row.
- **All 1,174 unique URLs tested** — every one returns a live JPEG. Zero dead links.
- Only blanks are Picture-11, where the PIM has no lifestyle shot.

## One thing to decide

This ticket covers **only the sets**. The 190 Waterford **singles** in the PIM are not included.
Say if you want them in the same request and I will extend both files.
