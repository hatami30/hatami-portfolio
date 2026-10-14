// Checks the built site (dist/) for broken internal links and for links that break the
// "no trailing slash" URL rule. Run after `pnpm build`:  pnpm check:links
//
// Resolution mirrors Vercel with cleanUrls: "/blog" -> dist/blog.html, "/" -> dist/index.html.
// "/api/*" is skipped: it is a Vercel Function, not a static file.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';

if (!existsSync(DIST)) {
  console.error('check-links: dist/ not found. Run `pnpm build` first.');
  process.exit(1);
}

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** @param {string} urlPath */
function resolves(urlPath) {
  if (urlPath === '/') return existsSync(join(DIST, 'index.html'));
  const base = join(DIST, urlPath);
  return existsSync(base) && statSync(base).isFile()
    ? true
    : existsSync(`${base}.html`) || existsSync(join(base, 'index.html'));
}

const pages = walk(DIST).filter((file) => file.endsWith('.html') && !file.includes('pagefind'));
const attr = /\s(?:href|src)="(\/[^"]*)"/g;
const problems = [];
let checked = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const [, raw] of html.matchAll(attr)) {
    if (raw.startsWith('//')) continue; // protocol-relative: external
    const urlPath = raw.split('#')[0].split('?')[0];
    if (urlPath === '' || urlPath.startsWith('/api/')) continue;
    checked += 1;
    const where = relative(DIST, file);
    if (urlPath !== '/' && urlPath.endsWith('/')) {
      problems.push(`${where}: trailing slash in link "${raw}"`);
    }
    if (!resolves(urlPath.replace(/\/$/, '') || '/')) {
      problems.push(`${where}: broken link "${raw}"`);
    }
  }
}

if (problems.length > 0) {
  console.error(`check-links: ${problems.length} problem(s) in ${pages.length} pages:`);
  for (const problem of [...new Set(problems)]) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`check-links: ${checked} internal links in ${pages.length} pages, no problems.`);
