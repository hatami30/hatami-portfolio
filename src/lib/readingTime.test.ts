import { describe, expect, it } from 'vitest';
import { readingTime } from './readingTime';

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

describe('readingTime', () => {
  it('returns at least 1 minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('short')).toBe(1);
  });

  it('rounds up at 200 words per minute', () => {
    expect(readingTime(words(200))).toBe(1);
    expect(readingTime(words(201))).toBe(2);
    expect(readingTime(words(650))).toBe(4);
  });

  it('ignores fenced code, MDX imports and tags', () => {
    const source = `import Callout from './Callout.astro';\n\n${words(150)}\n\n\`\`\`ts\n${words(800)}\n\`\`\`\n\n<Callout>${words(10)}</Callout>`;
    expect(readingTime(source)).toBe(1);
  });
});
