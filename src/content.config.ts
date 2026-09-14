import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { WRITING_KINDS, type WritingKind } from './site.config';

// Writing: one Markdown file per piece in src/content/writing/.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(Object.keys(WRITING_KINDS) as [WritingKind, ...WritingKind[]]).default('thoughts'),
    date: z.coerce.date(),
    lang: z.string().optional(), // e.g. "es" for pieces not in English
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Photo albums: src/content/albums/<name>.md plus a folder of images next to it.
// scripts/import-photos.mjs writes these from a folder of photos.
const albums = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/albums' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      dateEnd: z.coerce.date().optional(),
      description: z.string().optional(),
      cover: image(),
      photos: z.array(
        z.object({
          src: image(),
          alt: z.string().optional(),
          caption: z.string().optional(),
          // Camera wall-clock time, e.g. "2026-03-03T12:09:53". YAML may hand an
          // unquoted value over as a Date, so normalise it back to that string.
          taken: z
            .union([z.string(), z.date()])
            .transform((v) => (typeof v === 'string' ? v : v.toISOString().slice(0, 19)))
            .optional(),
          camera: z.string().optional(),
          lens: z.string().optional(),
          focalLength: z.number().optional(),
          aperture: z.number().optional(),
          shutter: z.string().optional(), // "1/250" or "2" (seconds)
          iso: z.number().optional(),
        }),
      ),
    }),
});

export const collections = { writing, albums };
