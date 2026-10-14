/**
 * Content schemas (field rules: AGENTS.md section 6, model: docs/ERD.md).
 * Invalid frontmatter fails the build instead of silently producing broken pages.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tag = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Tags must be lowercase kebab-case, e.g. "web-performance"');

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1).max(160),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z
        .array(tag)
        .default([])
        .refine((tags) => new Set(tags).size === tags.length, { message: 'Duplicate tags' }),
      cover: image().optional(),
      // Optional link to the case study this post belongs to.
      project: reference('projects').optional(),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      summary: z.string().min(1).max(160),
      role: z.string().min(1),
      period: z.string().optional(),
      stack: z.array(z.string().min(1)).min(1),
      liveUrl: z.url().optional(),
      repoUrl: z.url().optional(),
      cover: image().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, projects };
