---
title: "Conception et Lecture d'Index B-Tree pour Requêtes Réelles"
description: "Analyse approfondie des mécanismes B-Tree, de l'ordre des colonnes composites et de la sélectivité pour l'optimisation de logs d'audit."
pubDate: 2026-10-07T23:48:00.000Z
translationKey: 145-what-is-a-database-index
seriesOrder: 32
locale: fr
tags: ["persistence","learning-series"]
draft: false
---

## Le Mécanisme B-Tree

Un index B-Tree n'est pas un simple arbre binaire. C'est une structure équilibrée multi-voies conçue pour minimiser les entrées/sorties (I/O) disque. Au lieu de deux enfants par nœud, un nœud B-Tree contient plusieurs clés et pointeurs, permettant à la base de données de naviguer parmi des millions de lignes en très peu d'étapes.

Lors d'une recherche, le moteur part de la racine, compare la valeur cible aux clés du nœud et suit le pointeur vers la page enfant appropriée. Cela continue jusqu'à atteindre un nœud feuille, qui contient le pointeur vers la ligne réelle dans la table (le heap).

## Sélectivité et Décision de Scan

Pour une requête, la sélectivité concerne la fraction estimée de lignes correspondant au prédicat ; le nombre de valeurs distinctes aide à l’estimer. Si presque toutes les lignes correspondent, un scan séquentiel peut coûter moins que de nombreux accès au heap. Si peu correspondent, un index peut aider. Aucun pourcentage n’impose un plan : taille, organisation, statistiques, cache et colonnes sélectionnées comptent aussi.
## Index Composites : Le Problème de l'Ordre

Dans un index composite (index sur plusieurs colonnes), l'ordre des colonnes est crucial. L'index est trié lexicographiquement. Si vous avez un index sur `(tenant_id, created_at)`, les données sont triées d'abord par tenant, puis par date à l'intérieur de chaque tenant.

Scénario : Un log d'audit où nous devons trouver les logs d'un tenant spécifique, filtrés par plage horaire, et triés du plus récent au plus ancien.

**Requête :**
`SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

### Analyse des Options d'Indexation

1. **Index sur `(created_at)`** : Le moteur trouve la plage horaire, mais doit ensuite filtrer les logs de tous les tenants pour cette période. I/O élevé.
2. **Index sur `(tenant_id)`** : Le moteur trouve tous les logs de 'T1', mais doit ensuite les trier par date en mémoire (filesort).
3. **Index Composite sur `(tenant_id, created_at)`** : C'est le choix optimal. Le moteur saute directement à la section 'T1'. Comme les entrées pour 'T1' sont déjà triées par `created_at`, le moteur lit la plage et retourne les résultats sans étape de tri supplémentaire.

## Exemple Concret : Trace du Plan EXPLAIN

Supposons une table `audit_logs` avec 1 million de lignes.

**Scénario A : Pas d'index ou index sur `(created_at)` uniquement**
`EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

*   **Sortie :** `Seq Scan on audit_logs (cost=0.00..25000.00 rows=5000 width=120) -> Filter: (tenant_id = 'T1' AND created_at > '2023-01-01') -> Sort: created_at DESC`
*   **Signification :** La DB a lu toute la table et a trié les résultats en RAM. C'est lent et gourmand en mémoire.

**Scénario B : Index Composite sur `(tenant_id, created_at)`**
`CREATE INDEX idx_tenant_time ON audit_logs (tenant_id, created_at);`
`EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE tenant_id = 'T1' AND created_at > '2023-01-01' ORDER BY created_at DESC;`

*   **Sortie :** `Index Scan using idx_tenant_time on audit_logs (cost=0.42..800.00 rows=5000 width=120) -> Index Cond: (tenant_id = 'T1' AND created_at > '2023-01-01')`
*   **Signification :** La DB a utilisé le B-Tree pour aller à 'T1', a scanné la plage triée et a évité l'opération de tri.

## Coût d'Écriture et Compromis

Les index ne sont pas gratuits. Chaque `INSERT`, `UPDATE` ou `DELETE` nécessite la mise à jour du B-Tree. Cela implique de trouver le nœud feuille correct et potentiellement de diviser des nœuds pour maintenir l'équilibre. Dans un log d'audit à fort volume d'écriture, trop d'index dégraderont les performances d'ingestion.

## Exercice

Avec (status, user_id), des égalités sur les deux colonnes permettent une recherche ciblée quel que soit l’ordre textuel des conditions WHERE. Le planificateur peut encore choisir autrement. Un prédicat user_id seul n’a pas l’égalité sur la colonne initiale et peut demander un scan plus large. PostgreSQL 18 peut aussi envisager un skip scan B-tree lorsque la colonne initiale a peu de valeurs distinctes. Vérifiez version et EXPLAIN plutôt que d’affirmer que l’index ne peut jamais aider.

Les plans précédents sont schématiques, pas des benchmarks ni des sorties garanties. Un tri peut déborder sur disque et un index être parcouru à rebours. Des updates de colonnes non indexées peuvent parfois utiliser HOT dans PostgreSQL sans modifier chaque index. Mesurez bénéfice de lecture et coût d’écriture.

## Pour approfondir

- [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL B-tree indexes](https://www.postgresql.org/docs/current/btree.html)
