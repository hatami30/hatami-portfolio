import { describe, expect, it } from 'vitest';
import { AI_TRAINING_BOTS, buildRobotsTxt } from './robots';

const sitemapUrl = 'https://hatami.tech/sitemap.xml';

describe('buildRobotsTxt', () => {
  it('closes the whole site while the indexing gate is off', () => {
    const text = buildRobotsTxt({ allowIndexing: false, aiTraining: 'allow', sitemapUrl });
    expect(text).toBe('User-agent: *\nDisallow: /\n');
    expect(text).not.toContain('Sitemap');
  });

  it('opens the site and lists the sitemap when the gate is on', () => {
    const text = buildRobotsTxt({ allowIndexing: true, aiTraining: 'allow', sitemapUrl });
    expect(text).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
  });

  it('blocks only training crawlers when aiTraining is "disallow"', () => {
    const text = buildRobotsTxt({ allowIndexing: true, aiTraining: 'disallow', sitemapUrl });
    for (const bot of AI_TRAINING_BOTS) expect(text).toContain(`User-agent: ${bot}\n`);
    expect(text).toContain('Disallow: /\n\nSitemap:');
    for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User']) {
      expect(text).not.toContain(bot);
    }
  });

  it('never blocks the generic crawler in the open mode', () => {
    const text = buildRobotsTxt({ allowIndexing: true, aiTraining: 'disallow', sitemapUrl });
    expect(text.startsWith('User-agent: *\nAllow: /\n')).toBe(true);
  });
});
