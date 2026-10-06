# Why customers return our rugs — and which deductions we can dispute

**Source:** Partner Home → Incidents and Resolutions → Customer Incidents and Returns →
Export → *Purchase Order and Photos Report*, All Products (Last 18 Months)
**Period:** 28 Mar 2025 – 23 Sep 2026 · **Pulled:** 28 Sep 2026 · SUID 19440
**Raw file:** `wayfair/data/raw/incidents-photos-18mo.csv` (2,855 rows, 2,448 POs, 1,166 parts)

---

## 1. The headline: colour is the problem, not quality

2,106 returns carry a customer comment. Classified:

| Reason | Returns | Share |
|---|---:|---:|
| **Colour / shade not as pictured** | **803** | **38%** |
| Size / fit wrong | 306 | 15% |
| Thin / cheap / quality | 235 | 11% |
| Slipping — "non-slip" backing doesn't grip | 64 | 3% |
| Wrong item received | 44 | 2% |
| Everything else / no reason given | ~650 | 31% |

Colour is the single biggest driver of returns by a wide margin, and it is **a photography
problem, not a product problem**. Nobody is saying the rug is bad — they are saying it isn't
the colour they saw on screen. Typical comments:

> "color looked pale" · "color too orange" · "It is lighter yellow than i expected" ·
> "rug looks white" (ordered Ivory)

### Linen is the worst offender

Returns by colour code:

| Colour | Returns |
|---|---:|
| **LI (Linen)** | **269** |
| GY (Grey) | 162 |
| BL (Blue) | 162 |
| NA (Natural/Ivory) | 139 |
| PI (Pink) | 91 |

Linen alone is **12.8% of all returns**, and 6 of the 10 most-returned parts are Linen
(BALL2020LI 19 returns, BWA4PC17212022LI 17, BALL1724LI 13, BWA2020CLI 13, BALL2134LI 12,
BALL2440LI 12). Roughly 40% of Linen returns name the colour.

**Action:** re-shoot Linen, Natural/Ivory and Grey under neutral lighting with a real-room
reference, and add an honest close-up swatch. This is the cheapest money we can save.

---

## 2. Deductions we should be disputing

Total incident deductions in the period: **$6,505.16** across 582 incidents.
Mis-shipped alone is **$5,085.45** (202 incidents) — 78% of all incident deductions.

Two clean dispute categories fall straight out of Wayfair's own comment text:

### A. False mis-ships — customer's record says they got what they ordered ($479.46, 14 POs)

Wayfair logged these as Mis-shipped, but its own "Customer Ordered / Customer Received"
fields hold the **identical value**:

| PO | Part | Delivered | Deduction | Ordered = Received |
|---|---|---|---:|---|
| CS680018381 | BWA4PC18172122RE | 2026-09-12 | $55.23 | Red |
| CS616934414 | BWA4PC18202122GY | 2025-10-31 | $60.91 | Gray |
| CS647232652 | BWA4PC18202122GRFT | 2026-04-08 | $55.51 | Bottle Green |
| CS642584841 | BWA4PC18202122RB | 2026-03-12 | $55.48 | Navy |
| CS593092095 | BWA4PC18202122LA | 2025-06-05 | $51.25 | Purple |
| CS618383785 | BWA3PC172120BL | 2025-11-06 | $34.35 | Blue |
| CS660604364 | BWA3PC172120YE | 2026-06-10 | $33.12 | Butter |
| CS651531643 | BMELM2PC1721NV | 2026-04-29 | $25.24 | Navy |
| CS667400463 | BWA1022TWH | 2026-07-16 | $24.23 | White |
| CS645384189 | BMIM2154NV | 2026-03-29 | $22.72 | Navy |
| CS649853650 | BMELM2PC1820LI | 2026-04-23 | $19.65 | Linen |
| CS651384189 | BDR1818BU | 2026-04-30 | $16.85 | Yellow (part code = Blue) |
| CS613526886 | BMO1730SSA | 2025-10-08 | $14.26 | Green (part code = Sand) |
| CS659812041 | BMIM2020NV | 2026-06-06 | $10.66 | Contour 20x20, Navy |

Two caveats before we file: **BDR1818BU** and **BMO1730SSA** show a colour that doesn't match
their own part code, so the *listing option mapping* may be wrong on those two — worth checking
ourselves rather than disputing blind. The other 12 ($448.35) look clean.

### B. "Option not Listed" — Wayfair's listing is missing the variant ($752.87, 28 POs)

28 incidents where the Customer Received field literally reads **"Option not Listed"** — the
variant the customer got does not exist as a selectable option on the Wayfair listing. That is
a catalogue defect on Wayfair's side, not a pick error on ours. Examples:

- CS642847680 · BELE2440GY · $22.20 · *Ordered: Gray 24x40. Received: Option not Listed, Option not Listed.*
- CS622032903 · BDR2440PI + BDR2134PI + BDR1724PI · $61.73 combined · all three lines "Option not Listed"
- CS623167287 · ALR58SIL · $84.81 · *"Color is completely different"*
- CS588168239 · BFA2020NA · $16.02 × 7 duplicate rows · *"rug looks white"* (ordered Ivory)

**CS588168239 appears seven times and CS583184577 twice** in the raw export — worth asking
Wayfair whether we were charged once or seven times.

Combined disputable: **~$1,232** on these two categories alone, and the argument is made
entirely from Wayfair's own data.

---

## 3. The house-brand renaming theory — real, but small

We suspected Wayfair's collection renaming (Allure → *Dobrinka*, Bruss → *Luxury*) was driving
the mis-ship incidents, because customers get packaging whose name doesn't match the listing.

Only **5 comments in 18 months** name a collection at all, and just **2** are unambiguous:

> BALL2440BU — *"I ordered the Dobrinka bath mat. I received something completely different,
> Allure Collection."* ← the exact failure we predicted
>
> BALL3PC172120SA — *"I received the Waterford 3 piece set instead of the Dobrinka 3 piece set"*

So the mechanism is confirmed but it is **not** what is costing us money. It is worth one line
to Ben as evidence; it is not the case for reactivating the 106 parts.

---

## 4. What this means for ticket FIND-406710

The ticket currently asks the wrong question. We now know the 106 parts were deactivated for
**high incident rate**, and the photos report tells us what's underneath that rate:

- 66 of the 106 parts appear in this data at all, across 154 incidents/returns
- Their breakdown: **129 plain returns**, 14 mis-shipped, 8 defective, 2 mis-information, 1 damaged
- Only 25 of 154 (16%) are chargeable incidents — the rest are ordinary customer returns

**We should amend the ticket to ask:** why parts were deactivated on an incident rate that is
dominated by non-chargeable buyer's-remorse returns, and request reactivation alongside a
corrective action plan (re-shot colour imagery) rather than arguing the rate itself.

---

## 5. Photos

Only **47 customer images across 26 POs** are attached in 18 months — 2,808 of 2,855 rows have
zero photos. Photo evidence is not going to carry a dispute; the comment text is our evidence.

---

## Do next

1. **Re-shoot Linen, Natural/Ivory, Grey.** 38% of returns are colour; Linen is 12.8% of returns
   on its own. Highest-value fix available and it also helps the 1,034 live-zero-click parts.
2. **File the two dispute batches** (~$1,232) using Wayfair's own comment fields as evidence.
3. **Query the duplicate rows** on CS588168239 (×7) and CS583184577 (×2).
4. **Check BDR1818BU and BMO1730SSA** option mapping ourselves before disputing those two.
5. **Amend FIND-406710** per section 4.
