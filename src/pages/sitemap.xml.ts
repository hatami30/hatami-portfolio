import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { getPublishedPosts, getPublishedProjects, getTags } from '@/lib/content';
import { paginate } from '@/lib/pagination';
import { absoluteUrl, isTagIndexable } from '@/lib/seo';
import { buildSitemapXml, type SitemapEntry } from '@/lib/sitemap';

/**
 * Hand-written instead of @astrojs/sitemap so that:
 *  - lastmod is only set where it is accurate (posts, and the lists that show them),
 *  - thin tag pages (see site.seo.minPostsForIndexableTag) stay out,
 *  - the list is built from the same content helpers as the pages (drafts never appear).
 * Static pages come from site.nav; `pnpm check:seo` fails if an indexable page is missing here.
 */
export const GET: APIRoute = async () => {
  const [posts, projects, tags] = await Promise.all([
    getPublishedPosts(),
    getPublishedProjects(),
    getTags(),
  ]);

  const modified = (post: (typeof posts)[number]) => post.data.updated ?? post.data.date;
  const newest = (list: typeof posts) =>
    list.length > 0
      ? new Date(Math.max(...list.map((post) => modified(post).valueOf())))
      : undefined;

  const entries: SitemapEntry[] = [{ loc: absoluteUrl('/'), lastmod: newest(posts) }];

  for (const item of site.nav) {
    entries.push({
      loc: absoluteUrl(item.href),
      lastmod: item.key === 'blog' ? newest(posts) : undefined,
    });
  }

  const { totalPages } = paginate(posts, 1);
  for (let page = 2; page <= totalPages; page += 1) {
    entries.push({ loc: absoluteUrl(`/blog/page/${page}`) });
  }

  for (const project of projects) entries.push({ loc: absoluteUrl(`/projects/${project.id}`) });
  for (const post of posts) {
    entries.push({ loc: absoluteUrl(`/blog/${post.id}`), lastmod: modified(post) });
  }
  for (const { tag, count } of tags) {
    if (!isTagIndexable(count)) continue;
    const tagged = posts.filter((post) => post.data.tags.includes(tag));
    entries.push({ loc: absoluteUrl(`/blog/tag/${tag}`), lastmod: newest(tagged) });
  }

  return new Response(buildSitemapXml(entries), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
