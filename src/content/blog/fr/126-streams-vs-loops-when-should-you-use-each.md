---
title: "Streams vs Boucles : Lequel Choisir ?"
description: "Un guide pratique pour choisir entre les boucles for impératives et les Streams Java fonctionnels pour le traitement des données."
pubDate: 2026-10-11T21:48:00.000Z
translationKey: 126-streams-vs-loops-when-should-you-use-each
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un manager doit filtrer une liste de demandes en attente pour trouver uniquement celles dépassant 5 000 USD. Vous commencez par écrire une boucle for classique, mais vous voyez un collègue utiliser `.filter().collect()`. Vous vous demandez alors : l'API Stream est-elle juste une façon élégante d'écrire une boucle, ou change-t-elle réellement le fonctionnement du code ?

## L'approche impérative : Les Boucles
Les boucles sont impératives, ce qui signifie que vous dites à Java exactement *comment* effectuer le travail. Vous gérez l'index, l'état de l'accumulateur et la condition de sortie. C'est idéal lorsque vous devez modifier des variables externes (effets de bord) ou lorsque vous devez interrompre le processus prématurément avec `break` ou `continue`. Les boucles sont généralement plus faciles à déboguer car on peut suivre chaque itération linéairement.

## L'approche fonctionnelle : Les Streams
Les Streams sont déclaratifs ; vous dites à Java *ce que* vous voulez. Au lieu de gérer une boucle, vous chaînez des opérations comme `filter`, `map` et `reduce`. Les Streams excellent dans la transformation de données et le traitement par pipeline. Ils séparent la logique de "quoi faire" de la manière d'itérer, rendant le code plus concis et souvent plus lisible pour des transformations complexes.

## Exemple concret : Filtrage des achats
Considérons un record `PurchaseRequest` avec un `double amount` et un `String status`.

```java
// Approche Boucle
List<PurchaseRequest> expensiveRequests = new ArrayList<>();
for (PurchaseRequest req : allRequests) {
    if ("PENDING".equals(req.status()) && req.amount() > 5000) {
        expensiveRequests.add(req);
    }
}

// Approche Stream
List<PurchaseRequest> expensiveRequestsStream = allRequests.stream()
    .filter(req -> "PENDING".equals(req.status()))
    .filter(req -> req.amount() > 5000)
    .toList();
```
Dans la boucle, nous gérons manuellement la liste `expensiveRequests`. Dans le stream, le pipeline gère la collecte automatiquement.

## Erreur courante : Le mythe de la performance
Beaucoup de développeurs pensent que les Streams sont automatiquement plus rapides car ils paraissent "modernes". En réalité, pour de petites collections, une simple boucle for est souvent légèrement plus rapide en raison d'un moindre surcoût d'objets. Les Streams n'offrent un avantage de performance qu'avec `.parallelStream()` sur des jeux de données massifs.

## Matrice de décision
| Caractéristique | Boucle | Stream |
| :--- | :--- | :--- |
| Flux de contrôle | Complet (break/continue) | Limité (ops terminales) |
| État | Mutation facile | Favorise l'immuabilité |
| Lisibilité | Verbeux pour les filtres | Concis pour les pipelines |

## Exercice pratique
Étant donné une liste d'objets `PurchaseRequest`, comment calculeriez-vous la somme totale de toutes les demandes approuvées en utilisant un Stream ?

**Réponse :** `allRequests.stream().filter(r -> "APPROVED".equals(r.status())).mapToDouble(PurchaseRequest::amount).sum();`


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
