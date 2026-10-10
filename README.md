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

## AI-powered multilingual drafting

You can write one post in any locale, then generate the other two with AI (natural rewrite, not literal translation).

### 1) Free local mode (default): Ollama

Install Ollama and run a model locally, for example:

```bash
ollama pull llama3.1:8b
```

### 2) Run generator

```bash
npm run ai:translate -- --source "src/content/blog/ar/your-post.md"
```

Optional flags:

- `--provider ollama` (default) or `--provider openai`
- `--model llama3.1:8b` (or any local model you have)
- `--force` to overwrite existing translated files

### 3) OpenAI mode (optional)

Only if you want cloud generation:

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
npm run ai:translate -- --provider openai --source "src/content/blog/ar/your-post.md"
```

The script keeps `translationKey`, `pubDate`, and structure, and creates missing locale files in:

- `src/content/blog/en/...`
- `src/content/blog/fr/...`
- `src/content/blog/ar/...`
