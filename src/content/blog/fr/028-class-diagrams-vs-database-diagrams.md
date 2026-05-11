---
title: "Diagrammes de Classes vs Diagrammes de Base de Données"
description: "Comprenez les différences fondamentales entre la modélisation orientée objet et les structures de données relationnelles pour éviter les erreurs d'architecture."
pubDate: 2026-10-07T19:48:00.000Z
translationKey: 028-class-diagrams-vs-database-diagrams
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez un système d'achat. Vous commencez par dessiner des blocs pour 'DemandeAchat' et 'Approbation'. Vous réalisez que même si les deux ressemblent à des tableaux, l'un décrit le comportement du code et l'autre décrit comment les données persistent après un redémarrage. Confondre les deux mène souvent à des 'Modèles de Domaine Anémiques' où la logique métier est dispersée dans des requêtes SQL plutôt que d'être encapsulée dans des objets.

## La Division Conceptuelle
Un diagramme de classes est un plan pour le comportement du logiciel. Il se concentre sur l'encapsulation, l'héritage et les méthodes. Il indique ce qu'un objet *fait*. Un diagramme de base de données (ERD), en revanche, est un plan pour le stockage. Il se concentre sur la normalisation, les clés étrangères et l'intégrité des données. Il indique ce que le système *retient*.

## Différences Structurelles
Dans un diagramme de classes, on utilise la composition et l'agrégation pour montrer la propriété. Vous pourriez avoir une classe `Demande` qui contient une liste d'objets `Article`. Dans un diagramme de base de données, cette relation est aplatie en une colonne de clé étrangère dans la table `Articles`. Alors qu'une classe peut hériter d'une classe parente (ex: `Manager` hérite de `Employé`), les bases de données relationnelles n'ont pas d'héritage natif ; il faut utiliser des stratégies comme la table unique ou les tables jointes.

## Exemple Concret : Flux d'Achat
Considérons la soumission d'une demande. Dans un diagramme de classes, la classe `PurchaseRequest` possède une méthode `calculateTotal()` qui additionne les prix de ses articles. La logique réside à l'intérieur de l'objet.

```java
// Représentation Diagramme de Classes (Extrait)
public class PurchaseRequest {
    private List<Item> items;
    public double calculateTotal() {
        return items.stream().mapToDouble(Item::getPrice).sum();
    }
}
```

Dans le diagramme de base de données, il n'y a pas de méthode `calculateTotal()`. À la place, vous avez une table `purchase_requests` et une table `items` liées par `request_id`. Pour obtenir le total, vous écrivez une requête SQL `SUM()`.

## Erreur Courante : Le Piège du Miroir
Une erreur fréquente est de vouloir faire du diagramme de classes un miroir exact du diagramme de base de données. Si vous faites cela, vos classes deviennent de simples conteneurs de données (POJOs) avec seulement des getters et setters, déplaçant toute la logique métier vers la couche base de données.

**Correction :** Concevez vos classes selon le comportement dont elles ont besoin, et concevez vos tables selon la manière dont les données doivent être récupérées efficacement.

## Exercice Pratique
Si vous avez une classe `User` et une classe `Role` avec une relation plusieurs-à-plusieurs, comment la représentation diffère-t-elle entre les deux diagrammes ?

**Réponse :** Dans le diagramme de classes, `User` a une `List<Role>` et `Role` a une `List<User>`. Dans le diagramme de base de données, vous devez introduire une troisième 'table de jointure' (ex: `user_roles`) pour lier les deux clés primaires.


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
