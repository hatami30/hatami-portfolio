import { describe, expect, it } from 'vitest';
import handler from '../../api/contact.ts';

// Guards the Vercel Function entry: a web-standard `export default { fetch }` object that
// delegates to handleContact (verified against @vercel/node's web-handler detection).
describe('Vercel entry (api/contact.ts)', () => {
  it('exports a handler object with a fetch function', () => {
    expect(typeof handler.fetch).toBe('function');
  });

  it('delegates to handleContact: GET returns the JSON 405 with an Allow header', async () => {
    const res = await handler.fetch(new Request('https://hatami.tech/api/contact'));
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
    expect(await res.json()).toEqual({ ok: false, error: 'method_not_allowed' });
  });
});
