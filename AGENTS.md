# daicompute-website - Agent Context

> Read by AI coding agents (Cursor, opencode, etc.) on every session. START HERE. Keep concise and current.

## What this project is

The public credibility website for **DAI Compute** (Distributed AI Compute), a **Canadian sovereign InfraFi credit protocol**: a two-sided market where depositors earn yield from financing Canadian energy + compute infrastructure, and builders borrow against the infrastructure they build. Every position is backed by physical Canadian assets, on Canadian soil, under Canadian law. Sovereignty is the core value proposition.

- **Domain:** daicompute.ca (Canada-first; use `.ca` everywhere).
- **Posture:** pre-launch, pre-regulatory. No token issued, no financial product offered yet.

This repository is the **website implementation**. Brand and content direction are maintained in the parent CITAble workspace and the public-safe project docs. Do not invent brand or messaging.

Before changing positioning, claims, token language, or public content, read `../../CITAble/README.md`, `../../CITAble/indicators-strategy/strategy.md`, `../../CITAble/brand/guidelines/voice-and-messaging.md`, and `../../CITAble/ecosystem/regulatory-notes.md`. Use `docs/brand/DESIGN.md` for implementation-specific design rules.

## Read next (in this repo)

| Doc | Purpose |
|-----|---------|
| `docs/brand/DESIGN.md` | **The design spec.** Palette, type, colour language, components, motion. Read before any UI work. |
| `docs/adr/` | Architecture decisions already made (static hosting, model + domain, dark theme). Do not re-litigate. |
| `docs/data/` | Public source data (e.g. `canada-energy-compute.md`) that feeds visualisations. |
| `docs/plans/` | Local build-spec prompts for active work (gitignored, not published). Read the relevant one for your task. |
| `CONTENT-PLAN.md` | Gap map: what is built vs deferred. |

## Verification (critical)

- **Build:** `bunx astro build` (terminates; exit 0 = compiles). **NOT `npm run build`** - the npm shim is broken under the bun install layout.
- **Install:** `bun install` (requires env var `GITHUB_TOKEN_FWVISION`, a classic PAT with `read:packages`, for the private `@fw-vision/*` packages; read by `.npmrc`).
- **Dev smoke only:** start `bunx astro dev` in a background job, wait ~9s, capture output, kill it. **NEVER leave a dev server running** - it blocks the session.
- A successful build is sufficient proof code compiles. Visual verification is manual.

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | Astro 5.13 (static output) |
| Styling | Tailwind 4 via `@tailwindcss/vite` (CSS `@source` directives, no JS config) |
| Islands | `@astrojs/react` - React only for the ForesightScope widget island |
| Vite | Pinned stable via `package.json` `overrides: { "vite": "npm:vite@^7.1.5" }` |
| Private packages | `@fw-vision/web-kit` (tokens, structural), `@fw-vision/widgets` (D3 dataviz incl. ForesightScope), from GitHub Packages org `fw-vision` |
| Hosting | GitHub Pages (static; no server) via `.github/workflows/deploy.yml` (bun-based) |
| Package manager | bun |

## Directory map

```
src/
  layouts/Main.astro          Nav (Invest/Build/Protocol/Sovereignty/The Future/About) + footer + scroll-aware header
  pages/
    index.astro               Home: hero, verified-stat row, gap framing, GridDemo, two-sided market, feature grid, token teaser, future teaser, CTA
    invest.astro              Depositor side: CADS/sCADS, yield, proof-of-reserves, Northern Queue
    build.astro               Borrower side: non-recourse financing, who borrows, hybrid legal structure
    protocol.astro            Instrument stack, two-sided-market flywheel, attestation layer, Northern Queue, governance
    sovereignty.astro         Problem-first page: dependence on foreign-owned infrastructure, the compute gap, the energy paradox
    future.astro              The long-horizon vision: climate stakes + LIVE ForesightScope + horizons + co-location
    about.astro               Founders, why-us, origin
    contact.astro             Illustrative template + mailto:hello@daicompute.ca (no backend on static hosting)
  components/
    Wordmark.astro            "DAI" (orange) + "Compute"
    GridDemo.astro            Signature demonstration: auto-cycling centralised vs distributed compute topology (SVG + inline JS)
    TokenCard.astro           CADS/sCADS/CROWN spec cards
    StatCounter.astro         Verified-data stat rows (national statistics, not live protocol metrics pre-launch)
    FeatureCard, StepCard, PageHeader, Placeholder
  data/
    foresight.ts              sovereigntyForesightData: the long-horizon trajectory for ForesightScope (H1-H3, scenarios, preferred + off-ramp)
  styles/global.css           Design tokens (@theme), palette, colour language, GridDemo animations
public/
  CNAME (daicompute.ca), robots.txt, favicon.svg
docs/                         brand/ (DESIGN.md), adr/, data/ (public source data), plans/ (local build specs, gitignored)
```

## Colour language (important)

Used consistently across the GridDemo and all dataviz:
- **Orange `#FF6A1A` = compute.** Yellow `#FFC21A` = energy. Flag red `#D52B1E` = sovereignty / capital / jurisdiction.
- Near-black `#0B0D0F` canvas, `#C4CBD2` / `#F4F6F8` text, `#8A939C` hairline/secondary.
- Ration the warm accents; the dark canvas carries the weight.

## Working guidelines

1. **Dark-first.** The site is dark institutional; do not introduce light backgrounds without reason.
2. **Verified data only, pre-launch.** Do NOT publish live APR/TVL/deposit/user figures or a "deposit now / launch app" CTA. Use verified national statistics; "register interest" not "deposit". See `docs/brand/DESIGN.md` section 7.
3. **No crypto-hype language.** Never: moon, DeFi (as self-label), yield farming, WAGMI, HODL, degen, guaranteed returns. Yield is always tied to its real source.
4. **Tickers** (CADS, sCADS, CROWN, sCROWN) are mono, uppercase.
5. **Astro islands pattern** - JS only where needed; the ForesightScope is `client:only="react"`.
6. **Do not touch** `.npmrc`, `.github/workflows/deploy.yml`, or private-package auth without reason.
7. **Placeholders are intentional** - `<Placeholder>` frames mark planned gaps; their notes encode the sourcing/build brief.
8. **Canadian spelling; no em-dashes** (restructure the sentence).

## Active build work

See `docs/plans/` (local, gitignored) for the current build specs: the ForesightScope dark-mode fix, the Canada choropleth widget (uses `docs/data/canada-energy-compute.md`), and the two-sided-market flywheel visualisation for the Protocol page.
