---
title: "Que se passe-t-il quand Hibernate sauvegarde une entité ?"
description: "Une analyse approfondie du cycle de vie interne et du processus de décision lors de l'opération de sauvegarde Hibernate."
pubDate: 2026-10-09T12:48:00.000Z
translationKey: 069-what-happens-when-hibernate-saves-an-entity
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une demande d'achat et vous appelez `repository.save(request)`. Vous pourriez penser que cela déclenche immédiatement une instruction `INSERT` dans votre base de données, mais le mécanisme interne d'Hibernate est bien plus stratégique.

## La décision de sauvegarde : Persist vs Merge
Lorsque vous utilisez la méthode `save()` de Spring Data JPA, le framework vérifie d'abord si l'entité est nouvelle. Si l'entité n'a pas d'ID (ou si l'ID est nul), Hibernate appelle `persist()`. Cela indique au contexte de persistance de gérer l'objet. Si l'entité possède déjà un ID, Hibernate appelle `merge()`. C'est une distinction cruciale : `merge` ne se contente pas de mettre à jour ; il copie l'état de votre objet détaché dans une instance gérée récupérée depuis la base de données.

## Le rôle du contexte de persistance
Hibernate ne communique pas avec la base de données à chaque modification de champ. Il utilise un 'cache de premier niveau' (le Persistence Context). Quand vous sauvegardez une entité, elle entre dans ce cache à l'état 'managed'. Hibernate suit chaque modification apportée à cet objet. Le SQL réel est souvent différé jusqu'à ce que la transaction soit sur le point de s'engager ou qu'un `flush()` manuel soit appelé.

## Génération d'ID et timing
Le moment de l'exécution du `INSERT` SQL dépend de votre stratégie `@GeneratedValue`. Si vous utilisez `SEQUENCE`, Hibernate peut récupérer l'ID suivant sans insérer la ligne immédiatement. Cependant, si vous utilisez `IDENTITY` (courant avec MySQL), Hibernate doit exécuter l' `INSERT` immédiatement car il a besoin que la base de données génère l'ID pour gérer l'entité dans le cache.

## Exemple concret : Demande d'achat
```java
// Extrait illustratif
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item = "Laptop";
}

// Dans le service :
PurchaseRequest req = new PurchaseRequest();
PurchaseRequest savedReq = repository.save(req); 
// Avec IDENTITY, l'INSERT arrive ici.
// Avec SEQUENCE, l'INSERT arrive au moment du flush.
```
Résultat : L'objet `savedReq` est maintenant géré. Tout changement ultérieur sur `savedReq` avant la fin de la transaction sera synchronisé automatiquement sans rappeler `save()`.

## Erreur courante : Ignorer la valeur de retour
Les développeurs appellent souvent `repository.save(entity)` et continuent d'utiliser l'objet `entity` original. Lorsque `merge()` est utilisé, l'objet original reste détaché ; seule l'instance retournée est gérée.

**Correction :** Assignez toujours le résultat : `entity = repository.save(entity);`.

## Exercice pratique
Si vous utilisez `GenerationType.SEQUENCE` et appelez `save()` sur une nouvelle entité, l'instruction `INSERT` est-elle exécutée immédiatement ?

**Réponse :** Non, elle attend généralement le flush de la session ou l'engagement de la transaction, bien que l'ID soit récupéré immédiatement.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
