import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { isPublished } from '../src/lib/publication.mjs';
const schedule = JSON.parse(await fs.readFile(new URL('../publication-schedule.json', import.meta.url), 'utf8'));
const posts=[];
for (const locale of ['en','fr','ar']) {
  const directory = new URL(`../src/content/blog/${locale}/`, import.meta.url);
  for (const name of await fs.readdir(directory)) {
    if (!/^\d{3}-/.test(name)) continue;
    const text=await fs.readFile(new URL(name,directory),'utf8');
    const date = new Date(text.match(/^pubDate: (.+)$/m)[1]);
    const id=Number(name.slice(0,3));
    assert.equal(date.valueOf(),Date.parse(schedule.startsAt)+(id-1)*3600000);
    assert.equal(text.includes('In this learning series:'),false);
    posts.push({locale,id,pubDate:date});
  }
}
assert.equal(posts.length,840);
const start=Date.parse(schedule.startsAt);
for(const [offset,expected] of [[-1,0],[0,3],[3599999,3],[3600000,6],[279*3600000,840]]) {
  const visible=posts.filter(p=>isPublished(p,true,new Date(start+offset)));
  assert.equal(visible.length,expected);
  for(const p of visible) assert.equal(visible.filter(q=>q.id===p.id).length,3);
}
assert.equal(isPublished({draft:true,pubDate:new Date(start)},true,new Date(start+3600000)),false);
assert.equal(isPublished(posts[839],false,new Date(start-1)),true);
console.log('Publication checks passed: hourly boundaries, future URLs, drafts, and all 280 translation triplets.');
