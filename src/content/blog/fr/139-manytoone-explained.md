---
title: "@ManyToOne Explained"
description: "Une analyse approfondie du mappage des relations many-to-one dans JPA pour lier plusieurs entités à un parent unique."
pubDate: 2026-10-12T10:48:00.000Z
translationKey: 139-manytoone-explained
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous avez des dizaines d'entités `PurchaseRequest`, mais chacune doit appartenir à un seul `Department`. Si vous stockez simplement l'ID du département comme un entier long dans votre classe Java, vous perdez la navigation orientée objet. Vous aimeriez appeler `request.getDepartment().getName()` sans écrire une jointure SQL manuelle à chaque fois.

## Le mécanisme de @ManyToOne
Dans JPA, l'annotation `@ManyToOne` définit une relation où plusieurs instances de l'entité propriétaire sont liées à une seule instance d'une autre entité. Dans la base de données, cela se traduit par une colonne de clé étrangère (FK) dans la table de l'entité où l'annotation est placée. Par défaut, JPA utilise `FetchType.EAGER` pour `@ManyToOne`, ce qui signifie que Hibernate tentera de charger l'entité associée immédiatement.

## Exemple concret : Demandes d'achat
Voici comment lier une demande à un département en utilisant les imports `jakarta.persistence`.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String itemDescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;
    
    // Getters et setters
}

@Entity
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // Getters et setters
}
```
**Résultat :** Dans PostgreSQL, la table `purchase_request` aura une colonne `dept_id` qui référence l'id de la table `department`. L'utilisation de `FetchType.LAZY` évite de charger l'objet département inutilement.

## Erreur courante : Le problème N+1
Les développeurs laissent souvent le chargement `EAGER` par défaut ou changent tout en `EAGER` pour éviter la `LazyInitializationException`. Si vous récupérez 100 demandes, Hibernate peut exécuter 1 requête pour les demandes et 100 requêtes supplémentaires pour chaque département.

**Correction :** Utilisez `FetchType.LAZY` et employez le "Join Fetch" dans vos requêtes JPQL (ex: `SELECT r FROM PurchaseRequest r JOIN FETCH r.department`) pour récupérer les données en une seule requête SQL.

## Exercice pratique
**Scénario :** Vous avez une entité `Product` et une entité `Category`. Plusieurs produits appartiennent à une catégorie. Quelle entité doit porter l'annotation `@ManyToOne` ?

**Réponse :** L'entité `Product`, car c'est le côté "many" qui détient la clé étrangère vers la catégorie.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
