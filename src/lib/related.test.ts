import { describe, expect, it } from 'vitest';
import { rankRelated, type RelatedCandidate } from './related';

const post = (id: string, tags: string[], day: number): RelatedCandidate => ({
  id,
  tags,
  date: new Date(Date.UTC(2026, 0, day)),
});

describe('rankRelated', () => {
  const current = post('current', ['php', 'queues'], 1);

  it('excludes the post itself and posts with no shared tag', () => {
    const result = rankRelated(current, [current, post('other', ['css'], 2)]);
    expect(result).toEqual([]);
  });

  it('ranks by shared tags first, then by newest', () => {
    const result = rankRelated(current, [
      post('one-shared-old', ['php'], 2),
      post('two-shared', ['php', 'queues'], 3),
      post('one-shared-new', ['queues'], 9),
    ]);
    expect(result.map((item) => item.id)).toEqual([
      'two-shared',
      'one-shared-new',
      'one-shared-old',
    ]);
  });

  it('limits the result to max items (3 by default)', () => {
    const others = Array.from({ length: 6 }, (_, index) => post(`p${index}`, ['php'], index + 2));
    expect(rankRelated(current, others)).toHaveLength(3);
    expect(rankRelated(current, others, 2)).toHaveLength(2);
  });
});
