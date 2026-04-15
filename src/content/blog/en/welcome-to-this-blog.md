---
title: Welcome to this learning blog
description: How this site works and how to publish the same article in English, French, and Arabic.
pubDate: 2026-04-10
translationKey: welcome-to-this-blog
locale: en
tags:
  - meta
  - astro
---

This blog is a **personal study journal** by **Nada Tayebi**, a software engineering student. When I learn something, I rewrite it in my own words. That helps memory—and if it helps you too, even better.

## Three languages, one topic

Each “logical” article uses the same `translationKey` in every language file. Put English in `src/content/blog/en/`, French in `fr/`, and Arabic in `ar/` (same filename is a good habit).

Required frontmatter in **each** file:

- `title`, `description`, `pubDate`
- `translationKey` — shared slug (example: `welcome-to-this-blog`)
- `locale` — `en`, `fr`, or `ar`

Optional: `updatedDate`, `tags`, `draft: true`.

The header lets readers switch **EN · FR · العربية**. If a translation is missing, that language links to the blog index until you add the file.

## Run locally

```bash
npm run dev
```

Then open the URL from the terminal and pick a language from the home page.
