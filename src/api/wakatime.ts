export interface WakatimeEnv {
  WAKATIME_API_KEY?: string;
}

export interface WakatimeResponse {
  success: boolean;
  totalHours?: string;
  topLanguages?: string[];
}

const WAKATIME_ENDPOINT = 'https://wakatime.com/api/v1/users/current/status_bar/today';

export async function handleWakatime(
  request: Request,
  env: WakatimeEnv,
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

  const apiKey = env.WAKATIME_API_KEY;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
  };

  if (!apiKey) {
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: defaultHeaders,
    });
  }

  try {
    const basicAuth = Buffer.from(apiKey).toString('base64');
    const res = await fetchImpl(WAKATIME_ENDPOINT, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: defaultHeaders,
      });
    }

    const json = (await res.json()) as {
      data?: {
        text?: string;
        languages?: Array<{ name: string }>;
      };
    };

    if (!json.data) {
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: defaultHeaders,
      });
    }

    const payload: WakatimeResponse = {
      success: true,
      totalHours: json.data.text ?? '0 mins',
      topLanguages: json.data.languages?.map((l) => l.name) ?? [],
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: defaultHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: defaultHeaders,
    });
  }
}
