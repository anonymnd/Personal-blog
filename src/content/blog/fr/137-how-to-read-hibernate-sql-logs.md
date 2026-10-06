---
title: "How to Read Hibernate SQL Logs"
description: "Apprenez à interpréter le SQL généré par Hibernate pour identifier les goulots d'étranglement et les problèmes de requêtes N+1."
pubDate: 2026-10-12T08:48:00.000Z
translationKey: 137-how-to-read-hibernate-sql-logs
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous avez écrit une méthode de dépôt JPA propre, mais votre application semble lente. Vous soupçonnez qu'Hibernate exécute des centaines de requêtes pour une seule demande, mais comme le SQL est caché derrière la couche d'abstraction, vous avancez à l'aveugle. Savoir lire ces logs est le seul moyen de vérifier si vos plans de récupération (fetch plans) fonctionnent comme prévu.

## Activer la sortie SQL
Pour voir ce qui se passe en arrière-plan, vous devez configurer votre fichier `application.properties`. L'option `spring.jpa.show-sql=true` affiche le SQL dans la console, mais il est souvent illisible. Pour le rendre utile, utilisez `spring.jpa.properties.hibernate.format_sql=true` pour le formatage et `logging.level.org.hibernate.orm.jdbc.bind=trace` pour voir les valeurs réelles liées aux paramètres.

## Interpréter le schéma des logs
Dans les logs, vous verrez un schéma : une instruction `SELECT` suivie de plusieurs lignes `binding parameter`. Hibernate utilise des requêtes préparées pour la sécurité et la performance. Au lieu d'insérer les valeurs directement, il utilise des marqueurs (?). Les logs de trace vous indiquent quelle valeur remplace quel marqueur. Si vous voyez une longue séquence de SELECT similaires pour différents IDs, vous faites face au problème N+1.

## Exemple concret : Demandes d'achat
Imaginez une application d'achat où une `PurchaseRequest` possède plusieurs `RequestItem`. Si vous récupérez 10 demandes et que vous bouclez pour afficher les articles, les logs afficheront :

```sql
-- 1 requête pour obtenir les demandes
SELECT * FROM purchase_request;
-- 10 requêtes supplémentaires pour les articles de chaque demande
SELECT * FROM request_item WHERE request_id = 1;
SELECT * FROM request_item WHERE request_id = 2;
... (et ainsi de suite)
```
Ceci confirme un problème de Lazy Loading. La solution est d'utiliser un `JOIN FETCH` dans votre JPQL pour tout regrouper en une seule requête.

## Erreur courante : L'abus du EAGER
Certains développeurs voient ces logs et changent immédiatement `@OneToMany` en `fetch = FetchType.EAGER`. C'est une erreur car cela force Hibernate à charger la collection systématiquement, même quand elle est inutile, ce qui peut ralentir l'application. La bonne approche est de rester en `LAZY` et d'utiliser des jointures spécifiques.

## Exercice pratique
Si vous voyez `binding parameter [1] as [101]` suivi d'un `SELECT` sur une table `request_item`, qu'est-ce que cela signifie ?

**Réponse :** Hibernate exécute une requête pour trouver les articles associés à l'identifiant spécifique 101.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
