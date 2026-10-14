import type { APIRoute } from 'astro';
import { buildLlmsFullTxt } from '@/lib/llms';
import { getLlmsData } from '@/lib/llms-source';

// All projects and posts as one Markdown file, for tools that read a single document.
export const GET: APIRoute = async () =>
  new Response(buildLlmsFullTxt(await getLlmsData()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
