import { describe, expect, it } from 'vitest';
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  buildPostMarkdown,
  buildProjectMarkdown,
  type LlmsData,
  type LlmsLabels,
} from './llms';

const labels: LlmsLabels = {
  projects: 'Projects',
  blog: 'Blog',
  about: 'About',
  contact: 'Contact',
  skills: 'Skills',
  email: 'Email',
  aboutNote: 'Bio and skills',
  contactNote: 'Contact form',
  markdownNote: 'Add .md to any project or post URL.',
  fullContent: 'Everything in one file',
  rss: 'RSS feed',
  sitemap: 'XML sitemap',
  url: 'URL',
  published: 'Published',
  updated: 'Updated',
  tags: 'Tags',
  role: 'Role',
  period: 'Period',
  stack: 'Stack',
  liveSite: 'Live site',
  sourceCode: 'Source code',
  relatedProject: 'Related project',
};

const data: LlmsData = {
  site: {
    name: 'Ada Example',
    role: 'Software Engineer.',
    description: 'I build reliable web software.',
    url: 'https://hatami.tech',
    email: 'ada@example.com',
    socials: [{ label: 'GitHub', url: 'https://github.com/ada' }],
    bio: ['Ada is an engineer.', 'She likes small tools.'],
    skills: ['Backend: PHP, Node.js'],
  },
  labels,
  projects: [
    {
      id: 'queue-tuner',
      title: 'Queue [Tuner]',
      summary: 'Faster queues\nfor everyone.',
      path: '/projects/queue-tuner',
      role: 'Solo developer',
      period: '2025',
      stack: ['Laravel', 'Redis'],
      liveUrl: 'https://example.com',
      repoUrl: 'https://github.com/ada/queue-tuner',
      markdown: '## Problem\n\nSlow jobs.\n\n```bash\n# keep this\n```',
    },
  ],
  posts: [
    {
      id: 'hello',
      title: 'Hello',
      description: 'First post.',
      path: '/blog/hello',
      date: new Date('2026-10-13T00:00:00Z'),
      updated: new Date('2026-10-20T00:00:00Z'),
      tags: ['php', 'queues'],
      project: { title: 'Queue [Tuner]', path: '/projects/queue-tuner' },
      markdown: '## Why\n\nBecause.',
    },
  ],
};

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt(data);

  it('starts with the H1 name and a single-line blockquote summary', () => {
    const [h1, blank, quote] = text.split('\n');
    expect(h1).toBe('# Ada Example');
    expect(blank).toBe('');
    expect(quote).toBe('> Software Engineer. I build reliable web software.');
  });

  it('lists projects and posts as "- [title](absolute url): note"', () => {
    expect(text).toContain(
      '- [Queue \\[Tuner\\]](https://hatami.tech/projects/queue-tuner): Faster queues for everyone.',
    );
    expect(text).toContain('- [Hello](https://hatami.tech/blog/hello): First post. (2026-10-13)');
  });

  it('puts the literal "Optional" section last', () => {
    const headings = text.split('\n').filter((line) => line.startsWith('## '));
    expect(headings).toEqual(['## About', '## Projects', '## Blog', '## Optional']);
    expect(text).toContain(
      '- [llms-full.txt](https://hatami.tech/llms-full.txt): Everything in one file',
    );
    expect(text).toContain('- [Sitemap](https://hatami.tech/sitemap.xml): XML sitemap');
  });

  it('omits empty Projects and Blog sections', () => {
    const empty = buildLlmsTxt({ ...data, posts: [], projects: [] });
    expect(empty).not.toContain('## Projects');
    expect(empty).not.toContain('## Blog');
    expect(empty).toContain('## About');
  });

  it('ends with exactly one newline', () => {
    expect(text.endsWith('\n')).toBe(true);
    expect(text.endsWith('\n\n')).toBe(false);
  });
});

describe('buildPostMarkdown / buildProjectMarkdown', () => {
  it('writes title, summary, facts and the body for a post', () => {
    const md = buildPostMarkdown(data, data.posts[0]!);
    expect(md.startsWith('# Hello\n\n> First post.\n')).toBe(true);
    expect(md).toContain('- URL: https://hatami.tech/blog/hello');
    expect(md).toContain('- Published: 2026-10-13');
    expect(md).toContain('- Updated: 2026-10-20');
    expect(md).toContain('- Tags: php, queues');
    expect(md).toContain(
      '- Related project: [Queue \\[Tuner\\]](https://hatami.tech/projects/queue-tuner)',
    );
    expect(md).toContain('## Why\n\nBecause.');
  });

  it('writes role, stack and links for a project', () => {
    const md = buildProjectMarkdown(data, data.projects[0]!);
    expect(md).toContain('- Role: Solo developer');
    expect(md).toContain('- Stack: Laravel, Redis');
    expect(md).toContain('- Live site: https://example.com');
    expect(md).toContain('- Source code: https://github.com/ada/queue-tuner');
  });
});

describe('buildLlmsFullTxt', () => {
  const text = buildLlmsFullTxt(data);

  it('contains about, contact, projects and posts under H2 sections', () => {
    const withoutCode = text.replace(/```[\s\S]*?```/g, '');
    const headings = withoutCode
      .split('\n')
      .filter((line) => /^##? /.test(line) && !line.startsWith('###'));
    expect(headings).toEqual(['# Ada Example', '## About', '## Projects', '## Blog']);
    expect(text).toContain('Ada is an engineer.');
    expect(text).toContain('- Backend: PHP, Node.js');
    expect(text).toContain('- Email: ada@example.com');
    expect(text).toContain('- GitHub: https://github.com/ada');
  });

  it('nests entry headings below the file structure and leaves code alone', () => {
    expect(text).toContain('### Queue [Tuner]');
    expect(text).toContain('#### Problem');
    expect(text).toContain('#### Why');
    expect(text).toContain('# keep this');
  });

  it('skips the contact block when there is nothing real to show', () => {
    const bare = buildLlmsFullTxt({
      ...data,
      site: { ...data.site, email: undefined, socials: [] },
    });
    expect(bare).not.toContain('### Contact');
  });
});
