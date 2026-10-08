# Nada Journal design system

Source: UI/UX Pro Max from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The verified `personal technical blog editorial` design-system query recommended Swiss Modernism 2.0: modular grids, clear hierarchy, low visual overhead, and Libre Bodoni/Public Sans typography. The reading palette query also returned Book & Reading Tracker. This implementation adapts those results to a personal engineering notebook: warm paper, dark green ink, an understated graph-paper illustration, and readable article cards. The generated storytelling funnel and pink CTA were omitted because browsing and reading are this site's primary activities.

- Background: #f8f6f0; surface: #fffdf8; body: #232f29; secondary text: #59635a; accent: #28543e; divider: #d6d9cc.
- Display: Libre Bodoni. UI/body: Public Sans. Darija: Noto Sans Arabic. Code: JetBrains Mono.
- Desktop shell: 74rem; article: 46rem with a separate contents rail. Phone gutters: 1rem.
- Navigation and filter controls: at least 44px high; visible 3px focus outline.
- Home: journal introduction, decorative notebook diagram, latest published entry, six preceding articles.
- Library: static published collection, progressively enhanced search and topic filter; usable without JavaScript.
- Article: title, description, author/date/estimated reading time, tags, full prose. Desktop contents rail; native details menu on mobile.
- Logical CSS properties mirror RTL layouts. Mixed-script code remains LTR. Long inline identifiers wrap; code blocks and tables scroll within the article.
- Hover transitions: color/background only; reduced-motion removes transitions and smooth scrolling.
- All publishing dates, canonical content, redirects, translation links, and hourly workflow stay governed by the existing publication logic.

Validation: production build, publication boundaries, internal routes, 320/390/768/1440 widths, all three languages, search/reset/topic/empty state, native contents links, skip link, and JavaScript-disabled library.
