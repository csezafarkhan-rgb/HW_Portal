# Ads: checking Daniella's reply against the portal

Checked live in Partner Home, 1 Oct 2026. Her reply of 30 Sep answers the 29 Sep email to
Sunny (who has moved teams; Daniella Gangi is now the Advertising Account Manager).

## Her factual claims — all check out

| Claim | Portal | Verdict |
|---|---|---|
| Campaign 514125 "Top Priority SKUs", cap $70 | Active, cap $70 | correct |
| Campaign 642357 "HIGH_POTENTIAL_SKU", cap $20, not reactivated | **Paused**, cap $20 | correct |
| Campaign 614155 "Impression & Element", cap $45, not reactivated | **Paused**, cap $45 | correct |
| New test campaign 707526 launched 22 Sep | Active, start date 09/22/2026 | correct |
| Test campaign ~3.00x ROAS | 279.8% retail RoAS | correct |
| Partner daily cap $100 | Wallet Daily Cap $100.00 | correct |

Every campaign ID in her email matches. The diagnosis is honest, not a brush-off.

Last 28 days overall: **518% retail RoAS, $588.98 spend, $3,053 revenue, 112,869 impressions,
CPC $0.24.**

| Campaign | Status | Cap | RoAS | Spend | Impressions |
|---|---|---:|---:|---:|---:|
| Top Priority SKUs (514125) | Active | $70 | 564% | $476.05 | 93,228 |
| TEST - TOP 5 SKUs (707526) | Active | $30 | 280% | $107.92 | 16,931 |
| Impression & Element (614155) | **Paused** | $45 | 1,513% | $3.04 | 1,605 |
| HIGH_POTENTIAL_SKU (642357) | **Paused** | $20 | 913% | $1.97 | 1,105 |
| HW Q4 2026 - Top Sellers In Stock (707030) | Paused | $45 | -- | -- | -- |

The two paused campaigns show 1,513% and 913% RoAS on trivial spend - that is residual
attribution tail, not live performance, but it does corroborate that they were the strong ones.

## Where her recommendation is out of date

**"The test campaign is taking $30 of the $100 cap."** It is not. Actual daily spend from the
wallet ledger:

| Date | 514125 Top Priority | 707526 Test |
|---|---:|---:|
| 24 Sep | -- | $23.21 |
| 25 Sep | $47.54 | $5.12 |
| 26 Sep | $69.25 | $2.86 |
| 27 Sep | $70.00 | $7.14 |
| 28 Sep | $69.82 | $2.99 |
| 29 Sep | $68.65 | $1.68 |
| 30 Sep | $69.75 | $5.41 |

She is right about 24 Sep - the test campaign took $23 that day while Top Priority spent nothing.
But since 26 Sep the test has been taking **$1.68-$7.14 a day**, not $30. Lowering its cap frees
almost nothing.

**The real constraint is that 514125 is pinned at its $70 cap every single day** since 26 Sep.
Total daily spend is ~$73-77 against a $100 wallet cap, so ~$25/day of the partner cap is already
going unused. Raising the partner cap on its own changes nothing; the binding limit is the
campaign-level cap on 514125.

## The thing nobody has flagged - and it is the one that will break again

**Wallet balance $409.47. Wayfair's own estimate: 6 days to empty. Automatic payments are NOT
set up** - both `autoRenewThreshold` and `autoRenewAmount` are blank.

August's blackout was a payment failure. This is the same failure mode, armed again.

It gets worse under her plan. Unpausing 642357 ($20) and 614155 ($45) alongside 514125 ($70) and
the test ($30) is up to $165/day of campaign caps; raising the partner cap to $150 lets ~$150/day
actually spend. At that rate **$409.47 is under three days of runway.**

Payment method is **Voucher Deduction** with $5,000 available credit, deducted from future
dropship vouchers - so funding does not need a card at all. Wayfair's own recommended funding on
the page is $5,000.

## Suggested order of operations

1. **Set up automatic payments first.** Voucher Deduction, trigger balance ~$300, payment amount
   ~$1,500. Nothing else is safe until this is done.
2. Unpause **642357** and **614155**.
3. **Raise the cap on 514125** - it has been capped out daily for a week. The partner cap rise to
   $150 only matters once the campaign caps can actually absorb it.
4. Leave the test campaign alone, or park it. It is spending ~$4/day; it is not the problem.
5. Decide on **707030 "HW Q4 2026 - Top Sellers In Stock"** - created 22 Sep, never run, $45 cap.
   Daniella did not mention it.

## Unverified

Her catalog availability figure (88.4% May -> 73.5% Sep) was not checked. Worth noting it should
improve on its own: the 130 containment-paused parts came back Live on 1 Oct, and those were
unbuyable for the whole of the period she is measuring.

Her 14-day attribution argument is sound in principle and cannot be confirmed from the portal -
it resolves itself by about 12 Oct, which is the honest test of it.
