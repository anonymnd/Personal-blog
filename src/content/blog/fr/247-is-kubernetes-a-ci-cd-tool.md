---
title: "Kubernetes est-il un outil de CI/CD ?"
description: "Clarification de la différence fondamentale entre l'orchestration de conteneurs et les pipelines d'automatisation pour l'intégration et le déploiement continus."
pubDate: 2026-10-16T22:48:00.000Z
translationKey: 247-is-kubernetes-a-ci-cd-tool
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez développé une application de gestion des achats où un demandeur soumet une requête et un manager l'approuve. Vous avez réussi à emballer cette application dans une image Docker. Maintenant, vous faites face à un dilemme : on parle souvent de Kubernetes et de CI/CD ensemble, ce qui vous amène à vous demander si l'installation de Kubernetes suffit pour automatiser tout votre processus de mise en production.

## La Distinction Fondamentale
Kubernetes n'est pas un outil de CI/CD ; c'est un orchestrateur de conteneurs. Alors que les outils CI/CD se concentrent sur le *voyage* du code depuis le poste du développeur vers le serveur, Kubernetes se concentre sur la *destination*. Il gère l'endroit où les conteneurs s'exécutent, comment ils passent à l'échelle et comment ils redémarrent en cas de panne. Il ne sait pas exécuter vos tests unitaires, compiler votre code Java ou déclencher un build lors d'un push sur GitHub.

## Comment le flux de travail s'articule
Dans le pipeline d'une application d'achats, les rôles sont séparés. Un outil de CI (comme Jenkins ou GitHub Actions) gère la phase de build et de test. Un outil de CD indique ensuite à Kubernetes de mettre à jour le déploiement vers une nouvelle version de l'image.

| Fonctionnalité | Outil CI/CD | Kubernetes |
| :--- | :--- | :--- |
| Objectif Principal | Automatisation du pipeline | Gestion des charges de travail |
| Action | Build, Test, Déploiement | Planification, Scaling, Guérison |
| Déclencheur | Git Push / Merge | Requête API / Controller |

## Exemple concret : Le déclenchement du déploiement
Supposons que votre application d'achats tourne dans un Pod. Pour la mettre à jour, vous n'utilisez pas Kubernetes pour 'construire' l'app. À la place, votre pipeline exécute une commande comme celle-ci :

```bash
# L'outil CI construit l'image et la pousse vers un registre
docker build -t procurement-app:v2 .
docker push procurement-app:v2

# La partie CD demande à Kubernetes de mettre à jour l'image
kubectl set image deployment/procurement-deploy app=procurement-app:v2
```
Résultat : Kubernetes effectue une mise à jour progressive (rolling update), remplaçant les anciens pods par les nouveaux sans interruption de service.

## Erreur courante : Confondre l'auto-guérison et la CI
Une idée reçue est que, puisque Kubernetes peut redémarrer un conteneur planté (via les Liveness Probes), il 'répare' le code. C'est faux. Kubernetes assure la résilience de l'infrastructure, pas la correction de bugs. Si votre application a une NullPointerException, Kubernetes redémarrera le pod, mais il plantera à nouveau. Vous avez toujours besoin d'un pipeline CI/CD pour pousser une version corrigée du code.

## Exercice pratique
Scénario : Vous avez poussé une modification sur votre dépôt GitHub, et l'application est maintenant active sur votre cluster. Quelle partie du processus a été gérée par l'outil CI/CD et laquelle par Kubernetes ?

**Réponse :** L'outil CI/CD a géré le déclenchement, la construction de l'image Docker et la commande de mise à jour du cluster. Kubernetes a géré l'ordonnancement réel des pods et s'est assuré que la nouvelle version restait opérationnelle.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
