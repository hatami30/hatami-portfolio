import type { APIRoute, GetStaticPaths } from 'astro';
import { buildProjectMarkdown } from '@/lib/llms';
import { getLlmsData } from '@/lib/llms-source';

interface Props {
  markdown: string;
}

// /projects/<slug>.md: the same case study as clean Markdown for AI tools.
export const getStaticPaths = (async () => {
  const data = await getLlmsData();
  return data.projects.map((project) => ({
    params: { slug: project.id },
    props: { markdown: buildProjectMarkdown(data, project) },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = ({ props }) =>
  new Response(props.markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
