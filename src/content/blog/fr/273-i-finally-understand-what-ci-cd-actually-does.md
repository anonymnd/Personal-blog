---
title: "J'ai enfin compris ce que fait réellement le CI/CD"
description: "Une analyse conceptuelle de l'Intégration Continue et du Déploiement Continu illustrée par un système d'achat hypothétique."
pubDate: 2026-10-18T00:48:00.000Z
translationKey: 273-i-finally-understand-what-ci-cd-actually-does
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Pendant longtemps, j'ai considéré le CI/CD comme un simple ensemble d'outils comme Jenkins ou GitHub Actions. J'avais du mal à saisir la différence entre « intégrer » et « déployer » jusqu'à ce que j'imagine une application d'achat où un demandeur soumet une requête et un manager l'approuve. En logiciel, la « requête » est le code, et l'« approbation » est le pipeline automatisé.

## La partie « CI » : Intégration Continue
Le CI consiste à fusionner fréquemment le code dans un dépôt partagé. Au lieu de travailler sur une fonctionnalité pendant deux semaines et de subir un « enfer des fusions », les développeurs poussent de petits changements quotidiennement. L'objectif est de s'assurer que le nouveau code ne casse pas les fonctionnalités existantes. Lorsque vous poussez du code, un serveur déclenche un build et exécute des tests. Si un test échoue, le build est « cassé ».

## La partie « CD » : Livraison vs Déploiement
La Livraison Continue (Continuous Delivery) garantit que le code est *prêt* à être déployé à tout moment. Le Déploiement Continu (Continuous Deployment) va plus loin : il pousse automatiquement l'artéfact dans l'environnement de production sans intervention humaine. Dans notre analogie d'achat, la Livraison est comme avoir la commande prête sur le bureau de l'acheteur ; le Déploiement est l'action d'appuyer automatiquement sur le bouton « Commander ».

## Exemple concret : Le flux d'achat
Imaginons l'ajout d'un champ « Priorité » à la demande d'achat.
1. **Phase CI** : Le développeur pousse le code. Le pipeline lance `mvn test`. Il vérifie si le champ priorité est bien enregistré. Résultat : Build réussi.
2. **Phase CD** : Le pipeline crée une image Docker et la pousse vers un serveur de staging.
3. **Déploiement** : Après un test de fumée automatisé, l'image est mise à jour dans le cluster de production.

## Erreur courante : Sauter la suite de tests
Une erreur fréquente est de configurer un pipeline qui « compile » le code mais ne le « teste » pas. Si votre pipeline vérifie seulement la compilation, vous ne faites pas de CI, vous automatisez simplement un build. Les tests automatisés sont indispensables pour valider la logique.

## Exercice pratique
Si un pipeline échoue lors de l'étape « Test » mais réussit lors de l'étape « Build », le processus CI a-t-il fonctionné comme prévu ?

**Réponse** : Oui. Le but du CI est de détecter les erreurs avant la production. Un test échoué est une erreur interceptée avec succès.
