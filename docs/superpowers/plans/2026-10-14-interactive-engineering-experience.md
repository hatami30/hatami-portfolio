# Interactive Engineering Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform hatami.tech into an interactive, high-craft engineering portfolio inspired by sincan.dev, featuring scroll-driven text reveals, a marquee ticker, a bento capability matrix, spec-sheet case studies, an accessible FAQ accordion, and a command palette.

**Architecture:** Implement modular, zero-framework Astro components using native Web APIs (IntersectionObserver, Dialog, requestAnimationFrame) and Tailwind CSS 4 utilities. All interactive elements run on vanilla TypeScript client scripts with strict prefers-reduced-motion fallbacks, zero layout shift, and guaranteed WCAG AA contrast compliance.

**Tech Stack:** Astro 7 (static), Tailwind CSS 4, TypeScript 6, Native Web Components & HTML5 Dialog, Vitest, Lighthouse CI.

**Spec:** `docs/superpowers/specs/2026-10-14-interactive-engineering-experience-design.md`

## Global Constraints

- No React, Vue, Svelte, or external UI component libraries (AGENTS.md Section 2).
- Zero layout shift: all image elements and container boundaries must define explicit dimensions or aspect ratios.
- WCAG AA contrast (>= 4.5:1) for all text and interactive states in both light and dark modes.
- Keyboard operable: all modals, disclosures, and navigation elements must support Tab, Enter, Space, and Escape.
- Pinned Lighthouse CI quality budget: Mobile scores >= 0.95 across Performance, Accessibility, Best Practices, and SEO.

## Review Focus

- Color contrast on dark/light mode switches for subtle accent labels and badges.
- Scroll observer performance on mobile browsers: must throttle scroll handlers with requestAnimationFrame to prevent jank.
- Dialog accessibility: focus trap inside Command Palette and focus restoration upon Escape.
- Touch target sizes on mobile: all interactive buttons and accordion summaries must have a minimum tap area of 44x44px.
- SEO and crawler integrity: all text rendered in scroll reveals and accordions must remain fully indexable in the server-rendered HTML.

---

### Task 1: Infinite Tech Marquee Component

**Files:**

- Create: `src/components/ui/TechMarquee.astro`
- Modify: `src/styles/global.css`
- Modify: `src/pages/index.astro`

**Interfaces:**

- Produces: `<TechMarquee items={string[]} speed?: number />`

- [ ] **Step 1: Add keyframes animation for infinite marquee in `src/styles/global.css`**
      Define `@keyframes marquee` and `@keyframes marquee-reverse` using GPU-accelerated `translate3d`.

- [ ] **Step 2: Create `src/components/ui/TechMarquee.astro`**
      Render a duplicated track of items with `aria-hidden="true"` on the duplicate, respecting `prefers-reduced-motion` by pausing or wrapping gracefully.

- [ ] **Step 3: Integrate `TechMarquee` below the Hero section in `src/pages/index.astro`**
      Place the marquee between the Hero section and the Featured Projects section.

- [ ] **Step 4: Verify with build and check**
      Run: `pnpm check && pnpm build`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/TechMarquee.astro src/styles/global.css src/pages/index.astro
git commit -m "feat(ui): add infinite tech marquee ticker"
```

---

### Task 2: Cinematic Sticky Scroll Text Reveal

**Files:**

- Create: `src/components/ui/TextScrollReveal.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**

- Produces: `<TextScrollReveal text={string} />`

- [ ] **Step 1: Create `src/components/ui/TextScrollReveal.astro`**
      Render a tall container (`min-h-[160vh]`) with a sticky viewport container (`sticky top-0 h-screen flex items-center`). Split the statement text into individual words, each wrapped in a `span.reveal-word` with base opacity `0.2`.
      Add a vanilla script using `requestAnimationFrame` that computes scroll progress through the container (`rect.top` relative to window height) and progressively lights up each word from `0.2` to `1.0`.

- [ ] **Step 2: Mount `TextScrollReveal` in `src/pages/index.astro`**
      Inject an engineering philosophy manifesto between the Hero and the Bento Grid section.

- [ ] **Step 3: Verify performance and build**
      Run: `pnpm check && pnpm build`
      Expected: PASS with zero build errors and valid semantic HTML.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/TextScrollReveal.astro src/pages/index.astro
git commit -m "feat(ui): add cinematic sticky scroll text reveal"
```

---

### Task 3: Interactive Bento Capability Matrix

**Files:**

- Create: `src/components/ui/BentoGrid.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**

- Produces: `<BentoGrid />`

- [ ] **Step 1: Create `src/components/ui/BentoGrid.astro`**
      Create an asymmetric 12-column bento grid containing 4 core engineering domains:
- 01: Low-Latency Systems & Backend Engineering (col-span-12 md:col-span-7)
- 02: Full-Stack & Edge Architecture (col-span-12 md:col-span-5)
- 03: Autonomous AI Agents & Workflows (col-span-12 md:col-span-5)
- 04: Resilient Infrastructure & DevOps (col-span-12 md:col-span-7)
  Add large watermark numbers (`01`, `02`, `03`, `04`), SVG noise texture overlay, tech pill badges, and cursor spotlight hover glow.

- [ ] **Step 2: Mount `BentoGrid` in `src/pages/index.astro`**
      Add section heading "Capabilities & Engineering Services" above the Bento Grid.

- [ ] **Step 3: Verify formatting and accessibility**
      Run: `pnpm check && pnpm lint && pnpm build`
      Expected: PASS with valid contrast and semantic landmarks.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/BentoGrid.astro src/pages/index.astro
git commit -m "feat(ui): add interactive bento capability matrix"
```

---

### Task 4: Interactive Spec-Sheet Project Cards

**Files:**

- Modify: `src/components/projects/ProjectCard.astro`

**Interfaces:**

- Consumes: `project: Project` from `@/lib/content`
- Produces: Upgraded `<ProjectCard project={project} />`

- [ ] **Step 1: Enhance `ProjectCard.astro` with architectural spec layout**
      Add:
- 3 numbered impact pills (e.g. `1` Low-latency execution, `2` Modular architecture, `3` Production deployment)
- Browser mockup topbar with colored indicator dots and case study label
- Interactive hover transitions with border illumination and subtle depth lift.

- [ ] **Step 2: Verify existing project pages and cards**
      Run: `pnpm check && pnpm test && pnpm build`
      Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/projects/ProjectCard.astro
git commit -m "feat(projects): enhance project cards with architectural spec sheets"
```

---

### Task 5: Interactive FAQ Accordion

**Files:**

- Create: `src/components/ui/FaqAccordion.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**

- Produces: `<FaqAccordion />`

- [ ] **Step 1: Create `src/components/ui/FaqAccordion.astro`**
      Implement an accessible 2-column layout:
- Left column (sticky): "Tertarik berkolaborasi atau diskusi teknis?" with direct CTA button to `/contact` and quick email copy.
- Right column: Interactive `<details>` / `<summary>` accordion items addressing key freelance/engineering inquiries with smooth toggle icons and accessible keyboard navigation.

- [ ] **Step 2: Add FAQ section to `src/pages/index.astro`**
      Mount `FaqAccordion` above the closing CTA section on the homepage.

- [ ] **Step 3: Verify with build and link check**
      Run: `pnpm check && pnpm check:links && pnpm build`
      Expected: PASS with 0 broken links.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/FaqAccordion.astro src/pages/index.astro
git commit -m "feat(ui): add interactive FAQ accordion component"
```

---

### Task 6: Command Palette & Global Header Integration

**Files:**

- Modify: `src/components/layout/Header.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Ensure: `src/components/ui/CommandPalette.astro` is globally mounted

**Interfaces:**

- Produces: Global keyboard shortcut listener (`Cmd+K` / `Ctrl+K`) and tactile navigation trigger in `Header.astro`.

- [ ] **Step 1: Add quick `Cmd+K` badge button to `src/components/layout/Header.astro`**
      Place a sleek `⌘K` quick search button next to the theme toggle that opens the Command Palette.

- [ ] **Step 2: Mount `CommandPalette.astro` in `src/layouts/BaseLayout.astro`**
      Ensure every page can trigger the palette seamlessly without duplicate listeners.

- [ ] **Step 3: Test keyboard navigation and modal trap**
      Verify that pressing `Cmd+K` or clicking the header button opens the modal, `ESC` closes it, and navigation jumps correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.astro src/layouts/BaseLayout.astro
git commit -m "feat(ui): integrate global command palette and header trigger"
```

---

### Task 7: Full Quality Gate & Lighthouse Verification

**Files:**

- All modified components and tests

- [ ] **Step 1: Run complete check and lint suite**
      Run: `pnpm format && pnpm check && pnpm lint && pnpm test`
      Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Run SEO and link audit**
      Run: `pnpm build && pnpm check:links && pnpm check:seo --live`
      Expected: PASS.

- [ ] **Step 3: Run Lighthouse Mobile audit**
      Run: `PUBLIC_ALLOW_INDEXING=true pnpm build && pnpm lighthouse`
      Expected: Scores >= 0.95 across Performance, Accessibility, Best Practices, SEO on all audited pages.

- [ ] **Step 4: Final commit and verify git log**

```bash
git status
```

Confirm working tree is clean.
