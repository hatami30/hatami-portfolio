import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '@/config/site';
import { t } from '@/config/strings';
import { getPublishedPosts } from '@/lib/content';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: `${site.name} | ${t.blog.title}`,
    description: site.description,
    site: context.site ?? site.url,
    // Keep feed links identical to the canonical URLs (no trailing slash).
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
    })),
    customData: `<language>${site.lang}</language>`,
  });
}
