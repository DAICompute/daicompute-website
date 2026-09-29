# daicompute-website

Public credibility website for **DAI Compute** (Distributed AI Compute):
daicompute.ca. The **procurement place** for Canadian energy and AI compute
capacity. Traditional paths lead through financial partners (financing and
lease-to-own) and commercial compute purchase. Blockchain is an optional
emerging-technology financing path. Capacity is managed by DAI Compute.

Part of the FW.VISION group of ventures. Pre-launch and pre-regulatory; no
financial product is offered yet.

## For AI agents

**Read `AGENTS.md` first**, then `docs/brand/DESIGN.md`. Active build handoffs
are in `docs/design/`. Architecture decisions in `docs/adr/`.

## Stack

- **Astro 5.13** (static output) + **Tailwind 4** (via `@tailwindcss/vite`, CSS `@source` directives)
- **React island** (`@astrojs/react`) for the ForesightScope widget only; Vite pinned stable via `overrides`
- Consumes private GitHub Packages: `@fw-vision/web-kit`, `@fw-vision/widgets`

## Design

**Dark institutional** theme on a Canada-first palette: flag red
`#D52B1E` (sovereignty), energetic orange `#FF6A1A` (compute / action), power
yellow `#FFC21A` (energy) on a near-black `#0B0D0F` canvas. Space Grotesk +
IBM Plex Mono. Full spec: `docs/brand/DESIGN.md`.

## Pages

Invest (capital procurement / partner financing), Buy (compute and credits),
Build (hosts and builders), Technology (optional blockchain path; `/protocol`
redirects here), Sovereignty, The Future (footer/teaser), About, Contact
(mailto template, no backend on static hosting).

## Develop

Requires the `GITHUB_TOKEN_FWVISION` env var (a classic PAT with `read:packages`)
for the private `@fw-vision/*` packages, read by `.npmrc`.

```sh
bun install
bun run build         # or: bunx astro build (NOT npm run build)
bun run dev           # binds 0.0.0.0 for Tailnet reachability; do not leave running in CI/agents
```

Dev and preview bind `0.0.0.0` via `astro.config.mjs` and the `package.json` scripts so other Tailnet devices can open the site (for example `http://fcwang-elitemini-series.tail0f7891.ts.net:4321`).

## Content

- Brand and content direction are maintained separately; this repo is the implementation. Design reference: `docs/brand/DESIGN.md`.
- Gap map: `CONTENT-PLAN.md`.

## Deploy

GitHub Pages via `.github/workflows/deploy.yml` (bun-based). Private package
auth in CI uses Actions secret `FWVISION_PACKAGES_TOKEN` (classic PAT with
`read:packages`), mapped to `GITHUB_TOKEN_FWVISION` for `.npmrc`. That secret
must be a **Repository** secret, or an **Environment** secret on `github-pages`
(the build job uses that environment). Custom domain in `public/CNAME`
(daicompute.ca).

To verify package auth locally (same check CI runs before `bun install`):

```powershell
$env:GITHUB_TOKEN_FWVISION = "<your classic PAT>"
bun scripts/check-packages-auth.mjs
```
