# Bento Grid & Services Section (sincan.dev Style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the homepage capabilities section (`BentoGrid.astro`) into an interactive, full-width sincan.dev-inspired services & engineering showcase with a radial-masked dot grid background, bento 7/5 & 5/7 card layout, SVG fractal noise texture, and responsive hover lighting (without watermark numbering).

**Architecture:** Update UI dictionaries in `src/config/strings.ts` to support dual engineering & service copy for EN and ID. Rebuild `BentoGrid.astro` to feature a full-width background container with an SVG dot `<pattern>` and CSS radial mask, noise overlay on cards, glowing radial hover blobs, transforming icon containers, and stack pills. Update `src/pages/index.astro` to allow full-width background bleed.

**Tech Stack:** Astro 7, Tailwind CSS 4, SVG pattern & filters, TypeScript.

**Spec:** Brainstorming session confirmed: Opsi A (Keahlian & Layanan), card texture overlay enabled, monolithic number watermarks removed, accent color aligned with project `--accent` design tokens.

## Global Constraints

- No external UI framework or runtime dependencies; vanilla CSS and semantic HTML in `.astro` components.
- Strict WCAG AA contrast compliance in both light and dark themes.
- Respect `prefers-reduced-motion` for all hover transitions.
- Internal link & SEO compliance: maintain semantic heading hierarchy (`h2` for section title, `h3` for card titles).
- Pass all quality gates: `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links`, `pnpm check:seo`.

## Review Focus

1. Mobile responsiveness: on viewports `< 768px`, the 7/5 and 5/7 bento columns must collapse smoothly into single full-width columns (`col-span-12`).
2. Noise overlay performance: ensure SVG fractal noise filter uses CSS `background-size` and pointer-events `none` so it doesn't cause paint thrashing or block interaction.
3. Theme switching: ensure card backgrounds and text have adequate contrast across both `[data-theme="light"]` and `[data-theme="dark"]`.
4. Full-bleed background: ensure the section stretches full viewport width without horizontal page scroll (`overflow-hidden`).
5. Icon & Text contrast: all hover transitions must maintain legible text against the elevated card backgrounds.

---

### Task 1: Update UI Strings Dictionary for Dual Capabilities & Services

**Files:**

- Modify: `src/config/strings.ts:51-56` (EN dictionary)
- Modify: `src/config/strings.ts:194-199` (ID dictionary)

**Interfaces:**

- Consumes: `t.capabilities`
- Produces: Updated `tag`, `title`, and `description` strings in `t.capabilities` for both English and Indonesian.

- [ ] **Step 1: Update English dictionary in `src/config/strings.ts`**
      Set `tag: 'SERVICES & SPECIALIZATIONS'`, `title: 'How I Help Build & Scale Your Product'`, and update `description` to communicate high-craft engineering and reliable digital product delivery.

- [ ] **Step 2: Update Indonesian dictionary in `src/config/strings.ts`**
      Set `tag: 'LAYANAN & SPESIALISASI'`, `title: 'Keahlian & Solusi Rekayasa Produk'`, and update `description` to "Membantu founder & tim teknik mewujudkan produk digital yang cepat, berarsitektur bersih, dan mudah dirawat dalam jangka panjang."

- [ ] **Step 3: Run type check & tests to verify dictionaries compile**
      Run: `pnpm check && pnpm test`
      Expected: PASS (0 errors, 98/98 tests passing)

- [ ] **Step 4: Commit**

```bash
git add src/config/strings.ts
git commit -m "feat(strings): update capabilities dictionary for services and engineering"
```

---

### Task 2: Rebuild `BentoGrid.astro` with Dot Grid Background, Noise Texture, and Hover Micro-interactions

**Files:**

- Modify: `src/components/ui/BentoGrid.astro`

**Interfaces:**

- Consumes: `t.capabilities`, `src/components/ui/Container.astro`
- Produces: Full-width `<section>` with dot-grid mask, centered header with rough annotation highlight, bento 7/5 & 5/7 grid, textured cards without numbers, and hover lighting effects.

- [ ] **Step 1: Define updated 4 capabilities items in frontmatter**
      Define `capabilities` with:

1. `UI Design & Frontend Engineering` (`colSpan: 'md:col-span-7'`, stack: `['Astro', 'Next.js / React', 'Tailwind CSS', 'WCAG AA']`, icon: `code`)
2. `Fullstack & Web Architecture` (`colSpan: 'md:col-span-5'`, stack: `['TypeScript', 'Node.js', 'Edge Runtime', 'API Design']`, icon: `layers`)
3. `Backend & API Performance` (`colSpan: 'md:col-span-5'`, stack: `['PostgreSQL', 'Redis', 'Fastify / Express', 'REST API']`, icon: `server`)
4. `AI Agents & Workflow Automation` (`colSpan: 'md:col-span-7'`, stack: `['Autonomous Agents', 'Tool Calling', 'LLM Pipelines', 'Automation']`, icon: `bot`)

- [ ] **Step 2: Implement full-width outer section with SVG dot pattern**
      Use an efficient SVG `<pattern id="bento-dot-pattern" width="24" height="24">` with a radial gradient mask (`[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]`) and relative `overflow-hidden`.

- [ ] **Step 3: Implement centered header with rough-annotation stroke highlight**
      Add centered layout with badge, `h2` title containing hand-drawn SVG underline on key phrase, and description paragraph.

- [ ] **Step 4: Implement refined textured cards without numbers**
      Include:
- SVG fractal noise overlay (`mix-blend-overlay opacity-[0.06] dark:opacity-[0.12]`)
- Glow blob on hover (`bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100`)
- Hover border highlight (`hover:border-accent/40`) and subtle halo shadow (`hover:shadow-xl hover:shadow-accent/5`)
- Transforming icon box (`group-hover:bg-accent group-hover:text-background group-hover:scale-105 group-hover:border-accent`)
- Card title hover color transition (`group-hover:text-accent`)
- Stack pills at the bottom of each card

- [ ] **Step 5: Verify build & styling**
      Run: `pnpm check && pnpm build`
      Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/BentoGrid.astro
git commit -m "feat(ui): rebuild bento grid with sincan.dev background and card hover effects"
```

---

### Task 3: Adjust Homepage Container Bleed & Final Verification

**Files:**

- Modify: `src/pages/index.astro:137-139`

**Interfaces:**

- Consumes: `<BentoGrid />` from `src/components/ui/BentoGrid.astro`
- Produces: Full-width bleed for the bento section between `<TextScrollReveal />` and `<Container>` featured projects.

- [ ] **Step 1: Un-wrap `<BentoGrid />` from outer `<Container>` in `src/pages/index.astro`**
      Since `BentoGrid.astro` now provides its own full-width background and internal `<Container>`, remove the redundant wrapping `<Container>` in `index.astro`.

- [ ] **Step 2: Run all validation gates**
      Run:

```bash
pnpm format
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm check:links
pnpm check:seo
pnpm check:seo --live
```

Expected: All pass with 0 errors.

- [ ] **Step 3: Visual inspection via browser preview or Playwright screenshot**
      Verify background dot grid extends edge-to-edge, cards stack properly at mobile (360px) and tablet (768px), and hover effects trigger smoothly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "style(home): bleed bento grid section full width on homepage"
```
