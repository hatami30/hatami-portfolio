/**
 * Vercel Function: GET /api/wakatime
 *
 * Thin entry. Logic lives in src/api/wakatime.ts.
 */
import { handleWakatime } from '../src/api/wakatime.ts';

export default {
  fetch(request: Request): Promise<Response> {
    return handleWakatime(request, process.env);
  },
};
