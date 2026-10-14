/**
 * Vercel Function: GET /api/spotify
 *
 * Thin entry. Logic lives in src/api/spotify.ts.
 */
import { handleSpotify } from '../src/api/spotify.ts';

export default {
  fetch(request: Request): Promise<Response> {
    return handleSpotify(request, process.env);
  },
};
