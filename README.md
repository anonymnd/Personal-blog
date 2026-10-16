# Nada Tayebi — personal technical journal

Notes on computer science, software engineering and EEG research, written in English, French and Arabic. Built with [Astro](https://astro.build/).

**Live site:** https://anonymnd.github.io/Personal-blog/

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321/Personal-blog/

## Structure

- `src/content/blog/{en,fr,ar}/` — articles, one folder per language (Markdown and MDX)
- `src/components/` — layout pieces and the interactive figures used in articles
- `src/pages/` — routes for each language, the article library and categories

The site is built and deployed to GitHub Pages by GitHub Actions on every push to `main`.
