import type { APIRoute } from 'astro';
import { handleContact } from '@/api/contact';

// Dev-only route injected by scripts/dev-api.mjs. Never part of the production build:
// production serves /api/contact from api/contact.ts (Vercel Function).
export const prerender = false;

export const ALL: APIRoute = ({ request }) => handleContact(request, process.env);
