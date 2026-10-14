/**
 * robots.txt content.
 *
 * - Indexing gate off (default until launch): everything is closed.
 * - Gate on: everything is open, with an optional block for crawlers that collect AI training
 *   data. Crawlers that fetch pages to answer a user's question or to build AI search
 *   (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, ...) are never
 *   blocked here: blocking them only removes the site from AI answers.
 */

/**
 * Review now and then: crawler names change. ClaudeBot and GPTBot are named in the vendors'
 * own documentation; the others are widely published training or data-collection crawlers.
 */
export const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'Bytespider',
] as const;

export interface RobotsOptions {
  allowIndexing: boolean;
  aiTraining: 'allow' | 'disallow';
  sitemapUrl: string;
}

export function buildRobotsTxt({ allowIndexing, aiTraining, sitemapUrl }: RobotsOptions): string {
  if (!allowIndexing) return 'User-agent: *\nDisallow: /\n';

  const groups = ['User-agent: *\nAllow: /'];
  if (aiTraining === 'disallow') {
    groups.push(`${AI_TRAINING_BOTS.map((bot) => `User-agent: ${bot}`).join('\n')}\nDisallow: /`);
  }
  groups.push(`Sitemap: ${sitemapUrl}`);
  return `${groups.join('\n\n')}\n`;
}
