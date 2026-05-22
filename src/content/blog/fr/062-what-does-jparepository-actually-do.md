---
title: "Suivre une Entité JPA : De l'État Java au SQL"
description: "Analyse approfondie du cycle de vie de persistance Hibernate, des états des entités et du mécanisme de transformation des objets Java en lignes de base de données."
pubDate: 2026-10-07T05:48:00.000Z
translationKey: 062-what-does-jparepository-actually-do
seriesOrder: 14
locale: fr
tags: ["spring-architecture","learning-series"]
draft: false
---

## L'Architecture de la Persistance

Pour comprendre comment un objet Java devient une ligne en base de données, il faut distinguer trois couches : **JPA** (la spécification), **Hibernate** (l'implémentation) et la **Base de données** (le stockage, ex: PostgreSQL).

Quand vous utilisez un `JpaRepository`, vous interagissez avec une abstraction Spring Data qui délègue au `EntityManager` de JPA. L' `EntityManager` gère un **Contexte de Persistance**—un cache de premier niveau qui suit chaque entité chargée ou sauvegardée durant une transaction. C'est ce contexte qui décide si une modification Java nécessite un `UPDATE` SQL via le mécanisme de **Dirty Checking**.

## États de l'Entité et Cycle de Vie

Une entité peut se trouver dans l'un des quatre états suivants :

1. **New (Transient) :** L'objet est instancié (`new StockItem()`) mais n'a pas d'identité en base et n'est pas suivi par Hibernate.
2. **Managed :** L'entité est suivie. Tout changement de ses champs sera détecté et synchronisé avec la DB lors du flush.
3. **Detached :** L'entité a un ID, mais le contexte de persistance est fermé ou l'entité a été détachée. Les modifications sont ignorées jusqu'à ce que l'entité soit fusionnée (merged).
4. **Removed :** L'entité est marquée pour suppression.

## Le Fonctionnement de `repository.save()`

Spring Data save appelle persist pour une entité considérée comme nouvelle, sinon merge. Par défaut, il examine une propriété de version non primitive si elle existe, puis vérifie si l’identifiant est nul. Persistable permet de personnaliser cette décision. Un identifiant attribué par l’application demande donc une stratégie explicite.

persist rend la nouvelle instance gérée ; le moment du SQL dépend de la génération de l’identifiant et du flush. merge copie son état dans une instance gérée et la renvoie. L’argument détaché reste détaché : utilisez l’instance retournée. Aucun de ces appels ne signifie que la transaction est validée.
## Stratégies de Génération d'ID et Timing SQL

Avec Hibernate, PostgreSQL et une transaction active utilisant le mode AUTO habituel, IDENTITY nécessite généralement un INSERT anticipé pour obtenir l’identifiant. Ce moment précis ne se généralise pas à tous les fournisseurs, modes de flush et configurations.

SEQUENCE sépare l’attribution de l’identifiant de l’insertion. Hibernate peut demander une valeur à la séquence ou utiliser une plage déjà allouée, selon l’optimiseur et la taille d’allocation. Une entité peut donc avoir un ID avant le flush de son INSERT. Cet ID ne prouve ni l’existence de la ligne ni la validation de la transaction.
## Exemple Concret : Cycle de Vie d'un StockItem

Chaque trace ci-dessous reste dans une transaction de service englobante, avec Hibernate, PostgreSQL et le mode AUTO habituel. L’entité reste gérée jusqu’à la fin de cette transaction. Sans cette frontière, un appel repository peut terminer sa propre transaction avant de retourner ; un setter ultérieur ne sera alors pas automatiquement persisté. Dans la trace merge, l’entité détachée vient d’un contexte précédent ; validez normalement les données client et appliquez-les à une entité chargée plutôt que de les fusionner sans contrôle.

Considérons l'entité `StockItem` :

```java
@Entity
public class StockItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String sku;
    private Integer quantity;
    
    // Getters, Constructeur, etc.
}
```

### Trace 1 : L'Insertion Initiale
1. `StockItem item = new StockItem("BOLT-01", 100);` → **État : New**.
2. `repository.save(item);` → Hibernate voit que c'est nouveau → appelle `persist()`. 
3. Avec `SEQUENCE`, Hibernate récupère l'ID suivant (ex: `1`) et l'assigne à `item`. **État : Managed**. Aucun `INSERT` SQL n'a encore eu lieu.
4. **Flush** : À la fin de la transaction ou lors d'un `flush()`, Hibernate génère : `INSERT INTO stock_item (id, sku, quantity) VALUES (1, 'BOLT-01', 100);`.

### Trace 2 : Mise à jour Managée (Dirty Checking)
1. `StockItem item = repository.findById(1L).orElseThrow();` → **État : Managed**.
2. `item.setQuantity(80);` → Aucune méthode de repository n'est appelée. Le dirty checking compare l'état actuel avec le snapshot pris lors du chargement.
3. **Commit** : Lors du commit, Hibernate détecte le changement et génère : `UPDATE stock_item SET quantity = 80 WHERE id = 1;`.

### Trace 3 : Le Merge d'une Entité Détachée
1. Une entité est envoyée à une UI, modifiée, puis renvoyée. Elle a un ID mais n'est plus dans la session → **État : Detached**.
2. `StockItem detachedItem = ...; // quantity est 50` 
3. `StockItem managedItem = repository.save(detachedItem);` → Hibernate appelle `merge()`. 
4. Hibernate charge l'enregistrement actuel depuis la DB, copie `50` dans l'instance managée, et la retourne.
5. **Flush** : `UPDATE stock_item SET quantity = 50 WHERE id = 1;`.

## Flush vs Commit

Le flush exécute le SQL des changements en attente dans la transaction courante ; il ne valide pas cette transaction. Dans le cas PostgreSQL présenté ici, elle voit ses propres changements, tandis que les autres transactions ordinaires ne voient pas ses écritures non validées. La visibilité dépend plus généralement de l’isolation et du moteur.

En mode AUTO habituel, la validation déclenche le flush des changements gérés en attente. Le mode MANUAL et certaines configurations en lecture seule demandent un traitement différent. Un flush réussi peut encore être suivi d’un rollback ou d’un échec lors du commit.
## Exercice

Dans une transaction Hibernate active en mode AUTO habituel avec PostgreSQL IDENTITY, sauvegardez un nouveau StockItem puis supprimez-le avant le commit. Prévoyez un INSERT anticipé pour obtenir l’ID, suivi d’un DELETE lors du flush des suppressions. Vérifiez les journaux puis l’absence de ligne après commit. Recommencez avec SEQUENCE : obtenir un identifiant n’exige pas en soi l’insertion de la ligne. Le moment observé dépend de cette configuration et n’est pas une promesse universelle JPA.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
