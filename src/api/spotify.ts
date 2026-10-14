export interface SpotifyEnv {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_REFRESH_TOKEN?: string;
}

export interface SpotifyResponse {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  songUrl?: string;
  albumArt?: string;
}

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';

export async function handleSpotify(
  request: Request,
  env: SpotifyEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'GET',
      },
    });
  }

  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = env.SPOTIFY_REFRESH_TOKEN;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
  };

  // If credentials are not configured, degrade gracefully without throwing errors
  if (!clientId || !clientSecret || !refreshToken) {
    return new Response(JSON.stringify({ isPlaying: false }), {
      status: 200,
      headers: defaultHeaders,
    });
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetchImpl(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: defaultHeaders,
      });
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: defaultHeaders,
      });
    }

    const playerRes = await fetchImpl(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (playerRes.status === 204 || playerRes.status >= 400) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: defaultHeaders,
      });
    }

    const song = (await playerRes.json()) as {
      is_playing?: boolean;
      item?: {
        name: string;
        artists: Array<{ name: string }>;
        external_urls?: { spotify?: string };
        album?: { images?: Array<{ url: string }> };
      };
    };

    if (!song.item) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: defaultHeaders,
      });
    }

    const payload: SpotifyResponse = {
      isPlaying: Boolean(song.is_playing),
      title: song.item.name,
      artist: song.item.artists.map((a) => a.name).join(', '),
      songUrl: song.item.external_urls?.spotify ?? '',
      albumArt: song.item.album?.images?.[0]?.url ?? '',
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: defaultHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ isPlaying: false }), {
      status: 200,
      headers: defaultHeaders,
    });
  }
}
