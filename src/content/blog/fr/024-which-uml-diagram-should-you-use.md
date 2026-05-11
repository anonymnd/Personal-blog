---
title: "Quel diagramme UML devez-vous utiliser ?"
description: "Un guide pratique pour choisir le bon diagramme UML selon que vous modélisez des objectifs, une logique, des interactions ou une structure."
pubDate: 2026-10-07T15:48:00.000Z
translationKey: 024-which-uml-diagram-should-you-use
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imaginez que vous deviez concevoir un système d'achat où un demandeur soumet une requête, un manager l'approuve et un acheteur passe la commande. Vous commencez à dessiner des boîtes et des flèches, mais vous réalisez vite qu'un seul schéma ne peut pas expliquer à la fois les règles métier et la structure technique. C'est là que beaucoup de débutants bloquent : ils essaient de tout faire tenir dans un seul diagramme.

## Modéliser les objectifs avec les Diagrammes de Cas d'Utilisation
Quand vous devez définir *qui* utilise le système et *ce qu'il* veut accomplir, utilisez le Diagramme de Cas d'Utilisation. Il se concentre sur le 'quoi' et non sur le 'comment'. Dans notre application d'achat, les acteurs sont le Demandeur, le Manager et l'Acheteur. Les cas d'utilisation seraient 'Soumettre une demande', 'Réviser la demande' et 'Passer la commande'.

## Cartographier la logique avec les Diagrammes d'Activités
Si vous devez visualiser un flux de travail ou un processus métier avec des décisions, le Diagramme d'Activités est le meilleur choix. Il fonctionne comme un organigramme évolué. Par exemple, après la révision par le manager, un losange de décision intervient : si 'Approuvé', le flux va vers l'Acheteur ; si 'Refusé', il revient vers le Demandeur pour correction.

## Détailler les interactions avec les Diagrammes de Séquence
Lorsque l'objectif est de voir comment des objets ou services communiquent dans le temps, utilisez le Diagramme de Séquence. Il montre l'ordre chronologique des messages.

Exemple d'interaction :
1. `Demandeur` -> `RequestService` : `createRequest(data)`
2. `RequestService` -> `Database` : `save(request)`
3. `RequestService` -> `NotificationService` : `notifyManager(requestId)`

## Définir la structure avec les Diagrammes de Classes
Pour modéliser le plan statique du système, utilisez le Diagramme de Classes. Une erreur courante est de confondre les classes UML avec des tables SQL. Une classe UML inclut des comportements (méthodes), pas seulement des colonnes de données. La classe `PurchaseRequest` aurait des attributs comme `totalAmount` et des méthodes comme `calculateTax()`.

## Erreur courante : tout expliquer avec un seul diagramme
Choisissez le diagramme selon la question à résoudre. Les acteurs peuvent être des lignes de vie dans un diagramme de séquence, qui peut aussi contenir des alternatives, boucles et interactions parallèles. Il explique l'ordre des messages ; un diagramme d'activité convient souvent mieux au flux global. Le diagramme de classes décrit la structure, pas l'exécution détaillée d'une méthode. Ces vues se complètent : UML ne réserve pas les acteurs aux seuls cas d'utilisation.
## Exercice Pratique
Scénario : Vous devez montrer l'ordre exact des appels API entre une application mobile, un serveur d'authentification et une base de données. Quel diagramme utilisez-vous ?
**Réponse :** Un Diagramme de Séquence, car il se concentre sur l'échange chronologique de messages.


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
