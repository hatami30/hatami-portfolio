/** Minimal sitemap.xml writer (https://www.sitemaps.org/protocol.html). */

export interface SitemapEntry {
  /** Absolute URL. */
  loc: string;
  /** Only set it when it is accurate: search engines stop trusting lastmod that is not. */
  lastmod?: Date;
}

const escapeXml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const entry of entries) {
    if (seen.has(entry.loc)) continue;
    seen.add(entry.loc);
    const lastmod = entry.lastmod
      ? `<lastmod>${entry.lastmod.toISOString().slice(0, 10)}</lastmod>`
      : '';
    urls.push(`  <url><loc>${escapeXml(entry.loc)}</loc>${lastmod}</url>`);
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
