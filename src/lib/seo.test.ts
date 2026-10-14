import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  blogJsonLd,
  blogPostingJsonLd,
  breadcrumbJsonLd,
  canonicalUrl,
  isTagIndexable,
  personJsonLd,
  projectJsonLd,
  skillTopics,
  webPageJsonLd,
  websiteJsonLd,
} from './seo';

describe('canonicalUrl', () => {
  it('keeps the root as the bare origin with a single slash', () => {
    expect(canonicalUrl('/')).toBe('https://hatami.tech/');
    expect(canonicalUrl('')).toBe('https://hatami.tech/');
  });

  it('uses paths without a trailing slash', () => {
    expect(canonicalUrl('/blog')).toBe('https://hatami.tech/blog');
    expect(canonicalUrl('/blog/')).toBe('https://hatami.tech/blog');
    expect(canonicalUrl('/blog/hello-world/')).toBe('https://hatami.tech/blog/hello-world');
  });

  it('drops a ".html" suffix', () => {
    expect(canonicalUrl('/blog/hello-world.html')).toBe('https://hatami.tech/blog/hello-world');
  });

  it('maps the home page file path back to the root', () => {
    expect(canonicalUrl('/index.html')).toBe('https://hatami.tech/');
    expect(canonicalUrl('/index')).toBe('https://hatami.tech/');
    expect(canonicalUrl('/blog/index.html')).toBe('https://hatami.tech/blog/index');
  });
});

describe('absoluteUrl', () => {
  it('resolves a path against the production origin', () => {
    expect(absoluteUrl('/og/default.png')).toBe('https://hatami.tech/og/default.png');
  });
});

describe('isTagIndexable', () => {
  it('requires the configured minimum number of posts (3 by default)', () => {
    expect(isTagIndexable(1)).toBe(false);
    expect(isTagIndexable(2)).toBe(false);
    expect(isTagIndexable(3)).toBe(true);
  });
});

describe('skillTopics', () => {
  it('extracts topics after the colon and splits on commas', () => {
    expect(skillTopics(['Backend: PHP, Node.js', 'Frontend: Astro, PHP', 'DevOps'])).toEqual([
      'PHP',
      'Node.js',
      'Astro',
      'DevOps',
    ]);
  });

  it('ignores placeholder lines', () => {
    expect(skillTopics(['[PLACEHOLDER: skill group]'])).toEqual([]);
  });
});

describe('entity graph', () => {
  const person = 'https://hatami.tech/#person';
  const website = 'https://hatami.tech/#website';

  it('gives Person and WebSite stable @id values and links them', () => {
    expect(personJsonLd()['@id']).toBe(person);
    expect(websiteJsonLd()['@id']).toBe(website);
    expect(websiteJsonLd().publisher).toEqual({ '@id': person });
  });

  it('points a post at the same Person (inline name + url) and at the WebSite', () => {
    const post = blogPostingJsonLd({
      title: 'T',
      description: 'D',
      path: '/blog/t',
      image: '/og/blog/t.png',
      datePublished: new Date('2026-10-13T00:00:00Z'),
      tags: ['a', 'b'],
      minutes: 4,
    });
    expect(post['@id']).toBe('https://hatami.tech/blog/t#article');
    expect(post.author['@id']).toBe(person);
    expect(post.author.name).toBeTruthy();
    expect(post.author.url).toBe('https://hatami.tech');
    expect(post.publisher['@id']).toBe(person);
    expect(post.isPartOf).toEqual({ '@id': website });
    expect(post.keywords).toBe('a, b');
    expect(post.timeRequired).toBe('PT4M');
    expect(post.dateModified).toBe(post.datePublished);
  });

  it('omits keywords when a post has no tags', () => {
    const post = blogPostingJsonLd({
      title: 'T',
      description: 'D',
      path: '/blog/t',
      image: '/og/blog/t.png',
      datePublished: new Date('2026-10-13T00:00:00Z'),
      tags: [],
      minutes: 1,
    });
    expect('keywords' in post).toBe(false);
  });

  it('describes a project as a CreativeWork by the same Person', () => {
    const project = projectJsonLd({
      title: 'P',
      summary: 'S',
      path: '/projects/p',
      image: '/og/projects/p.png',
      stack: ['Laravel', 'Redis'],
      repoUrl: 'https://github.com/x/p',
    });
    expect(project['@type']).toBe('CreativeWork');
    expect(project.author['@id']).toBe(person);
    expect(project.keywords).toBe('Laravel, Redis');
    expect(project.sameAs).toEqual(['https://github.com/x/p']);
  });

  it('types list, contact and profile pages and attaches the Person to the profile page', () => {
    const profile = webPageJsonLd({
      type: 'ProfilePage',
      name: 'About',
      description: 'd',
      path: '/about',
    });
    expect(profile['@type']).toBe('ProfilePage');
    expect(profile.url).toBe('https://hatami.tech/about');
    expect(profile.mainEntity?.['@id']).toBe(person);
    const contact = webPageJsonLd({
      type: 'ContactPage',
      name: 'Contact',
      description: 'd',
      path: '/contact',
    });
    expect('mainEntity' in contact).toBe(false);
  });

  it('lists posts on the Blog entity with article ids', () => {
    const blog = blogJsonLd([
      { title: 'A', path: '/blog/a', datePublished: new Date('2026-10-13T00:00:00Z') },
    ]);
    expect(blog['@type']).toBe('Blog');
    expect(blog.blogPost[0]?.['@id']).toBe('https://hatami.tech/blog/a#article');
  });
});

describe('breadcrumbJsonLd', () => {
  it('always starts at the home page and numbers items from 1', () => {
    const list = breadcrumbJsonLd([
      { name: 'Blog', path: '/blog' },
      { name: 'Post', path: '/blog/post' },
    ]).itemListElement;
    expect(list.map((item) => [item.position, item.item])).toEqual([
      [1, 'https://hatami.tech/'],
      [2, 'https://hatami.tech/blog'],
      [3, 'https://hatami.tech/blog/post'],
    ]);
  });
});
