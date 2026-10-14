import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '@/lib/llms';
import { getLlmsData } from '@/lib/llms-source';

// Index of the site for AI tools (https://llmstxt.org). Generated from the content collections.
export const GET: APIRoute = async () =>
  new Response(buildLlmsTxt(await getLlmsData()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
