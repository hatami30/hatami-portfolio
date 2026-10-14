export interface RelatedCandidate {
  id: string;
  tags: readonly string[];
  date: Date;
}

/**
 * Posts that share at least one tag with `current`, best match first (more shared tags, then
 * newer). Internal links between related posts help readers and search engines find more
 * of the site.
 */
export function rankRelated(
  current: RelatedCandidate,
  others: readonly RelatedCandidate[],
  max = 3,
): RelatedCandidate[] {
  const own = new Set(current.tags);
  return others
    .filter((other) => other.id !== current.id)
    .map((other) => ({ other, shared: other.tags.filter((tag) => own.has(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || b.other.date.valueOf() - a.other.date.valueOf())
    .slice(0, max)
    .map(({ other }) => other);
}
