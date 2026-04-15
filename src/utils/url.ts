/**
 * Prefix a site path with Astro `base` (e.g. `/Personal-blog/` on GitHub Pages).
 * Pass a path without the repo base, with or without a leading slash.
 */
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL;
	const trimmed = path.startsWith('/') ? path.slice(1) : path;
	return `${base}${trimmed}`.replace(/\/{2,}/g, '/');
}
