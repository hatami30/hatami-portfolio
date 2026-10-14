// SEO and AI-readability audit of the built site.
//
//   pnpm check:seo            audit dist/ (the normal build, where indexing is still closed)
//   pnpm check:seo --live     build with PUBLIC_ALLOW_INDEXING=true into dist-live/ and audit
//                             that: the state the site will have after launch
//   pnpm check:seo --dir out  audit another build output
//
// Failures exit with code 1. Warnings (lengths, heading jumps, placeholder duplicates) do not.
// No network access: everything is read from the build output.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from 'node-html-parser';

const args = process.argv.slice(2);
const live = args.includes('--live');
const dirIndex = args.indexOf('--dir');
const DIR = dirIndex >= 0 ? args[dirIndex + 1] : live ? 'dist-live' : 'dist';

if (live) {
  console.log(`check:seo: building with indexing enabled into ${DIR}/ ...`);
  const build = spawnSync('pnpm', ['exec', 'astro', 'build', '--outDir', DIR], {
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, PUBLIC_ALLOW_INDEXING: 'true' },
    shell: process.platform === 'win32',
  });
  if (build.status !== 0) {
    console.error('check:seo: the live build failed.');
    process.exit(1);
  }
}

if (!existsSync(DIR)) {
  console.error(`check:seo: ${DIR}/ not found. Run \`pnpm build\` first.`);
  process.exit(1);
}

const failures = [];
const warnings = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);
const PLACEHOLDER = '[PLACEHOLDER';

// --- helpers ------------------------------------------------------------------------------

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const read = (path) => readFileSync(join(DIR, path), 'utf8');
const isFile = (path) => existsSync(join(DIR, path)) && statSync(join(DIR, path)).isFile();

/** URL path -> built file, the way Vercel serves it with cleanUrls. */
function resolveUrlPath(urlPath) {
  const path = urlPath === '/' ? '/index' : urlPath.replace(/\/$/, '');
  for (const candidate of [path, `${path}.html`, `${path}/index.html`]) {
    if (isFile(candidate.slice(1))) return candidate.slice(1);
  }
  return null;
}

/** dist-relative html file -> URL path ("blog.html" -> "/blog", "index.html" -> "/"). */
function urlPathOf(file) {
  const path = `/${file.split(sep).join('/')}`.replace(/\.html$/, '');
  return path === '/index' ? '/' : path;
}

const meta = (root, selector) =>
  root.querySelector(selector)?.getAttribute('content')?.trim() ?? '';

// --- pages --------------------------------------------------------------------------------

const htmlFiles = walk(DIR)
  .map((file) => relative(DIR, file))
  .filter((file) => file.endsWith('.html') && !file.startsWith(`pagefind${sep}`));

if (!htmlFiles.includes('index.html')) {
  console.error(`check:seo: ${DIR}/index.html not found.`);
  process.exit(1);
}

const home = parse(read('index.html'));
const origin = new URL(home.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '')
  .origin;

const pages = []; // { file, urlPath, canonical, indexable, title, description }
const titles = new Map();
const descriptions = new Map();

for (const file of htmlFiles) {
  const where = file.split(sep).join('/');
  const urlPath = urlPathOf(file);
  const root = parse(read(file));

  // Title and description
  const title = root.querySelector('title')?.text.trim() ?? '';
  if (!title) fail(where, 'missing <title>');
  else if (title.length > 65) warn(where, `title is ${title.length} chars (aim for <= 60)`);
  const description = meta(root, 'meta[name="description"]');
  if (!description) fail(where, 'missing meta description');
  else if (description.length > 160) {
    warn(where, `description is ${description.length} chars (aim for <= 160)`);
  } else if (description.length < 50 && !description.includes(PLACEHOLDER)) {
    warn(where, `description is only ${description.length} chars`);
  }

  // Canonical
  const canonicals = root.querySelectorAll('link[rel="canonical"]');
  const canonical = canonicals[0]?.getAttribute('href') ?? '';
  if (canonicals.length !== 1)
    fail(where, `expected one canonical link, found ${canonicals.length}`);
  else if (canonical !== `${origin}${urlPath}`) {
    fail(where, `canonical is ${canonical}, expected ${origin}${urlPath}`);
  }
  if (canonical.length > origin.length + 1 && canonical.endsWith('/')) {
    fail(where, 'canonical has a trailing slash');
  }

  // Robots, language, viewport, headings
  const robots = meta(root, 'meta[name="robots"]');
  if (!robots) fail(where, 'missing robots meta');
  const indexable = robots.startsWith('index');
  if (!root.querySelector('html')?.getAttribute('lang')) fail(where, 'missing <html lang>');
  if (!root.querySelector('meta[name="viewport"]')) fail(where, 'missing viewport meta');
  const h1s = root.querySelectorAll('h1').length;
  if (h1s !== 1) fail(where, `expected exactly one <h1>, found ${h1s}`);
  const levels = root.querySelectorAll('h1,h2,h3,h4,h5,h6').map((h) => Number(h.tagName[1]));
  levels.forEach((level, index) => {
    if (index > 0 && level > levels[index - 1] + 1) {
      warn(where, `heading jumps from h${levels[index - 1]} to h${level}`);
    }
  });

  // Open Graph and Twitter
  for (const property of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
    if (!meta(root, `meta[property="${property}"]`)) fail(where, `missing ${property}`);
  }
  if (meta(root, 'meta[property="og:url"]') !== canonical)
    fail(where, 'og:url differs from canonical');
  if (!meta(root, 'meta[name="twitter:card"]')) fail(where, 'missing twitter:card');
  const ogImage = meta(root, 'meta[property="og:image"]');
  if (ogImage) {
    if (!ogImage.startsWith(`${origin}/`)) fail(where, `og:image is not on ${origin}: ${ogImage}`);
    else if (!isFile(new URL(ogImage).pathname.slice(1)))
      fail(where, `og:image file missing: ${ogImage}`);
  }

  // Images
  for (const img of root.querySelectorAll('img')) {
    if (img.getAttribute('alt') === undefined)
      fail(where, `<img src="${img.getAttribute('src')}"> has no alt`);
  }

  // Links advertised in <head>
  for (const link of root.querySelectorAll(
    'link[rel="alternate"][type="text/markdown"], link[rel="describedby"]',
  )) {
    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('/') || !isFile(href.slice(1)))
      fail(where, `head link to a missing file: ${href}`);
  }
  for (const link of root.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')) {
    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('/') || !isFile(href.slice(1))) fail(where, `icon file missing: ${href}`);
  }

  // Structured data
  const blocks = root.querySelectorAll('script[type="application/ld+json"]');
  if (['/', '/about'].includes(urlPath) && blocks.length === 0) fail(where, 'no JSON-LD');
  for (const block of blocks) {
    let data;
    try {
      data = JSON.parse(block.text);
    } catch (error) {
      fail(where, `invalid JSON-LD: ${error.message}`);
      continue;
    }
    for (const node of Array.isArray(data) ? data : (data['@graph'] ?? [data])) {
      const type = node['@type'];
      if (!type) fail(where, 'JSON-LD node without @type');
      if (!node['@context'] && !data['@context']) fail(where, `JSON-LD ${type} without @context`);
      if (node['@id'] && !String(node['@id']).startsWith(origin))
        fail(where, `JSON-LD @id off-site: ${node['@id']}`);
      if (type === 'BlogPosting') {
        for (const key of ['headline', 'datePublished', 'dateModified', 'image', 'author']) {
          if (!node[key]) fail(where, `BlogPosting without ${key}`);
        }
        if (!node.author?.name) fail(where, 'BlogPosting author has no name');
      }
      if (type === 'Person' && !node.name) fail(where, 'Person without name');
      if (type === 'BreadcrumbList') {
        const items = node.itemListElement ?? [];
        if (items.length < 2) fail(where, 'BreadcrumbList has fewer than 2 items');
        if (items[0]?.item !== `${origin}/`) fail(where, 'BreadcrumbList does not start at home');
        if (items.at(-1)?.item !== canonical)
          fail(where, 'BreadcrumbList does not end at this page');
      }
    }
  }

  pages.push({ file: where, urlPath, canonical, indexable, title, description });
  if (urlPath !== '/404') {
    titles.set(title, [...(titles.get(title) ?? []), where]);
    descriptions.set(description, [...(descriptions.get(description) ?? []), where]);
  }
}

// Duplicates: real content must be unique; placeholders are expected to repeat until replaced.
for (const [title, files] of titles) {
  if (title && files.length > 1) {
    (title.includes(PLACEHOLDER) ? warn : fail)(files.join(', '), `duplicate <title> "${title}"`);
  }
}
for (const [description, files] of descriptions) {
  if (description && files.length > 1) {
    (description.includes(PLACEHOLDER) ? warn : fail)(
      files.join(', '),
      'duplicate meta description',
    );
  }
}

// --- robots.txt and sitemap -----------------------------------------------------------------

const robotsTxt = isFile('robots.txt') ? read('robots.txt') : '';
if (!robotsTxt) fail('robots.txt', 'missing');
const closed = /^User-agent:\s*\*\s*\nDisallow:\s*\/\s*$/m.test(robotsTxt);
console.log(
  `check:seo: auditing ${DIR}/ (${closed ? 'indexing closed' : 'indexing open'}), ${pages.length} pages`,
);

if (live && closed)
  fail('robots.txt', 'expected an open site in --live mode but it disallows everything');
if (closed) {
  for (const page of pages) {
    if (page.indexable) fail(page.file, 'indexable robots meta while robots.txt closes the site');
  }
} else {
  if (!robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`))
    fail('robots.txt', 'missing Sitemap line');
}

const sitemapUrls = [];
if (!isFile('sitemap.xml')) {
  fail('sitemap.xml', 'missing');
} else {
  const xml = read('sitemap.xml');
  for (const [, loc, rest] of xml.matchAll(/<url><loc>([^<]+)<\/loc>(.*?)<\/url>/g)) {
    sitemapUrls.push(loc);
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(rest)?.[1];
    if (lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(lastmod))
      fail('sitemap.xml', `bad lastmod "${lastmod}" for ${loc}`);
  }
  if (sitemapUrls.length === 0) fail('sitemap.xml', 'no URLs');
  if (new Set(sitemapUrls).size !== sitemapUrls.length) fail('sitemap.xml', 'duplicate URLs');
  const byCanonical = new Map(pages.map((page) => [page.canonical, page]));
  for (const loc of sitemapUrls) {
    const page = byCanonical.get(loc);
    if (!page) fail('sitemap.xml', `${loc} is not the canonical URL of any built page`);
    else if (!closed && !page.indexable) fail('sitemap.xml', `${loc} is noindex but listed`);
  }
  if (!closed) {
    const listed = new Set(sitemapUrls);
    for (const page of pages) {
      if (page.indexable && !listed.has(page.canonical)) {
        fail('sitemap.xml', `indexable page missing from the sitemap: ${page.canonical}`);
      }
    }
  }
}

// --- llms.txt, llms-full.txt and the .md versions -------------------------------------------------

if (!isFile('llms.txt')) {
  fail('llms.txt', 'missing');
} else {
  const lines = read('llms.txt').split('\n');
  if (!lines[0]?.startsWith('# ')) fail('llms.txt', 'first line must be an H1 ("# Name")');
  if (
    !lines
      .slice(1)
      .find((line) => line.trim() !== '')
      ?.startsWith('> ')
  ) {
    fail('llms.txt', 'the H1 must be followed by a "> summary" blockquote');
  }
  const h2s = lines.filter((line) => line.startsWith('## '));
  if (h2s.at(-1) !== '## Optional') warn('llms.txt', 'the "## Optional" section should come last');
  const linked = new Set();
  for (const [, url] of read('llms.txt').matchAll(/^- \[.*?\]\(([^)]+)\)/gm)) {
    if (!url.startsWith(`${origin}/`) && url !== origin) continue;
    const path = new URL(url).pathname;
    linked.add(path);
    if (!resolveUrlPath(path)) fail('llms.txt', `link does not resolve: ${url}`);
  }
  for (const loc of sitemapUrls) {
    const { pathname } = new URL(loc);
    if (
      /^\/(blog|projects)\/[^/]+$/.test(pathname) &&
      !pathname.startsWith('/blog/tag/') &&
      !linked.has(pathname)
    ) {
      fail('llms.txt', `not listed: ${pathname}`);
    }
  }
}
if (!isFile('llms-full.txt')) fail('llms-full.txt', 'missing');
else if (!read('llms-full.txt').startsWith('# ')) fail('llms-full.txt', 'must start with an H1');

for (const page of pages) {
  if (
    /^\/(blog|projects)\/[^/]+$/.test(page.urlPath) &&
    !page.urlPath.startsWith('/blog/tag/') &&
    !/^\/blog\/page\//.test(page.urlPath)
  ) {
    const md = `${page.urlPath.slice(1)}.md`;
    if (!isFile(md)) fail(page.file, `Markdown version missing: ${md}`);
    else if (!read(md).startsWith('# ')) fail(md, 'must start with an H1');
  }
}

// --- RSS ----------------------------------------------------------------------------------------

if (!isFile('rss.xml')) fail('rss.xml', 'missing');
else {
  for (const [, link] of read('rss.xml').matchAll(/<link>([^<]+)<\/link>/g)) {
    if (!link.startsWith(origin)) continue;
    if (link.length > origin.length + 1 && link.endsWith('/'))
      fail('rss.xml', `trailing slash: ${link}`);
    if (!resolveUrlPath(new URL(link).pathname)) fail('rss.xml', `link does not resolve: ${link}`);
  }
}

if (!isFile('404.html')) fail('404.html', 'missing');

// --- report -------------------------------------------------------------------------------------

for (const message of [...new Set(warnings)]) console.log(`  warn  ${message}`);
for (const message of [...new Set(failures)]) console.error(`  FAIL  ${message}`);
if (failures.length > 0) {
  console.error(
    `check:seo: ${new Set(failures).size} failure(s), ${new Set(warnings).size} warning(s).`,
  );
  process.exit(1);
}
console.log(`check:seo: passed (${new Set(warnings).size} warning(s)).`);
