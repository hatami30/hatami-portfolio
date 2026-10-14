import type { APIRoute, GetStaticPaths } from 'astro';
import { buildPostMarkdown } from '@/lib/llms';
import { getLlmsData } from '@/lib/llms-source';

interface Props {
  markdown: string;
}

// /blog/<slug>.md: the same post as clean Markdown for AI tools (linked from the HTML page).
export const getStaticPaths = (async () => {
  const data = await getLlmsData();
  return data.posts.map((post) => ({
    params: { slug: post.id },
    props: { markdown: buildPostMarkdown(data, post) },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = ({ props }) =>
  new Response(props.markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
