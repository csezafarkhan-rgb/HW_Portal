# Ticket replies — drafted 5 Oct after the 497 were fixed

Backup of the three replies typed into the Partner Home comment boxes but **not yet posted**.
Held back because the customer-facing PDPs were still returning 404 at 15:00 IST while Partner
Home showed the parts as Live. A scheduled check runs at 19:30 IST to confirm before posting.

---

## ENRICH-1492404 — Waterford (close)

> Hi team,
>
> Please close this ticket - we have resolved it ourselves.
>
> We found the cause. Our media import file had the manufacturerPartId column empty on every row.
> Once we populated it from the Update Product Identifiers export, the same file with the same
> image URLs imported cleanly: 2,716 of 2,716 rows accepted, 0 errors.
>
> All 247 parts across FBWX2182, FBWX2183 and FBWX2184 now have their images and are Live. No
> further action is needed from your team on this ticket, and we are sorry for taking up your time.
>
> One thing we would ask you to pass on. The template marks manufacturerPartId as required only for
> UPDATE and DELETE, but it is clearly required for UPLOAD as well - a blank value fails the row
> with no usable message. Correcting that guidance would save other suppliers the same five days.
>
> The related point about the missing error download is on ENRICH-1492821.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

---

## ENRICH-1492407 — Essence (close)

> Hi team,
>
> Please close this ticket - we have resolved it ourselves.
>
> We found the cause. Our media import file had the manufacturerPartId column empty on every row.
> Once we populated it from the Update Product Identifiers export, the same file with the same
> image URLs imported successfully: 2,700 of 2,750 rows accepted. The 50 remaining were images
> already present from a test upload.
>
> All 250 parts across FBWX2176 to FBWX2181 now have their images and are Live. No further action
> is needed from your team on this ticket, and we are sorry for taking up your time.
>
> One thing we would ask you to pass on. The template marks manufacturerPartId as required only for
> UPDATE and DELETE, but it is clearly required for UPLOAD as well - a blank value fails the row
> with no usable message. Correcting that guidance would save other suppliers the same five days.
>
> The related point about the missing error download is on ENRICH-1492821.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

---

## ENRICH-1492821 — PMP tool (keep open, narrowed)

> Hi team,
>
> An update, and a narrowing of what we are asking for.
>
> We found the cause ourselves. Both files had the manufacturerPartId column empty on every row.
> Once we populated it from the Update Product Identifiers export, the same files with the same
> image URLs imported cleanly - Waterford 2,716 of 2,716 with 0 errors, Essence 2,700 of 2,750.
> All 497 parts are now Live. ENRICH-1492404 and ENRICH-1492407 can be closed.
>
> Two things we would still like from this ticket.
>
> 1. Please enable the error download, or tell us how to reach it. The Import Center says to use
> the download error function in the Actions column, but that column only shows a delete icon - we
> checked again today on a Partially Complete import and there is still no download. Had that
> worked on 1 October we would have seen the cause in minutes instead of five days and three
> tickets.
>
> 2. Please correct the template guidance. manufacturerPartId is labelled Conditional, required for
> UPDATE and DELETE. It is clearly required for UPLOAD too, and a blank value fails the row
> silently. Either make it required in the template or surface a clear message.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

---
---

# VARIANT B — use these if the PDPs are STILL 404 at the 19:30 check

As of 16:00 IST the customer pages still returned "Seems Like We've Rearranged Some Furniture",
while Partner Home showed all 497 Live. A control test on an older product loaded normally
through the same route, so the 404s are real. These versions report the import as fixed but
raise the storefront problem, and **close nothing**.

## ENRICH-1492404 — Waterford (keep open)

> Hi team,
>
> An update, and a new problem.
>
> We resolved the import ourselves using the PMP tool. The cause was on our side: our media file
> had the manufacturerPartId column empty on every row. Once we populated it from the Update
> Product Identifiers export, the same file with the same image URLs imported cleanly - 2,716 of
> 2,716 rows accepted, 0 errors.
>
> All 247 parts across FBWX2182, FBWX2183 and FBWX2184 now have their images attached, and Partner
> Home shows every one of them as Live. The Not Live and Launched But Not Live counts have both
> gone to zero.
>
> However the products are not showing online. Opening the product page from the Listings panel
> returns "Seems Like We've Rearranged Some Furniture" - for example W123833029. We checked an
> older product of ours through the same route and it loads normally, so this is not a problem
> with how we are opening the page.
>
> Could you check why these parts are Live in the catalogue but not reaching the site? Please keep
> this ticket open until they are visible to customers. The Way Day curation deadline is 15 October
> and they cannot be entered into any promotion until they are on site.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

## ENRICH-1492407 — Essence (keep open)

> Hi team,
>
> An update, and a new problem.
>
> We resolved the import ourselves using the PMP tool. The cause was on our side: our media file
> had the manufacturerPartId column empty on every row. Once we populated it from the Update
> Product Identifiers export, the same file with the same image URLs imported successfully - 2,700
> of 2,750 rows accepted, the remainder being images already present from a test upload.
>
> All 250 parts across FBWX2176 to FBWX2181 now have their images attached, and Partner Home shows
> every one of them as Live.
>
> However the products are not showing online. Opening the product page from the Listings panel
> returns "Seems Like We've Rearranged Some Furniture" - for example W123832291. An older product
> of ours opened the same way loads normally, so this is not a problem with how we are opening the
> page.
>
> Could you check why these parts are Live in the catalogue but not reaching the site? Please keep
> this ticket open until they are visible to customers. The Way Day curation deadline is 15 October.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

## ENRICH-1492821 — PMP tool (keep open)

> Hi team,
>
> An update, and a narrowing of what we are asking for.
>
> We found the cause ourselves. Both files had the manufacturerPartId column empty on every row.
> Once we populated it from the Update Product Identifiers export, the same files with the same
> image URLs imported cleanly - Waterford 2,716 of 2,716 with 0 errors, Essence 2,700 of 2,750.
> All 497 parts now have their images and show as Live in Partner Home, though they are not yet
> reaching the site - that is being tracked on ENRICH-1492404 and ENRICH-1492407.
>
> Two things we would still like from this ticket.
>
> 1. Please enable the error download, or tell us how to reach it. The Import Center says to use
> the download error function in the Actions column, but that column only shows a delete icon - we
> checked again today on a Partially Complete import and there is still no download. Had that
> worked on 1 October we would have seen the cause in minutes instead of five days and three
> tickets.
>
> 2. Please correct the template guidance. manufacturerPartId is labelled Conditional, required for
> UPDATE and DELETE. It is clearly required for UPLOAD too, and a blank value fails the row
> silently. Either make it required in the template or surface a clear message.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.
