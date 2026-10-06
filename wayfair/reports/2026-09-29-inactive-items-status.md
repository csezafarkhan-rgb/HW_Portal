# Inactive items — status, and the tickets

**Checked live in Partner Home, 29 Sep 2026.** SUID 19440.

---

## The answer: Wayfair told us, and closed the ticket

**FIND-406710 is CLOSED** as of 2:08 PM today. Manh Do, Findability Team:

> "all the given part numbers of SKUs OPCO4702, FBWX1917, FBWX1956 have been taken down from
> Wayfair **US and CA** by the **Global Containment team** due to **high incidents and/or high
> returns** to protect the customer experience."

Your original read was right. It was never a deactivation we caused, and it was never a bug in
the reactivation tool. It is a **Containment penalty**.

Reference: [Containment program FAQ](https://partners.wayfair.com/d/help-center/help/article/3731)
(last updated 21 Jul 2026).

## What is actually applied

Expanding a penalised part in the dashboard shows **three penalties, all Enforced** — that is
what the "3" in the Penalty column means:

| Penalty | Status | Effect |
|---|---|---|
| **Pause** | **Enforced** | **Product delisted — cannot be bought** |
| Castlegate Replenishment Restriction | Enforced | No replenishment into Wayfair FCs |
| Safety Stock Restriction | Enforced | Inventory levels capped |

This is why they read as "Active but Not Live". The part is alive in the catalogue; the Pause
penalty takes it off sale.

## The critical point: they will never come back on their own

Straight from the FAQ:

> "Relisting is a manual process. Relisting requests **must be submitted by your Supplier
> Relationship Manager (SRM)**. Suppliers cannot submit requests directly. Approval is not
> guaranteed."

> "Paused products... do not generate sales or post-order data, [so] Wayfair cannot validate
> improvement without a manual review."

Every other penalty clears itself after three consecutive good months. **Pause does not.** A
paused part makes no sales, so it can never generate the data that would prove it improved.
Waiting achieves nothing. **The only route is Ben → his SRM → a relisting request with a
documented improvement plan.**

Approval is judged on three things: root causes clearly identified, corrective actions credible
and measurable, and a plan likely to prevent recurrence.

---

## What the dashboard actually shows — and it is a strong argument

42 parts currently carry the 3-penalty Enforced stack in the last 6 months of delivery data:

| Listing | Penalised parts |
|---|---:|
| FBWX1917 | 12 |
| OPCO4702 | 11 |
| FBWX1956 | 10 |
| **FBWX2072** | **9** |

**Wayfair's reply named only three listings. FBWX2072 is penalised too** (the BMCC range) and was
not mentioned. Worth raising — we may have more affected parts than the 106 we listed.

Now the numbers behind those 42 parts:

| Measure | Value |
|---|---:|
| Total units delivered | **276** |
| Total returns | 77 |
| **Total incidents** | **7** |
| Parts with a **0% incident rate** | **36 of 42 (86%)** |
| Parts with fewer than 30 units delivered | **41 of 42** |
| Parts with fewer than 10 units delivered | 31 of 42 |
| Parts with 3 or fewer units delivered | 15 of 42 |
| **Parts with exactly 1 unit delivered** | **6** |
| Median units delivered | **5** |

Six parts were paused on **one delivery and one return** — a "100% return rate" from a single
customer. BMO22RGY, BDR2154BL, BLUX2154GRFT, BDR2154LI, BMO30RRE, BMCC1818GR.

**86% of the paused parts have never had a single incident.** No damage, no defect, no missing
parts, no mis-ship. The penalty is driven almost entirely by **buyer's remorse returns**.

### The fairness argument writes itself

The FAQ sets out both programmes side by side. **WGS Containment** requires, before a
return-based flag:

- Order Quantity ≥ 30
- Return Quantity ≥ 10

**Global Containment**, which we are on, has **no minimum volume at all** — only a percentile
test and "worse than benchmark".

Apply the WGS floor to our 42 parts and **41 of them would not qualify.** That is not us arguing
the rate is unfair in the abstract; it is Wayfair's own threshold from its own programme.

### And Wayfair names our fix as the fix

The FAQ, on reducing return rates:

> "Buyer's remorse returns are often preventable by setting accurate customer expectations
> through: accurate product descriptions, clear, representative images, correct dimensions and
> materials."

That is exactly the colour-imagery problem we found in the photos report — 38% of return
comments say the colour is not what the images showed, Linen worst. Our corrective action is
already the one Wayfair prescribes.

---

## Ticket status, all open tickets

| Ticket | Subject | Status | Note |
|---|---|---|---|
| **FIND-406710** | Item reactivation / 106 parts | **CLOSED 29 Sep** | Answered: Global Containment. Comment on it to reopen. |
| **WPI-371528** | Items Included — BWA4PC18202122TC | **ACTION REQUIRED** | New today. See below — answer this one fast. |
| FINSAP-1351249 | FedEx carrier charges | In Progress | Updated 29 Sep. Still waiting on the remaining $211.42. |
| ERT-1910077 | Verify return to supplier, PO CS681073322 | In Progress | Opened 29 Sep. |
| QAPH-3340280 | Supplier Outreach Request | In Progress | Untouched since 13 Mar 2026. |
| QAPH-3331799 | Supplier Outreach Request | In Progress | Untouched since 13 Mar 2026. |

### WPI-371528 needs answering before it becomes another Containment case

Wayfair asks whether **BWA4PC18202122TC** (Waterford 4-Piece Bath Mat Set **with Lid Cover**,
listing FBWX1454) actually includes a toilet lid cover — a customer on PO CS680922178 says they
did not receive one. Sang Nguyen closes with:

> "due to unresponsiveness, your product may be subject to restrictions if inaccurate product
> descriptions cause higher return and incident rates."

That is the on-ramp to Containment. It needs a factual answer from the actual pack spec — not a
guess. I have not checked what that set really contains.

---

## What I would do next, in order

1. **Answer WPI-371528** with the real pack contents. Cheapest possible prevention.
2. **Send the POA email to Ben** — the draft is already written and it is now exactly what the
   process requires. It needs one change: it must explicitly ask him to have **his SRM submit a
   relisting request to the Containment team**, because that is the only route that exists.
3. **Add the three arguments above** to that email: the WGS minimum-volume comparison, the 86%
   zero-incident figure, and the missing listing FBWX2072.
4. **Do not reopen FIND-406710.** It was answered correctly and the Findability team cannot
   relist — only the SRM route can.

## Where the figures come from

| Claim | Source |
|---|---|
| Containment cause, US + CA | FIND-406710 comment, Manh Do, 2:08 PM 29 Sep 2026 |
| Three penalties Enforced | CIRD, expanded row for BMCC2260GY |
| Relisting is SRM-only, Pause cannot auto-recover | Containment program FAQ, article 3731 |
| WGS floor: Order Qty ≥ 30, Return Qty ≥ 10 | same FAQ, WGS Containment flagging criteria |
| 42 parts, 4 listings, delivery/return/incident counts | CIRD table, delivery dates 29 Mar – 29 Sep 2026 |
| 38% colour returns | `wayfair/reports/2026-09-28-return-reasons-and-photos.md` |

**Caveat on the 42:** the dashboard is filtered to deliveries in the last 6 months, so paused
parts with no recent deliveries are not in that count. The full paused set is at least the 106 we
listed. The 42 are the ones with live data behind them.
