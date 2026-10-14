import { describe, it, expect } from 'vitest';
import { filterTocHeadings } from './toc';

describe('filterTocHeadings', () => {
  it('filters out headings outside h2 and h3', () => {
    const raw = [
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'intro', text: 'Intro' },
      { depth: 3, slug: 'sub', text: 'Sub' },
      { depth: 4, slug: 'deep', text: 'Deep' },
    ];
    const filtered = filterTocHeadings(raw);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].slug).toBe('intro');
    expect(filtered[1].slug).toBe('sub');
  });

  it('returns empty array when no h2 or h3 headings exist', () => {
    const raw = [
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 4, slug: 'deep', text: 'Deep' },
    ];
    expect(filterTocHeadings(raw)).toEqual([]);
  });
});
