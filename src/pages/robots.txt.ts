import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { buildRobotsTxt } from '@/lib/robots';
import { absoluteUrl, allowIndexing } from '@/lib/seo';

// Until PUBLIC_ALLOW_INDEXING=true, the whole site is closed to crawlers (see src/lib/seo.ts).
export const GET: APIRoute = () =>
  new Response(
    buildRobotsTxt({
      allowIndexing,
      aiTraining: site.seo.aiTraining,
      sitemapUrl: absoluteUrl('/sitemap.xml'),
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
