// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site.ts';
import { devApi } from './scripts/dev-api.mjs';

// https://astro.build/config
export default defineConfig({
  // Single source of truth: src/config/site.ts (https://hatami.tech, no "www").
  site: site.url,
  // URLs have no trailing slash (/blog, not /blog/). Keep these two in sync with vercel.json
  // ("trailingSlash": false, "cleanUrls": true). Vercel's trailing-slash redirect would
  // otherwise also catch /api/contact.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [mdx(), devApi()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
