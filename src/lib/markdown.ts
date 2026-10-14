/**
 * Turns an MDX source string into clean Markdown for AI readers (llms-full.txt and the .md
 * versions of pages): no imports, no JSX components, absolute links. Code fences are copied
 * verbatim, so code that mentions `import` or `<Callout>` is never altered.
 *
 * Limits (documented in AGENTS.md): multi-line `import`/`export` blocks and JSX attributes
 * that contain ">" are not handled. When you add an MDX component, add its Markdown form here.
 */

interface Segment {
  code: boolean;
  text: string;
}

const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})/;

/** Splits text into alternating prose and fenced-code segments (fence lines included). */
function splitFences(text: string): Segment[] {
  const segments: Segment[] = [];
  let buffer: string[] = [];
  let fence: { char: string; length: number } | null = null;

  const flush = (code: boolean) => {
    if (buffer.length > 0) segments.push({ code, text: buffer.join('\n') });
    buffer = [];
  };

  for (const line of text.split('\n')) {
    if (fence === null) {
      const open = FENCE_OPEN.exec(line);
      if (open) {
        flush(false);
        fence = { char: open[2]![0]!, length: open[2]!.length };
      }
      buffer.push(line);
    } else {
      buffer.push(line);
      const close = new RegExp(`^ {0,3}\\${fence.char}{${fence.length},}\\s*$`).exec(line);
      if (close) {
        flush(true);
        fence = null;
      }
    }
  }
  flush(fence !== null); // an unclosed fence runs to the end of the text
  return segments;
}

function attribute(attrs: string, name: string): string | undefined {
  const match = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`).exec(attrs);
  return match ? (match[1] ?? match[2]) : undefined;
}

function calloutToBlockquote(attrs: string, inner: string): string {
  const type = attribute(attrs, 'type') ?? 'note';
  const label = attribute(attrs, 'title') ?? type.charAt(0).toUpperCase() + type.slice(1);
  const body = inner
    .trim()
    .split('\n')
    .map((line) => (line.trim() === '' ? '>' : `> ${line.trim()}`));
  return [`> **${label}**`, '>', ...body].join('\n');
}

function transformProse(text: string, origin: string): string {
  return (
    text
      // ESM at column 0 is how MDX declares imports and exports.
      .replace(/^import\s+.+\s+from\s+['"][^'"]+['"];?[ \t]*$/gm, '')
      .replace(/^import\s+['"][^'"]+['"];?[ \t]*$/gm, '')
      .replace(/^export\s+(?:const|let|var|function|default)\b[^\n]*$/gm, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g, (_match, attrs: string, inner: string) =>
        calloutToBlockquote(attrs, inner),
      )
      // Any other component: drop the tags, keep the text inside.
      .replace(/<\/?[A-Z][\w.]*(?:\s[^<>]*?)?\/?>/g, '')
      // Root-relative links become absolute so a standalone .md file still works.
      .replace(/\]\((\/(?!\/)[^)\s]*)\)/g, (_match, path: string) => `](${origin}${path})`)
      .replace(/\n{3,}/g, '\n\n')
  );
}

export function mdxToMarkdown(source: string, origin: string): string {
  const text = source.replace(/\r\n?/g, '\n');
  const parts = splitFences(text).map((segment) =>
    segment.code ? segment.text : transformProse(segment.text, origin),
  );
  return parts.join('\n').trim();
}

/** Moves every heading outside code fences down by `by` levels (capped at h6). */
export function demoteHeadings(markdown: string, by: number): string {
  return splitFences(markdown)
    .map((segment) =>
      segment.code
        ? segment.text
        : segment.text.replace(/^(#{1,6})(\s)/gm, (_match, hashes: string, space: string) => {
            return `${'#'.repeat(Math.min(6, hashes.length + by))}${space}`;
          }),
    )
    .join('\n');
}
