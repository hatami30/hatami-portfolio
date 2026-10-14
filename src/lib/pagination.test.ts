import { describe, expect, it } from 'vitest';
import { blogPageUrl, paginate } from './pagination';

const list = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe('blogPageUrl', () => {
  it('maps page 1 to /blog and later pages to /blog/page/N', () => {
    expect(blogPageUrl(1)).toBe('/blog');
    expect(blogPageUrl(2)).toBe('/blog/page/2');
  });
});

describe('paginate', () => {
  it('handles an empty list as a single empty page', () => {
    const result = paginate([], 1);
    expect(result).toMatchObject({ items: [], page: 1, totalPages: 1 });
    expect(result.prevUrl).toBeUndefined();
    expect(result.nextUrl).toBeUndefined();
  });

  it('splits 25 items into pages of 10, 10 and 5', () => {
    expect(paginate(list(25), 1).items).toHaveLength(10);
    expect(paginate(list(25), 2).items).toEqual(list(25).slice(10, 20));
    expect(paginate(list(25), 3).items).toHaveLength(5);
  });

  it('links neighbouring pages', () => {
    const middle = paginate(list(25), 2);
    expect(middle.prevUrl).toBe('/blog');
    expect(middle.nextUrl).toBe('/blog/page/3');
    expect(paginate(list(25), 3).nextUrl).toBeUndefined();
  });

  it('clamps out-of-range pages', () => {
    expect(paginate(list(25), 99).page).toBe(3);
    expect(paginate(list(25), 0).page).toBe(1);
  });
});
