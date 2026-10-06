---
title: "J'ai enfin compris pourquoi Kubernetes n'est pas du CI/CD"
description: "Une analyse conceptuelle de la différence fondamentale entre l'orchestration de conteneurs et les pipelines d'automatisation."
pubDate: 2026-10-18T01:48:00.000Z
translationKey: 274-i-finally-understand-why-kubernetes-is-not-ci-cd
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Pendant longtemps, j'ai été confus quand on mentionnait 'Kubernetes' et 'CI/CD' ensemble. Il semblait qu'ils faisaient la même chose : automatiser le passage du code du laptop du développeur vers un serveur. Je pensais que posséder un cluster K8s signifiait avoir un système de déploiement. La réalité est simple : Kubernetes est la destination, tandis que le CI/CD est le voyage.

## L'écart entre Orchestration et Automatisation
Kubernetes est un orchestrateur de conteneurs. Son rôle est de gérer l'état de votre application—s'assurer que trois réplicas d'un pod tournent, gérer l'équilibrage de charge et redémarrer les conteneurs plantés. Il ne sait pas compiler du code Java, lancer des tests JUnit ou déclencher un build lors d'un push sur GitHub. C'est là qu'intervient le CI/CD. L'Intégration Continue (CI) construit et teste le code ; le Déploiement Continu (CD) indique à Kubernetes de mettre à jour la version de l'image.

## Un flux de travail d'achat hypothétique
Imaginez une application de gestion des achats où un demandeur soumet une requête. Dans un monde CI/CD, le processus est le suivant :
1. **Phase CI** : Un développeur pousse un correctif pour la logique d'approbation. Jenkins ou GitHub Actions lance les tests et crée une image Docker : `procurement-app:v2`.
2. **Phase CD** : Le pipeline met à jour le manifeste Kubernetes pour utiliser `v2` au lieu de `v1`.
3. **Phase Kubernetes** : K8s détecte le changement, effectue un déploiement progressif (rolling update) et garantit que les services 'Acheteur' et 'Manager' restent disponibles.

## L'erreur courante
Beaucoup de débutants tentent d'utiliser des 'Jobs' Kubernetes ou des scripts internes pour gérer leurs builds. C'est une erreur car K8s est conçu pour des services persistants, pas pour le cycle de vie complexe d'un pipeline (source → build → test → scan → déploiement).

**Mauvaise approche** : Exécuter un script shell dans un Pod pour faire un `git pull` et `mvn package` toutes les heures.
**Bonne approche** : Utiliser un outil CI dédié pour construire l'image, puis utiliser `kubectl set image` ou Helm pour mettre à jour le cluster.

## Exercice Pratique
Si votre pipeline échoue lors de l'étape 'Unit Test', s'agit-il d'une panne Kubernetes ou d'une panne CI ?

**Réponse** : C'est une panne CI. Kubernetes ne reçoit même pas la nouvelle image car le pipeline s'est arrêté avant la phase de déploiement.
