---
title: Bienvenue sur ce blog d’apprentissage
description: Comment fonctionne ce site et comment publier le même article en anglais, français et arabe.
pubDate: 2026-04-10
translationKey: welcome-to-this-blog
locale: fr
tags:
  - meta
  - astro
---

Ce blog est un **journal d’apprentissage personnel** de **Nada Tayebi**, étudiante en génie logiciel. Quand j’apprends quelque chose, je le reformule avec mes mots. Cela aide la mémoire—et si cela vous aide aussi, tant mieux.

## Trois langues, un même sujet

Chaque « article logique » utilise le même `translationKey` dans chaque fichier de langue. L’anglais va dans `src/content/blog/en/`, le français dans `fr/`, l’arabe dans `ar/` (garder le même nom de fichier est une bonne habitude).

Frontmatter **obligatoire** dans chaque fichier :

- `title`, `description`, `pubDate`
- `translationKey` — identifiant partagé (exemple : `welcome-to-this-blog`)
- `locale` — `en`, `fr` ou `ar`

Optionnel : `updatedDate`, `tags`, `draft: true`.

L’en-tête permet de passer **EN · FR · العربية**. Si une traduction manque, cette langue pointe vers l’index du blog jusqu’à ce que vous ajoutiez le fichier.

## Lancer en local

```bash
npm run dev
```

Ouvrez l’URL indiquée dans le terminal et choisissez une langue depuis la page d’accueil.
