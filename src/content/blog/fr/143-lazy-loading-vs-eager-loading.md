---
title: "Résoudre le problème des requêtes N+1 avec JPA"
description: "Guide technique pour optimiser la récupération des données via des plans de récupération et des graphes d'entités."
pubDate: 2026-10-07T22:48:00.000Z
translationKey: 143-lazy-loading-vs-eager-loading
seriesOrder: 31
locale: fr
tags: ["persistence","learning-series"]
draft: false
---

## Le mécanisme du N+1

Le problème N+1 survient lorsqu'une application exécute une requête pour récupérer une entité parente, puis N requêtes supplémentaires pour récupérer les entités liées pour chaque parent. Cela arrive généralement à cause du `FetchType.LAZY` (défaut pour `@OneToMany`) ou lorsque `FetchType.EAGER` (défaut pour `@ManyToOne`) déclenche des sélections individuelles lors d'une itération.

Imaginons un système de tickets de support. Nous avons une entité `Ticket` et une entité `User` (le propriétaire). Si nous récupérons 10 tickets et accédons au propriétaire de chaque ticket dans une boucle, Hibernate peut exécuter 1 requête pour les tickets et 10 requêtes distinctes pour les utilisateurs.

## Exemple concret : Récupération de tickets

### Les Entités

```java
@Entity
public class Ticket {
    @Id
    @GeneratedValue
    private Long id;
    private String subject;

    @ManyToOne(fetch = FetchType.LAZY)
    private User owner;
    
    // Getters, Constructeur
}

@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String username;
    
    // Getters, Constructeur
}
```

### Scénario A : L'échec N+1

Lors de l'utilisation d'un `findAll()` standard ou d'un JPQL `SELECT t FROM Ticket t` :

1. `SELECT * FROM ticket;` → Retourne 10 lignes.
2. Pour chaque ticket, le code appelle `ticket.getOwner().getUsername()`.
3. Hibernate détecte que le proxy `User` n'est pas initialisé et déclenche : `SELECT * FROM user WHERE id = ?;` (Répété 10 fois).

**Total Requêtes : 11**

### Scénario B : Le plan de récupération optimisé

Pour résoudre cela, on déplace la stratégie de récupération du mapping d'entité (statique) vers la requête (dynamique) via un `JOIN FETCH`.

```java
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT t FROM Ticket t JOIN FETCH t.owner")
    List<Ticket> findAllWithOwner();
}
```

**Trace d'exécution :**
1. `SELECT t.*, u.* FROM ticket t INNER JOIN user u ON t.owner_id = u.id;` → Retourne toutes les données en un seul jeu de résultats.

**Total Requêtes : 1**

## Pagination et multiplication des lignes

Le `JOIN FETCH` résout le N+1, mais introduit un risque avec les collections `@OneToMany` (ex: `Ticket` → `Comment`). 

Si vous récupérez une collection via un join, la base de données retourne un produit cartésien. Si un ticket a 5 commentaires, le résultat contient 5 lignes pour ce ticket. Si vous appliquez un `Pageable`, Hibernate ne peut pas limiter les lignes au niveau de la base de données sans tronquer la collection. Il récupère donc **toutes** les lignes en mémoire pour paginer en Java, ce qui peut causer une `OutOfMemoryError`.

**Solution pour les collections :** Utiliser une récupération en deux étapes. Récupérer d'abord les IDs des parents avec pagination, puis récupérer les parents et leurs collections via une clause `IN` ou une configuration de taille de lot (batch size).

## Comparaison Synthétique

| Stratégie | Nb Requêtes | Impact Mémoire | Cas d'usage |
| :--- | :--- | :--- | :--- |
| Lazy Loading | 1 + N | Faible | Recherche d'entité unique |
| Eager Mapping | 1 + N (souvent) | Élevé | Relations toujours requises |
| Join Fetch | 1 | Moyen | Rapports/pages spécifiques |
| Entity Graph | 1 | Moyen | Besoins de récupération dynamiques |

## Exercice

**Question :** Vous avez une entité `User` avec une relation `@OneToMany` vers `Order`. Vous devez afficher une liste paginée de 20 utilisateurs et leurs commandes. Pourquoi `@Query("SELECT u FROM User u JOIN FETCH u.orders")` avec un paramètre `Pageable` est-il dangereux, et quelle est la bonne approche ?

**Réponse :** C'est dangereux car le join crée des doublons d'utilisateurs pour chaque commande, forçant Hibernate à paginer en mémoire (avertissement HHH000104). La bonne approche est de récupérer d'abord la liste paginée des IDs de `User`, puis d'exécuter une seconde requête avec `WHERE u.id IN :ids` et un `JOIN FETCH` pour récupérer les commandes de ces 20 utilisateurs.

La trace de onze queries suppose dix propriétaires distincts non chargés et un contexte actif. Des propriétaires partagés ou déjà chargés réduisent le compte. EAGER exige la disponibilité, pas un JOIN précis ni N+1 universel. Un entity graph exprime un besoin sans garantir une seule query. Utilisez LEFT JOIN FETCH si les tickets sans propriétaire doivent rester. La pagination avec collection fetch peut avertir, paginer en mémoire ou échouer selon configuration ; préservez l’ordre dans les deux étapes et testez le SQL.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
