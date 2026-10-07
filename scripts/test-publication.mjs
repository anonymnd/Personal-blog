import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { isPublished } from '../src/lib/publication.mjs';
const schedule=JSON.parse(await fs.readFile(new URL('../publication-schedule.json',import.meta.url),'utf8'));
const series=JSON.parse(await fs.readFile(new URL('../article-series.json',import.meta.url),'utf8'));
const redirects=JSON.parse(await fs.readFile(new URL('../article-redirects.json',import.meta.url),'utf8'));
const start=Date.parse(schedule.startsAt),posts=[];
assert.equal(series.length,schedule.topics);
assert.equal(new Set(series.flatMap(p=>p.sourceIds)).size,280);
assert.equal(new Set(series.map(p=>p.slug)).size,series.length);
assert.equal(new Set(redirects.map(p=>p.from)).size,redirects.length);
for(const alias of redirects)assert.ok(series.some(p=>p.slug===alias.to));
for(const locale of ['en','fr','ar']){
 const directory=new URL(`../src/content/blog/${locale}/`,import.meta.url);
 const files=(await fs.readdir(directory)).filter(n=>/^\d{3}-.*\.md$/.test(n));assert.equal(files.length,series.length);
 for(const article of series){const text=await fs.readFile(new URL(article.slug+'.md',directory),'utf8');const date=new Date(text.match(/^pubDate: (.+)$/m)[1]);assert.equal(date.valueOf(),start+(article.order-1)*3600000);assert.ok(text.includes(`seriesOrder: ${article.order}\n`));assert.equal(text.includes('In this learning series:'),false);posts.push({locale,order:article.order,pubDate:date});}
}
for(const [offset,expected]of [[-1,0],[0,3],[3599999,3],[3600000,6],[(series.length-1)*3600000,series.length*3]]){const visible=posts.filter(p=>isPublished(p,true,new Date(start+offset)));assert.equal(visible.length,expected);for(const p of visible)assert.equal(visible.filter(q=>q.order===p.order).length,3);}
assert.equal(isPublished({draft:true,pubDate:new Date(start)},true,new Date(start+3600000)),false);
console.log(`Publication checks passed: ${series.length} articles, all 280 original topics accounted for, ${posts.length} translations, hourly boundaries and redirect targets.`);
