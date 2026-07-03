import fs from 'node:fs/promises';
const schedule = JSON.parse(await fs.readFile(new URL('../publication-schedule.json', import.meta.url), 'utf8'));
const now = Date.now();
const start = Date.parse(schedule.startsAt);
const end = start + schedule.intervalHours * 3600000 * (schedule.topics - 1);
// One final run after the last release; later scheduled jobs skip the build.
const build = process.env.GITHUB_EVENT_NAME !== 'schedule' || now <= end + 3600000;
if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `build=${build}\n`);
console.log(JSON.stringify({build, releasedTopics: Math.max(0, Math.min(schedule.topics, Math.floor((now-start)/3600000)+1)), totalTopics:schedule.topics}));
