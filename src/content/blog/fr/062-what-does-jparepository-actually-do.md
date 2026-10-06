---
title: "Que fait réellement JpaRepository ?"
description: "Une analyse approfondie de la couche d'abstraction de Spring Data JPA et de la gestion de la persistance."
pubDate: 2026-10-09T05:48:00.000Z
translationKey: 062-what-does-jparepository-actually-do
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de débutants considèrent `JpaRepository` comme une boîte magique. La confusion commence souvent lorsqu'on appelle `.save()` en s'attendant à voir un `INSERT` immédiat dans les logs, ou quand on ne comprend pas pourquoi une entité mise à jour ne reflète pas les changements en base de données.

## La Couche d'Abstraction
`JpaRepository` n'est pas une classe que vous implémentez, mais une interface que Spring Data JPA implémente pour vous dynamiquement. Elle sert d'enveloppe autour de l' `EntityManager`. Au lieu d'écrire du code répétitif pour gérer les transactions, le repository propose des méthodes standards comme `save()`, `findById()` et `delete()`, qu'il traduit en requêtes JPQL ou Criteria API.

## La Logique de la méthode save()
L'idée reçue est que `save()` effectue toujours un `INSERT`. En réalité, Spring Data JPA vérifie si l'entité est nouvelle. Si l'ID est nul, il appelle `persist()`. Si un ID existe, il appelle `merge()`. 

Il est crucial de comprendre que `merge()` ne se contente pas de mettre à jour la ligne ; il copie l'état de l'entité fournie vers une version gérée de cette entité. C'est pourquoi il faut toujours utiliser l'objet retourné : `entity = repository.save(entity);`.

## Exemple : Demande d'Achat
Imaginons une application de procurement où un utilisateur soumet une `PurchaseRequest`.

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemName;
    private String status; // PENDING, APPROVED
    // getters/setters
}

// Repository
public interface RequestRepository extends JpaRepository<PurchaseRequest, Long> {}
```

Si vous appelez `save()` sur une nouvelle demande, JPA utilise la stratégie `IDENTITY` pour interroger la DB immédiatement afin d'obtenir l'ID. Si vous changez ensuite le statut en `APPROVED` et rappelez `save()`, JPA effectue un `merge()`. Le SQL `UPDATE` réel peut être différé jusqu'au flush de la session.

## Erreur Courante : Ignorer la Valeur de Retour
Certains développeurs appellent `repository.save(myEntity)` et continuent d'utiliser `myEntity`. Si `save` a déclenché un `merge`, `myEntity` reste détachée, alors que l'objet retourné est celui géré par JPA. Toute modification ultérieure de `myEntity` ne sera pas suivie.

## Exercice Pratique
**Scénario :** Vous avez une entité avec un générateur d'ID `SEQUENCE`. Vous appelez `save()` sur une nouvelle entité. L'instruction `INSERT` est-elle exécutée immédiatement ?

**Réponse :** Non. Avec `SEQUENCE`, JPA peut récupérer l'ID auprès de la séquence d'abord et garder l'entité en mémoire. L' `INSERT` arrive généralement lors de la phase de flush à la fin de la transaction.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
