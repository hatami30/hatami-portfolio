/**
 * Single source of truth for owner-specific facts.
 *
 * Rule: never invent personal data. Anything the owner must supply stays a bracketed
 * PLACEHOLDER marker until it is replaced; `pnpm check:placeholders` lists what is left.
 */

export type Lang = 'en' | 'id';

export interface SiteConfig {
  name: string;
  role: string;
  /** Canonical origin, no trailing slash. Used by astro.config.mjs, SEO, sitemap, RSS. */
  url: string;
  /** OWNER: 'en' or 'id'. Sets <html lang> and the UI language (src/config/strings.ts). */
  lang: Lang;
  /** One or two sentences, max 160 characters (used as the default meta description). */
  description: string;
  email: string;
  socials: { github: string; linkedin: string };
  /** Set to '/resume.pdf' after adding public/resume.pdf. Leave empty to hide the links. */
  resumeUrl: string;
  nav: ReadonlyArray<{ key: 'projects' | 'blog' | 'about' | 'contact'; href: string }>;
  /** Short factual bio, one string per paragraph. Shown on /about and included in llms-full.txt. */
  bio: ReadonlyArray<string>;
  /** Skill groups, one string per line. Shown on /about, in JSON-LD and in llms-full.txt. */
  skills: ReadonlyArray<string>;
  seo: {
    /**
     * 'allow': AI crawlers may read the site (default, good for being found by AI assistants).
     * 'disallow': robots.txt blocks crawlers that collect training data (GPTBot, ClaudeBot, ...)
     * but still allows the ones that fetch pages to answer a user's question or build search.
     */
    aiTraining: 'allow' | 'disallow';
    /** Tag pages with fewer published posts are noindex (thin duplicates of the blog list). */
    minPostsForIndexableTag: number;
  };
}

export const site: SiteConfig = {
  name: '[PLACEHOLDER: full name]',
  role: '[PLACEHOLDER: e.g. Software Engineer]',
  url: 'https://hatami.tech',
  lang: 'en',
  description: '[PLACEHOLDER: one or two sentences about what you build, max 160 characters]',
  email: '[PLACEHOLDER: contact email]',
  socials: {
    github: '[PLACEHOLDER: GitHub profile URL]',
    linkedin: '[PLACEHOLDER: LinkedIn profile URL]',
  },
  resumeUrl: '',
  nav: [
    { key: 'projects', href: '/projects' },
    { key: 'blog', href: '/blog' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
  ],
  bio: [
    '[PLACEHOLDER: a short, factual bio in plain sentences: who you are, what you work on, and where you are based.]',
    '[PLACEHOLDER: one or two sentences about your experience and what you are looking for.]',
  ],
  skills: [
    '[PLACEHOLDER: skill group, e.g. Backend: technologies you use]',
    '[PLACEHOLDER: skill group, e.g. Frontend: technologies you use]',
    '[PLACEHOLDER: skill group, e.g. Infrastructure and tooling]',
  ],
  seo: { aiTraining: 'allow', minPostsForIndexableTag: 3 },
};
