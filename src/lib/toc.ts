export interface HeadingItem {
  depth: number;
  slug: string;
  text: string;
}

/**
 * Filter Astro headings for Table of Contents, keeping only h2 and h3.
 */
export function filterTocHeadings(headings: HeadingItem[]): HeadingItem[] {
  return headings.filter((h) => h.depth === 2 || h.depth === 3);
}
