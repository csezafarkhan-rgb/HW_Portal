# Escalation — why we cannot update media through the PMP tool

**Submitted 5 Oct 2026, 12:18 PM as ENRICH-1492821** (In Progress). Three attachments went with it:
both failed PMP files and a live Import Center screenshot taken the same day.

A second, separate angle from the two media tickets already open. Those ask Wayfair to load the
images for us. **This one asks why the self-service tool fails**, so we stop needing tickets at
all for the next launch.

Route: **Submit a Ticket > Products > Manage Media** (checked 5 Oct — Integrations is for API/EDI,
not the Partner Home UI, so Manage Media remains the right form; it carries the "what prevented
you from using the PMP tool" fields this is about).

## Files to attach

Both are the genuine PMP Media template, exported from Partner Home and filled in — not a
hand-built sheet. Both verified today before attaching.

| File | Parts | Image URL rows | Action | Media type | Lead images | Submitted | Result |
|---|---:|---:|---|---|---:|---|---|
| `Waterford COMBO 4-6-7 247 - Media Upload.xlsx` | 247 | 2,716 | all UPLOAD | all IMAGE | 247 | 1 Oct 5:27 PM | **Failed — 1,523 errors** |
| `Essence 250 - Media Upload.xlsx` | 250 | 2,750 | all UPLOAD | all IMAGE | 250 | 1 Oct 5:16 PM | **Failed — 1,366 errors** |

Both are at `E:\HW Portals\`. Sheet layout is Wayfair's own: `Media`, `DropDownOptions`,
`wf-only-metadata`, 36 columns, data from row 7.

**The point worth making:** each file has exactly one lead-eligible image per part — 247 of 247
and 250 of 250 — every row is `UPLOAD` / `IMAGE`, and every row carries a supplier part number
and a public URL. Structurally there is nothing wrong with them, yet more than half the rows were
rejected and the reasons cannot be retrieved.

## Message

> Hi team,
>
> This is a separate issue from ENRICH-1492404 and ENRICH-1492407, which cover loading the images
> themselves. This ticket is about the PMP tool failing, so that we can do this ourselves in
> future rather than raising a ticket each time.
>
> On 1 October we submitted two media imports through Product Management:
>
> 1. Waterford COMBO 4/6/7 - 247 parts, 2,716 image rows - failed with 1,523 errors
> 2. Essence COMBOS - 250 parts, 2,750 image rows - failed with 1,366 errors
>
> Both files are the PMP Media template exported from Partner Home and filled in without changing
> the structure. Every row is action UPLOAD, media type IMAGE, with a supplier part number and a
> public image URL, and exactly one lead-eligible image per part - 247 of 247 and 250 of 250.
>
> Three questions:
>
> 1. Why did these rows fail? We cannot tell from our side. In the Import Center the Actions
>    column only shows a delete icon - there is no error download, although the page text says to
>    "use the download error function from the Actions column". Could you send the error report
>    for both imports?
>
> 2. Is there a known limit or defect at this volume? Each file is roughly 2,700 rows. Smaller
>    media imports have gone through for us before, so if there is a row cap or a throttle on
>    image fetching, please tell us the safe batch size and we will split accordingly.
>
> 3. Can the error download be enabled on our account? Without it we cannot correct a failed
>    import, which is what forces us to raise media tickets.
>
> Both files are attached exactly as submitted. The Import Center failure screenshot is already on
> ENRICH-1492404.
>
> We have around 5,500 images to load across these two launches and more to come, so getting the
> self-service route working matters more to us than any single batch.
>
> Thank you,
> Zafar K.
> Ecom Manager
> Home Weavers Inc.

## Form fields

- **Have you tried making this update using the PMP tool?** Yes
- **What prevented you from completing the update using the PMP Tool?** I received an error message.
- **More details:** use the first paragraph of the message above, so the summary field is not blank
  this time (ENRICH-1492407 went out with only "Error" in that box).
