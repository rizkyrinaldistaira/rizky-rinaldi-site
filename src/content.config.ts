import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().optional(),

      // Seri pembelajaran
      series: z.string().optional(),
      seriesPart: z.number().optional(),
      seriesDescription: z.string().optional(),
      seriesIcon: z.string().optional(),

      // Penelusuran dan penyaringan (semua opsional)
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      icon: z.string().optional(),
    }),
});

export const collections = { blog };
