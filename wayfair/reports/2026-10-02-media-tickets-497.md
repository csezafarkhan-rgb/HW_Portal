# Media tickets for the 497 Not Live parts

## Why we are raising tickets

The self-service route failed. Both Product Media imports submitted 1 Oct came back **Failed**:

| File | Submitted | Errors |
|---|---|---:|
| Waterford COMBO 4-6-7 247 - Media Upload.xlsx | 5:27 PM | **1,523** |
| Essence 250 - Media Upload.xlsx | 5:16 PM | **1,366** |

2,889 errors across 5,466 rows. The Import Center page says to "use the download error function
from the Actions column" — but the Actions column only offers a **delete icon**, no error
download, so the per-row reasons are not retrievable.

Given the Waterford sets ticket (ENRICH-1491438 / SAM-19406) is working through its listings
successfully, the same route is the better bet for these.

## The two files

Same layout as the sheet that went to SAM-19406: row 1 headers, row 2 the shot type per column,
data from row 3.

| File | Listings | Parts | Image URLs |
|---|---|---:|---:|
| `Waterford COMBO 4-6-7 247 - Media.xlsx` | FBWX2182, FBWX2183, FBWX2184 | 247 | 2,736 |
| `Essence COMBOS - Media Upload.xlsx` | FBWX2176–FBWX2181 | 250 | 3,000 |

Per-listing counts reconcile exactly against Product Management: Waterford 76 / 95 / 76,
Essence 40 / 40 / 40 / 40 / 50 / 40.

Both files were read back after packaging: no duplicate part numbers, every URL well formed,
every lead image a WBG shot.

## A defect found in the Essence PIM — worth knowing

**The Essence PIM's header row is shifted one column against its own contents.** Verified by
reading the file name behind every URL across all 250 rows:

| Header says | Actually holds |
|---|---|
| LIV | **_WBG — the real lead image** |
| WBG | _WBG1 |
| WBG 1 | _DIM |
| DIM | _SI |
| F1 | _Back |
| F2 | _Closeup |
| F3 | _WASH |
| WASH | _Soft |

COLORVARY / MULTICOLOR / MULTISIZE / SWATCH are correct.

Taken at face value this puts **WBG1 on the listing as the lead image instead of WBG**. The first
build of the Essence sheet had exactly that error; it is corrected by reading those columns by
index rather than by header name. Anything else built off this PIM should be re-checked — it may
also explain the long-standing "MULTISIZES.jpg is dead on Essence" problem.

## Ticket text

### Ticket 1 — Waterford

> **Category:** Products — Media — Add New Media
>
> Hi team,
>
> These 247 parts launched on 30 September and are Not Live, each with a single problem:
> "Missing Images". The image URLs were supplied on the original Product Addition template but
> were never ingested, and a Product Media import on 1 October failed with 1,523 errors that the
> Import Center will not let us download.
>
> Attached is the image URL sheet for all 247 parts across three listings — FBWX2182, FBWX2183
> and FBWX2184 — in the same format as the sheet on ENRICH-1491438. Lead image, ten further
> shots and a swatch per part.
>
> Could you please load these so the listings can go Live?
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

### Ticket 2 — Essence

> **Category:** Products — Media — Add New Media
>
> Hi team,
>
> These 250 parts launched on 30 September and are Not Live, each with a single problem:
> "Missing Images". The image URLs were supplied on the original Product Addition template but
> were never ingested, and a Product Media import on 1 October failed with 1,366 errors that the
> Import Center will not let us download.
>
> Attached is the image URL sheet for all 250 parts across six listings — FBWX2176 to FBWX2181 —
> in the same format as the sheet on ENRICH-1491438. Lead image, ten further shots and a swatch
> per part.
>
> Could you please load these so the listings can go Live?
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.
