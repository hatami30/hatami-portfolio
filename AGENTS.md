# AGENTS.md: Portfolio + Blog (hatami.tech)

> Read this entire file before writing any code. It is the source of truth for this project.
> If a chat prompt conflicts with this file, point out the conflict and ask before deviating.
>
> Related documents: `docs/PRD.md` (what to build and why) and `docs/ERD.md` (content model and relationships). The PRD wins on scope; this file wins on implementation details and holds the authoritative schema rules (section 6). Keep all three in sync.

**State of the repository:** this is a working boilerplate. Phases 0-6 (section 13) are implemented, plus an SEO and AI-readability layer (section 8: `llms.txt`, custom sitemap, entity-graph JSON-LD, `pnpm check:seo`). Everything passes `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links` and `pnpm check:seo`. All owner content is still `[PLACEHOLDER: ...]`. Your work is to keep it healthy, finish Phase 7, and replace placeholders with real content **only when the owner supplies it**.

---

## 1. Project overview

A personal portfolio website for a software engineer, with a technical blog. Production domain: **https://hatami.tech** (canonical host, no `www`). Hosted on **Vercel**.

**Goals**

1. Present 3-6 projects as case studies (problem, role, decisions, result).
2. Publish technical writing that can rank for specific technical searches.
3. Be easy to find by searching the owner's name.
4. Be fast, accessible, and near-zero maintenance.

**Audience:** recruiters, hiring managers, freelance clients, other developers.

**Non-goals (do not build):** user accounts, database, CMS backend, e-commerce, server-rendered pages, heavy animation, multi-language routing (prepare for it, do not implement it).

---

## 2. Tech stack

| Concern           | Choice                                                                                                                             | Notes                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | Astro 7, `output: 'static'`                                                                                                        | Static HTML, minimal client JS. No adapter.                                                                                                                                                    |
| Language          | TypeScript 6, `strict`                                                                                                             | TypeScript 7 is not compatible with `@astrojs/check` / `typescript-eslint` at the time of writing; do not upgrade without checking.                                                            |
| Styling           | Tailwind CSS 4 via `@tailwindcss/vite` + `@tailwindcss/typography`                                                                 | CSS variables for theme tokens. Do not use the legacy `@astrojs/tailwind` integration.                                                                                                         |
| Content           | Astro Content Collections (glob loader) + MDX                                                                                      | Markdown files in Git, no database                                                                                                                                                             |
| Code highlighting | Shiki (built into Astro)                                                                                                           | Dual theme: `github-light` / `github-dark`                                                                                                                                                     |
| Search            | Pagefind                                                                                                                           | Index generated after build; UI loaded in the browser                                                                                                                                          |
| Sitemap / RSS     | Own `src/pages/sitemap.xml.ts` endpoint, `@astrojs/rss`                                                                            | The `@astrojs/sitemap` integration was dropped: its `serialize`/`filter` hooks only see URLs, so accurate `lastmod` and the thin-tag rule would have needed a second copy of the content logic |
| AI-readable files | `/llms.txt`, `/llms-full.txt`, `.md` version of every post and project                                                             | Generated from the content collections (section 8.4)                                                                                                                                           |
| OG images         | `satori` + `@resvg/resvg-js`                                                                                                       | Build time, static `.woff` from `@fontsource/inter`                                                                                                                                            |
| Images            | `astro:assets`                                                                                                                     | `sharp` installed                                                                                                                                                                              |
| Fonts             | Fontsource (`@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`)                                                   | Self-hosted                                                                                                                                                                                    |
| Package manager   | pnpm 10 (`packageManager` is pinned)                                                                                               | Node >= 22.12 (`.nvmrc`: 22)                                                                                                                                                                   |
| Hosting           | **Vercel**                                                                                                                         | Static output from `dist/` plus one Vercel Function                                                                                                                                            |
| Domain            | `hatami.tech`                                                                                                                      | `www.hatami.tech` redirects to it                                                                                                                                                              |
| API               | Vercel Function, Node.js runtime, `api/contact.ts`                                                                                 | One endpoint only: `POST /api/contact` (section 12.2)                                                                                                                                          |
| API validation    | Zod 4 (`zod`)                                                                                                                      | Content schemas use `astro/zod`                                                                                                                                                                |
| Email delivery    | Resend REST API via `fetch`                                                                                                        | No SDK                                                                                                                                                                                         |
| Anti-spam         | Honeypot + same-origin check; Vercel Firewall rate limit (owner)                                                                   | Turnstile later if needed, not in MVP                                                                                                                                                          |
| Tests             | Vitest 5                                                                                                                           | API handler + pure helpers                                                                                                                                                                     |
| Comments          | Giscus                                                                                                                             | Optional, env-gated                                                                                                                                                                            |
| Analytics         | Umami                                                                                                                              | Optional, env-gated                                                                                                                                                                            |
| Quality           | `astro check`, ESLint 10 (+ jsx-a11y), Prettier, `check:links`, `check:seo` (`node-html-parser`), Lighthouse CI (Phase 7, not yet) |                                                                                                                                                                                                |

**Version rule:** before using any Astro, Tailwind, Pagefind, or Vercel API, read the official documentation for the **installed** version. Do not rely on memory. APIs change between major versions (Astro 7 example: a Vite `server.middlewares` hook did not intercept dev requests, so the dev API uses `injectRoute`).

**Do not add** React/Vue/Svelte, UI component libraries, CSS-in-JS, state-management libraries, a CMS, a database, or an API framework (Express, Hono) unless the owner explicitly asks. Do not add the Astro Vercel adapter: the site is fully static and the API is a plain Vercel Function. If an interactive island truly needs a framework, ask first and justify it.

---

## 3. Commands

```bash
pnpm install --frozen-lockfile
pnpm dev                  # Astro dev server; also serves POST /api/contact (dev-only route)
pnpm check                # astro check: types + content schema validation
pnpm lint                 # eslint + prettier --check
pnpm test                 # vitest run
pnpm build                # astro check && astro build && pagefind --site dist
pnpm preview              # serve dist/ locally (static only, no /api)
pnpm check:links          # after build: broken internal links and trailing-slash links in dist/
pnpm check:seo            # after build: SEO + AI-readability audit of dist/ (indexing closed)
pnpm check:seo --live     # builds with PUBLIC_ALLOW_INDEXING=true into dist-live/ and audits that
pnpm icons                # regenerate favicon.ico + apple-touch-icon.png from public/favicon.svg
pnpm check:placeholders   # launch gate only; NOT part of build or the per-task checks
pnpm dev:vercel           # vercel dev: production-like run with the real Vercel Function (needs `vercel login` + link)
pnpm format               # prettier --write
```

A task is not done until `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build` all pass, and `pnpm check:links`, `pnpm check:seo` and `pnpm check:seo --live` pass after the build.

`pnpm dev` loads `.env` (if present) for the dev-only API route. `GET /api/contact` in dev returns the module source because Vite serves it; test the endpoint with `POST` only.

---

## 4. Directory structure

```
.
├── AGENTS.md
├── README.md
├── docs/
│   ├── PRD.md
│   └── ERD.md
├── api/
│   └── contact.ts                # Vercel Function entry (thin): export default { fetch }
├── astro.config.mjs
├── vercel.json                   # build, trailing slash, www redirect, headers (noindex for .md and llms files)
├── public/
│   ├── favicon.svg               # source icon: replace with your logo, then run `pnpm icons`
│   ├── favicon.ico               # generated by `pnpm icons`
│   ├── apple-touch-icon.png      # generated by `pnpm icons`
│   └── resume.pdf                # [PLACEHOLDER: owner adds, then sets site.resumeUrl]
├── scripts/
│   ├── check-links.mjs           # internal link checker for dist/
│   ├── check-seo.mjs             # SEO + AI-readability audit of the build output
│   ├── check-placeholders.mjs    # launch gate
│   ├── dev-api.mjs               # Astro integration: injects the dev-only /api/contact route
│   └── generate-icons.mjs        # favicon.ico + apple-touch-icon.png from favicon.svg
├── src/
│   ├── api/
│   │   ├── contact.ts            # handleContact(request, env, fetchImpl): all API logic
│   │   ├── contact.test.ts
│   │   └── entry.test.ts         # guards the Vercel entry shape
│   ├── config/
│   │   ├── site.ts               # name, url, lang, socials, nav, bio, skills, seo (single source of truth)
│   │   └── strings.ts            # all UI strings, EN + ID dictionaries
│   ├── content/
│   │   ├── projects/*.mdx
│   │   └── blog/*.mdx
│   ├── content.config.ts
│   ├── components/
│   │   ├── layout/               # Header, Footer, ThemeToggle, SkipLink
│   │   ├── seo/                  # SEO.astro, JsonLd.astro
│   │   ├── projects/             # ProjectCard, ProjectMeta
│   │   ├── blog/                 # PostCard, TagList, TableOfContents, Callout, Pagination, Search
│   │   ├── integrations/         # Umami, Giscus (env-gated)
│   │   └── ui/                   # Button, Container, Breadcrumbs
│   ├── dev/contact-route.ts      # dev-only route, never in production
│   ├── layouts/                  # BaseLayout, PostLayout
│   ├── lib/
│   │   ├── content.ts            # ONLY place that queries collections
│   │   ├── seo.ts                # canonical, indexing gate, JSON-LD builders
│   │   ├── robots.ts, sitemap.ts # pure builders for robots.txt and sitemap.xml
│   │   ├── llms.ts               # pure builders for llms.txt, llms-full.txt and the .md files
│   │   ├── llms-source.ts        # feeds llms.ts from the collections and site config
│   │   ├── markdown.ts           # MDX -> clean Markdown (imports, components, links)
│   │   ├── related.ts            # related posts by shared tags
│   │   └── og, pagination, readingTime, format, placeholder (+ tests next to each file)
│   ├── pages/
│   │   ├── index.astro, about.astro, contact.astro, 404.astro
│   │   ├── projects/{index.astro,[slug].astro,[slug].md.ts}
│   │   ├── blog/{index.astro,[slug].astro,[slug].md.ts,page/[page].astro,tag/[tag].astro}
│   │   ├── og/[...slug].png.ts   # build-time OG images
│   │   ├── llms.txt.ts, llms-full.txt.ts
│   │   ├── robots.txt.ts         # indexing gate + AI crawler policy
│   │   ├── sitemap.xml.ts
│   │   └── rss.xml.ts
│   └── styles/global.css
├── .env.example                  # all variables, names only
└── .github/workflows/ci.yml
```

---

## 5. Site config (placeholders)

All owner-specific facts live in `src/config/site.ts`. **Never invent personal information.** Current state: `url` is `https://hatami.tech`, `lang` is `'en'` (owner may set `'id'`), and `name`, `role`, `description`, `email`, and `socials` are `[PLACEHOLDER: ...]` markers. `resumeUrl` is empty (links are hidden until the owner adds `public/resume.pdf` and sets it to `/resume.pdf`). Nav hrefs have **no trailing slash**. `bio` (one string per paragraph) and `skills` (one `"Group: a, b, c"` string per line) feed `/about`, the `Person` JSON-LD (`knowsAbout`) and `llms-full.txt`. `seo.aiTraining` (`'allow'` by default, or `'disallow'`) and `seo.minPostsForIndexableTag` (3) drive section 8.3 and 8.5.

All visible UI text (button labels, headings that are not content, error messages) goes in `src/config/strings.ts`, not hard-coded in components. It already contains complete English and Indonesian dictionaries, selected by `site.lang`.

---

## 6. Content schemas

Defined with Zod in `src/content.config.ts`. Invalid frontmatter **fails the build**.

**Blog**

| Field         | Type      | Rules                                                           |
| ------------- | --------- | --------------------------------------------------------------- |
| `title`       | string    | required                                                        |
| `description` | string    | required, max 160 chars                                         |
| `date`        | date      | required (`z.coerce.date()`)                                    |
| `updated`     | date      | optional                                                        |
| `tags`        | string[]  | default `[]`, lowercase kebab-case, no duplicates               |
| `cover`       | image     | optional (`image()` helper)                                     |
| `project`     | reference | optional, `reference('projects')`; links a post to a case study |
| `draft`       | boolean   | default `false`                                                 |

**Projects**

| Field      | Type     | Rules                                          |
| ---------- | -------- | ---------------------------------------------- |
| `title`    | string   | required                                       |
| `summary`  | string   | required, max 160 chars                        |
| `role`     | string   | required, e.g. "Solo developer"                |
| `period`   | string   | optional, e.g. "2025"                          |
| `stack`    | string[] | required, at least 1                           |
| `liveUrl`  | url      | optional                                       |
| `repoUrl`  | url      | optional                                       |
| `cover`    | image    | optional                                       |
| `featured` | boolean  | default `false` (homepage shows featured only) |
| `order`    | number   | default `100`, lower first                     |
| `draft`    | boolean  | default `false`                                |

**Draft handling:** `src/lib/content.ts` exports `getPublishedPosts()`, `getPublishedProjects()`, and `getPostsForProject(slug)`. In production they exclude `draft: true`; in dev (`import.meta.env.DEV`) they include drafts. A published post that references a missing or draft project **fails the build**. **No page, RSS feed, tag page, search index, or OG route may query a collection directly.** Always go through these helpers.

**Case study body convention (projects):** Problem, My role, Stack and key decisions (why X over Y), Result, Links.

---

## 7. Routes and page requirements

| Route                                    | Content                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/`                                      | Hero (name, role, one-line value, CTA to projects + contact), featured projects (max 3), latest 3 posts, short contact CTA |
| `/projects`                              | All published projects, ordered by `order`                                                                                 |
| `/projects/[slug]`                       | Case study with metadata (role, period, stack, links) and a "Related posts" list                                           |
| `/blog`                                  | Posts newest first, tag list, search box, pagination at 10/page (`/blog/page/[n]` for n >= 2)                              |
| `/blog/[slug]`                           | Post with reading time, table of contents (h2/h3), tags, link to its related project, prev/next, optional Giscus           |
| `/blog/tag/[tag]`                        | Posts for a tag                                                                                                            |
| `/about`                                 | Short factual bio in plain sentences, skills, link to resume PDF                                                           |
| `/contact`                               | Contact form + direct email + social links                                                                                 |
| `/rss.xml`                               | Published posts only                                                                                                       |
| `/sitemap.xml`, `/robots.txt`            | Generated; see 8.3 and 8.5                                                                                                 |
| `/llms.txt`, `/llms-full.txt`            | Generated for AI tools; see 8.4                                                                                            |
| `/blog/[slug].md`, `/projects/[slug].md` | The same post or case study as clean Markdown; see 8.4                                                                     |
| `/404`                                   | Helpful, links to home, projects, blog; `noindex`                                                                          |
| `/api/contact`                           | The only dynamic endpoint (section 12.2)                                                                                   |

**URL rule: no trailing slashes.** Write every internal link as `/blog`, `/blog/my-post`, never `/blog/`. Configuration that must stay in sync: `astro.config.mjs` (`trailingSlash: 'never'`, `build.format: 'file'`) and `vercel.json` (`trailingSlash: false`, `cleanUrls: true`). Reason: with `trailingSlash: true`, Vercel's routing (checked in the `@vercel/routing-utils` source) also redirects `/api/contact` to `/api/contact/`, which is an unnecessary risk for the one endpoint that must not move. `pnpm check:links` fails on any trailing-slash link in the build output.

Every page must have exactly one `<h1>` and a logical heading order.

---

## 8. SEO and AI-readability

### 8.1 Every HTML page

`SEO.astro` is used by `BaseLayout`. Every page outputs:

- `<title>` and a unique meta description (aim for 50-160 characters; `check:seo` warns outside that range and fails on duplicates)
- `<link rel="canonical">` built by `canonicalUrl()` in `src/lib/seo.ts` (no trailing slash, no `.html`, `/` for home). With `build.format: 'file'`, Astro reports `/blog.html` and `/index.html` as pathnames while building; never build canonicals from `Astro.url.pathname` directly.
- `<meta name="robots">` (see 8.5) and `<meta name="author">`
- Open Graph (`og:type`, `og:title`, `og:description`, `og:image` + width/height/alt, `og:url`, `og:site_name`, `og:locale`) and `twitter:card` = `summary_large_image` with image alt
- `<html lang>` from `site.lang`, viewport, light/dark `theme-color`
- Icons: `favicon.ico` (48px), `favicon.svg`, `apple-touch-icon.png`
- `<link rel="describedby" href="/llms.txt">` on every page; on posts and projects also `<link rel="alternate" type="text/markdown" href="/blog/<slug>.md">` (`markdownPath` prop)

**Title patterns:** Home `{name}: {role}`; other pages `{page title} | {name}`. Titles around 50-60 chars.

**Descriptions:** list pages use `t.<section>.metaDescription(...)` from `strings.ts` (longer than the on-page intro text); posts use `description`, projects use `summary`; the home page uses `site.description`; every other page has its own, so no two pages share one.

### 8.2 Structured data (`src/lib/seo.ts`, rendered by `JsonLd.astro`)

One entity graph. `Person` has `@id` `https://hatami.tech/#person` and `WebSite` has `https://hatami.tech/#website`; every other node points at them, so search engines and AI tools resolve "who wrote this" to one entity. Authors are written inline (`@id`, `name`, `url`) so each page is valid on its own.

| Page                           | JSON-LD                                                                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | `Person`, `WebSite`                                                                                                                                                          |
| `/about`                       | `ProfilePage` (mainEntity: the Person), `Person` (with `knowsAbout` from `site.skills`), `BreadcrumbList`                                                                    |
| `/projects`, `/blog/tag/[tag]` | `CollectionPage`, `BreadcrumbList`                                                                                                                                           |
| `/projects/[slug]`             | `CreativeWork` (author, keywords = stack, `sameAs` = live and repo URLs), `BreadcrumbList`                                                                                   |
| `/blog`                        | `Blog` (with the posts on the page), `BreadcrumbList`                                                                                                                        |
| `/blog/[slug]`                 | `BlogPosting` (headline, description, image, `datePublished`, `dateModified` = `updated ?? date`, `keywords`, `timeRequired`, author, publisher, isPartOf), `BreadcrumbList` |
| `/contact`                     | `ContactPage`, `BreadcrumbList`                                                                                                                                              |

`BreadcrumbList` always starts at Home and ends at the current page; the visible `Breadcrumbs.astro` component uses the same items. Never emit structured data about content that is not visible on the page.

### 8.3 Sitemap, robots.txt, RSS

- `sitemap.xml` is hand-written (`src/pages/sitemap.xml.ts`) from the same content helpers as the pages, so drafts never appear. Static pages come from `site.nav`. `lastmod` is set only where it is accurate (posts, and the home page, blog index and tag pages that show them: the newest `updated ?? date`); projects and static pages have none. Tag pages with fewer posts than `site.seo.minPostsForIndexableTag` are left out. There is no `sitemap-index.xml`.
- `robots.txt` is built by `buildRobotsTxt()` (`src/lib/robots.ts`): closed while the indexing gate is off; otherwise `Allow: /` plus a `Sitemap:` line. With `site.seo.aiTraining = 'disallow'` it also blocks crawlers that collect AI training data (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Meta-ExternalAgent, Bytespider) but **never** the ones that fetch pages to answer users or build AI search (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot): blocking those only removes the site from AI answers. Crawler names change, so review the list in `robots.ts` now and then.
- RSS (`/rss.xml`): published posts only; links use no trailing slash (`trailingSlash: false` in the rss options).

### 8.4 llms.txt and Markdown versions

For AI tools that read a site instead of crawling it. Everything is generated from the content collections and `site.ts`; nothing is hand-maintained.

- `/llms.txt` follows https://llmstxt.org: H1 with the name, a `>` summary, then H2 sections (About, Projects, Blog) of `- [title](canonical url): note` entries, and a final literal `## Optional` section (`llms-full.txt`, RSS, sitemap). Links point at the canonical HTML pages so that citations credit the real URL.
- `/llms-full.txt`: bio, skills, contact, then every project and post in full as Markdown (headings nested under the section headings).
- `/blog/<slug>.md`, `/projects/<slug>.md`: one entry as clean Markdown: H1, summary, facts (URL, dates, tags, role, stack, links), body.
- `src/lib/markdown.ts` converts MDX to Markdown: removes `import`/`export` lines and comments, turns `<Callout>` into a blockquote, drops other components but keeps their text, makes root-relative links absolute, and never touches fenced code. **When you add an MDX component, add its Markdown form there and a test.** Multi-line `import`/`export` blocks and JSX attributes containing `>` are not supported.
- Builders are pure (`src/lib/llms.ts`, tested); `src/lib/llms-source.ts` feeds them. Labels come from `t.llms` in `strings.ts`, so the files follow `site.lang`; the `## Optional` heading stays English because it is a keyword of the format.
- **Honest status:** llms.txt is a community proposal, not a standard. A 2026 GEO guide checked while building this states that OpenAI, Google, Microsoft and Perplexity have not formally endorsed it (that guide is vendor-written and cites no measurements), and Anthropic publishes one for its own docs. No documented benefit was found. It costs almost nothing, so the boilerplate ships it; do not promise the owner ranking or citation gains from it. What does help AI answers is already part of this site: clean semantic HTML, the entity-graph JSON-LD, crawlable pages, and not blocking the AI search crawlers.

### 8.5 Indexing policy

- **Indexing gate.** `PUBLIC_ALLOW_INDEXING` (build-time) defaults to off: every page gets `noindex, nofollow` and `robots.txt` is `Disallow: /`. The owner sets it to `true` in Vercel **Production only** at launch. Never flip the default in code.
- After launch, `noindex, follow` pages: `/404` and tag pages with fewer than `site.seo.minPostsForIndexableTag` (3) published posts (thin duplicates of the blog list). They are excluded from the sitemap.
- Paginated blog pages (`/blog/page/[n]`) are indexable, canonical to themselves, with a unique title and description.
- `.md` files, `llms.txt` and `llms-full.txt` are served with `X-Robots-Tag: noindex` (`vercel.json`) so they do not compete with the HTML pages in search results. This is a design choice to keep search results clean, not a measured effect; AI tools that fetch the files directly do not rely on the search index.
- One canonical host: `https://hatami.tech`. `www.hatami.tech` redirects to it (`vercel.json`).

### 8.6 Internal linking

Visible breadcrumbs (posts, projects, tag pages), related posts on each post (up to 3, ranked by shared tags then date, `getRelatedPosts()`), previous/next post, post <-> project links, topic (tag) links. Internal links use descriptive anchor text, never "click here". Images always have meaningful `alt`.

### 8.7 Quality gate: `pnpm check:seo`

Reads the build output (no network). **Fails** on: missing or duplicate `<title>`/description (placeholder text only warns), canonical missing, not unique, with a trailing slash or different from the page's URL, `og:url` differing from the canonical, missing robots/viewport/lang, not exactly one `<h1>`, missing Open Graph/Twitter tags or `og:image` file, `<img>` without `alt`, icons or head links pointing at missing files, invalid JSON-LD (missing `@type`/`@context`, `BlogPosting` without headline/dates/image/author, breadcrumbs not starting at home or ending at the page, off-site `@id`), a sitemap with bad, duplicate, noindex or non-canonical URLs, `llms.txt` without H1 + summary or with links that do not resolve or posts/projects not listed, a missing `.md` version, RSS links with a trailing slash or that do not resolve. With indexing open it also fails when an indexable page is missing from the sitemap or `robots.txt` lacks the `Sitemap:` line. **Warns** on long titles, short or long descriptions, and heading-level jumps. `--live` builds with indexing enabled first, so CI checks the state the site will have after launch.

### 8.8 Other

- OG images are generated at build time (1200x630) per post and project, with `/og/default.png` as fallback.
- Icons: edit `public/favicon.svg`, run `pnpm icons`, commit the generated `favicon.ico` and `apple-touch-icon.png`.
- Owner-side steps that code cannot do (Search Console, Bing Webmaster Tools, validating JSON-LD on the live URL) are in section 15.

---

## 9. Design and UX

- Minimal, typography-led. One accent color, neutral grays, generous whitespace.
- One sans-serif and one monospace font, self-hosted, `font-display: swap`.
- Theme tokens as CSS variables (`--bg`, `--fg`, `--muted`, `--border`, `--accent`) for light and dark, in `src/styles/global.css`. Contrast was verified for WCAG AA; re-verify if you change a color.
- Dark mode follows the system by default; the toggle persists in `localStorage`. An inline script in `<head>` sets `data-theme` before paint (no flash). Keep it inline.
- Prose width capped around 65-75ch. Code blocks scroll horizontally inside their container.
- Mobile-first. Test at 360px, 768px, 1280px. No horizontal page scroll.
- Motion: subtle only. Respect `prefers-reduced-motion`.
- **Do not copy** any existing site's layout or assets.

---

## 10. Quality budgets

- Lighthouse (mobile) **>= 95** for Performance, Accessibility, Best Practices, SEO on: home, one project page, one blog post. (Not yet measured: Phase 7.)
- Zero framework JavaScript on content pages. Allowed client JS: theme toggle, search UI, contact form enhancement, optional Giscus/Umami loaders.
- Accessibility: WCAG 2.2 AA contrast, visible focus styles, skip-to-content link, keyboard-operable navigation and form, labels on all inputs, semantic landmarks.
- No layout shift: images and embeds have explicit dimensions.
- No console errors or warnings in dev or production.

---

## 11. Coding conventions

**Do**

- Keep components small and single-purpose. Prefer `.astro` components.
- Use Tailwind utilities; extract repeated patterns into components, not custom CSS.
- Use TypeScript types for all props. No `any` without a comment explaining why.
- Use `astro:assets` for all local images.
- Use semantic HTML before ARIA.
- Write comments only for non-obvious decisions.

**Do not**

- Hard-code personal data, URLs, or UI strings outside `site.ts` / `strings.ts`.
- Query content collections outside `src/lib/content.ts`.
- Write internal links with a trailing slash.
- Add an MDX component without adding its Markdown form in `src/lib/markdown.ts` (and a test).
- Add a page without checking it appears in `sitemap.xml` (or is deliberately `noindex`): `pnpm check:seo --live` fails otherwise.
- Commit secrets. Only `.env.example` is committed; `.env` is git-ignored.
- Add a dependency without stating why in your summary.
- Fabricate content: bio, employers, metrics, testimonials, project details, links.
- Edit this file unless asked. Propose changes instead.

**Placeholders:** any content the owner must supply is written as `[PLACEHOLDER: what is needed]`. `pnpm check:placeholders` lists every remaining placeholder in `src` and `public`. It is **not** part of `pnpm build`. It is a **launch gate**: CI reports placeholders on every run and makes the check blocking only when the repository variable `LAUNCH_READY` is `true` (the script also fails with `--strict`).

**Commits:** small, conventional (`feat:`, `fix:`, `chore:`, `docs:`).

---

## 12. Environment variables and API

### 12.1 Environment variables

One file, `.env.example`, lists every variable by name. Copy it to `.env` for local work; never commit `.env`. In production set the same names in **Vercel: Project > Settings > Environment Variables**.

| Variable                                                      | Kind                 | Where used       | Notes                                               |
| ------------------------------------------------------------- | -------------------- | ---------------- | --------------------------------------------------- |
| `RESEND_API_KEY`                                              | secret (server)      | `api/contact.ts` | Mark as Sensitive in Vercel                         |
| `CONTACT_TO_EMAIL`                                            | server               | `api/contact.ts` | Inbox that receives messages                        |
| `CONTACT_FROM_EMAIL`                                          | server               | `api/contact.ts` | Must be an address on the domain verified in Resend |
| `PUBLIC_ALLOW_INDEXING`                                       | build-time           | SEO, robots.txt  | `true` only in Production at launch                 |
| `PUBLIC_UMAMI_SCRIPT_URL`, `PUBLIC_UMAMI_WEBSITE_ID`          | build-time, optional | Umami            | Render nothing when empty                           |
| `PUBLIC_GISCUS_REPO`, `_REPO_ID`, `_CATEGORY`, `_CATEGORY_ID` | build-time, optional | Giscus           | Render nothing when empty                           |

`PUBLIC_*` values are inlined into the build: **redeploy after changing them**. Server variables apply to new deployments only, so redeploy after changing those too.

There is no origin variable. The API compares the request's `Origin` header with the request's own origin (`new URL(request.url).origin`), so localhost, preview URLs, and `hatami.tech` all work with no configuration.

### 12.2 API: contact endpoint

The site has exactly **one** endpoint. Everything else is static.

**Stack**

- Runtime: a Vercel Function (Node.js) at `api/contact.ts`. The file is a thin entry: `export default { fetch(request) { return handleContact(request, process.env); } }` (web-standard handler). Do not rename the `api/` directory; Vercel requires it at the project root.
- All logic lives in `src/api/contact.ts` as `handleContact(request, env, fetchImpl = fetch)`: platform-neutral, uses Web APIs only (`Request`, `Response`, `URL`, `fetch`, `AbortSignal.timeout`), and is unit-tested without network. The same handler serves the dev-only route `src/dev/contact-route.ts`.
- Validation: Zod 4. Email: Resend REST API (`POST https://api.resend.com/emails`, `Authorization: Bearer <RESEND_API_KEY>`, fields `from`, `to`, `reply_to`, `subject`, `text`). Re-check Resend's current docs when touching this.
- No API framework and no Resend SDK. If more endpoints are ever needed, propose Hono first and wait for approval.

**Contract**

Request: `POST /api/contact`, `Content-Type: application/json`, body up to 10 KB.

```json
{ "name": "Ada", "email": "ada@example.com", "message": "Hello, ...", "website": "" }
```

| Status | Body                                                                             | When                                                                |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 200    | `{ "ok": true }`                                                                 | Email sent, **or** honeypot filled (silent success, nothing sent)   |
| 400    | `{ "ok": false, "error": "validation", "fields": { "email": "invalid_email" } }` | Field validation failed                                             |
| 400    | `{ "ok": false, "error": "bad_request" }`                                        | Body is not valid JSON                                              |
| 403    | `{ "ok": false, "error": "forbidden_origin" }`                                   | `Origin` header present and different from the request's own origin |
| 405    | `{ "ok": false, "error": "method_not_allowed" }` plus `Allow: POST`              | Any method other than POST                                          |
| 413    | `{ "ok": false, "error": "payload_too_large" }`                                  | Body over 10 KB                                                     |
| 415    | `{ "ok": false, "error": "unsupported_media_type" }`                             | Not `application/json`                                              |
| 500    | `{ "ok": false, "error": "server_error" }`                                       | Missing or invalid configuration                                    |
| 502    | `{ "ok": false, "error": "send_failed" }`                                        | Resend returned an error or timed out                               |

A `429` can come from the Vercel Firewall rate-limit rule; its body is Vercel's, not ours. The client treats it as a generic error.

All handler responses carry `Content-Type: application/json` and `Cache-Control: no-store`. Error bodies never include stack traces, provider messages, or echoed user input. `fields` values are codes (`required`, `too_short`, `too_long`, `invalid_email`); the client maps them to text in `strings.ts`.

**Validation (Zod)** after trimming. Data reference: `docs/ERD.md` section 7.

| Field     | Rule                                              |
| --------- | ------------------------------------------------- |
| `name`    | 1-100 chars                                       |
| `email`   | valid email, max 254 chars                        |
| `message` | 10-2000 chars                                     |
| `website` | honeypot: must be empty, otherwise silent success |

**Email composition:** `from` = `CONTACT_FROM_EMAIL`, `to` = `CONTACT_TO_EMAIL`, `reply_to` = visitor's email. `subject` = `New message from <name>` with control characters stripped, max 100 chars (prevents header injection). Plain-text body only; user input is never interpolated into markup.

**Security**

- Origin check as in the contract. No CORS headers: same-origin only.
- No in-memory rate limiting (serverless instances are ephemeral). The owner adds a Vercel Firewall rate-limit rule for `/api/contact`.
- Turnstile is **not** in MVP. Keep the handler structured so a server-side token check can be added as a small, isolated change.
- Resend request aborts after 8 seconds (`AbortSignal.timeout(8000)`) and returns 502.
- Secrets only from `env`. Missing variable: 500 and log `contact:missing_env` (never values).
- Logging: event names and status codes only (for example `contact:sent`, `contact:resend_error status=422`). **Never log the name, email, message, or any key.** A test enforces this.
- Store nothing: no database, queue, KV, or file.

**Client behavior (contact page, already implemented; preserve it)**

- Submit with `fetch` to `/api/contact`; disable the button while pending; `aria-live="polite"` status region; success clears the form.
- On `400 validation`: `aria-invalid` + `aria-describedby` on failing fields, messages from `strings.ts`, focus the first invalid field.
- On 403, 429, 500, 502, or network failure: generic error plus the direct email link.
- Honeypot hidden with CSS (not `type="hidden"`), `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`.
- Client validation is a convenience; the server is the authority.

**Local development**

```
cp .env.example .env     # fill RESEND_API_KEY etc. (use a Resend test setup so no real mail is sent)
pnpm dev                 # site + POST /api/contact on the same port
```

For a production-like run with the real Vercel Function, use `pnpm dev:vercel` (requires the Vercel CLI login and a linked project). `pnpm preview` serves static files only.

**Tests (Vitest, `fetch` mocked, no network):** valid input (Resend called once with the expected payload); honeypot (Resend not called); validation codes; malformed JSON; wrong content type; oversized body; same-origin passes and cross-origin 403; non-POST 405; Resend error and timeout give 502; missing env gives 500; no console output contains the name, email, or message; the Vercel entry exports `fetch` and delegates to the handler.

---

## 13. Build phases

Work **one phase at a time**, only the phase the owner names. Each phase ends with its acceptance criteria met and the checks from section 3 passing.

| Phase                      | Status                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 Scaffold and tooling     | Done                                                                                                                                                                                                         |
| 1 Layout and design system | Done                                                                                                                                                                                                         |
| 2 Content collections      | Done (negative tests passed: bad frontmatter, missing project reference, draft project reference all fail the build)                                                                                         |
| 3 Core pages               | Done                                                                                                                                                                                                         |
| 4 Blog                     | Done                                                                                                                                                                                                         |
| 5 SEO                      | Done, then extended with the AI-readability layer: llms.txt, `.md` versions, custom sitemap, entity-graph JSON-LD, breadcrumbs, related posts, `check:seo`                                                   |
| 6 Integrations             | Done (Pagefind, contact API, Giscus, Umami)                                                                                                                                                                  |
| 7 Quality gates            | **Partial**: `ci.yml` runs lint, test, build (with `astro check`), `check:links`, `check:seo`, `check:seo --live` and the placeholder report. **Remaining: Lighthouse CI with the budgets from section 10.** |
| 8 Deploy                   | **Owner tasks**, then verification on the real deployment (see below)                                                                                                                                        |

### Phase 7 remaining: Lighthouse CI

- Add Lighthouse CI to `.github/workflows/ci.yml` against the built `dist/` (home, one project, one post), asserting >= 0.95 for the four categories on mobile. Read the current Lighthouse CI docs for the installed version and static-dist setup; pin action versions.
- **Done when:** CI is green on a clean clone and fails when a budget or link is broken.

### Phase 8: Deploy and verify (after the owner connects Vercel)

Things that **could not be verified in the build environment** and must be checked on the first real deployment. Report each as pass/fail; do not claim them without evidence:

1. `/blog`, `/projects`, `/about`, `/contact` return 200 and `/blog/`, `/projects/` redirect (expected 308) to the slash-less URL; `/blog.html` redirects to `/blog` (`cleanUrls`).
2. `POST /api/contact` reaches the function (a valid request returns 200 and the email arrives; a request with a foreign `Origin` returns 403).
3. `https://www.hatami.tech/anything` redirects (expected 308, `permanent: true`) to `https://hatami.tech/anything`.
4. Response headers from `vercel.json` are present (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`) and `/_astro/*` has the immutable `Cache-Control`.
5. A non-existent URL serves the custom 404 page with status 404.
6. Pagefind search works on the live site.
7. The Node.js version in the Vercel build log is 22.x.
8. `/llms.txt` is served as `text/plain`, `/blog/<slug>.md` as `text/markdown`, and both (plus `/llms-full.txt`) carry `X-Robots-Tag: noindex`; HTML pages do not.
9. `/sitemap.xml` is reachable and `robots.txt` (after launch) lists it.
10. A Content-Security-Policy is **not** set yet; add one only after confirming Umami, Giscus, and fonts still work.

---

## 14. Working agreement for the AI agent

1. **Plan first.** Before coding, list the files you will create or change in at most 10 bullets.
2. **Stay in scope.** Implement only what was asked. Do not "helpfully" start the next phase.
3. **Verify, then report.** Run the checks in section 3. Report the real results. Never claim something passes if you did not run it, and never claim a Vercel behavior you have not seen on a real deployment.
4. **Decide, don't stall.** If something is ambiguous but not blocking, choose the documented default and state the assumption. If it blocks, ask one concise question.
5. **Summarize.** End each task with: what changed, new dependencies and why, assumptions made, anything the owner must do manually.
6. **Be honest about uncertainty.** If you are unsure an API exists in the installed version, check the docs instead of guessing.
7. **Never fabricate owner content.** Leave `[PLACEHOLDER: ...]` until the owner supplies the real text.

---

## 15. Owner-only tasks (the AI cannot do these)

**Content and config**

- [ ] Replace every `[PLACEHOLDER]` (name, role, description, email, socials, projects, posts, bio). Use `pnpm check:placeholders` to list what is left.
- [ ] Decide `site.lang` (`'en'` or `'id'`) in `src/config/site.ts`.
- [ ] Decide `site.seo.aiTraining`: `'allow'` (default) or `'disallow'` to keep AI training crawlers out (section 8.3).
- [ ] Replace `public/favicon.svg` with your logo and run `pnpm icons`.
- [ ] Add `public/resume.pdf`, then set `resumeUrl: '/resume.pdf'` in `src/config/site.ts`.
- [ ] Write 3-5 real posts and 3+ real case studies before announcing.

**Vercel and domain**

- [ ] Push the repo to GitHub; in Vercel choose **Add New > Project**, import it (framework preset Astro; `vercel.json` already sets the build command and output directory).
- [ ] Project Settings: set **Node.js Version** to 22.x.
- [ ] Add environment variables (section 12.1). Keep `PUBLIC_ALLOW_INDEXING` unset/false until launch.
- [ ] Project Settings > Domains: add `hatami.tech` and `www.hatami.tech`; create the DNS records Vercel shows at your registrar; make `hatami.tech` the primary domain. Wait for the certificate.
- [ ] Add a Vercel Firewall rate-limit rule for `POST /api/contact` (check which plan includes it).
- [ ] Review the Hobby plan's terms (non-commercial use) against how you will use the site.

**Email**

- [ ] Create a Resend account, verify `hatami.tech` (add the DNS records Resend shows), create an API key, set `CONTACT_FROM_EMAIL` to an address on that domain. Start early: DNS verification can take time.
- [ ] Send a real test message through the live form.

**Launch**

- [ ] Set the GitHub repository variable `LAUNCH_READY=true` so the placeholder check becomes blocking.
- [ ] Set `PUBLIC_ALLOW_INDEXING=true` for **Production** in Vercel and redeploy.
- [ ] Verify `hatami.tech` in Google Search Console and Bing Webmaster Tools; submit `https://hatami.tech/sitemap.xml`.
- [ ] Validate JSON-LD on a live URL (Rich Results Test, Schema Markup Validator).
- [ ] Optional: Giscus (GitHub Discussions category), Umami (Cloud or self-hosted), Cloudflare Turnstile later.

---

## Appendix: prompts to give the agent

**Orientation (first session)**

> Read AGENTS.md fully. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links` and report the real results. Do not change anything yet.

**Phase 7**

> Implement the remaining part of Phase 7 (Lighthouse CI) only. Follow section 14. Show me your plan first.

**Fill in content (only with real material)**

> Here are my real details: [paste]. Replace the matching placeholders in `src/config/site.ts` and the content files. Do not invent anything I did not provide; leave the rest as placeholders. Then run `pnpm check:placeholders` and show what is left.

**Fix**

> `pnpm build` fails with the error below. Find the root cause, fix it without changing unrelated files, and re-run all checks. [paste error]

**Verify deployment (Phase 8)**

> The site is deployed at [URL]. Run the checks in section 13 "Phase 8" with curl and report pass/fail for each, with the evidence. Do not change code.

**SEO audit**

> Run `pnpm build && pnpm check:seo && pnpm check:seo --live` and report every failure and warning with the file. Then review `/llms.txt` and one `.md` file for accuracy. Do not change anything yet.

**Review**

> Review the current code against AGENTS.md sections 7-11. List violations by severity. Do not change anything yet.
