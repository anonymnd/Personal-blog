// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/guides/deploy/github/
// Project site: https://<user>.github.io/<repo>/
export default defineConfig({
	site: 'https://anonymnd.github.io',
	base: '/Personal-blog',
	trailingSlash: 'always',
});
