export const POSTS_PER_PAGE = 10;

/** Page 1 lives at /blog, later pages at /blog/page/N (so /blog/page/1 never exists). */
export function blogPageUrl(page: number): string {
  return page <= 1 ? '/blog' : `/blog/page/${page}`;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  prevUrl?: string;
  nextUrl?: string;
}

export function paginate<T>(items: T[], page: number, pageSize = POSTS_PER_PAGE): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    totalPages,
    prevUrl: current > 1 ? blogPageUrl(current - 1) : undefined,
    nextUrl: current < totalPages ? blogPageUrl(current + 1) : undefined,
  };
}
