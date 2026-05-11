---
title: "Comment passer d'un flux de travail à un diagramme de séquence"
description: "Apprenez à traduire un processus métier de haut niveau en un diagramme de séquence technique pour cartographier les interactions entre objets."
pubDate: 2026-10-08T01:48:00.000Z
translationKey: 034-how-to-go-from-a-workflow-to-a-sequence-diagram
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imaginez que vous ayez un flux de travail pour un processus d'achat : un demandeur soumet une demande, un manager l'approuve et un acheteur passe la commande. Bien que ce flux soit clair pour les parties prenantes, les développeurs ont souvent du mal à identifier quels composants logiciels doivent communiquer et dans quel ordre exact. Un workflow montre *ce qui* se passe, mais un diagramme de séquence montre *comment* les objets du système collaborent pour le réaliser.

## Identifier les participants
Pour commencer la transition, vous devez d'abord identifier les « Lignes de vie » (Lifelines). Dans un workflow, vous avez des rôles (Demandeur, Manager). Dans un diagramme de séquence, vous traduisez cela en acteurs et en objets système. Pour une application d'achat, vos lignes de vie seraient l' `Utilisateur` (Acteur), le `RequestController`, l' `ApprovalService` et le `OrderRepository`.

## Cartographier la chronologie
Les workflows utilisent souvent des couloirs (swimlanes). Pour convertir cela en diagramme de séquence, lisez le flux de haut en bas et associez chaque étape à un message synchrone ou asynchrone. Si le workflow indique « Le manager approuve la demande », le diagramme de séquence doit montrer un appel de l'acteur `Manager` vers la méthode `ApprovalService.approve(requestId)`, qui déclenche ensuite un changement d'état dans la base de données.

## Exemple concret : Approbation d'achat
Considérons l'étape : « Le manager approuve la demande ».
1. **Acteur** : Manager $ightarrow$ **Objet** : `ApprovalController` (Message : `postApproval(id)`)
2. **Objet** : `ApprovalController` $ightarrow$ **Objet** : `ApprovalService` (Message : `validateAndApprove(id)`)
3. **Objet** : `ApprovalService` $ightarrow$ **Objet** : `RequestEntity` (Message : `setStatus('APPROVED')`)

Résultat : Le statut de la demande est mis à jour et une confirmation est renvoyée via la chaîne jusqu'à l'interface du Manager.

## Erreur courante : Mélanger les niveaux de logique
Une erreur fréquente consiste à placer des décisions métier (comme « Si montant > 1000 € ») directement comme un message. Les diagrammes de séquence doivent montrer l' *appel* à une méthode qui gère la logique, et non la logique elle-même. Au lieu d'un message nommé `VerifierSiMontantEstEleve`, utilisez `ApprovalService.verifyLimit(request)`.

## Exercice pratique
**Scénario** : Un demandeur soumet une nouvelle demande d'achat. Cartographiez cela avec trois lignes de vie : `Demandeur`, `RequestController` et `RequestDatabase`.

**Correction** : Le `Demandeur` envoie `submit(data)` au `RequestController`, qui appelle ensuite `save(request)` sur la `RequestDatabase`.


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
