import { describe, expect, it } from 'vitest';
import { demoteHeadings, mdxToMarkdown } from './markdown';

const ORIGIN = 'https://hatami.tech';

describe('mdxToMarkdown', () => {
  it('removes MDX imports and exports', () => {
    const source = [
      "import Callout from '../../components/blog/Callout.astro';",
      "import '../styles/x.css';",
      'export const meta = { a: 1 };',
      '',
      'Hello world.',
    ].join('\n');
    expect(mdxToMarkdown(source, ORIGIN)).toBe('Hello world.');
  });

  it('keeps normal sentences that start with the word "import" or "export"', () => {
    const source = 'Import duties are high.\nExport your data first.';
    expect(mdxToMarkdown(source, ORIGIN)).toBe(source);
  });

  it('turns a Callout into a blockquote with its title', () => {
    const source =
      '<Callout type="tip" title="Remember">\n  Keep it small.\n\n  Really.\n</Callout>';
    expect(mdxToMarkdown(source, ORIGIN)).toBe(
      ['> **Remember**', '>', '> Keep it small.', '>', '> Really.'].join('\n'),
    );
  });

  it('uses the capitalized type when a Callout has no title', () => {
    const out = mdxToMarkdown('<Callout type="warning">Careful.</Callout>', ORIGIN);
    expect(out).toBe('> **Warning**\n>\n> Careful.');
  });

  it('drops unknown components but keeps their text', () => {
    const out = mdxToMarkdown('<Card title="x">Inside text</Card>\n\n<Divider />', ORIGIN);
    expect(out).toBe('Inside text');
  });

  it('removes HTML and MDX comments', () => {
    const out = mdxToMarkdown('Before <!-- hidden --> after {/* also hidden */} end.', ORIGIN);
    expect(out).toBe('Before  after  end.');
  });

  it('makes root-relative links absolute and leaves other links alone', () => {
    const source = '[a](/blog/x) [b](https://example.com) [c](//cdn.example.com/y) [d](#top)';
    expect(mdxToMarkdown(source, ORIGIN)).toBe(
      '[a](https://hatami.tech/blog/x) [b](https://example.com) [c](//cdn.example.com/y) [d](#top)',
    );
  });

  it('never touches fenced code', () => {
    const source = [
      'Intro',
      '',
      '```ts',
      "import Callout from './Callout.astro';",
      '<Callout type="tip">keep me</Callout>',
      '[link](/not-rewritten)',
      '```',
      '',
      'Outro [x](/y)',
    ].join('\n');
    const out = mdxToMarkdown(source, ORIGIN);
    expect(out).toContain("import Callout from './Callout.astro';");
    expect(out).toContain('<Callout type="tip">keep me</Callout>');
    expect(out).toContain('[link](/not-rewritten)');
    expect(out).toContain('Outro [x](https://hatami.tech/y)');
  });

  it('handles tilde fences and longer outer fences containing shorter ones', () => {
    const source = ['~~~', '<Foo />', '~~~', '', '````md', '```', '<Bar />', '```', '````'].join(
      '\n',
    );
    const out = mdxToMarkdown(source, ORIGIN);
    expect(out).toContain('<Foo />');
    expect(out).toContain('<Bar />');
  });

  it('collapses runs of blank lines in prose', () => {
    expect(mdxToMarkdown('a\n\n\n\n\nb', ORIGIN)).toBe('a\n\nb');
  });

  it('normalizes Windows line endings', () => {
    expect(mdxToMarkdown('a\r\n\r\nb', ORIGIN)).toBe('a\n\nb');
  });
});

describe('demoteHeadings', () => {
  it('moves headings down and caps at h6', () => {
    expect(demoteHeadings('## A\n\ntext\n\n##### B', 2)).toBe('#### A\n\ntext\n\n###### B');
  });

  it('does not change "#" lines inside code fences', () => {
    const source = '## A\n\n```bash\n# a comment\n```';
    expect(demoteHeadings(source, 1)).toBe('### A\n\n```bash\n# a comment\n```');
  });
});
