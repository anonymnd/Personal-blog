---
title: "Docker vs Kubernetes"
description: "Une comparaison claire entre la conteneurisation et l'orchestration pour comprendre leur synergie dans un pipeline de déploiement."
pubDate: 2026-10-16T23:48:00.000Z
translationKey: 248-docker-vs-kubernetes
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imaginez que vous ayez développé une application d'achats où un demandeur soumet une requête et un manager l'approuve. Tout fonctionne sur votre ordinateur, mais une fois sur le serveur, l'application plante car la version de Java est différente. C'est ce problème du « ça marche sur ma machine » que nous résolvons avec les conteneurs.

## Le rôle de Docker
Docker est un outil permettant de créer, déployer et exécuter des applications via des conteneurs. Considérez un conteneur comme un paquet léger contenant tout le nécessaire : le code, le runtime et les outils système. Pour notre application d'achats, Docker emballe le JAR Spring Boot et le JRE dans une image unique, garantissant un environnement identique partout.

## Le rôle de Kubernetes
Si Docker gère le conteneur individuel, Kubernetes (K8s) gère la flotte. Si votre application devient populaire et que vous avez besoin de dix copies du « Service d'Approbation » pour gérer la charge, gérer dix conteneurs Docker manuellement devient impossible. Kubernetes est un orchestrateur ; il automatise le déploiement, la mise à l'échelle et la gestion de ces conteneurs sur un cluster de serveurs.

## Comment ils collaborent
Il ne s'agit pas de choisir l'un ou l'autre, mais de comprendre comment ils se complètent. Docker construit l'image et lance le conteneur ; Kubernetes décide où ce conteneur doit être placé et s'assure qu'il reste opérationnel.

| Fonctionnalité | Docker | Kubernetes |
| :--- | :--- | :--- |
| Objectif Principal | Packaging et Isolation | Orchestration et Scaling |
| Portée | Conteneur unique | Cluster de conteneurs |
| Auto-guérison | Politiques de redémarrage simples | Remplacement avancé de Pods |

## Exemple concret
Supposons que le conteneur du « Service Acheteur » plante à cause d'une fuite de mémoire.
- **Docker seul :** Le conteneur s'arrête. À moins d'un redémarrage manuel, le service reste indisponible.
- **Avec Kubernetes :** Le Kubelet détecte la panne via une sonde de liveness. Kubernetes tue automatiquement le pod défaillant et en lance un nouveau sur un nœud sain.

## Erreur courante : Confondre K8s et CI/CD
Une erreur fréquente est de croire que Kubernetes est un outil de CI/CD. Kubernetes ne compile pas votre code et ne lance pas vos tests ; il gère uniquement les conteneurs résultants. Vous avez toujours besoin d'un pipeline pour déclencher le build Docker puis demander à Kubernetes de mettre à jour l'image.

## Exercice pratique
**Question :** Si vous n'avez qu'une petite application sur un seul serveur, Kubernetes est-il indispensable ?
**Réponse :** Non. Docker (ou Docker Compose) suffit pour les configurations simples sur un seul serveur. Kubernetes apporte une complexité qui n'est justifiée que pour la haute disponibilité et le scaling multi-serveurs.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
