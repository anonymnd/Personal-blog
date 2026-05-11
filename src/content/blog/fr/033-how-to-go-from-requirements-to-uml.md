---
title: "Comment passer des besoins fonctionnels à l'UML"
description: "Apprenez à transformer des exigences métier brutes en diagrammes UML structurés pour combler le fossé entre les clients et les développeurs."
pubDate: 2026-10-08T00:48:00.000Z
translationKey: 033-how-to-go-from-requirements-to-uml
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imaginez que l'on vous remette un document indiquant : 'Les employés doivent soumettre une demande d'achat, qu'un manager approuve ensuite avant qu'un acheteur ne passe la commande.' Si vous commencez à coder immédiatement, vous risquez d'oublier des cas critiques, comme le refus d'une demande. C'est précisément là que l'UML (Unified Modeling Language) intervient.

## Identifier les Acteurs et les Objectifs
La première étape consiste à extraire le 'qui' et le 'quoi'. Dans notre scénario d'achat, les acteurs sont le Demandeur, le Manager et l'Acheteur. Leurs objectifs sont de soumettre, d'approuver et de commander. Vous transposez cela dans un Diagramme de Cas d'Utilisation. Ce diagramme ne montre pas l'ordre des événements, mais définit les limites du système.

## Modéliser le Flux Métier
Une fois les objectifs fixés, il faut modéliser la logique. Un flux métier n'est pas automatiquement un diagramme UML ; c'est la matière première. Pour visualiser le processus de décision, utilisez un Diagramme d'Activité. Par exemple, après l'action 'Soumettre la demande', le flux rencontre un losange de décision : 'Est-ce approuvé ?'. Si oui, on passe à l'Acheteur ; sinon, on revient au Demandeur.

## Modéliser les Interactions Ordonnées
Alors que les diagrammes d'activité montrent la logique, les Diagrammes de Séquence montrent le temps et la responsabilité. Vous y cartographiez les objets impliqués.

Exemple d'interaction :
1. `Demandeur` -> `RequestService` : `createRequest(details)`
2. `RequestService` -> `Database` : `save(request)`
3. `Manager` -> `RequestService` : `approveRequest(id)`

Cela permet de savoir exactement quelle classe traite quelle donnée à un instant T.

## Définir la Structure
Enfin, on passe au Diagramme de Classes. Une erreur courante est de confondre ce diagramme avec un schéma de base de données SQL. Alors qu'une table SQL stocke des données, une classe UML définit un comportement. Une classe `ProcurementRequest` doit posséder des méthodes comme `calculateTotal()` ou `validateBudget()`.

## Piège Courant : Le Diagramme 'Tout-en-un'
L'erreur classique est de vouloir tout mettre dans un seul schéma. Si votre diagramme de séquence contient 50 flèches, il devient illisible. La solution est de décomposer le système en scénarios plus petits et ciblés.

## Exercice Pratique
**Scénario :** Un utilisateur souhaite modifier son mot de passe. Il doit fournir l'ancien mot de passe, et le système doit le vérifier avant d'autoriser le nouveau.
**Question :** Quels sont les deux diagrammes UML les plus adaptés pour représenter la 'logique de décision' et 'l'interaction entre objets' pour cette fonctionnalité ?

**Réponse :** Un Diagramme d'Activité pour la logique de vérification (Oui/Non) et un Diagramme de Séquence pour l'interaction entre l'Utilisateur, le PasswordController et l'objet UserAccount.


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
