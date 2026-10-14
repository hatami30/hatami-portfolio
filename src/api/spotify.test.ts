import { describe, it, expect, vi } from 'vitest';
import { handleSpotify } from './spotify';

describe('handleSpotify', () => {
  it('rejects non-GET methods with 405', async () => {
    const req = new Request('https://hatami.tech/api/spotify', { method: 'POST' });
    const res = await handleSpotify(req, {});
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET');
  });

  it('returns isPlaying: false gracefully when env credentials are missing', async () => {
    const req = new Request('https://hatami.tech/api/spotify');
    const res = await handleSpotify(req, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isPlaying).toBe(false);
  });

  it('returns isPlaying: false when Spotify returns 204 (idle)', async () => {
    const mockFetch = vi
      .fn()
      // Token endpoint
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'fake_token' }), { status: 200 }),
      )
      // Currently playing endpoint returns 204
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const req = new Request('https://hatami.tech/api/spotify');
    const env = {
      SPOTIFY_CLIENT_ID: 'cid',
      SPOTIFY_CLIENT_SECRET: 'csec',
      SPOTIFY_REFRESH_TOKEN: 'cref',
    };

    const res = await handleSpotify(req, env, mockFetch);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isPlaying).toBe(false);
  });

  it('returns currently playing track when Spotify returns 200', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'fake_token' }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            is_playing: true,
            item: {
              name: 'Midnight City',
              artists: [{ name: 'M83' }],
              external_urls: { spotify: 'https://open.spotify.com/track/123' },
              album: { images: [{ url: 'https://img.spotify.com/art.jpg' }] },
            },
          }),
          { status: 200 },
        ),
      );

    const req = new Request('https://hatami.tech/api/spotify');
    const env = {
      SPOTIFY_CLIENT_ID: 'cid',
      SPOTIFY_CLIENT_SECRET: 'csec',
      SPOTIFY_REFRESH_TOKEN: 'cref',
    };

    const res = await handleSpotify(req, env, mockFetch);
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=30');

    const data = await res.json();
    expect(data.isPlaying).toBe(true);
    expect(data.title).toBe('Midnight City');
    expect(data.artist).toBe('M83');
    expect(data.songUrl).toBe('https://open.spotify.com/track/123');
    expect(data.albumArt).toBe('https://img.spotify.com/art.jpg');
  });
});
