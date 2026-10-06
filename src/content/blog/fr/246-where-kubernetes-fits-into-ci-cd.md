---
title: "Where Kubernetes Fits Into CI/CD"
description: "Comprenez le rôle spécifique de Kubernetes en tant que cible d'orchestration au sein d'un pipeline d'Intégration et de Déploiement Continus."
pubDate: 2026-10-16T21:48:00.000Z
translationKey: 246-where-kubernetes-fits-into-ci-cd
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs pensent à tort que Kubernetes est un outil de CI/CD. Ils imaginent que l'installation d'un cluster gère automatiquement les tests de code et le déploiement. En réalité, Kubernetes est la destination, pas le véhicule. Cette confusion vient souvent du fait que Kubernetes gère le cycle de vie d'une application, mais il ne sait pas comment compiler du code Java ou exécuter des tests unitaires.

## Le flux du pipeline
Dans un flux standard, tout commence par Git. Lorsqu'un développeur pousse du code, un outil de CI (comme Jenkins ou GitHub Actions) se déclenche. Cet outil compile l'application et l'emballe dans une image Docker. Une fois l'image poussée vers un registre, la partie CD commence. C'est là que Kubernetes intervient. L'outil CD dit à Kubernetes : "Mets à jour le déploiement pour utiliser la version 2.0 de cette image". Kubernetes gère ensuite le déploiement sur le cluster.

## Orchestration vs Automatisation
Tandis que les outils CI/CD automatisent le mouvement du code, Kubernetes orchestre la charge de travail. Par exemple, dans une application d'achats, le service 'Requester' peut être mis à l'échelle sur trois réplicas. Si un pod plante, le kubelet le redémarre selon la politique de redémarrage. C'est de l'auto-guérison, mais ce n'est pas du 'CI/CD'—c'est de la stabilité opérationnelle.

## Exemple concret : Mise à jour de l'app d'achats
Imaginons la mise à jour du service 'Approval' dans un système d'achats.
1. **Phase CI** : Le code est poussé → Les tests passent → L'image Docker `procurement-approval:v2` est créée.
2. **Phase CD** : Le pipeline met à jour le manifeste Kubernetes :
```yaml
spec:
  template:
    spec:
      containers:
      - name: approval-service
        image: procurement-approval:v2
```
3. **Action K8s** : Kubernetes effectue une mise à jour progressive (rolling update), remplaçant les pods v1 par des pods v2 un par un pour garantir zéro interruption.

## Erreur courante : Confondre Liveness et CI
Une erreur fréquente est de croire qu'une Liveness Probe corrige des bugs. Si votre code a une exception NullPointerException, la Liveness Probe redémarrera le conteneur, mais le bug persiste. La CI sert à détecter le bug ; Kubernetes sert à maintenir l'appli active malgré le crash.

## Exercice pratique
Si un pipeline CI construit avec succès une image Docker, mais que l'application ne démarre pas dans Kubernetes à cause d'une variable d'environnement erronée, quelle partie du pipeline a échoué ?

**Réponse** : La phase CD/Déploiement (ou la gestion de configuration), car l'artéfact a été construit correctement, mais la cible d'orchestration était mal configurée.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
