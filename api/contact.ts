/**
 * Vercel Function: POST /api/contact
 *
 * Thin entry on purpose. Every file inside /api becomes a public route, so all logic
 * and tests live in src/api/. Web-standard handler: `export default { fetch }` receives
 * every HTTP method, and handleContact answers non-POST requests with a JSON 405.
 */
import { handleContact } from '../src/api/contact.ts';

export default {
  fetch(request: Request): Promise<Response> {
    return handleContact(request, process.env);
  },
};
