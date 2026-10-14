/**
 * Contact form handler (platform-neutral: Web `Request` in, Web `Response` out).
 *
 * Production entry: /api/contact.ts (Vercel Function).
 * Local entry:      scripts/dev-api.mjs (mounted inside `astro dev`).
 *
 * Contract and security rules: AGENTS.md section 12.2.
 * Never log or store the visitor's name, email, or message.
 */
import { z } from 'zod';

export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export const MAX_BODY_BYTES = 10 * 1024;
const RESEND_URL = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 8000;

const required = { error: 'required' } as const;

// Error "messages" are stable codes. The client maps them to text in src/config/strings.ts.
const contactSchema = z.object({
  name: z.string(required).trim().min(1, required).max(100, { error: 'too_long' }),
  email: z
    .string(required)
    .trim()
    .min(1, required)
    .max(254, { error: 'too_long' })
    .pipe(z.email({ error: 'invalid_email' })),
  message: z
    .string(required)
    .trim()
    .min(1, required)
    .min(10, { error: 'too_short' })
    .max(2000, { error: 'too_long' }),
});

function json(body: Record<string, unknown>, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'body');
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

/** Strip control characters (prevents header injection) and cap the length. */
function buildSubject(name: string): string {
  // eslint-disable-next-line no-control-regex
  return `New message from ${name}`.replace(/[\u0000-\u001f\u007f]+/g, ' ').slice(0, 100);
}

export async function handleContact(
  request: Request,
  env: ContactEnv,
  fetchImpl: FetchLike = (input, init) => fetch(input, init),
): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST' });
  }

  // Same-origin only. Comparing with the request's own origin means localhost,
  // preview deployments and the production domain all work with no configuration.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: 'forbidden_origin' }, 403);
  }

  const contentType = (request.headers.get('content-type') ?? '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return json({ ok: false, error: 'unsupported_media_type' }, 415);
  }

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'payload_too_large' }, 413);
  }
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'payload_too_large' }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honeypot: bots fill hidden fields. Pretend it worked and send nothing.
  const honeypot = (body as Record<string, unknown>).website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ ok: true }, 200);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    console.info('contact:validation_failed');
    return json({ ok: false, error: 'validation', fields: fieldErrors(parsed.error) }, 400);
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error('contact:missing_env');
    return json({ ok: false, error: 'server_error' }, 500);
  }

  const { name, email, message } = parsed.data;
  try {
    const response = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: buildSubject(name),
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`contact:resend_error status=${response.status}`);
      return json({ ok: false, error: 'send_failed' }, 502);
    }
  } catch {
    console.error('contact:resend_unreachable');
    return json({ ok: false, error: 'send_failed' }, 502);
  }

  console.info('contact:sent');
  return json({ ok: true }, 200);
}
