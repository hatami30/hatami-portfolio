import { describe, expect, it } from 'vitest';
import { buildSitemapXml } from './sitemap';

describe('buildSitemapXml', () => {
  it('writes one <url> per entry with a date-only lastmod when given', () => {
    const xml = buildSitemapXml([
      { loc: 'https://hatami.tech/', lastmod: new Date('2026-10-13T08:30:00Z') },
      { loc: 'https://hatami.tech/about' },
    ]);
    expect(xml).toContain(
      '<url><loc>https://hatami.tech/</loc><lastmod>2026-10-13</lastmod></url>',
    );
    expect(xml).toContain('<url><loc>https://hatami.tech/about</loc></url>');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml.endsWith('</urlset>\n')).toBe(true);
  });

  it('escapes XML special characters', () => {
    const xml = buildSitemapXml([{ loc: 'https://hatami.tech/a?x=1&y=<2>' }]);
    expect(xml).toContain('https://hatami.tech/a?x=1&amp;y=&lt;2&gt;');
  });

  it('drops duplicate URLs and keeps the first', () => {
    const xml = buildSitemapXml([
      { loc: 'https://hatami.tech/a', lastmod: new Date('2026-01-01') },
      { loc: 'https://hatami.tech/a' },
    ]);
    expect(xml.match(/<url>/g)).toHaveLength(1);
    expect(xml).toContain('<lastmod>2026-01-01</lastmod>');
  });
});
