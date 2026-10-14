import { describe, expect, it } from 'vitest';
import { hasValue } from './placeholder';

describe('hasValue', () => {
  it('accepts a real value', () => {
    expect(hasValue('https://github.com/example')).toBe(true);
  });

  it('rejects empty, blank, null and undefined', () => {
    expect(hasValue('')).toBe(false);
    expect(hasValue('   ')).toBe(false);
    expect(hasValue(null)).toBe(false);
    expect(hasValue(undefined)).toBe(false);
  });

  it('rejects placeholders', () => {
    // Built at runtime so this test file is not itself reported by `pnpm check:placeholders`.
    const placeholder = `[${'PLACEHOLDER'}: GitHub profile URL]`;
    expect(hasValue(placeholder)).toBe(false);
  });
});
