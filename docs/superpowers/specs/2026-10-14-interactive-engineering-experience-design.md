# Interactive Engineering Experience Design Specification

**Date:** 2026-10-14  
**Status:** Approved  
**Author:** AI Engineer & hatamidev  
**Target:** hatami.tech

## 1. Intent & Purpose

Elevate the portfolio from a standard static portfolio to a distinct, mesmerizing, tactile engineering hub inspired by high-craft developer benchmarks (such as `sincan.dev`) while preserving 100/100 Lighthouse performance, zero layout shift, WCAG AA contrast, and zero heavy client framework bloat.

## 2. Core Components to Build

### 2.1 Infinite Tech Marquee (`src/components/ui/TechMarquee.astro`)

- Infinite horizontal ticker displaying core engineering domains: `HIGH-PERFORMANCE SYSTEMS • FULL-STACK ARCHITECTURE • AGENTIC AI & WORKFLOWS • REALTIME & EDGE COMPUTING • ROBUST DISTRIBUTED SYSTEMS`.
- Pause on hover, `prefers-reduced-motion` compliance, GPU-accelerated CSS `transform: translate3d`.

### 2.2 Cinematic Sticky Scroll Text Reveal (`src/components/ui/TextScrollReveal.astro`)

- A dedicated sticky transition section (`min-h-[180vh]`) where an engineering manifesto ("Nulis sistem yang ngebut, andal di peak-traffic, dan arsitektur modular yang gampang dirawat...") lights up word-by-word as the user scrolls.
- Implementation: Native Web `IntersectionObserver` / `scroll` event listener with `requestAnimationFrame`. Each word wrapped in a `<span>` with opacity transitioning from `0.2` to `1.0`.

### 2.3 Interactive Bento Capability Matrix (`src/components/ui/BentoGrid.astro`)

- 4-card asymmetric bento grid detailing engineering services:
  - `01`: High-Performance Systems & Backend (low-latency APIs, database query optimization, Redis caching).
  - `02`: Modern Full-Stack & Cloud Architecture (Astro, Next.js, TypeScript, Vercel Edge).
  - `03`: Autonomous AI Agents & Intelligent Pipelines (Tool calling, deterministic workflows, RAG).
  - `04`: Precision UI & Design Engineering (Accessible design systems, tactile micro-interactions).
- Monolithic numeric watermarks (`01`, `02`, etc.) that subtly scale and shift on hover, noise grain overlay via SVG data URI, and cursor spotlight luminescence.

### 2.4 Interactive Spec-Sheet Project Cards (`src/components/projects/ProjectCard.astro`)

- Numbered pill outcomes (`1`, `2`, `3`) summarizing key architectural achievements.
- Browser preview frame with simulated window controls and spec metadata when screenshots are not provided.
- Micro-interactions on hover with smooth elevation and border illumination.

### 2.5 Interactive FAQ Accordion (`src/components/ui/FaqAccordion.astro`)

- 2-column layout: Sticky left sidebar ("Tertarik kolaborasi atau diskusi teknis?") with direct action buttons; right side with interactive collapsible questions.
- Semantic HTML `<details>` and `<summary>` enhanced with smooth expand/collapse CSS transition.

### 2.6 Command Palette & Telemetry (`src/components/ui/CommandPalette.astro`, `CopyEmailButton.astro`)

- Instant `Cmd+K` / `Ctrl+K` keyboard modal dialog for direct navigation and quick actions.
- Interactive copy email button with tactile feedback.

## 3. Constraints & Budgets

- Framework: Static Astro 7 with vanilla JS islands only. No React/Vue/Svelte added.
- Accessibility: WCAG AA contrast (>= 4.5:1), visible focus rings, full keyboard operability for dialog and accordion.
- Quality budget: Lighthouse Mobile scores must remain >= 0.95 across Performance, Accessibility, Best Practices, and SEO.
- All checks (`pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm check:links`, `pnpm check:seo --live`, `pnpm lighthouse`) must pass.
