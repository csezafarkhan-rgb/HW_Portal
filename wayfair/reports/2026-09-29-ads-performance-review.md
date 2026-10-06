# Wayfair ads — what actually happened, and the email to send

**Source:** Partner Home → Advertising → Reports → WSP Campaign Report, grouped by Month,
01 Jan – 29 Sep 2026 (`wayfair/data/raw/ads-campaign-monthly-2026.csv`), plus the Campaigns and
Wallet pages read live on 29 Sep 2026. SUID 19440.

---

## The short version

Your instinct is right, but the cause is not what it looks like.

**Delivery is fine. Conversion is what broke.**

Ads are spending at the same daily rate as July, getting the same impressions per day, and the
same click-through rate. What changed is that the clicks stopped turning into orders.

---

## 1. August was a total loss

August does not appear in the report at all. Zero spend, zero impressions, zero revenue for the
entire month. The card/wallet issue took the whole month out.

| Month | Spend | Revenue | RoAS | Impressions | Orders |
|---|---:|---:|---:|---:|---:|
| Apr | $1,618.00 | $16,303.12 | 1,008% | 364,053 | 426 |
| May | $2,378.21 | $26,021.01 | 1,094% | 726,292 | 696 |
| Jun | $2,588.37 | $23,383.18 | 903% | 612,327 | 636 |
| Jul | $2,212.58 | $20,373.09 | 921% | 525,391 | 555 |
| **Aug** | **—** | **—** | **—** | **—** | **—** |
| Sep (to 29th) | $446.25 | $2,302.38 | 516% | 87,780 | 58 |

At the May–July average of $758/day in attributed revenue, a lost month is roughly **$23,000 of
attributed revenue** that did not happen.

## 2. Ads only restarted around 22–23 September

September's low totals are mostly a short month, not weak delivery:

- "TEST - TOP 5 SKUs" has a start date of **09/22/2026**
- The wallet shows the first meaningful spend on **09/24**
- $446.25 at roughly $70/day ≈ **6–7 active days**, not 29

So September must be compared **per active day**, not month to month.

## 3. Per active day, spend and traffic are back to normal — conversion is not

Same campaign ("Top Priority SKUs"), same $70 daily cap, same manual bidding:

| Metric | July | September | Change |
|---|---:|---:|---:|
| Spend per day | $49.40 | $52.40 | +6% |
| Impressions per day | 11,487 | 10,607 | −8% |
| Click-through rate | 2.09% | 2.11% | flat |
| **Cost per click** | **$0.205** | **$0.235** | **+15%** |
| **Orders per 100 clicks** | **4.64** | **3.51** | **−24%** |
| Average order value | $41.82 | $36.66 | −12% |
| **Retail RoAS** | **945%** | **549%** | **−42%** |

Account-wide the same shape holds: CPC $0.198 → $0.243, conversion per click 4.96% → 3.16%,
cost per order **$3.99 → $7.69**.

**Wayfair is still showing the ads to the same number of people, and those people still click at
the same rate. They just do not buy any more.** That is a product-page problem, not a campaign
problem.

### The most likely cause, and it connects to our open ticket

We currently have **1,076 unpurchasable parts** and **106 parts that are Active but Not Live**
(ticket FIND-406710). If advertised SKUs are in either group, we are paying for clicks that land
on pages the shopper cannot buy from. That would produce exactly this pattern — traffic normal,
conversion halved.

This needs confirming against the campaign's SKU list. It is the first question in the email.

## 4. An important caveat on the September numbers

The report attributes revenue on a **14-day view-through window**. September's spend is only
5–7 days old, so a large part of its attributed revenue **has not landed yet**. September's true
RoAS will rise as the window completes.

The conversion-rate and CPC gaps are still real — those are not attribution-dependent — but do
not treat 516% as final. We should re-pull this in mid-October.

## 5. Things that are on our side, not Wayfair's

Only **2 of 20 campaigns are Active**. Three that worked are sitting paused:

| Campaign | Status | July performance | Now |
|---|---|---|---|
| Impression & Element | **Paused** | $287.41 → $2,572.13 (895% RoAS) | $3.04 |
| HIGH_POTENTIAL_SKU 051926 | **Paused** | $324.85 → $2,875.72 (885% RoAS) | $1.97 |
| HW Q4 2026 - Top Sellers In Stock | **Paused** | created 09/22, never launched | $0 |

Restarting the first two is the single fastest thing we can do — they were both running near
900% RoAS with real spend behind them.

## 6. Wallet

Balance **$552.88**, estimated **9 days to empty**, wallet daily cap **$100.00**, recommended
funding $5,000. Paying by voucher deduction with $5,000 available credit. If the wallet empties
again we repeat August.

---

## Email to send

Replace `[NAME]` with the Wayfair ads manager.

```
Subject: Ads performance since the August pause - SUID 19440

Hi [NAME],

Hope you are well.

Our ads were paused for the whole of August because of a payment card issue on our side.
We restarted them around 22 September.
Since the restart the return has not recovered, and I would like your help understanding why.

What the data shows
August is completely absent from our WSP Campaign Report - zero spend, zero impressions.
September has only about 6 to 7 active days, so I have compared per active day, not per month.

Taking our main campaign, Top Priority SKUs, same $70 daily cap and same manual bidding:
Spend per day is $49.40 in July against $52.40 in September.
Impressions per day are 11,487 against 10,607.
Click through rate is 2.09% against 2.11%.
Cost per click is $0.205 against $0.235.
Orders per 100 clicks are 4.64 against 3.51.
Retail RoAS is 945% against 549%.

Account wide, cost per order has gone from $3.99 to $7.69.

So delivery and traffic look normal. What has changed is that the clicks no longer convert.

What I would like your help with
1. Are any of our advertised SKUs currently unpurchasable or Not Live?
   We have 1,076 unpurchasable parts and 106 parts that are Active but Not Live under ticket
   FIND-406710. If advertised parts are in either group we are paying for clicks on pages that
   cannot be bought from, which would explain the conversion drop exactly.
2. Did the August pause reset any learning, bidding or quality signal on these campaigns?
   If so, how long is the ramp back and is there anything we should do differently during it?
3. Our cost per click is up 15% on the same campaign and same bid setup. Has anything changed
   in the auction or in our quality score since August?
4. Is the 14 day view through attribution window the reason September looks worse than it is?
   I expect some of September's revenue has not landed yet and would like to confirm that.

On our side
We know two of our better campaigns are still paused and we are restarting them.
We are also fixing the imagery on our worst returning colours, which should help conversion.
We will keep the wallet funded so this does not repeat.

Happy to get on a call and go through the numbers with you.

Thank you,
Zafar K.
Ecom Manager
Home Weavers Inc.
```

---

## Every figure, and where it comes from

| Claim | Source |
|---|---|
| Monthly spend/revenue/RoAS/impressions/orders | WSP Campaign Report, grouped by Month, Jan–Sep 2026 |
| August absent | no 2026-08 rows exist in that report |
| Restart 22–23 Sep | TEST campaign start date 09/22/2026; wallet first real spend 09/24 |
| Per-day July vs Sep | same report, July ÷ 31 days, Sep ÷ 6.5 active days |
| CPC, CTR, conv/click, CPO | computed from clicks, impressions, spend, attributed orders |
| Paused campaigns and caps | Advertising → Campaigns, read live 29 Sep |
| Wallet balance, cap, days to empty | Advertising → Wallet, read live 29 Sep |
| 1,076 unpurchasable / 106 not live | `wayfair/unpurchasable.json`; ticket FIND-406710 |

## What I did not put in the email

- The $23,000 estimate for the lost August. It is an extrapolation, not a measured number, and
  quoting it invites an argument about the method instead of an answer about the SKUs.
- The paused-campaign list in detail. That is our housekeeping, and the email already concedes it
  in one line.
