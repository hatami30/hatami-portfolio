# hatami.tech

Portfolio + technical blog for a software engineer. Astro 7 (static), MDX content collections, Tailwind CSS 4, Pagefind search, and one Vercel Function for the contact form. Production: **https://hatami.tech**.

All owner content is still `[PLACEHOLDER: ...]`. Nothing here is real personal data yet.

## Quick start

Requirements: Node >= 22.12 (`nvm use` reads `.nvmrc`) and pnpm 10 (`corepack enable` picks the pinned version).

```bash
pnpm install
cp .env.example .env     # fill RESEND_API_KEY etc. to test the contact form locally
pnpm dev                 # http://localhost:4321 (site + POST /api/contact)
```

| Command                   | What it does                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                | Dev server. Drafts are visible. `POST /api/contact` works (dev-only route).                                                                                                                    |
| `pnpm check`              | Type and content-schema check (`astro check`).                                                                                                                                                 |
| `pnpm lint`               | ESLint (with jsx-a11y) and Prettier check.                                                                                                                                                     |
| `pnpm test`               | Vitest (contact API, helpers).                                                                                                                                                                 |
| `pnpm build`              | `astro check`, `astro build`, then the Pagefind index. Output: `dist/`.                                                                                                                        |
| `pnpm preview`            | Serve `dist/` (static only, no `/api`).                                                                                                                                                        |
| `pnpm check:links`        | After a build: broken internal links and trailing-slash links.                                                                                                                                 |
| `pnpm check:seo`          | After a build: SEO and AI-readability audit (titles, canonicals, JSON-LD, sitemap, llms.txt, `.md` files). `pnpm check:seo --live` first builds with indexing enabled, the state after launch. |
| `pnpm icons`              | Regenerates `favicon.ico` and `apple-touch-icon.png` from `public/favicon.svg`.                                                                                                                |
| `pnpm check:placeholders` | Lists remaining `[PLACEHOLDER: ...]` text. Report-only unless `LAUNCH_READY=true` or `--strict`.                                                                                               |
| `pnpm dev:vercel`         | `vercel dev`: production-like run with the real function (needs `vercel login` and a linked project).                                                                                          |

## Make it yours

1. Edit `src/config/site.ts`: name, role, description, email, socials, language (`'en'` or `'id'`).
2. Replace the example files in `src/content/projects/` and `src/content/blog/`. Frontmatter rules are in `AGENTS.md` section 6; invalid frontmatter fails the build.
3. Add `public/resume.pdf` and set `resumeUrl: '/resume.pdf'` in `site.ts`.
4. Run `pnpm check:placeholders` until nothing is left.

Publishing a post: add `src/content/blog/<slug>.mdx` with `draft: false`, push to `main`. `draft: true` keeps it out of production (visible in dev).

## Dynamic Features & Presence

### 1. Interactive Table of Contents (TOC)

- Posts and project case studies automatically render a responsive TOC from `h2` and `h3` headings.
- On desktop screens (`lg:`), TOC is displayed as a sticky right sidebar with reading progress calculation and scroll-spy highlighting via `IntersectionObserver`.

### 2. Spotify Now-Playing Widget

- Serverless endpoint: `GET /api/spotify` caches Spotify's currently-playing track with edge cache (`s-maxage=30`).
- If you aren't currently playing anything or credentials are not yet set, it gracefully renders an idle indicator without error.
- Setup:
  1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
  2. Set redirect URI to `http://localhost:4321/callback` or `https://hatami.tech/callback`.
  3. Generate your refresh token with scope `user-read-currently-playing`.
  4. Add to `.env` (and Vercel environment variables):
     - `SPOTIFY_CLIENT_ID`
     - `SPOTIFY_CLIENT_SECRET`
     - `SPOTIFY_REFRESH_TOKEN`

### 3. Developer Coding Presence

- Displays active coding status in the hero badge on the homepage.
- **Hybrid fallback**:
  1. Real-time active editor status (VS Code / Neovim) fetched directly via Lanyard Discord RPC if `PUBLIC_DISCORD_USER_ID` is provided.
  2. If offline/idle on Discord, queries `GET /api/wakatime` to display today's total coding hours and top languages.
  3. If both are unconfigured, displays standard availability message.
- Setup in `.env`:
  - `PUBLIC_DISCORD_USER_ID`: your 18-digit Discord snowflake ID (join the Lanyard Discord server first to activate).
  - `WAKATIME_API_KEY`: Secret API Key from [WakaTime Settings > Account](https://wakatime.com/settings/account).

### 4. Git-Backed Content Management (Decap CMS)

- Access the content manager at `/admin`.
- Supports editing `src/content/blog/` and `src/content/projects/` directly with live preview and custom `<Callout>` MDX support.
- **Local development**: run `npx decap-server` in a separate terminal and navigate to `http://localhost:4321/admin/`.
- **Production**: authenticate via GitHub OAuth or Netlify/Vercel Git Gateway.

## SEO and AI-readability

- `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph, and a linked JSON-LD graph (Person, WebSite, BlogPosting, ...) are generated from the content and `src/config/site.ts`.
- `/llms.txt` and `/llms-full.txt` (see https://llmstxt.org) and a Markdown version of every post and project (`/blog/<slug>.md`, `/projects/<slug>.md`) are generated automatically. llms.txt is a community proposal; no major vendor has formally confirmed that it reads it, so treat it as a cheap extra, not a ranking tool.
- `site.seo.aiTraining` in `site.ts`: `'allow'` (default) or `'disallow'` to block AI **training** crawlers while still allowing the crawlers that answer users' questions.
- Tag pages with fewer than 3 posts are `noindex` and not in the sitemap (`site.seo.minPostsForIndexableTag`).
- `pnpm check:seo` checks all of this on the build output and runs in CI.

## URLs

No trailing slashes anywhere (`/blog`, not `/blog/`). `astro.config.mjs` (`trailingSlash: 'never'`, `build.format: 'file'`) and `vercel.json` (`trailingSlash: false`, `cleanUrls: true`) must stay in sync.

## Deploy to Vercel (hatami.tech)

1. Push this repo to GitHub.
2. In Vercel: **Add New > Project**, import the repo. Framework preset: Astro. `vercel.json` already sets the build command (`pnpm build`) and output directory (`dist`).
3. Project Settings > General: set **Node.js Version** to 22.x.
4. Project Settings > Environment Variables (see `.env.example`):
   - `RESEND_API_KEY` (Sensitive), `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
   - Leave `PUBLIC_ALLOW_INDEXING` unset until launch.
5. Project Settings > Domains: add `hatami.tech` and `www.hatami.tech`. Vercel shows the DNS records to create at your registrar. Make `hatami.tech` the primary domain. (`vercel.json` also redirects `www` to the apex.)
6. Resend: verify `hatami.tech`, create an API key, and use an address on that domain as `CONTACT_FROM_EMAIL`. Start early; DNS verification can take time.
7. Vercel Firewall: add a rate-limit rule for `POST /api/contact` (check which plan includes it).
8. Send a real test message through the live form.

Until launch the whole site is `noindex` and `robots.txt` disallows everything.

### Launch

1. Replace all placeholders; `pnpm check:placeholders --strict` passes.
2. Set the GitHub repository variable `LAUNCH_READY` to `true` (CI placeholder check becomes blocking).
3. Set `PUBLIC_ALLOW_INDEXING=true` for **Production** in Vercel and redeploy (`PUBLIC_*` values are inlined at build time).
4. Verify the domain in Google Search Console and Bing Webmaster Tools; submit `https://hatami.tech/sitemap.xml`.

### Check the first deployment

These behaviors could not be tested before a real deployment, so check them once (`AGENTS.md` section 13, Phase 8, has the full list):

```bash
curl -sI https://hatami.tech/blog/            # expect a redirect to /blog
curl -sI https://www.hatami.tech/blog         # expect a redirect to https://hatami.tech/blog
curl -s -X POST https://hatami.tech/api/contact -H 'Content-Type: application/json' \
  -H 'Origin: https://evil.example' -d '{}'   # expect 403 {"ok":false,"error":"forbidden_origin"}
curl -sI https://hatami.tech/no-such-page     # expect 404
```

## Project docs

- `AGENTS.md`: instructions for AI coding agents and the source of truth for implementation rules.
- `docs/PRD.md`: what the site is for and its requirements.
- `docs/ERD.md`: the content model (there is no database).

## Notes

- Vercel's Hobby plan is for non-commercial use; check the current terms against how you use the site.
- Pagefind search needs a build (`pnpm build`); it does not exist in `pnpm dev`.
