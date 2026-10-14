import { describe, it, expect, vi } from 'vitest';
import { handleWakatime } from './wakatime';

describe('handleWakatime', () => {
  it('rejects non-GET methods with 405', async () => {
    const req = new Request('https://hatami.tech/api/wakatime', { method: 'POST' });
    const res = await handleWakatime(req, {});
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET');
  });

  it('returns success: false when WAKATIME_API_KEY is not set', async () => {
    const req = new Request('https://hatami.tech/api/wakatime');
    const res = await handleWakatime(req, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('returns parsed stats when WakaTime returns 200', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            text: '4 hrs 12 mins',
            languages: [{ name: 'TypeScript' }, { name: 'Astro' }, { name: 'Tailwind' }],
          },
        }),
        { status: 200 },
      ),
    );

    const req = new Request('https://hatami.tech/api/wakatime');
    const env = { WAKATIME_API_KEY: 'waka_sec_123' };

    const res = await handleWakatime(req, env, mockFetch);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=300');

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.totalHours).toBe('4 hrs 12 mins');
    expect(data.topLanguages).toEqual(['TypeScript', 'Astro', 'Tailwind']);
  });
});
