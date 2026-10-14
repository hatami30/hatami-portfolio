# Design Document: Dynamic Portfolio with Git-backed CMS, Interactive TOC, and Live Presence APIs

**Date:** 2026-10-14  
**Author:** AI Agent (MorePlan) & Hatami  
**Status:** Pending Approval  
**Target Domain:** https://hatami.tech

---

## 1. Intent & The Why

The owner wants a modern, highly interactive portfolio inspired by best-in-class developer sites (like `sincan.dev`) while avoiding hardcoded content updates. The goal is to provide:

1. **Dynamic Content Editing without code editor:** Manage projects, blog posts, and bio/skills from a browser admin dashboard (`/admin`).
2. **Interactive Table of Contents (TOC):** Sticky desktop sidebar with scroll-spy heading highlight, reading progress, and smooth anchor scrolling on blog and project case studies.
3. **Live Presence & Activity Widgets:** Real-time Spotify now-playing, coding activity (via Lanyard / Discord RPC or WakaTime), and GitHub repository statistics.

All of this must be achieved **without recurring database costs or server maintenance**, preserving Astro 7's static performance (100/100 Lighthouse) and zero-downtime reliability.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals

- **G1: Decap CMS / Git-backed Admin Dashboard (`/admin`):**
  - Web UI for creating, editing, and publishing Blog posts and Project case studies with rich metadata (title, summary, tags, stack, cover image, dates, markdown body).
  - Web UI for updating site config (name, role, bio, skills, socials).
  - Authenticates via GitHub OAuth / Decap, saving changes as Git commits directly to the repository (triggering Vercel deployment automatically).
- **G2: Floating Sticky TOC with Scroll-Spy:**
  - Placed alongside content on `lg` screens (`max-w-[70ch]` content + sticky sidebar).
  - Highlights currently visible heading `<h2>` and `<h3>` using `IntersectionObserver`.
  - Shows reading progress bar/percentage.
  - Collapses into an accessible drawer/accordion on mobile/tablet.
- **G3: Live Activity & Presence Widgets:**
  - **Spotify Island:** Micro-component showing currently playing track, artist, album art, and animated equalizer bars. Fallback to "Offline / Recently played".
  - **Coding Activity Island:** Micro-component showing live VS Code status via Lanyard (Discord RPC) or WakaTime (hours coded, top languages today).
  - **GitHub Stats Widget:** Live star count and public activity on featured projects.
- **G4: 100% Quality Gate Compliance:**
  - Must pass `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links`, `pnpm check:seo`, and `pnpm check:seo --live`.
  - Zero hydration overhead on static pages; presence widgets are isolated Astro islands.

### Non-Goals

- Do not build a standalone custom SQL/PostgreSQL database or Prisma ORM backend.
- Do not convert the entire static site into an SSR application (preserve `output: 'static'`).
- Do not introduce client-side heavy SPA routers (React/Vue full-page takeover).

### Anti-Goals

- Never break existing SEO invariants: canonical URLs, sitemap, `llms.txt`, and OpenGraph images must continue working seamlessly for all CMS-generated entries.
- Never block page paint with third-party presence requests (all presence widgets must fetch asynchronously on the client or via cached serverless proxy).

---

## 3. Architecture & How It Gets Made

### 3.1 Content Management System (`/admin`)

- **Technology:** Decap CMS (standalone SPA served from `public/admin/index.html` and `public/admin/config.yml`).
- **Collections configured in `config.yml`:**
  1. `blog`: maps to `src/content/blog/` (`extension: mdx`, `format: frontmatter`, fields matching Zod schema in `src/content.config.ts`). Custom editor component registered for `<Callout>` to prevent syntax corruption.
  2. `projects`: maps to `src/content/projects/` (`extension: mdx`, `format: frontmatter`, fields matching Zod schema in `src/content.config.ts`).
  3. `settings`: maps to `src/config/site.json` or YAML singleton for bio, role, socials, and skills.
- **Media Uploads:** `public/images/uploads`, referenced directly by markdown frontmatter.
- **Authentication:** GitHub OAuth via Vercel or Decap GitHub backend.

### 3.2 Sticky Table of Contents Component (`src/components/blog/TableOfContents.astro`)

- **Layout:**
  - Applied to `src/layouts/PostLayout.astro` and `src/pages/projects/[slug].astro`.
  - Grid: `grid lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_280px] gap-10`.
- **Interactivity:**
  - Native browser script (`<script>` inside component):
    - `IntersectionObserver` observing all heading IDs.
    - Active class applied to TOC link corresponding to the current visible section.
    - Scroll progress bar at the top or inside the TOC header.
    - Smooth scroll on click without page reload.
  - Fully accessible with `aria-current="true"` on active link.

### 3.3 Live Presence Micro-APIs (`src/components/presence/`)

1. **Spotify Integration (`api/spotify.ts`):**
   - Serverless function `api/spotify.ts` with Edge caching headers (`Cache-Control: s-maxage=30, stale-while-revalidate=15`).
   - Uses server secrets: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`.
   - Never exposes secrets to the client. Returns `{ isPlaying: boolean, title: string, artist: string, songUrl: string, albumArt: string }`.
   - Client component gracefully hides or renders "Offline" if credentials are not yet configured or no song is playing.
2. **Coding Presence (Hybrid Lanyard + WakaTime):**
   - **Real-time Live:** Lanyard REST / WebSocket (`https://api.lanyard.rest/v1/users/{DISCORD_ID}`). Detects when VS Code or NeoVim is active and displays current workspace/file activity with a live pulsating dot.
   - **Offline / Summary Fallback:** WakaTime API (`/api/wakatime` serverless proxy using `WAKATIME_API_KEY`). When Discord is idle or offline, it displays cumulative stats (e.g. "4.2 hrs coded today • TypeScript, Astro").
   - UI: Modern interactive developer pill in the Hero section and an activity card in the closing section.
3. **GitHub Activity:**
   - Client-side fetch with caching or proxy to GitHub API for repo stars and activity.

---

## 4. Verification & Testing Plan

- **Decap CMS Config Validation:** Ensure `config.yml` fields strictly match Astro content collection Zod schemas so that any published article or project immediately passes `pnpm check`.
- **TOC Visual & Keyboard Navigation:** Verify heading jump, smooth scroll, and scroll-spy active state on both dark and light modes.
- **SEO & Link Integrity:** Ensure newly generated routes conform to slash-less URL rules (`/blog/slug`, not `/blog/slug/`).
- **All Quality Gates:** Run `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links`, `pnpm check:seo`, and `pnpm check:seo --live`.

---

## 5. What's Left to the Builder

- Detailed CSS styling for the live equalizer bars and presence pills.
- Decap CMS backend configuration and local dev workflow.
- Edge-case handling when Spotify is offline or Discord RPC is inactive.
