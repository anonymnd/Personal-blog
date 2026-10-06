---
title: "@OneToMany Explained"
description: "Une analyse approfondie du mappage des relations un-à-plusieurs dans JPA avec Hibernate et PostgreSQL."
pubDate: 2026-10-12T09:48:00.000Z
translationKey: 138-onetomany-explained
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement où un Manager peut superviser plusieurs Demandes d'Achat. Vous avez vos entités, mais au moment de récupérer un Manager, vous réalisez que vous ne savez pas comment accéder efficacement à sa liste de demandes sans écrire des requêtes SQL manuelles. C'est là qu'intervient `@OneToMany`.

## Comprendre le Mécanisme
Dans JPA, `@OneToMany` définit une relation où une instance d'une entité est associée à plusieurs instances d'une autre. Par défaut, cette relation est en mode **LAZY**. Cela signifie qu'Hibernate ne chargera pas la collection d'entités enfants depuis PostgreSQL tant que vous n'appellerez pas la méthode getter (par exemple, `manager.getRequests()`). Cela évite de charger inutilement toute la base de données en mémoire.

## Exemple Concret : Flux d'Approvisionnement
Dans notre application, un `Manager` (Un) possède plusieurs objets `PurchaseRequest` (Plusieurs). Pour éviter une table de jointure inutile, nous utilisons l'attribut `mappedBy` pour indiquer que l'entité `PurchaseRequest` est propriétaire de la relation via un champ `@ManyToOne`.

```java
@Entity
public class Manager {
    @Id @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL)
    private List<PurchaseRequest> requests = new ArrayList<>();
}

@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;
}
```
**Résultat :** Lorsque vous enregistrez un Manager avec une liste de demandes, Hibernate insère d'abord le manager, puis insère les demandes avec la clé étrangère `manager_id` pointant vers l'ID du manager.

## Erreur Courante : Le Problème N+1
Les développeurs rencontrent souvent le problème N+1 lors de l'itération sur une liste de Managers pour accéder à leurs demandes. Hibernate exécute une requête pour obtenir N managers, puis N requêtes supplémentaires pour obtenir les demandes de chaque manager.

**Correction :** Au lieu de passer le type de fetch en `EAGER` (ce qui dégrade les performances), utilisez un `JOIN FETCH` dans votre requête JPQL : `SELECT m FROM Manager m JOIN FETCH m.requests`.

## Note sur l'Indexation PostgreSQL
N'oubliez pas que bien que JPA crée la clé étrangère dans PostgreSQL, PostgreSQL ne crée pas automatiquement d'index sur cette clé. Si vous interrogez fréquemment les demandes par manager, vous devez ajouter manuellement un index sur la colonne `manager_id`.

## Exercice Pratique
Si vous avez une entité `Buyer` et une entité `Order` où un acheteur gère plusieurs commandes, quelle entité doit porter l'attribut `mappedBy` pour assurer une relation bidirectionnelle ?

**Réponse :** L'entité `Buyer` doit avoir l'attribut `@OneToMany(mappedBy = "buyer")`, car l'entité `Order` possède généralement la clé étrangère.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
