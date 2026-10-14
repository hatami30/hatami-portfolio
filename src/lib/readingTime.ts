export const WORDS_PER_MINUTE = 200;

/** Estimated reading time in whole minutes (minimum 1) for a Markdown/MDX source. */
export function readingTime(source: string): number {
  const text = source
    .replace(/^---[\s\S]*?---/, ' ') // frontmatter, if present
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/^(import|export) .*$/gm, ' ') // MDX imports/exports
    .replace(/<[^>]+>/g, ' ') // HTML / JSX tags
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // keep link and image labels only
    .replace(/[#>*_`~|-]/g, ' '); // Markdown punctuation

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
