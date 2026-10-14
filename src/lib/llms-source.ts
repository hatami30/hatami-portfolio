/**
 * Feeds the pure builders in llms.ts from the content collections and the site config.
 * Goes through the helpers in content.ts, so drafts are handled in one place.
 */
import { site } from '@/config/site';
import { t } from '@/config/strings';
import { getPublishedPosts, getPublishedProjects } from './content';
import type { LlmsData, LlmsLabels } from './llms';
import { mdxToMarkdown } from './markdown';
import { hasValue } from './placeholder';

const labels: LlmsLabels = {
  projects: t.nav.projects,
  blog: t.nav.blog,
  about: t.nav.about,
  contact: t.nav.contact,
  skills: t.about.skills,
  email: t.contact.email,
  aboutNote: t.llms.aboutNote,
  contactNote: t.llms.contactNote,
  markdownNote: t.llms.markdownNote,
  fullContent: t.llms.fullContent,
  rss: t.llms.rss,
  sitemap: t.llms.sitemap,
  url: t.llms.url,
  published: t.llms.published,
  updated: t.blog.updated,
  tags: t.llms.tags,
  role: t.projects.role,
  period: t.projects.period,
  stack: t.projects.stack,
  liveSite: t.projects.live,
  sourceCode: t.projects.repo,
  relatedProject: t.blog.relatedProject,
};

export async function getLlmsData(): Promise<LlmsData> {
  const [posts, projects] = await Promise.all([getPublishedPosts(), getPublishedProjects()]);
  const projectById = new Map(projects.map((project) => [project.id, project]));

  return {
    site: {
      name: site.name,
      role: site.role,
      description: site.description,
      url: site.url,
      email: hasValue(site.email) ? site.email : undefined,
      socials: [
        { label: 'GitHub', url: site.socials.github },
        { label: 'LinkedIn', url: site.socials.linkedin },
      ].filter((social) => hasValue(social.url)),
      bio: [...site.bio],
      skills: [...site.skills],
    },
    labels,
    projects: projects.map((project) => ({
      id: project.id,
      title: project.data.title,
      summary: project.data.summary,
      path: `/projects/${project.id}`,
      role: project.data.role,
      period: project.data.period,
      stack: project.data.stack,
      liveUrl: project.data.liveUrl,
      repoUrl: project.data.repoUrl,
      markdown: mdxToMarkdown(project.body ?? '', site.url),
    })),
    posts: posts.map((post) => {
      const related = post.data.project ? projectById.get(post.data.project.id) : undefined;
      return {
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        path: `/blog/${post.id}`,
        date: post.data.date,
        updated: post.data.updated,
        tags: post.data.tags,
        project: related
          ? { title: related.data.title, path: `/projects/${related.id}` }
          : undefined,
        markdown: mdxToMarkdown(post.body ?? '', site.url),
      };
    }),
  };
}
