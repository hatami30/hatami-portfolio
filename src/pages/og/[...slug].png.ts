import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '@/config/site';
import { t } from '@/config/strings';
import { getPublishedPosts, getPublishedProjects } from '@/lib/content';
import { renderOgImage } from '@/lib/og';

interface Props {
  title: string;
  kicker: string;
}

// Generated at build time: /og/default.png, /og/blog/<slug>.png, /og/projects/<slug>.png
export const getStaticPaths = (async () => {
  const [posts, projects] = await Promise.all([getPublishedPosts(), getPublishedProjects()]);
  return [
    { params: { slug: 'default' }, props: { title: site.role, kicker: site.name } },
    ...posts.map((post) => ({
      params: { slug: `blog/${post.id}` },
      props: { title: post.data.title, kicker: `${site.name} · ${t.blog.title}` },
    })),
    ...projects.map((project) => ({
      params: { slug: `projects/${project.id}` },
      props: { title: project.data.title, kicker: `${site.name} · ${t.projects.title}` },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = await renderOgImage({
    title: props.title,
    kicker: props.kicker,
    footer: new URL(site.url).host,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
