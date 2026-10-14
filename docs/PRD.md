# PRD: Portfolio + Blog

|                    |                                                                     |
| ------------------ | ------------------------------------------------------------------- |
| **Status**         | v1.1: boilerplate implemented (phases 0-6), see section 16          |
| **Last updated**   | 2026-10-13                                                          |
| **Owner**          | The site owner (software engineer)                                  |
| **Production URL** | https://hatami.tech (canonical host, no `www`, no trailing slashes) |
| **Hosting**        | Vercel (static site + one Vercel Function)                          |
| **Related docs**   | `AGENTS.md` (how to build), `docs/ERD.md` (content model)           |

> This document defines **what** to build and **why**. `AGENTS.md` defines **how** (stack, conventions, phases). If they conflict on scope, this PRD wins; on implementation details, `AGENTS.md` wins.

---

## 1. Summary

A personal website for a software engineer that combines a **portfolio** (case studies of selected projects) and a **technical blog**. It is static (Astro), fast, readable by both search engines and AI tools, served from the owner's own domain (hatami.tech) on Vercel, and maintained by editing Markdown files in Git.

## 2. Problem and opportunity

**Problems**

- The owner's work is scattered across GitHub, LinkedIn, and other platforms. None of them show _how the owner thinks_: decisions, trade-offs, results.
- Recruiters and clients skim. Without a single focused page, strong work goes unnoticed.
- Posts published only on third-party platforms build that platform's authority, not the owner's.
- Searching the owner's name does not reliably lead to anything the owner controls.

**Opportunity**
A single owned site that (1) makes the right first impression in seconds, (2) explains projects as case studies, and (3) compounds over time through blog posts that rank for specific technical searches.

## 3. Goals and success metrics

Targets are initial values; the owner should adjust them.

| Goal                    | Metric                                                                                | Target                                        | How measured     |
| ----------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------- |
| Strong first impression | Lighthouse (mobile): Performance, Accessibility, Best Practices, SEO                  | >= 95 each on home, a project page, a post    | Lighthouse CI    |
| Discoverable            | Published pages indexed by Google                                                     | 100% within 4 weeks of launch                 | Search Console   |
| Found by name           | Homepage ranks #1 for the owner's name                                                | Within 3 months (depends on name competition) | Search Console   |
| Long-term traffic       | Impressions from non-brand queries                                                    | Growing month over month after month 3        | Search Console   |
| Content momentum        | Posts at launch / ongoing                                                             | >= 3 at launch, >= 1 per month                | Content count    |
| Easy to maintain        | Time from finished draft to live post                                                 | < 10 minutes                                  | Owner self-check |
| Reliable contact        | Valid form submissions delivered to inbox                                             | 100% in pre-launch tests                      | Manual test      |
| Quality stays high      | Broken internal links / failing checks on main                                        | 0                                             | CI               |
| AI-readable             | `/llms.txt`, `/llms-full.txt` and a `.md` version of every published post and project | Always, generated                             | `pnpm check:seo` |

## 4. Non-goals

User accounts, database, CMS backend, e-commerce, server-rendered pages, heavy animation or 3D, multi-language routing in MVP (design for it, do not build it), a newsletter in MVP.

## 5. Users

| Persona       | Who                                         | Wants                                                      | Success looks like                                                         |
| ------------- | ------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Evaluator** | Recruiter, hiring manager, potential client | Know who the owner is, see proof of skill, contact quickly | Understands the owner's role and best work within ~30 seconds; reaches out |
| **Reader**    | Developer arriving from search              | A clear answer to a specific technical problem             | Solves the problem, reads another post, subscribes via RSS                 |
| **Owner**     | The site owner                              | Publish and update with minimal friction                   | Adds a file, pushes, it is live                                            |
| **Crawler**   | Search engines and AI assistants            | Clean, structured, crawlable content                       | Pages are indexed with correct titles, snippets, and entities              |

## 6. Scope

**MVP (launch blockers)**
Home, About, Projects (list + case study), Blog (list + post + tags), Contact (form + email), resume download, dark mode, SEO foundation (meta, canonical, sitemap, robots, linked JSON-LD, OG images, breadcrumbs, related posts), AI-readable files (`llms.txt`, `llms-full.txt`, `.md` versions), RSS, 404, CI checks (including the SEO audit), deploy with custom domain.

**v1.0 (shortly after launch)**
Search (Pagefind), comments (Giscus), privacy-friendly analytics (Umami), Lighthouse budgets enforced in CI.

**Later (not planned)**
Second language, newsletter, "Uses" page, testimonials, project demo videos, experience timeline page.

## 7. User stories and acceptance criteria

Priority: **M** = must (MVP), **S** = should (v1.0), **C** = could (later).

| ID    | P   | Story                                                                         | Acceptance criteria                                                                                                                                                                                                        |
| ----- | --- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | M   | As an Evaluator, I see who the owner is and where to go next within seconds.  | At 360px width, the first screen shows name, role, one-line value statement, and CTAs to Projects and Contact without scrolling.                                                                                           |
| US-02 | M   | As an Evaluator, I browse projects and open a case study.                     | Project list shows title, summary, stack, cover. Case study shows problem, role, stack and decisions, result, and live/repo links when provided.                                                                           |
| US-03 | M   | As an Evaluator, I download the resume.                                       | Resume PDF link is present on About and in the footer; file opens in a new tab or downloads; link is not broken.                                                                                                           |
| US-04 | M   | As an Evaluator, I contact the owner.                                         | Form accepts name, email, message; shows inline success/error; works with keyboard only; a direct email link is also shown; the message reaches the owner's inbox.                                                         |
| US-05 | M   | As a Reader, I read a post comfortably.                                       | Code blocks are highlighted in both themes; headings generate a table of contents; reading time is shown; layout has no horizontal page scroll on mobile.                                                                  |
| US-06 | M   | As a Reader, I browse by topic.                                               | Tags list on the blog index; each tag has its own page listing published posts.                                                                                                                                            |
| US-07 | S   | As a Reader, I search posts.                                                  | Search box returns relevant results from titles and content without a server; works after a production build.                                                                                                              |
| US-08 | M   | As a Reader, I follow via RSS.                                                | `/rss.xml` is valid, lists published posts only, and is discoverable via `<link rel="alternate">`.                                                                                                                         |
| US-09 | C   | As a Reader, I comment on a post.                                             | Comments load via GitHub Discussions only when configured; nothing renders when unconfigured.                                                                                                                              |
| US-10 | M   | As the Owner, I publish a post by adding a file.                              | Adding `src/content/blog/<slug>.mdx` with valid frontmatter and pushing makes it live; `draft: true` keeps it hidden in production.                                                                                        |
| US-11 | M   | As the Owner, I add a project by adding a file.                               | Invalid frontmatter fails the build with a clear error; `featured: true` shows it on the homepage.                                                                                                                         |
| US-12 | M   | As the Owner, I preview changes before publishing.                            | Each branch/PR gets a preview URL.                                                                                                                                                                                         |
| US-13 | S   | As the Owner, I see which pages perform.                                      | Analytics show page views and key events without cookies or personal data.                                                                                                                                                 |
| US-14 | M   | As the Owner, I want shared links to look good.                               | Every page has Open Graph and Twitter card tags with a 1200x630 image.                                                                                                                                                     |
| US-15 | M   | As a Crawler, I can understand the site.                                      | Sitemap, canonical URLs, `robots.txt`, `Person` and `BlogPosting` JSON-LD are present and valid; drafts are excluded everywhere.                                                                                           |
| US-16 | M   | As any visitor, I can use the site in light or dark mode.                     | Follows system theme by default; toggle persists; no flash of the wrong theme on load.                                                                                                                                     |
| US-17 | M   | As any visitor using assistive tech or only a keyboard, I can use every page. | Skip link, visible focus, labelled form fields, semantic landmarks, WCAG 2.2 AA contrast.                                                                                                                                  |
| US-18 | C   | As a Reader, I read in another language.                                      | Out of MVP. UI strings are centralised so a second language can be added later.                                                                                                                                            |
| US-19 | M   | As an AI assistant or agent, I can read the site's content cleanly.           | `/llms.txt` follows the llmstxt.org format and lists every published post and project; each has a `.md` version; `/llms-full.txt` contains all of it; drafts are excluded; `robots.txt` does not block AI search crawlers. |
| US-20 | S   | As the Owner, I can keep AI training crawlers out with one setting.           | `site.seo.aiTraining = 'disallow'` adds training crawlers to `robots.txt` and still allows the crawlers that fetch pages to answer users.                                                                                  |

## 8. Functional requirements

| ID    | Requirement                                                                                                                                                                                                                                                           | Stories       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| FR-01 | Content is stored as MDX files in Git; collections `projects` and `blog` are validated by Zod schemas at build time (see `docs/ERD.md`).                                                                                                                              | US-10, US-11  |
| FR-02 | A post may optionally reference one project; the project page lists its related posts and the post links back.                                                                                                                                                        | US-02, US-05  |
| FR-03 | All content queries go through one helper module that hides drafts in production.                                                                                                                                                                                     | US-10, US-15  |
| FR-04 | Blog index paginates at 10 posts per page, newest first.                                                                                                                                                                                                              | US-05, US-06  |
| FR-05 | Each post shows reading time, table of contents (h2/h3), tags, previous/next navigation.                                                                                                                                                                              | US-05         |
| FR-06 | Homepage shows up to 3 featured projects and the 3 latest posts.                                                                                                                                                                                                      | US-01, US-02  |
| FR-07 | The contact endpoint validates server-side, includes a honeypot, sends via Resend, and stores nothing. Contract and error codes: `AGENTS.md` section 12.2.                                                                                                            | US-04         |
| FR-08 | Every page renders unique title and description, canonical URL, Open Graph, Twitter card.                                                                                                                                                                             | US-14, US-15  |
| FR-09 | OG images are generated at build time per post and project, with a static fallback.                                                                                                                                                                                   | US-14         |
| FR-10 | Sitemap and RSS are generated at build time and exclude drafts.                                                                                                                                                                                                       | US-08, US-15  |
| FR-11 | A custom 404 page links back to home, projects, and blog.                                                                                                                                                                                                             | US-01         |
| FR-12 | Optional integrations (Giscus, Umami) render nothing when their environment variables are empty.                                                                                                                                                                      | US-09, US-13  |
| FR-13 | Renamed slugs get a redirect entry in `vercel.json` so old URLs keep working.                                                                                                                                                                                         | US-15         |
| FR-14 | CI fails on type/schema errors, lint errors, test failures, broken internal links, or Lighthouse budget violations. Remaining `[PLACEHOLDER]` text is reported on every run and becomes a blocking launch gate once the owner sets `LAUNCH_READY=true`.               | Quality goals |
| FR-15 | `/llms.txt`, `/llms-full.txt` and one `.md` file per published post and project are generated at build time from the content collections and site config; code blocks are preserved and MDX components are converted. `.md` and llms files are `noindex` via headers. | US-19         |
| FR-16 | `sitemap.xml` is generated from the content helpers with accurate `lastmod` (posts and the lists that show them); tag pages with fewer than 3 posts are `noindex` and left out.                                                                                       | US-15         |
| FR-17 | JSON-LD forms one linked entity graph (Person and WebSite `@id`, BlogPosting, CreativeWork, ProfilePage, CollectionPage, ContactPage, Blog, BreadcrumbList).                                                                                                          | US-15         |
| FR-18 | Posts, projects and tag pages show breadcrumbs; posts show up to 3 related posts by shared tags.                                                                                                                                                                      | US-05, US-06  |
| FR-19 | `pnpm check:seo` audits the build output (also with indexing enabled) and runs in CI.                                                                                                                                                                                 | Quality goals |

## 9. Non-functional requirements

| Area            | Requirement                                                                                                                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance     | Static output served from a CDN; zero framework JS on content pages; images optimized and sized; fonts self-hosted.                                                                                                                                                                                              |
| Accessibility   | WCAG 2.2 AA; keyboard operable; respects `prefers-reduced-motion`.                                                                                                                                                                                                                                               |
| SEO             | Structured data; one canonical host (`https://hatami.tech`, `www` redirects to it); AI-readable `llms.txt` and `.md` versions; URLs have no trailing slash, enforced consistently by Astro and Vercel; drafts excluded; the whole site is `noindex` until the owner sets `PUBLIC_ALLOW_INDEXING=true` at launch. |
| Security        | No secrets in the repo; API keys only in server-side environment variables; security headers set; contact input validated server-side.                                                                                                                                                                           |
| Privacy         | No cookies; no personal data stored; analytics are cookie-free and honor Do Not Track; contact message content is not logged.                                                                                                                                                                                    |
| Reliability     | Site stays up even if third-party services (comments, analytics, email) fail.                                                                                                                                                                                                                                    |
| Maintainability | Small components, typed props, one place for personal data and UI strings, documented commands.                                                                                                                                                                                                                  |
| Browser support | Latest two versions of Chrome, Safari, Firefox, Edge; iOS Safari and Android Chrome.                                                                                                                                                                                                                             |

## 10. Content the owner must provide

- Site name, role, one-line value statement, short factual bio
- 3-6 case studies, each with: problem, the owner's role, stack and key decisions (why X over Y), result (metrics if available), live and repo links, cover image
- Resume PDF
- Social links and a contact email
- At least 3 real blog posts before launch
- Optional: headshot, accent color preference

Until provided, all of it is `[PLACEHOLDER: ...]`. The AI must not invent it.

## 11. Information architecture and key flows

```
/                    Home
├── /projects        Project list
│   └── /projects/[slug]
├── /blog            Post list (paginated)
│   ├── /blog/[slug]
│   └── /blog/tag/[tag]
├── /about
├── /contact
├── /rss.xml
└── /404
```

**Flow A: Evaluator.** Lands on home, reads hero, opens a featured project, reads the case study, opens About or downloads the resume, submits the contact form.

**Flow B: Reader.** Arrives on a post from search, reads, follows a related-project link or a tag, subscribes via RSS.

**Flow C: Owner publishes.** Creates `<slug>.mdx` with `draft: true`, writes, previews on the branch URL, sets `draft: false`, merges to `main`, CI passes, site deploys.

## 12. Measurement plan

Cookie-free analytics (Umami). Events:

| Event                                             | Fired when                                                    |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `resume_download`                                 | Resume link clicked                                           |
| `contact_submit_success` / `contact_submit_error` | Form result                                                   |
| `project_outbound_click`                          | Live-demo or repo link clicked (property: project slug, type) |
| `search_used`                                     | Search submitted                                              |
| `rss_click`                                       | RSS link clicked                                              |

Review monthly: top pages, top referrers, event counts, and Search Console queries.

## 13. Risks and mitigations

| Risk                                          | Impact                            | Mitigation                                                                                                                    |
| --------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Blog is launched empty or abandoned           | Looks neglected                   | Require >= 3 posts at launch; commit to a modest cadence (1 per month)                                                        |
| AI invents bio, metrics, or projects          | Credibility damage                | Placeholder rule + CI check that blocks deploy                                                                                |
| Framework APIs differ from AI's memory        | Broken or outdated code           | `AGENTS.md` requires reading current docs for the installed version                                                           |
| Contact form spam                             | Noise, wasted time                | Honeypot, server-side validation, same-origin check, a Vercel Firewall rate-limit rule (owner), optional Turnstile later      |
| Site indexed while still full of placeholders | Embarrassing search snippets      | Indexing gate: `noindex` + `Disallow: /` by default; `PUBLIC_ALLOW_INDEXING=true` only at launch                              |
| llms.txt brings no measurable benefit         | Wasted effort, false expectations | It is generated and costs nothing to maintain; no vendor has formally confirmed reading it, so the plan does not depend on it |
| Slow SEO ramp-up                              | Disappointment                    | Set expectations (weeks to months); focus on long-tail posts                                                                  |
| Email domain verification delays              | Form not ready at launch          | Start Resend domain verification early                                                                                        |
| OG image generation fails or slows builds     | Poor link previews                | Static fallback image; keep generation isolated                                                                               |
| Scope creep                                   | Never launches                    | Non-goals list; phases are accepted one at a time                                                                             |

## 14. Assumptions, dependencies, open questions

**Assumptions:** the owner can supply real content; the Vercel Hobby plan and the Resend free tier are sufficient for a personal site. Check Vercel's current terms: the Hobby plan is for non-commercial use, so a portfolio that is used to win paid client work may need the Pro plan.

**Dependencies:** the domain `hatami.tech` (owned), a Vercel account, a Resend account with a verified sending domain, a GitHub repository. Giscus and Umami are optional.

**Open questions (owner to decide):**

1. Site language and blog language: Indonesian, English, or both later?
2. Name, domain, and accent color.
3. Include an Experience/timeline page, or only the resume PDF?
4. Keep AI training crawlers out of the site? The default allows everything; one setting (`site.seo.aiTraining`) changes it.
5. Cross-post to dev.to or Medium (with canonical URL back to this site)?

## 15. Release plan

Phases are defined in `AGENTS.md` section 13 and are accepted one at a time.

| Release | Phases                                      | Exit criteria                                         |
| ------- | ------------------------------------------- | ----------------------------------------------------- |
| MVP     | 0-5, contact function from 6, deploy from 8 | Launch checklist below is complete                    |
| v1.0    | Remaining 6, 7                              | Search, comments, analytics live; CI budgets enforced |

Status of each phase: section 16.

**Launch checklist**

- [ ] No `[PLACEHOLDER]` text remains
- [ ] >= 3 real posts and >= 3 real case studies
- [ ] Lighthouse >= 95 on home, a project, a post
- [ ] Contact form delivers a real test message
- [ ] JSON-LD validates on a live URL
- [ ] Custom domain with HTTPS; one canonical host
- [ ] Sitemap submitted in Search Console and Bing Webmaster Tools

## 16. Implementation status (boilerplate v1.1)

| Phase                      | Status         | Notes                                                                                                                                                                                |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 Scaffold and tooling     | Done           | Astro 7, TypeScript strict, Tailwind 4, ESLint, Prettier, Vitest, pnpm                                                                                                               |
| 1 Layout and design system | Done           | Light/dark tokens, no-flash theme script, WCAG AA contrast checked                                                                                                                   |
| 2 Content collections      | Done           | Schemas, draft filtering, project references; negative tests pass (bad frontmatter, missing or draft project reference fail the build)                                               |
| 3 Core pages               | Done           | All routes in `AGENTS.md` section 7, placeholder content                                                                                                                             |
| 4 Blog                     | Done           | Pagination, tags, TOC, callout, Shiki dual theme, RSS                                                                                                                                |
| 5 SEO                      | Done, extended | Meta, canonical, linked JSON-LD, custom sitemap with accurate lastmod, robots with AI crawler policy, OG images, indexing gate, llms.txt, `.md` versions, breadcrumbs, related posts |
| 6 Integrations             | Done           | Pagefind, contact API (Vercel Function, 30 API tests), Giscus, Umami                                                                                                                 |
| 7 Quality gates            | Partial        | CI runs check, lint, test, build, link check, `check:seo` (normal and `--live`) and the placeholder report. **Lighthouse CI is not set up yet.**                                     |
| 8 Deploy                   | Owner tasks    | Connect the repo to Vercel and the domain, set environment variables, verify on the real deployment                                                                                  |

**Not verified in the build environment (verify on the first real deployment):** Vercel routing of `/api/contact` and the clean URLs (`/blog` served from `blog.html`), the `www` to apex redirect, the response headers from `vercel.json` (including `Content-Type` and `X-Robots-Tag` for `.md` and llms files; those patterns were only checked against `@vercel/routing-utils`), Resend delivery with a verified domain, and Lighthouse scores.
