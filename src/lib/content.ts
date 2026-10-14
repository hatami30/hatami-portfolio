/**
 * The ONLY module that queries content collections.
 * No page, feed, tag page, search index or OG route may call getCollection() directly,
 * so draft handling stays in one place.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { rankRelated } from './related';

export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;

/** Drafts are visible in `astro dev` and never in a production build. */
const showDrafts = import.meta.env.DEV;

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) => showDrafts || !data.draft);
  return projects.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getFeaturedProjects(max = 3): Promise<Project[]> {
  return (await getPublishedProjects()).filter((p) => p.data.featured).slice(0, max);
}

export async function getPublishedPosts(): Promise<Post[]> {
  const [posts, projects] = await Promise.all([
    getCollection('blog', ({ data }) => showDrafts || !data.draft),
    getPublishedProjects(),
  ]);

  // Integrity rule: a published post must not point at a missing or draft project.
  const projectIds = new Set(projects.map((p) => p.id));
  for (const post of posts) {
    const ref = post.data.project;
    if (ref && !projectIds.has(ref.id)) {
      throw new Error(
        `Post "${post.id}" references project "${ref.id}", which is missing or still a draft. ` +
          'Publish the project or remove the "project" field.',
      );
    }
  }

  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPostsForProject(projectId: string): Promise<Post[]> {
  return (await getPublishedPosts()).filter((post) => post.data.project?.id === projectId);
}

export async function getTags(): Promise<Array<{ tag: string; count: number }>> {
  const counts = new Map<string, number>();
  for (const post of await getPublishedPosts()) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Other published posts that share tags with `post`, best match first. */
export async function getRelatedPosts(post: Post, max = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const toCandidate = (item: Post) => ({
    id: item.id,
    tags: item.data.tags,
    date: item.data.date,
  });
  const byId = new Map(posts.map((item) => [item.id, item]));
  return rankRelated(toCandidate(post), posts.map(toCandidate), max)
    .map((candidate) => byId.get(candidate.id))
    .filter((item): item is Post => item !== undefined);
}
