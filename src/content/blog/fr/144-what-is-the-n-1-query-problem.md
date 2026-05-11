---
title: "Qu'est-ce que le problème des requêtes N+1 ?"
description: "Une analyse approfondie du piège de performance où une seule requête déclenche des centaines d'appels inutiles à la base de données."
pubDate: 2026-10-12T15:48:00.000Z
translationKey: 144-what-is-the-n-1-query-problem
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous voulez afficher une liste de 50 demandes d'achat, et pour chaque demande, vous voulez afficher le nom du manager qui doit l'approuver. Vous récupérez les demandes, vous bouclez dessus dans votre code, et vous appelez `request.getManager().getName()`. Soudain, vos logs affichent 51 requêtes vers PostgreSQL : une pour les demandes, et 50 requêtes individuelles pour chaque manager. C'est le problème N+1.

## Le mécanisme du Lazy Loading
Dans JPA et Hibernate, les relations `@ManyToOne` sont souvent récupérées avec empressement (EAGER) par défaut, mais les `@OneToMany` sont paresseuses (LAZY). Avec le chargement paresseux, Hibernate ne récupère pas l'entité liée immédiatement. Il place un objet 'proxy'. La requête SQL n'est déclenchée que lorsque vous appelez un getter sur ce proxy. Si vous itérez sur N entités, Hibernate exécute 1 requête pour la liste et N requêtes supplémentaires pour les données liées.

## Exemple concret
Considérons une entité `PurchaseRequest` et une entité `Manager`. Si vous utilisez une méthode `findAll()` standard :

```java
// Extrait illustratif
List<PurchaseRequest> requests = repository.findAll(); // Requête 1: SELECT * FROM purchase_request
for (PurchaseRequest req : requests) {
    System.out.println(req.getManager().getName()); // Requêtes 2 à N+1: SELECT * FROM manager WHERE id = ?
}
```
Résultat : Si vous avez 100 demandes, vous exécutez 101 requêtes. Cela crée une surcharge réseau massive et ralentit considérablement l'application.

## L'erreur courante : Passer en EAGER
Beaucoup de développeurs tentent de corriger cela en changeant le type de récupération en `FetchType.EAGER`. C'est une erreur car cela force l'application à toujours charger l'entité liée, même quand elle n'est pas nécessaire, entraînant une consommation mémoire excessive.

## La solution correcte : JOIN FETCH
La méthode professionnelle consiste à utiliser un JOIN FETCH en JPQL. Cela indique à Hibernate de récupérer l'association dans une seule jointure SQL.

```java
@Query("SELECT r FROM PurchaseRequest r JOIN FETCH r.manager")
List<PurchaseRequest> findAllWithManagers();
```
Désormais, une seule requête est exécutée : `SELECT r.*, m.* FROM purchase_request r JOIN manager m ON r.manager_id = m.id`.

## Exercice pratique
Vous avez une entité `Buyer` avec une liste `@OneToMany` d'entités `Order`. Vous voulez lister 10 acheteurs et leurs commandes sans déclencher le N+1. Quel mot-clé JPQL devez-vous utiliser dans votre méthode de repository ?

**Réponse :** Utilisez `JOIN FETCH` (ex: `SELECT b FROM Buyer b JOIN FETCH b.orders`).

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
