// @ts-check
import { defineConfig } from 'astro/config';
import { remarkArticleVisuals } from './src/lib/remark-article-visuals.mjs';
import { visuals } from './src/lib/article-visuals.mjs';
import { createHash } from 'node:crypto';
// Include editorial data in Astro's Markdown cache key when a diagram changes.
const visualRevision = createHash('sha256').update(JSON.stringify(visuals)).digest('hex');

// https://docs.astro.build/en/guides/deploy/github/
// Project site: https://<user>.github.io/<repo>/
export default defineConfig({
	markdown: { remarkPlugins: [[remarkArticleVisuals, { revision: visualRevision }]] },
	devToolbar: { enabled: false },
	site: 'https://anonymnd.github.io',
	base: '/Personal-blog',
	trailingSlash: 'always',
});
