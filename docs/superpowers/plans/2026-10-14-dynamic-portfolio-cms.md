# Dynamic Portfolio with Git-backed CMS, Interactive TOC, and Live Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Git-backed admin dashboard at `/admin`, an interactive sticky Table of Contents (TOC) with scroll-spy, and live presence micro-APIs (Spotify & Hybrid Lanyard/WakaTime coding status) for https://hatami.tech.

**Architecture:** Pure static Astro 7 with isolated client-side islands for live presence, decoupled serverless edge-cached proxies for third-party API secrets (Spotify, WakaTime), an interactive client-side TOC with native `IntersectionObserver`, and Decap CMS configured against Git collections (`src/content/blog/`, `src/content/projects/`).

**Tech Stack:** Astro 7 (`output: 'static'`), TypeScript 6, Tailwind CSS 4, Decap CMS, Spotify Web API, Lanyard API, WakaTime API, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-14-dynamic-portfolio-cms-design.md`

## Global Constraints

- Site output remains static (`output: 'static'`); all new APIs use plain Vercel Function handlers (`api/*.ts`).
- No new runtime framework dependencies (no React/Vue/Svelte islands unless explicitly required).
- No trailing slashes on URLs (`trailingSlash: 'never'`).
- Preserves 100% compliance with `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links`, `pnpm check:seo`, and `pnpm check:seo --live`.
- Any missing external API credentials must fail gracefully to an elegant offline/fallback state without crashing or throwing client console errors.

## Review Focus

1. **Spotify API token expiry:** Serverless handler must refresh access token cleanly and cache results (`s-maxage=30`) so visitors do not exhaust Spotify rate limits.
2. **Discord/Lanyard offline state:** When Discord RPC is inactive, the coding status component must seamlessly fall back to WakaTime or an elegant status message without layout jumping.
3. **Decap CMS MDX parsing:** Saving posts via Decap CMS must preserve `<Callout>` components and frontmatter types without corrupting Astro's Zod content schemas.
4. **TOC Scroll-Spy heading jumps:** Rapid page scrolling must not desync active heading state in the TOC or cause sticky positioning jitter.
5. **SEO & Indexing safety:** `/admin` route must carry `noindex, nofollow` headers and never appear in `sitemap.xml`.

---

### Task 1: Interactive Sticky Table of Contents (TOC) with Scroll-Spy & Reading Progress

**Files:**

- Create: `src/lib/toc.ts`
- Modify: `src/components/blog/TableOfContents.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/projects/[slug].astro`
- Test: `src/lib/toc.test.ts`

**Interfaces:**

- Produces: `TableOfContents.astro` accepting `headings: MarkdownHeading[]` with interactive desktop sticky sidebar and mobile drawer.
- Consumes: Astro `render(entry)` headings (`{ depth: number, slug: string, text: string }[]`).

- [ ] **Step 1: Write the failing test for TOC heading filter and nested hierarchy helper in `src/lib/toc.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { filterTocHeadings } from './toc';

describe('filterTocHeadings', () => {
  it('filters out headings outside h2 and h3', () => {
    const raw = [
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'intro', text: 'Intro' },
      { depth: 3, slug: 'sub', text: 'Sub' },
      { depth: 4, slug: 'deep', text: 'Deep' },
    ];
    const filtered = filterTocHeadings(raw);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].slug).toBe('intro');
    expect(filtered[1].slug).toBe('sub');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/toc.test.ts`
Expected: FAIL with "Cannot find module './toc'"

- [ ] **Step 3: Implement `filterTocHeadings` in `src/lib/toc.ts`**

Implement pure function filtering `depth === 2 || depth === 3`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/toc.test.ts`
Expected: PASS

- [ ] **Step 5: Upgrade `TableOfContents.astro` with Scroll-Spy & Sticky layout**

Update `src/components/blog/TableOfContents.astro` with:

- Desktop sticky container (`sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto`).
- Active state highlight styling (`text-accent font-medium border-l-2 border-accent`).
- Reading progress bar.
- Client script using `IntersectionObserver` observing all heading IDs.

- [ ] **Step 6: Integrate dual-column layout in `PostLayout.astro` and `projects/[slug].astro`**

Change the article wrapper on `lg` screens from `max-w-[70ch]` single-column to `grid lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_280px] gap-10`. Place `TableOfContents` in the sticky aside column.

- [ ] **Step 7: Verify with `pnpm check && pnpm lint && pnpm test && pnpm build`**

Run: `pnpm check && pnpm lint && pnpm test && pnpm build`
Expected: PASS with 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/toc.ts src/lib/toc.test.ts src/components/blog/TableOfContents.astro src/layouts/PostLayout.astro src/pages/projects/[slug].astro
git commit -m "feat(ui): add interactive sticky TOC with scroll-spy"
```

---

### Task 2: Spotify Now-Playing Serverless Endpoint & Live Visualizer Component

**Files:**

- Create: `src/api/spotify.ts`
- Create: `src/api/spotify.test.ts`
- Create: `api/spotify.ts`
- Create: `src/components/presence/SpotifyPlayer.astro`
- Modify: `.env.example`

**Interfaces:**

- Produces: `GET /api/spotify` returning JSON `{ isPlaying: boolean, title?: string, artist?: string, songUrl?: string, albumArt?: string }`.
- Produces: `<SpotifyPlayer />` component fetching `/api/spotify` on the client.

- [ ] **Step 1: Write the failing tests for `handleSpotify` in `src/api/spotify.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { handleSpotify } from './spotify';

describe('handleSpotify', () => {
  it('returns isPlaying: false when credentials are missing', async () => {
    const req = new Request('https://hatami.tech/api/spotify');
    const res = await handleSpotify(req, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isPlaying).toBe(false);
  });

  it('returns currently playing song when Spotify API returns 200', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'fake_token' }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            is_playing: true,
            item: {
              name: 'Track Name',
              artists: [{ name: 'Artist Name' }],
              external_urls: { spotify: 'https://open.spotify.com/track/123' },
              album: { images: [{ url: 'https://img.spotify.com/123.jpg' }] },
            },
          }),
          { status: 200 },
        ),
      );

    const req = new Request('https://hatami.tech/api/spotify');
    const env = {
      SPOTIFY_CLIENT_ID: 'id',
      SPOTIFY_CLIENT_SECRET: 'secret',
      SPOTIFY_REFRESH_TOKEN: 'refresh',
    };
    const res = await handleSpotify(req, env, mockFetch);
    const data = await res.json();
    expect(data.isPlaying).toBe(true);
    expect(data.title).toBe('Track Name');
    expect(data.artist).toBe('Artist Name');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/api/spotify.test.ts`
Expected: FAIL with "Cannot find module './spotify'"

- [ ] **Step 3: Implement `handleSpotify(request, env, fetchImpl)` in `src/api/spotify.ts`**

Implement token exchange with `https://accounts.spotify.com/api/token` and call to `https://api.spotify.com/v1/me/player/currently-playing`. Include `Cache-Control: public, s-maxage=30, stale-while-revalidate=15`.

- [ ] **Step 4: Create thin Vercel function entry in `api/spotify.ts`**

```ts
import { handleSpotify } from '../src/api/spotify';

export default {
  fetch(request: Request) {
    return handleSpotify(request, process.env);
  },
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test src/api/spotify.test.ts`
Expected: PASS

- [ ] **Step 6: Create `src/components/presence/SpotifyPlayer.astro`**

Build client-side island with animated equalizer bars (CSS keyframes), album cover thumbnail, title & artist marquee/truncate, and link to track.

- [ ] **Step 7: Update `.env.example`**

Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN`.

- [ ] **Step 8: Commit**

```bash
git add src/api/spotify.ts src/api/spotify.test.ts api/spotify.ts src/components/presence/SpotifyPlayer.astro .env.example
git commit -m "feat(api): add spotify now-playing serverless handler and visualizer"
```

---

### Task 3: Live Coding Activity (Hybrid Lanyard + WakaTime)

**Files:**

- Create: `src/api/wakatime.ts`
- Create: `src/api/wakatime.test.ts`
- Create: `api/wakatime.ts`
- Create: `src/components/presence/CodingPresence.astro`
- Modify: `src/pages/index.astro`
- Modify: `.env.example`

**Interfaces:**

- Produces: `GET /api/wakatime` returning JSON `{ success: boolean, totalHours?: string, topLanguages?: string[] }`.
- Produces: `<CodingPresence />` component that checks Lanyard WebSocket/REST first; falls back to `/api/wakatime` if idle.

- [ ] **Step 1: Write the failing tests for `handleWakatime` in `src/api/wakatime.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { handleWakatime } from './wakatime';

describe('handleWakatime', () => {
  it('returns success: false when WAKATIME_API_KEY is not set', async () => {
    const req = new Request('https://hatami.tech/api/wakatime');
    const res = await handleWakatime(req, {});
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('parses coding stats correctly when WakaTime API returns data', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            human_readable_total: '3 hrs 45 mins',
            languages: [{ name: 'TypeScript' }, { name: 'Astro' }],
          },
        }),
        { status: 200 },
      ),
    );

    const req = new Request('https://hatami.tech/api/wakatime');
    const res = await handleWakatime(req, { WAKATIME_API_KEY: 'test_key' }, mockFetch);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.totalHours).toBe('3 hrs 45 mins');
    expect(data.topLanguages).toContain('TypeScript');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/api/wakatime.test.ts`
Expected: FAIL with "Cannot find module './wakatime'"

- [ ] **Step 3: Implement `handleWakatime` in `src/api/wakatime.ts` and `api/wakatime.ts`**

Fetch from `https://wakatime.com/api/v1/users/current/status_bar/today` with Base64 Authorization. Set `Cache-Control: public, s-maxage=300`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/api/wakatime.test.ts`
Expected: PASS

- [ ] **Step 5: Create `src/components/presence/CodingPresence.astro`**

Implement hybrid client logic:

1. Connect to `https://api.lanyard.rest/v1/users/{PUBLIC_DISCORD_USER_ID}`.
2. If Discord rich presence reports VS Code / NeoVim active: display `"Editing <file> in <workspace>"`.
3. If not active or offline: fetch `/api/wakatime` and display `"Coded <totalHours> today"`.
4. Include live pulsating status indicator.

- [ ] **Step 6: Integrate Presence components into `src/pages/index.astro` Hero & Activity section**

Add `<CodingPresence />` and `<SpotifyPlayer />` into the homepage layout with clean Linear Dark aesthetics.

- [ ] **Step 7: Update `.env.example`**

Add `PUBLIC_DISCORD_USER_ID` and `WAKATIME_API_KEY`.

- [ ] **Step 8: Commit**

```bash
git add src/api/wakatime.ts src/api/wakatime.test.ts api/wakatime.ts src/components/presence/CodingPresence.astro src/pages/index.astro .env.example
git commit -m "feat(presence): add hybrid lanyard and wakatime coding activity widget"
```

---

### Task 4: Decap CMS Integration (`/admin`) for Git-Backed Dynamic Content

**Files:**

- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`
- Create: `public/admin/cms.js`
- Modify: `vercel.json` (ensure `noindex` header on `/admin`)

**Interfaces:**

- Produces: `/admin` Single Page Application allowing authoring of `src/content/blog/` and `src/content/projects/`.

- [ ] **Step 1: Create `public/admin/index.html`**

HTML file loading Decap CMS script from official CDN and loading custom editor extension script `/admin/cms.js`.

- [ ] **Step 2: Create `public/admin/cms.js` for `<Callout>` widget**

Register custom editor component for `<Callout type="..." title="...">` so writing blog posts in Decap does not strip MDX JSX elements.

- [ ] **Step 3: Create `public/admin/config.yml` matching collection schemas**

Configure backend (`git-gateway` or GitHub repo), media folder (`public/images/uploads`), public folder (`/images/uploads`), and exact frontmatter fields for:

- Collection `blog`: `title`, `description`, `date`, `updated`, `tags`, `cover`, `project`, `draft`, `body`.
- Collection `projects`: `title`, `summary`, `role`, `period`, `stack`, `liveUrl`, `repoUrl`, `cover`, `featured`, `order`, `draft`, `body`.

- [ ] **Step 4: Update `vercel.json` with security headers for `/admin`**

Add `X-Robots-Tag: noindex, nofollow` to headers matching `/admin/**`.

- [ ] **Step 5: Verify build & links**

Run: `pnpm check && pnpm lint && pnpm test && pnpm build && pnpm check:links && pnpm check:seo`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/admin/ vercel.json
git commit -m "feat(cms): integrate decap cms for git-backed content authoring"
```

---

### Task 5: End-to-End Verification & Documentation

**Files:**

- Modify: `README.md`
- Modify: `docs/PRD.md`

- [ ] **Step 1: Run complete CI test suite locally**

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm check:links
pnpm check:seo
pnpm check:seo --live
```

Expected: All commands pass with 0 errors.

- [ ] **Step 2: Document setup instructions for Owner in `README.md`**

Add instructions for obtaining Spotify API keys, Discord ID for Lanyard, WakaTime API key, and Decap CMS GitHub OAuth activation.

- [ ] **Step 3: Commit**

```bash
git add README.md docs/PRD.md
git commit -m "docs: document dynamic features, presence APIs and CMS setup"
```
