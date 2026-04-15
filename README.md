# Personal blog (Nada Tayebi)

Trilingual learning notes (EN / FR / AR), built with [Astro](https://astro.build/).

## Live site

Open this in your browser (not the `github.com/...` code page):

**https://anonymnd.github.io/Personal-blog/**

Use the trailing slash or pick a language from the home page.

### If you only see the GitHub README

The site is deployed by **GitHub Actions**, not from the raw files on `main`.

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → **Source**: choose **GitHub Actions** (not “Deploy from a branch”).
3. **Actions** tab → confirm the latest **Deploy to GitHub Pages** workflow is green (re-run if it failed).

## Local development

```bash
npm install
npm run dev
```

With the configured `base` path, open **http://localhost:4326/Personal-blog/** (see `astro.config.mjs`).

## New posts

Add Markdown under `src/content/blog/en/`, `fr/`, and `ar/` with the same `translationKey` in each file’s frontmatter.
