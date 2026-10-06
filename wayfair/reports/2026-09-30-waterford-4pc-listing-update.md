# Waterford 4-Piece (FBWX1454) — listing update

**Date:** 30 Sep 2026 · Listing FBWX1454 · Source: `Waterford HW_PIM 2026.xlsx`

---

## DONE — copy is live on 18 SKUs

Uploaded via Product Management → Update from File → Bulk Update Product Names, Descriptions &
Feature Bullets. Import Center confirms: **Complete, 18 imported, 18 submitted, 0 errors.**

### New title (per colour)

> Waterford 4 Piece Cotton Bath Rug Set with Lid Cover, Non-Slip, **[Colour]**

67–76 characters, down from 180. The old titles were keyword-stuffed and **inconsistent between
colours** — some said "100% Cotton Bath Rug", others "100% Cotton Tufted Bath Rug", others
"Cotton Tufted Bath Rug"; some "Soft", others "Extra Soft". All 18 now match.

### New description

Opens with the contents, which is the fix for WPI-371528:

> The Waterford 4 Piece Bath Rug Set includes everything you need to finish the bathroom in one
> purchase: a 22" x 60" runner bath rug, a 21" x 34" bath rug, a 20" x 20" contour rug shaped to
> fit around the base of the toilet, and an 18" x 18" toilet lid cover.

Then three short paragraphs: cotton construction and absorbency, non-slip latex backing, machine
washable and colour range. The old description was a **single-rug blurb** that never listed the
set contents.

### New bullets

1. **COMPLETE 4 PIECE SET** — names all four pieces with sizes
2. **SOFT 100% COTTON, HIGHLY ABSORBENT**
3. **NON-SLIP LATEX BACKING** — tile, hardwood, vinyl, linoleum
4. **MACHINE WASHABLE, QUICK DRY**
5. **FITS ANY BATHROOM** — solid colours, four sizes

Dropped the old BP4 ("Variety of Colors and Designs"), which was not a product benefit.

Change reasons submitted: naming "7 - Requested or Confirmed by Supplier", copy
"3 - Removed / updated potentially inaccurate information", citing WPI-371528.

---

## Import log — all four Complete, zero errors

| File | Type | Time | Imported |
|---|---|---|---:|
| Waterford_4PC_Copy_Update.xlsx | Product Description | 11:07 | 18 / 18 |
| Waterford_4PC_Media_Upload.xlsx | Product Media | 11:26 | 198 / 198 |
| Waterford_SA_Copy_Update.xlsx | Product Description | 11:32 | 1 / 1 |
| Waterford_SA_Media_Upload.xlsx | Product Media | 11:35 | 11 / 11 |

**All 19 live SKUs on FBWX1454 now carry the new copy and 11 new images each (209 total).**

### SA = GR, resolved

Confirmed: **BWA4PC18202122SA is the Green colourway** — the same product the PIM calls GR.
Evidence beyond your word: every existing SA image on Wayfair is named for green —
`green_back.jpg`, `waterford_green_info_1.jpg`, `waterford_swatch_green.jpg`,
`waterford-backing-gr.jpg`. So the GR photography is the correct photography for SA.

SA now reads *"Waterford 4 Piece Cotton Bath Rug Set with Lid Cover, Non-Slip, Green"* and has
the 11 GR images.

**A trap worth recording:** the SA update had to be built from a *stripped* file. The template
exported at 11:00 still held the OLD titles for the other 18 SKUs, so re-importing it whole
would have silently reverted the work done at 11:07. Every data row except SA was deleted from
that file before upload. **Any future single-SKU fix on this listing must either re-export
first or be stripped the same way.**

---

## Original notes on the two SKUs

| | |
|---|---|
| **BWA4PC18202122GR** (Green) | In the PIM. **Not on Wayfair at all** — not in the catalogue, not in the export. Nothing to update. |
| **BWA4PC18202122SA** | **Live on Wayfair.** Not in your list and **not in the PIM** — no copy, no colour name, no images. I left it untouched. |

So FBWX1454 has 19 live SKUs, but only 18 of yours exist. SA is now the odd one out: it still
carries the old 180-character title while its 18 siblings have the new one.

**Need from you:** is SA meant to be there? If it should stay, I need its colour name and image
set. If GR should be live, that is a new-product submission, not an update.

### 2. Images — step 1 DONE, step 2 awaiting your check

**Uploaded 30 Sep, 11:26 AM. Import Center: Complete, 198 imported, 198 submitted, 0 errors.**

- 198 rows = 18 SKUs x 11 images, all set `Active = Yes`
- One lead-eligible (primary) image per SKU — the WBG studio shot
- The 532 existing media rows were left with a **blank action**, so nothing was removed

**Step 2 is not done.** Once you have eyeballed the new images on the live listings, say the word
and I will run the second file to deactivate the 532 old associations. Wayfair may take a few
hours to render the new images on the PDP.

---

### Original plan (for the record)

Prepared and validated:

- **209 image URLs** from the PIM across the 18 SKUs — **all 191 unique links checked, every one
  returns a live JPEG.** Zero dead links.
- 11 images per SKU: WBG, WBG1, F1, SI, DIM, Multiple Sizes, Absorbent, Backing, Wash, Shade, Swatch
- LIV and F3 are empty for all 19 in the PIM — consistent, not a per-SKU gap

Against the existing media on Wayfair:

| | |
|---|---|
| Existing media rows | **532** across the 19 SKUs |
| Currently **active** (showing on site) | **248** |
| Inactive | 284 |

**Why I stopped:** doing this in one file means ~530 DELETE rows and ~198 UPLOAD rows. If the
uploads fail validation but the deletes succeed, **18 live listings are left with no images.**
The import runs both in one pass and I cannot control the order.

**Safer sequence I recommend:**
1. Upload the 198 new images first, set active.
2. Confirm they are live on the SKUs.
3. Then deactivate/delete the old 532 in a second file.

Two imports instead of one, and at no point is a listing imageless. Say the word and I will run
step 1 now.

---

## Still outstanding on this listing

- **The dimension image is from a different product.** It shows a 24" x 17" rug, which belongs to
  DRBH6313 (Morissette). On FBWX1454 that rug is 21" x 34". The PIM has a correct DIM image per
  SKU, so the image swap fixes this — another reason to get it done.
- **Tags/attributes are a separate route.** The copy template has no tag field. Tags, Subject
  ("Nautical & Beach, Animals" — wrong, it is a solid set) and Pieces Included ("Bath Rug" —
  omits the contour and lid cover) live in **Bulk Update Product Attributes**. I can export and
  fix those next.
- **Material confirmed as 100% Cotton** in the PIM, so the live spec is correct. That closes the
  open question from the WPI-371528 write-up.

## Files

- `Waterford_4PC_Copy_Update.xlsx` — the file imported (kept for the record)
- Image URL set and per-SKU copy held in the session scratchpad, ready for the media import
