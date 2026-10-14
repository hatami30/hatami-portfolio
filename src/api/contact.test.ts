import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleContact, MAX_BODY_BYTES, type ContactEnv } from './contact.ts';

const env: ContactEnv = {
  RESEND_API_KEY: 're_test_key_123',
  CONTACT_TO_EMAIL: 'owner@example.com',
  CONTACT_FROM_EMAIL: 'Site <contact@example.com>',
};

const ENDPOINT = 'https://hatami.tech/api/contact';
const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello, I would like to talk about a project.',
  website: '',
};

function post(body: unknown, headers: Record<string, string> = {}, raw?: string, url = ENDPOINT) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: new URL(url).origin, ...headers },
    body: raw ?? JSON.stringify(body),
  });
}

const resendOk = () => vi.fn(async () => new Response('{"id":"1"}', { status: 200 }));
const parse = async (res: Response) => (await res.json()) as Record<string, unknown>;

const spies = {
  log: vi.spyOn(console, 'log'),
  info: vi.spyOn(console, 'info'),
  warn: vi.spyOn(console, 'warn'),
  error: vi.spyOn(console, 'error'),
};

beforeEach(() => {
  Object.values(spies).forEach((spy) => spy.mockImplementation(() => {}));
});

afterEach(() => {
  // Privacy: nothing the visitor typed, and no secret, may ever reach the logs.
  const logged = JSON.stringify(Object.values(spies).flatMap((spy) => spy.mock.calls));
  for (const secret of [
    'Ada Lovelace',
    'ada@example.com',
    'Hello, I would like',
    're_test_key_123',
  ]) {
    expect(logged).not.toContain(secret);
  }
  Object.values(spies).forEach((spy) => spy.mockClear());
});

describe('POST /api/contact: success', () => {
  it('sends exactly one email with the expected payload and returns 200', async () => {
    const fetchMock = resendOk();
    const res = await handleContact(post(valid), env, fetchMock);

    expect(res.status).toBe(200);
    expect(await parse(res)).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test_key_123');
    const payload = JSON.parse(init.body as string);
    expect(payload).toMatchObject({
      from: 'Site <contact@example.com>',
      to: ['owner@example.com'],
      reply_to: 'ada@example.com',
      subject: 'New message from Ada Lovelace',
    });
    expect(payload.text).toContain('Hello, I would like to talk about a project.');
  });

  it('trims whitespace before validating', async () => {
    const fetchMock = resendOk();
    const res = await handleContact(post({ ...valid, name: '  Ada  ' }), env, fetchMock);
    expect(res.status).toBe(200);
  });

  it('strips control characters from the subject (header injection)', async () => {
    const fetchMock = resendOk();
    await handleContact(post({ ...valid, name: 'Ada\r\nBcc: evil@example.com' }), env, fetchMock);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const { subject } = JSON.parse(init.body as string);
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('accepts an Origin equal to the request origin (localhost and preview URLs work)', async () => {
    const fetchMock = resendOk();
    const preview = 'https://hatami-tech-git-feature-x.vercel.app/api/contact';
    const res = await handleContact(post(valid, {}, undefined, preview), env, fetchMock);
    expect(res.status).toBe(200);
  });

  it('sets JSON and no-store headers', async () => {
    const res = await handleContact(post(valid), env, resendOk());
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});

describe('POST /api/contact: honeypot', () => {
  it('returns 200 and sends nothing when the honeypot is filled', async () => {
    const fetchMock = resendOk();
    const res = await handleContact(
      post({ ...valid, website: 'https://spam.example' }),
      env,
      fetchMock,
    );
    expect(res.status).toBe(200);
    expect(await parse(res)).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/contact: validation (400)', () => {
  const cases: Array<[string, Record<string, unknown>, string, string]> = [
    ['empty name', { name: '   ' }, 'name', 'required'],
    ['name too long', { name: 'a'.repeat(101) }, 'name', 'too_long'],
    ['missing email', { email: undefined }, 'email', 'required'],
    ['invalid email', { email: 'not-an-email' }, 'email', 'invalid_email'],
    ['message too short', { message: 'short' }, 'message', 'too_short'],
    ['message too long', { message: 'x'.repeat(2001) }, 'message', 'too_long'],
    ['non-string field', { message: 12345 }, 'message', 'required'],
  ];

  it.each(cases)('%s', async (_label, override, field, code) => {
    const fetchMock = resendOk();
    const res = await handleContact(post({ ...valid, ...override }), env, fetchMock);
    const body = await parse(res);
    expect(res.status).toBe(400);
    expect(body.error).toBe('validation');
    expect((body.fields as Record<string, string>)[field]).toBe(code);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns bad_request for malformed JSON', async () => {
    const res = await handleContact(post(null, {}, '{not json'), env, resendOk());
    expect(res.status).toBe(400);
    expect((await parse(res)).error).toBe('bad_request');
  });

  it('returns bad_request when the JSON body is not an object', async () => {
    const res = await handleContact(post(null, {}, '[1,2,3]'), env, resendOk());
    expect(res.status).toBe(400);
  });
});

describe('POST /api/contact: request checks', () => {
  it('rejects a non-JSON content type with 415', async () => {
    const res = await handleContact(post(valid, { 'content-type': 'text/plain' }), env, resendOk());
    expect(res.status).toBe(415);
  });

  it('rejects a body over 10 KB with 413', async () => {
    const res = await handleContact(
      post(null, {}, 'x'.repeat(MAX_BODY_BYTES + 1)),
      env,
      resendOk(),
    );
    expect(res.status).toBe(413);
  });

  it('rejects a different Origin with 403', async () => {
    const fetchMock = resendOk();
    const res = await handleContact(
      post(valid, { origin: 'https://evil.example' }),
      env,
      fetchMock,
    );
    expect(res.status).toBe(403);
    expect((await parse(res)).error).toBe('forbidden_origin');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['GET', 'PUT', 'DELETE', 'PATCH'])(
    'rejects %s with 405 and an Allow header',
    async (method) => {
      const res = await handleContact(new Request(ENDPOINT, { method }), env, resendOk());
      expect(res.status).toBe(405);
      expect(res.headers.get('allow')).toBe('POST');
    },
  );
});

describe('POST /api/contact: failures', () => {
  it('returns 502 when Resend returns an error', async () => {
    const fetchMock = vi.fn(async () => new Response('{"message":"bad"}', { status: 422 }));
    const res = await handleContact(post(valid), env, fetchMock);
    expect(res.status).toBe(502);
    expect((await parse(res)).error).toBe('send_failed');
  });

  it('returns 502 when Resend times out or is unreachable', async () => {
    const fetchMock = vi.fn(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    const res = await handleContact(post(valid), env, fetchMock);
    expect(res.status).toBe(502);
  });

  it.each(['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'] as const)(
    'returns 500 when %s is missing',
    async (key) => {
      const fetchMock = resendOk();
      const res = await handleContact(post(valid), { ...env, [key]: undefined }, fetchMock);
      expect(res.status).toBe(500);
      expect((await parse(res)).error).toBe('server_error');
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('never echoes user input or provider details in error bodies', async () => {
    const fetchMock = vi.fn(
      async () => new Response('{"message":"secret provider detail"}', { status: 500 }),
    );
    const res = await handleContact(post(valid), env, fetchMock);
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain('secret provider detail');
    expect(text).not.toContain('Ada');
  });
});
