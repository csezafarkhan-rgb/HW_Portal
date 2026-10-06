# Wayfair ticket — reactivate 106 inactive parts holding stock

**Raise in:** Partner Home → Help / Contact Support (category: EDI & Inventory Management)
**Attach:** `wayfair/data/exports/PartsToReactivate.csv` (106 part numbers)
**Drafted:** 25 Sep 2026

---

## Ticket body

```
SUID: 19440 (HomeWeaversInc)
Subject: 106 parts set to Inactive while holding stock - reactivation not working

Issue 1 - parts are Inactive but still hold drop-ship stock
106 part numbers show Product Status = Inactive in Inventory > Availability.
All of them still hold drop-ship inventory - example: BLUX1724BL has 152 units on hand.
They do not appear under the "Active Products" filter, so they cannot be purchased.
Your own inventory page flags them: "123 Inactive & In Stock in DS - Reactivate or submit zero inv".
Affected listings: FBWX1917 (44 parts), OPCO4702 (36 parts), FBWX1956 (26 parts).
Full part list is attached as a CSV.

Why this matters
These parts took $1,987.21 in revenue and 192 units in the last 90 days while inactive.
They show 0 unique visits and 0 impressions, so they are invisible in search and browse.
They carry review history we do not want to lose - up to 199 reviews at 4.39 stars on OPCO4702.
They are enrolled in current promotions (NA Fall Sale 20%, Semi Annual Members Sale 18%) that they cannot benefit from.
We did not intend to deactivate these parts.

Issue 2 - the Reactivation tool returned a discontinuation message
On 25 Sep 2026 we used Inventory > Availability > More Actions > Discontinue or Reactivate Products.
We selected the Reactivation tab and uploaded the reactivation CSV of these 106 part numbers.
The confirmation read: "Import Complete. Your discontinuation file has been successfully uploaded...
Once discontinued, the parts will automatically be updated to Product Status = Inactive."
We uploaded a reactivation file on the reactivation tab, so this message is wrong or the wrong job was queued.

Please confirm urgently
1. Confirm that no discontinuation request was queued or applied against any of the 106 attached part numbers.
2. If a discontinuation was queued, cancel it before it processes. None of these parts should be discontinued.

Please also action
3. Reactivate the 106 attached part numbers so they return to Product Status = Active and become purchasable.
4. Confirm whether anything in our account deactivated these parts around September 2025, so we can prevent a repeat.

Possible UI defect worth checking
On the Discontinuation tab, "Download our template" returns a file named PartsToReactivate.csv.
The two tabs appear to share components, which may explain the incorrect confirmation message.

Thank you,
Zafar K.
Ecom Manager
Home Weavers Inc.
```

---

## Supporting evidence held on file

| Evidence | Detail |
|---|---|
| Part status | `partStatus: INACTIVE` on all parts read from `phiSupplierPartsInventoryUi` |
| Phasing out flag | `isPhasingOut: false` on all 50 parts read — no discontinuation applied at time of checking |
| Stock present | BMO30RYE 208 units · BLUX1724BL 152 · BMO30RWH 79 · BMO30RTQ 64 |
| Sales while inactive | $1,987.21 / 192 units, 90 days to 22 Sep 2026 |
| Visibility | 0 unique visits, 0 impressions |
| Launch dates | 3–5 Sep 2025 |

## Before sending

- Re-check `isPhasingOut` on the 106 parts. If any have flipped to `true`, a discontinuation **did** land —
  say so in the ticket and mark it urgent.
- If the 123 count on the "Inactive & In Stock in DS" card has changed, note the new figure.
