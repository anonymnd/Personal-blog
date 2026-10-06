---
title: "J'ai enfin compris la différence entre apprendre un framework et concevoir un logiciel"
description: "Une exploration conceptuelle de la raison pour laquelle maîtriser la syntaxe d'un outil diffère fondamentalement de la conception d'une architecture système évolutive."
pubDate: 2026-10-18T07:48:00.000Z
translationKey: 280-i-finally-understand-the-difference-between-learning-a-framework-and-engineering-software
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Beaucoup de débutants tombent dans le piège de penser que connaître chaque annotation d'un framework comme Spring Boot signifie qu'ils savent créer un logiciel. Vous pouvez passer des semaines à apprendre `@RestController` ou `@Service`, mais face à une page blanche pour concevoir un système complexe, vous vous sentez paralysé. C'est parce qu'apprendre un framework revient à apprendre le *vocabulaire*, alors que l'ingénierie logicielle concerne la *grammaire et la structure*.

## L'outil face au plan
Apprendre un framework, c'est comme apprendre à utiliser un marteau, une scie et une perceuse. Vous savez exactement sur quel bouton appuyer pour que l'outil fonctionne. Cependant, l'ingénierie logicielle est le plan architectural qui vous indique *où* placer les murs et *pourquoi* les fondations doivent être renforcées. Si vous ne connaissez que les outils, vous pouvez construire un abri de jardin, mais pas un gratte-ciel qui ne s'effondrera pas sous son propre poids.

## Un système d'approvisionnement hypothétique
Imaginons que nous créions une application d'achat où un Demandeur soumet une requête, un Manager l'approuve et un Acheteur passe la commande.

**L'approche Framework :** Vous vous concentrez sur la création d'un `ProcurementController` et d'un `ProcurementService`. Vous utilisez les outils intégrés pour sauvegarder les données. Cela fonctionne pour un utilisateur, mais la logique est emmêlée.

**L'approche Ingénierie :** Vous définissez d'abord les limites métier. Vous réalisez que la logique d'approbation est distincte de la logique de commande. Vous concevez une machine à états pour gérer le statut (EN_ATTENTE -> APPROUVÉ -> COMMANDÉ) afin qu'un acheteur ne puisse pas commander un article non approuvé. Le framework n'est que le véhicule utilisé pour implémenter ces règles.

## L'erreur classique : La conception dictée par le framework
Une erreur courante consiste à laisser le framework dicter la logique métier. Par exemple, placer des règles métier complexes directement dans un Contrôleur car c'est l'endroit le plus simple pour accéder aux données de la requête.

*Correction :* Déplacez la logique dans une couche Domaine dédiée. Le Contrôleur ne doit gérer que la requête HTTP et déléguer le travail à un service. Cela garantit que si vous changez de framework, votre logique métier reste intacte.

## Exercice pratique
**Scénario :** Vous devez ajouter un système de notification à l'application. Devez-vous mettre le code d'envoi d'e-mail directement dans la méthode `approveRequest()` de votre service ?

**Réponse :** Non. Cela viole le principe de responsabilité unique. Vous devriez créer un `NotificationService` séparé ou utiliser une approche événementielle pour que la logique d'approbation ne soit pas affectée si le fournisseur d'e-mails change.
