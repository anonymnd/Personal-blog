---
title: "Feature-Based Packages vs Layer-Based Packages"
description: "Une comparaison entre l'organisation du code par rôles techniques et par capacités métier pour améliorer la maintenance."
pubDate: 2026-10-17T07:48:00.000Z
translationKey: 256-feature-based-packages-vs-layer-based-packages
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Imaginez que vous travaillez sur une application d'achats. Vous devez ajouter un nouveau champ au formulaire de 'Demande d'achat'. Dans une structure par couches, vous vous retrouvez à naviguer entre un package `controller`, un package `service` et un package `repository`, alors que tous ces changements concernent une seule fonctionnalité métier. Cet effet de 'yo-yo' rend la navigation fastidieuse à mesure que le projet grandit.

## L'approche par couches (Layer-Based)
Le packaging par couches organise le code selon la fonction technique. On trouve des dossiers comme `com.app.controllers`, `com.app.services` et `com.app.repositories`. C'est intuitif pour les débutants car cela sépare le 'comment' (couche technique) du 'quoi' (logique métier). Cependant, cela crée une faible cohésion ; les fichiers qui évoluent ensemble sont dispersés dans tout l'arbre du projet.

## L'approche par fonctionnalité (Feature-Based)
Le packaging par fonctionnalité regroupe le code par capacité métier. Au lieu d'un dossier `services` global, vous avez un package `com.app.procurement.request` contenant son propre contrôleur, service et repository. Cela augmente la cohésion car tout ce qui concerne les 'Demandes' est au même endroit. Si vous devez supprimer la fonctionnalité 'Approbation', vous supprimez un seul package au lieu de chercher des fichiers dans cinq couches différentes.

## Exemple concret : Application d'achats
Voici comment ces deux structures gèrent un module 'Acheteur' (Buyer) :

| Par Couches | Par Fonctionnalité |
| :--- | :--- |
| `src/controllers/BuyerController.java` | `src/buyer/BuyerController.java` |
| `src/services/BuyerService.java` | `src/buyer/BuyerService.java` |
| `src/repositories/BuyerRepository.java` | `src/buyer/BuyerRepository.java` |

Dans le modèle par fonctionnalité, le package `Buyer` agit comme un module. Les autres fonctionnalités, comme `Request`, interagissent avec `Buyer` via une interface définie, réduisant ainsi la charge cognitive lors de l'exploration du code.

## Erreur courante : La fonctionnalité 'Dieu'
Une erreur fréquente consiste à créer un package de fonctionnalité trop large, tel que `com.app.core`. Cela revient concrètement à transformer le projet en un système par couches sous un autre nom. Pour corriger cela, divisez `core` en capacités de domaine spécifiques comme `inventory` ou `billing` selon les besoins métier.

## Exercice pratique
Si vous avez une classe `ManagerApproval` et une classe `ManagerRepository`, où devraient-elles se trouver dans une structure basée sur les fonctionnalités ?

**Réponse :** Les deux devraient être placées dans un package `com.app.approval` (ou un nom de fonctionnalité similaire).
