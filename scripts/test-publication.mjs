import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { isPublished } from '../src/lib/publication.mjs';
const schedule=JSON.parse(await fs.readFile(new URL('../publication-schedule.json',import.meta.url),'utf8'));
const series=JSON.parse(await fs.readFile(new URL('../article-series.json',import.meta.url),'utf8'));
const redirects=JSON.parse(await fs.readFile(new URL('../article-redirects.json',import.meta.url),'utf8'));
const posts=[];
assert.equal(series.length,schedule.topics);
assert.equal(new Set(series.flatMap(p=>p.sourceIds)).size,280);
assert.equal(new Set(series.map(p=>p.slug)).size,series.length);
assert.equal(new Set(redirects.map(p=>p.from)).size,redirects.length);
for(const alias of redirects)assert.ok(series.some(p=>p.slug===alias.to));
for(const locale of ['en','fr','ar']){
 const directory=new URL(`../src/content/blog/${locale}/`,import.meta.url);
 const files=(await fs.readdir(directory)).filter(n=>/^\d{3}-.*\.md$/.test(n));assert.equal(files.length,series.length);
 for(const article of series){const text=await fs.readFile(new URL(article.slug+'.md',directory),'utf8');const date=new Date(text.match(/^pubDate: (.+)$/m)[1]);assert.ok(Number.isFinite(date.valueOf()),`invalid pubDate in ${article.slug}`);assert.ok(text.includes(`seriesOrder: ${article.order}\n`));assert.equal(text.includes('In this learning series:'),false);posts.push({locale,order:article.order,pubDate:date});}
}
assert.equal(isPublished({draft:true,pubDate:new Date()},true,new Date(Date.now()+3600000)),false);
console.log(`Publication checks passed: ${series.length} articles, all 280 original topics accounted for, ${posts.length} translations, redirect targets.`);
