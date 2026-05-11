---
title: "Comment fonctionnent les index B-Tree en termes simples"
description: "Un guide accessible pour comprendre la structure et la logique des index B-Tree pour accélérer les requêtes de base de données."
pubDate: 2026-10-12T17:48:00.000Z
translationKey: 146-how-b-tree-indexes-work-in-simple-terms
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous recherchiez une demande d'achat spécifique dans une application de gestion avec dix mille entrées. Sans index, la base de données doit effectuer un 'Sequential Scan', lisant chaque ligne de la première à la dernière. C'est lent et gourmand en ressources. L'index B-Tree résout cela en organisant les données dans une structure d'arbre équilibré qui permet d'ignorer la grande majorité des données.

## Une structure équilibrée à plusieurs branches
Un B-tree est une structure de recherche équilibrée avec plusieurs branches par page, contrairement aux deux enfants d'un arbre binaire. La racine oriente la recherche vers des pages internes, puis des feuilles. La profondeur équilibrée limite le nombre de niveaux quand l'index grandit. Cela ne garantit pas la même durée pour toutes les requêtes : le cache, le nombre de résultats et l'accès aux lignes comptent aussi.
## Réduire la plage à chaque étape
Supposons une page simplifiée avec les séparateurs 25, 50 et 75. Pour chercher 42, on suit la branche couvrant les valeurs entre 25 et 50. La page suivante réduit encore la plage jusqu'à la feuille contenant les entrées correspondantes. Les pages réelles contiennent généralement beaucoup plus de clés. L'ordre permet aussi des recherches par intervalle, par exemple les demandes 40 à 60, et pas seulement une égalité.
## Exemple : rechercher des demandes
Supposons une table requests existante avec les colonnes id et created_at. Cet index illustratif peut servir au filtre de date :

```sql
CREATE INDEX requests_created_at_idx ON requests (created_at);

EXPLAIN
SELECT id, created_at
FROM requests
WHERE created_at >= DATE '2026-10-01';
```

Lisez le plan choisi sans inventer un résultat chronométré. Un filtre sélectif peut bénéficier de l'index ; un filtre couvrant presque toute une petite table peut coûter moins cher en parcours séquentiel. PostgreSQL tient compte des statistiques et coûts estimés. Les feuilles identifient normalement des tuples de table ; certaines requêtes couvertes peuvent éviter des accès ordinaires à la table grâce à un index-only scan.
## Erreur courante : Le sur-indexage
Une erreur fréquente consiste à ajouter des index sur toutes les colonnes pour 'tout accélérer'. Cependant, à chaque `INSERT` ou `UPDATE` d'une demande, la base de données doit aussi mettre à jour le B-Tree. Trop d'index ralentissent les opérations d'écriture et consomment beaucoup d'espace disque.

## Exercice pratique
Vous ajoutez un index, mais EXPLAIN affiche encore Seq Scan sur une petite table. L'index est-il forcément défectueux ?

**Réponse :** Non. Le planificateur peut estimer qu'un parcours direct coûte moins cher. Examinez le prédicat, la sélectivité, les statistiques et une taille de données représentative. Un index fournit un chemin d'accès possible ; il n'oblige pas chaque requête à l'utiliser.

## Pour approfondir

- [PostgreSQL B-tree indexes](https://www.postgresql.org/docs/current/btree.html)
