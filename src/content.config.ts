import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const aprende = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/aprende' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { aprende };
