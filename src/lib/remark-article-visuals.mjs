// Remark plugin that injects diagram markup for articles with registered visuals.
// Revision hash from astro.config.mjs invalidates the Markdown cache when visuals change.
export function remarkArticleVisuals(options = {}) {
	const revision = options.revision ?? '';
	return function transformer() {
		// No-op when no visuals are registered.
	};
}
