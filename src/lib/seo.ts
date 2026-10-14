import { site } from '@/config/site';
import { t } from '@/config/strings';
import { hasValue } from './placeholder';

/**
 * Search engines may index the site only when PUBLIC_ALLOW_INDEXING=true at build time.
 * Until launch (placeholder content!) every page is noindex and robots.txt disallows all.
 */
export const allowIndexing = import.meta.env.PUBLIC_ALLOW_INDEXING === 'true';

/** Tag pages with only a few posts are thin duplicates of the blog list: keep them out of search. */
export function isTagIndexable(postCount: number): boolean {
  return postCount >= site.seo.minPostsForIndexableTag;
}

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href;
}

/**
 * Canonical URL for a request path: no trailing slash (except the root), no ".html" and no
 * "/index". (With `build.format: 'file'`, Astro reports "/index.html" for the home page and
 * "/blog.html" for /blog while building.)
 */
export function canonicalUrl(pathname: string): string {
  let path = pathname.replace(/\.html$/, '');
  if (path === '/index') path = '/'; // only the home page, not e.g. a post with slug "index"
  path = path.replace(/(.)\/+$/, '$1');
  return absoluteUrl(path || '/');
}

/** Home: "Name: Role". Other pages: "Page | Name". */
export function pageTitle(title: string, home = false): string {
  return home ? `${site.name}: ${site.role}` : `${title} | ${site.name}`;
}

// --- Structured data (JSON-LD) ---------------------------------------------------------------
// One entity graph: every page refers to the same Person and WebSite through stable @id values,
// so search engines and AI tools resolve "who wrote this" to a single entity.

const personId = () => absoluteUrl('/#person');
const websiteId = () => absoluteUrl('/#website');

const personRef = () => ({
  '@type': 'Person',
  '@id': personId(),
  name: site.name,
  url: site.url,
});
const websiteRef = () => ({ '@id': websiteId() });

/** "Backend: PHP, Node.js" -> ["PHP", "Node.js"]; lines without a colon are kept whole. */
export function skillTopics(lines: ReadonlyArray<string>): string[] {
  const topics = lines
    .filter(hasValue)
    .flatMap((line) => (line.includes(':') ? line.slice(line.indexOf(':') + 1) : line).split(','))
    .map((topic) => topic.trim())
    .filter(Boolean);
  return [...new Set(topics)];
}

export function personJsonLd() {
  const topics = skillTopics(site.skills);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId(),
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    description: site.description,
    sameAs: Object.values(site.socials).filter(hasValue),
    ...(topics.length > 0 ? { knowsAbout: topics } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId(),
    name: site.name,
    url: site.url,
    inLanguage: site.lang,
    publisher: { '@id': personId() },
  };
}

type WebPageType = 'CollectionPage' | 'ContactPage' | 'ProfilePage';

/** A typed page (list, contact, about) that belongs to the WebSite. */
export function webPageJsonLd(page: {
  type: WebPageType;
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': page.type,
    '@id': `${absoluteUrl(page.path)}#webpage`,
    url: absoluteUrl(page.path),
    name: page.name,
    description: page.description,
    inLanguage: site.lang,
    isPartOf: websiteRef(),
    ...(page.type === 'ProfilePage' ? { mainEntity: personRef() } : {}),
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** The trail always starts at the home page; pages pass only the part below it. */
export function breadcrumbTrail(items: Crumb[]): Crumb[] {
  return [{ name: t.breadcrumbs.home, path: '/' }, ...items];
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbTrail(items).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogJsonLd(posts: Array<{ title: string; path: string; datePublished: Date }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${absoluteUrl('/blog')}#blog`,
    name: `${site.name} | ${t.blog.title}`,
    description: t.blog.intro,
    url: absoluteUrl('/blog'),
    inLanguage: site.lang,
    isPartOf: websiteRef(),
    publisher: personRef(),
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${absoluteUrl(post.path)}#article`,
      headline: post.title,
      url: absoluteUrl(post.path),
      datePublished: post.datePublished.toISOString(),
    })),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  description: string;
  path: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  tags: string[];
  minutes: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(post.path)}#article`,
    headline: post.title,
    description: post.description,
    url: absoluteUrl(post.path),
    mainEntityOfPage: absoluteUrl(post.path),
    image: absoluteUrl(post.image),
    datePublished: post.datePublished.toISOString(),
    dateModified: (post.dateModified ?? post.datePublished).toISOString(),
    inLanguage: site.lang,
    timeRequired: `PT${post.minutes}M`,
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    author: personRef(),
    publisher: personRef(),
    isPartOf: websiteRef(),
  };
}

export function projectJsonLd(project: {
  title: string;
  summary: string;
  path: string;
  image: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
}) {
  const links = [project.liveUrl, project.repoUrl].filter((url): url is string => Boolean(url));
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${absoluteUrl(project.path)}#project`,
    name: project.title,
    description: project.summary,
    url: absoluteUrl(project.path),
    image: absoluteUrl(project.image),
    inLanguage: site.lang,
    keywords: project.stack.join(', '),
    author: personRef(),
    isPartOf: websiteRef(),
    ...(links.length > 0 ? { sameAs: links } : {}),
  };
}
