# Curated hourly series

The original 280 overlapping titles have been consolidated into 57 distinct articles (171 language versions). All original topics are mapped in article-series.json. Removed article URLs redirect to their merged replacement only once that replacement is published; they are not separate blog entries.

The cadence remains one article per hour with English, French and Moroccan Darija released together. Start: 2026-10-06T16:48:00.000Z. End: 2026-10-09T00:48:00.000Z. Dates and the GitHub Actions minute-48 trigger are UTC. Future articles are excluded from production indexes, navigation and routes.

GitHub can delay scheduled runs; the monitoring heartbeat can dispatch the same deployment workflow to recover a missed release. It does not duplicate articles. Development mode shows local drafts; production builds show only due articles. BLOG_BUILD_TIME can override the clock for local verification.

Run node scripts/test-publication.mjs to check publication boundaries and coverage. Remove the schedule trigger to stop hourly rebuilds. Existing unrelated posts remain available. Original content has a local backup under work/editorial-revision/backup and in the previous Git commit.
