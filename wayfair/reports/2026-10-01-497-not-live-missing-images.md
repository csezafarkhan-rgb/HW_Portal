# The 497 "Launched But Not Live" — cause found: no images attached

Checked live in Partner Home, 1 Oct 2026.

## What the 497 are

Exactly the two batches submitted on 30 September:

| Batch | SKUs | Prefix | Verified |
|---|---:|---|---|
| Essence ALL COMBOS | 250 | BMESS* | Not Live filter + search "BMESS" returns **250 Products** |
| Waterford COMBO 4/6/7 | 247 | BWA* | spot check: "BWA10PC" returns **19 Products**, the full 10-piece set |
| **Total** | **497** | | matches the card exactly |

Catalogue is now 5,417 products (was 5,322 — the +95 from today). Not Live is 628, of which
497 launched in the last 30 days; the other 131 are older stock.

## The cause

Every one of them carries the same single problem on its listing page:

> **Missing Images** — "Products without images can't be Live on-site. Please review Wayfair's
> Product Media Requirements & Guidelines and upload images directly in Product Management."

Confirmed on both halves:
- **FBWX2182** (Waterford COMBO 4, 76 variants) — Problems 1, Missing Images. Media tab shows
  **zero** images: both "Wayfair Listing Associations" and "Variant Media" are empty.
- **FBWX2179** (Essence COMBO 1) — Problems 1, Missing Images.

Nothing else is wrong. No content, attribute, compliance or grouping errors. The listings are
built correctly — they simply have no pictures, and Wayfair will not put a product on sale
without one.

## Why this happened, and why today's 95 did not

The Dropbox URLs were never ingested. Quick Upload reported **0 errors** before submission on
both files, because pressing **Refresh** cleared the "Unable to download the file from the
provided URL" errors — but clearing the error flag is not the same as Wayfair having actually
fetched and stored the images. It had not.

Today's 95 Waterford COMBO 1/3 SKUs went Live within about two hours of submission, with
**0 problems** and images attached (FBWX2185). Same Dropbox links, same template, different
outcome — so the links themselves are fine. The difference is that today's file went through
several upload / download-review / re-upload cycles against the same upload id, which gave
Wayfair's fetcher repeated attempts that actually landed.

**The lesson: a clean validation does not prove the images are in. The only reliable check is the
listing's Problems panel after submission.**

## The fix

Images have to be attached after the fact, via **Quick Upload → Upload Media** (the media
association route already used for the Waterford 4PC refresh in September), mapping each part
number to its image URLs.

Scale to watch: 497 parts at roughly 11 images each is about 5,500 fetches — which is exactly
what provoked the Dropbox throttling in the first place. This should go up in batches, and is a
good argument for moving the image hosting off Dropbox for bulk work.

### Files built (1 Oct)

Two Product Media files, one per original submission, both verified by reading back the packaged
workbook:

| File | Parts | Image rows | Lead images | Listings |
|---|---:|---:|---:|---|
| `Essence 250 - Media Upload.xlsx` | 250 | 2,750 | 250 | FBWX2176-2181 |
| `Waterford COMBO 4-6-7 247 - Media Upload.xlsx` | 247 | 2,716 | 247 | FBWX2182, FBWX2183, FBWX2184 |

5,466 image rows in total, 11 per part, every row `UPLOAD` / `IMAGE` with a valid http URL and a
supplier part number. Exactly one lead image per part.

The URLs are taken from the templates that were actually submitted — the main sheet's
`Image File Name or URL 1..5` first (so the lead image stays the lead), then the Additional
Images sheet — so the listings get precisely the imagery they were meant to have.

Group-to-listing mapping was read off Product Management, not assumed, and the per-group counts
reconcile exactly: Essence 40/40/40/40/50/40 = 250, Waterford 76/76/95 = 247.

**One gap:** `BWA2PC1718BL` carries 10 images rather than 11 — it was short one URL on the
original template too, so nothing was lost in this build.

Route to apply: **Product Management → Update from File → Product Media**, the same import type
that ran 198/198 and 11/11 clean on FBWX1454 in September.

## Not part of this

Older Not Live items unrelated to our submissions, e.g. **BDR3212TBL** (listing FBWX2052,
launched 2025-09-05) carries a different problem: **Potential Duplicate**, affecting both
wayfair.com and wayfair.ca. Worth a separate look.
