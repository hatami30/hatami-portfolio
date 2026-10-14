import { site } from '@/config/site';

/** Human-readable date in the site language. Uses UTC so a date never shifts by timezone. */
export function formatDate(date: Date, lang: string = site.lang): string {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
