# Hourly publishing

The 280-topic series is released in English, French and Moroccan Darija together.

Topic 001 starts at 2026-10-06T16:48:00.000Z; each subsequent topic is one hour later. GitHub Actions rebuilds Pages every hour at minute 48 UTC. Schedules can be delayed by GitHub; the next successful build includes all topics whose publication time has passed.

Future articles are excluded from production indexes, language links, navigation and generated URLs. npm run dev shows all local drafts. npm run build and npm run preview show only released posts.

The scheduled builds stop after the last release (plus one final hourly window). Existing posts stay available. workflow_dispatch and pushes to main can always rebuild. To pause hourly publishing, remove the schedule trigger in .github/workflows/deploy.yml.

Run node scripts/test-publication.mjs to verify boundaries and translation parity. BLOG_BUILD_TIME can override the build clock for local testing. All dates are UTC; Moroccan local display follows the reader’s locale.
