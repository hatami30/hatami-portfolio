/**
 * Builders for the AI-readable files: /llms.txt (index), /llms-full.txt (everything in one
 * file) and the .md version of each post and project.
 *
 * Format of /llms.txt follows https://llmstxt.org: one H1 (name), a blockquote summary,
 * optional text, then H2 sections that hold lists of `- [title](url): note`. The H2 named
 * "Optional" marks links an agent may skip when it needs a shorter context.
 *
 * Pure functions with plain inputs (no Astro imports) so they are unit-tested. The adapter
 * that feeds them from the content collections is src/lib/llms-source.ts.
 */
import { demoteHeadings } from './markdown';

export interface LlmsLabels {
  projects: string;
  blog: string;
  about: string;
  contact: string;
  skills: string;
  email: string;
  aboutNote: string;
  contactNote: string;
  markdownNote: string;
  fullContent: string;
  rss: string;
  sitemap: string;
  url: string;
  published: string;
  updated: string;
  tags: string;
  role: string;
  period: string;
  stack: string;
  liveSite: string;
  sourceCode: string;
  relatedProject: string;
}

export interface LlmsSite {
  name: string;
  role: string;
  description: string;
  /** Canonical origin without a trailing slash, e.g. https://hatami.tech */
  url: string;
  /** Only real values: placeholders are filtered out by the adapter. */
  email?: string;
  socials: Array<{ label: string; url: string }>;
  bio: string[];
  skills: string[];
}

export interface LlmsPost {
  /** Content id (the slug): /blog/<id> and /blog/<id>.md */
  id: string;
  title: string;
  description: string;
  /** Path like /blog/my-post (no trailing slash). */
  path: string;
  date: Date;
  updated?: Date;
  tags: string[];
  project?: { title: string; path: string };
  /** Clean Markdown body (see mdxToMarkdown). */
  markdown: string;
}

export interface LlmsProject {
  /** Content id (the slug): /projects/<id> and /projects/<id>.md */
  id: string;
  title: string;
  summary: string;
  path: string;
  role: string;
  period?: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  markdown: string;
}

export interface LlmsData {
  site: LlmsSite;
  labels: LlmsLabels;
  posts: LlmsPost[];
  projects: LlmsProject[];
}

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();
const escapeLinkText = (text: string) => oneLine(text).replace(/([[\]])/g, '\\$1');
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

function link(title: string, url: string, note?: string): string {
  const base = `- [${escapeLinkText(title)}](${url})`;
  return note ? `${base}: ${oneLine(note)}` : base;
}

function summary(site: LlmsSite): string {
  const role = oneLine(site.role).replace(/[.\s]+$/, '');
  const description = oneLine(site.description);
  const text = role && description ? `${role}. ${description}` : role || description;
  return `> ${text || oneLine(site.name)}`;
}

export function buildLlmsTxt({ site, labels, posts, projects }: LlmsData): string {
  const abs = (path: string) => `${site.url}${path}`;
  const lines: string[] = [`# ${oneLine(site.name)}`, '', summary(site), '', labels.markdownNote];

  lines.push(
    '',
    `## ${labels.about}`,
    link(labels.about, abs('/about'), labels.aboutNote),
    link(labels.contact, abs('/contact'), labels.contactNote),
  );

  if (projects.length > 0) {
    lines.push('', `## ${labels.projects}`);
    for (const project of projects) {
      lines.push(link(project.title, abs(project.path), project.summary));
    }
  }

  if (posts.length > 0) {
    lines.push('', `## ${labels.blog}`);
    for (const post of posts) {
      lines.push(link(post.title, abs(post.path), `${post.description} (${isoDay(post.date)})`));
    }
  }

  // "Optional" is a literal keyword of the llms.txt format: do not translate it.
  lines.push(
    '',
    '## Optional',
    link('llms-full.txt', abs('/llms-full.txt'), labels.fullContent),
    link('RSS', abs('/rss.xml'), labels.rss),
    link('Sitemap', abs('/sitemap.xml'), labels.sitemap),
  );

  return `${lines.join('\n')}\n`;
}

function postMeta(site: LlmsSite, labels: LlmsLabels, post: LlmsPost): string[] {
  const meta = [
    `- ${labels.url}: ${site.url}${post.path}`,
    `- ${labels.published}: ${isoDay(post.date)}`,
  ];
  if (post.updated) meta.push(`- ${labels.updated}: ${isoDay(post.updated)}`);
  if (post.tags.length > 0) meta.push(`- ${labels.tags}: ${post.tags.join(', ')}`);
  if (post.project) {
    meta.push(
      `- ${labels.relatedProject}: [${escapeLinkText(post.project.title)}](${site.url}${post.project.path})`,
    );
  }
  return meta;
}

function projectMeta(site: LlmsSite, labels: LlmsLabels, project: LlmsProject): string[] {
  const meta = [`- ${labels.url}: ${site.url}${project.path}`, `- ${labels.role}: ${project.role}`];
  if (project.period) meta.push(`- ${labels.period}: ${project.period}`);
  meta.push(`- ${labels.stack}: ${project.stack.join(', ')}`);
  if (project.liveUrl) meta.push(`- ${labels.liveSite}: ${project.liveUrl}`);
  if (project.repoUrl) meta.push(`- ${labels.sourceCode}: ${project.repoUrl}`);
  return meta;
}

/** The .md file of one post: H1 title, summary, facts, then the body as written. */
export function buildPostMarkdown(data: LlmsData, post: LlmsPost): string {
  return `${[
    `# ${oneLine(post.title)}`,
    '',
    `> ${oneLine(post.description)}`,
    '',
    ...postMeta(data.site, data.labels, post),
    '',
    post.markdown,
  ].join('\n')}\n`;
}

export function buildProjectMarkdown(data: LlmsData, project: LlmsProject): string {
  return `${[
    `# ${oneLine(project.title)}`,
    '',
    `> ${oneLine(project.summary)}`,
    '',
    ...projectMeta(data.site, data.labels, project),
    '',
    project.markdown,
  ].join('\n')}\n`;
}

/** Everything in one file, with headings nested under "## Projects" and "## Blog". */
export function buildLlmsFullTxt(data: LlmsData): string {
  const { site, labels, posts, projects } = data;
  const lines: string[] = [`# ${oneLine(site.name)}`, '', summary(site)];

  lines.push('', `## ${labels.about}`);
  for (const paragraph of site.bio) lines.push('', oneLine(paragraph));
  if (site.skills.length > 0) {
    lines.push(
      '',
      `### ${labels.skills}`,
      '',
      ...site.skills.map((skill) => `- ${oneLine(skill)}`),
    );
  }
  const contact = [
    ...(site.email ? [`- ${labels.email}: ${site.email}`] : []),
    ...site.socials.map((social) => `- ${social.label}: ${social.url}`),
  ];
  if (contact.length > 0) lines.push('', `### ${labels.contact}`, '', ...contact);

  if (projects.length > 0) {
    lines.push('', `## ${labels.projects}`);
    for (const project of projects) {
      lines.push(
        '',
        `### ${oneLine(project.title)}`,
        '',
        `> ${oneLine(project.summary)}`,
        '',
        ...projectMeta(site, labels, project),
        '',
        demoteHeadings(project.markdown, 2),
      );
    }
  }

  if (posts.length > 0) {
    lines.push('', `## ${labels.blog}`);
    for (const post of posts) {
      lines.push(
        '',
        `### ${oneLine(post.title)}`,
        '',
        `> ${oneLine(post.description)}`,
        '',
        ...postMeta(site, labels, post),
        '',
        demoteHeadings(post.markdown, 2),
      );
    }
  }

  return `${lines.join('\n')}\n`;
}
