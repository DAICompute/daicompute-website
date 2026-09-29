# DAI Compute - Content Plan and Gap Map

> Tracks what is built vs deferred. Dark institutional theme, Canada-first
> palette. Brand master: Perceptiosphere `04_Execute/DAICompute/brand/brand-guidelines/voice-and-messaging.md`.

---

## Model (traditional-first)

DAI Compute is the **procurement place** for Canadian energy and AI compute
capacity. Traditional paths lead: financial partners (financing / lease-to-own),
commercial compute and compute credits, hosts expanding capacity. Capacity is
managed by DAI Compute. Blockchain is an **optional emerging-technology
financing path** (documented under Technology). No affiliate companies are named
publicly.

## Site map

| Page | Path | Status |
|------|------|--------|
| Home | `/` | Traditional-first hero; Invest / Buy / Build; Canada2080; technology teaser |
| Invest | `/invest` | Capital procurement; financial partners; Canada2080 inform invest/deploy |
| Buy | `/buy` | Compute purchase and compute credits (usage credits) |
| Build | `/build` | Hosts and builders; partner financing / lease-to-own pathways |
| Technology | `/technology` | Optional blockchain financing path; instrument designs; not an offer |
| Protocol | `/protocol` | 301 redirect to `/technology` |
| Sovereignty | `/sovereignty` | Problem-first national thesis |
| The Future | `/future` | Long-horizon vision (footer + home teaser; not primary nav) |
| Aggregators | `/aggregators` | Standard page retained; not primary nav |
| About | `/about` | Founders; managed capacity; Canada2080; no affiliate claims |
| Contact | `/contact` | Register interest (mailto) |

## Primary nav

Invest · Buy · Build · Technology · Sovereignty · About

## Pre-launch discipline (do not violate)

- **No live financial figures** (APR/TVL/deposits/users/loan rates).
- **No deposit now / launch app / apply for a loan** CTA that implies a live product. Use register interest / request assessment.
- **No affiliate names** (including Aurora Nyxus) on public pages.
- **No “raise rail”** language.
- Soften absolute CLOUD Act immunity; use claim-register-qualified residency/control language.
- Compute credits = prepaid usage; protocol instruments = optional emerging path, not offered.

## Remaining work (deferred)

- Canada choropleth map; proof-of-reserves and loan-lifecycle dataviz
- Owned imagery and final logo mark
- Contact submission pipeline beyond mailto
- Token-name trademark validation
- Soften residual absolute CLOUD Act wording on `/sovereignty` if still present

## Deploy

- Workflow: `.github/workflows/deploy.yml` (bun; `FWVISION_PACKAGES_TOKEN`)
- Domain: `public/CNAME` = `daicompute.ca`
- Build: `bunx astro build` (NOT `npm run build`)
