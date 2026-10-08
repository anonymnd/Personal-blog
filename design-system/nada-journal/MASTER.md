# Nada Journal design system

Source: UI/UX Pro Max from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

The verified `personal technical blog editorial` design-system query recommended Swiss Modernism 2.0: modular grids, clear hierarchy, low visual overhead, and a clear editorial typography hierarchy. The reading palette query also returned Book & Reading Tracker. This implementation adapts those results to a personal engineering notebook: a crisp light canvas, blue and violet ink (updated at the user’s request), an understated graph-paper illustration, and readable article cards. The generated storytelling funnel and pink CTA were omitted because browsing and reading are this site's primary activities.

- Background: #fafaff; surface: #ffffff; body: #151527; secondary text: #5b6175; blue accent: #1d4ed8; violet accent: #6d28d9; divider: #d8d8e4.
- Display: Public Sans 800/900. UI/body: Public Sans. Darija: Noto Sans Arabic. Code: JetBrains Mono.
- Desktop shell: 74rem; article: 46rem with a separate contents rail. Phone gutters: 1rem.
- Navigation and filter controls: at least 44px high; visible 3px focus outline.
- Home: journal introduction, decorative notebook diagram, latest published entry, six preceding articles.
- Library: static published collection, progressively enhanced search and topic filter; usable without JavaScript.
- Article: title, description, author/date/estimated reading time, tags, full prose. Desktop contents rail; native details menu on mobile.
- Logical CSS properties mirror RTL layouts. Mixed-script code remains LTR. Long inline identifiers wrap; code blocks and tables scroll within the article.
- Hover transitions: color/background only; reduced-motion removes transitions and smooth scrolling.
- All publishing dates, canonical content, redirects, translation links, and hourly workflow stay governed by the existing publication logic.

Validation: production build, publication boundaries, internal routes, 320/390/768/1440 widths, all three languages, search/reset/topic/empty state, native contents links, skip link, and JavaScript-disabled library.

## Bold magazine revision

The user chose Bold Magazine after rejecting the softer journal style. The verified style search returned Editorial Grid / Magazine and Exaggerated Minimalism. The implementation combines asymmetric feature sections, oversized bold sans headings, a navy/blue/violet vector cover, numbered visual article covers, and distinct section dividers. It omits scroll effects to keep reading immediate and accessible. Blue and violet follow the user's prior color choice. Article content and release logic are unchanged.
