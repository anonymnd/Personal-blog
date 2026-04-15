import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localeEnum = z.enum(['en', 'fr', 'ar']);

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).optional(),
		draft: z.boolean().optional(),
		/** Same value in every language file so URLs stay aligned (e.g. welcome-to-this-blog). */
		translationKey: z.string(),
		locale: localeEnum,
	}),
});

export const collections = { blog };
