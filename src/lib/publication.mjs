// Freeze one timestamp for the whole build so all three locales are released together.
export const buildTime = new Date(process.env.BLOG_BUILD_TIME || Date.now());
if (!Number.isFinite(buildTime.valueOf())) throw new Error('Invalid BLOG_BUILD_TIME');

export function isPublished(data, production = true, now = buildTime) {
  return !production || (data.draft !== true && data.pubDate.valueOf() <= now.valueOf());
}
