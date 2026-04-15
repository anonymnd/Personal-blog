---
title: Qu’est-ce qu’une URL (simplement)
description: Les morceaux d’une adresse web—protocole, hôte, chemin, requête—et pourquoi c’est utile quand on apprend le fonctionnement du web.
pubDate: 2026-04-12
translationKey: what-is-a-url
locale: fr
tags:
  - web
  - fondamentaux
---

Une **URL** (*Uniform Resource Locator*) est l’adresse que vous saisissez ou sur laquelle vous cliquez pour atteindre une ressource sur internet—souvent une page web ou une API.

## Exemple

```
https://example.com/docs/search?q=astro&lang=en
```

## Principales parties

| Partie        | Dans l’exemple     | Rôle                                                                 |
| ------------- | ------------------ | -------------------------------------------------------------------- |
| **Schéma**    | `https://`         | Indique *comment* le navigateur parle au serveur (ici HTTP chiffré). |
| **Hôte**      | `example.com`      | Identifie le serveur (via le DNS vers une adresse IP).               |
| **Chemin**    | `/docs/search`     | Quel document ou quelle route vous demandez sur ce serveur.          |
| **Requête**   | `?q=astro&lang=en` | Paramètres supplémentaires, souvent issus de formulaires ou filtres. |

Inutile de tout mémoriser au début. Savoir reconnaître ces fragments suffit pour lire la doc, déboguer des redirections ou configurer un hébergement.
