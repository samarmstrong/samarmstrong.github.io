import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Banners match X articles' 5:2 header so one image serves both.
const BANNER_RATIO = 5 / 2;
const BANNER_RATIO_TOLERANCE = 0.02;

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string(),
        updated: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
        banner: image().optional(),
        bannerAlt: z.string().optional(),
      })
      .superRefine((post, ctx) => {
        if (!post.banner) {
          if (!post.draft) ctx.addIssue({ code: 'custom', path: ['banner'], message: 'Published posts need a 5:2 banner' });
          return;
        }
        if (!post.bannerAlt) ctx.addIssue({ code: 'custom', path: ['bannerAlt'], message: 'Banner needs alt text' });
        const ratio = post.banner.width / post.banner.height;
        if (Math.abs(ratio / BANNER_RATIO - 1) > BANNER_RATIO_TOLERANCE) {
          ctx.addIssue({
            code: 'custom',
            path: ['banner'],
            message: `Banner must be 5:2; got ${post.banner.width}x${post.banner.height}`,
          });
        }
      }),
});

export const collections = { posts };
