// Launch gate: lists every remaining [PLACEHOLDER: ...] in the site.
//
// Placeholders are expected while building, so by default this only REPORTS (exit 0).
// It FAILS (exit 1) with --strict or when LAUNCH_READY=true. Set LAUNCH_READY=true in
// CI (repository variable) once the real content is in.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOTS = ['src', 'public'];
const EXTENSIONS = new Set([
  '.ts',
  '.astro',
  '.md',
  '.mdx',
  '.json',
  '.txt',
  '.svg',
  '.css',
  '.mjs',
  '.html',
]);
const PATTERN = /\[PLACEHOLDER:[^\]\n]*\]/g;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files = files.concat(walk(path));
    else if (EXTENSIONS.has(extname(path))) files.push(path);
  }
  return files;
}

const findings = [];
for (const root of ROOTS) {
  let files;
  try {
    files = walk(root);
  } catch {
    continue; // folder does not exist
  }
  for (const file of files) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        for (const match of line.matchAll(PATTERN)) {
          findings.push({ file, line: index + 1, text: match[0] });
        }
      });
  }
}

const strict = process.argv.includes('--strict') || process.env.LAUNCH_READY === 'true';

if (findings.length === 0) {
  console.log('check:placeholders: no placeholders left.');
  process.exit(0);
}

console.log(`check:placeholders: ${findings.length} placeholder(s) left:\n`);
for (const { file, line, text } of findings) console.log(`  ${file}:${line}  ${text}`);

if (strict) {
  console.error('\nLAUNCH_READY is on: replace every placeholder before deploying.');
  process.exit(1);
}
console.log('\nReport only (set LAUNCH_READY=true or pass --strict to make this fail).');
