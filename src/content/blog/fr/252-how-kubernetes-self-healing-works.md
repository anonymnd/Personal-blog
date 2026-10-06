---
title: "Comment fonctionne l'auto-guérison de Kubernetes"
description: "Une exploration de la manière dont Kubernetes détecte et récupère automatiquement les pannes de conteneurs pour maintenir la disponibilité."
pubDate: 2026-10-17T03:48:00.000Z
translationKey: 252-how-kubernetes-self-healing-works
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une application d'achat où le service de 'Soumission de demande' plante soudainement à 3 heures du matin à cause d'une fuite de mémoire. Sans orchestration, votre système reste hors service jusqu'à ce qu'un ingénieur redémarre manuellement le serveur. C'est là que l'auto-guérison (self-healing) de Kubernetes intervient pour automatiser la récupération.

## Le mécanisme de boucle de contrôle
Kubernetes fonctionne selon un modèle d'« État Désiré ». Vous indiquez au cluster : « Je veux trois réplicas de procurement-api », et le Control Plane surveille continuellement l'« État Réel ». Si un nœud tombe en panne ou qu'un processus s'arrête, la boucle de réconciliation détecte l'écart et déclenche une action corrective.

## Sondes de Liveness et de Readiness
L'auto-guérison repose sur des tests de santé. Une sonde de Liveness indique si un conteneur est toujours vivant ; s'il échoue, Kubernetes redémarre le conteneur. Une sonde de Readiness détermine si le conteneur est prêt à recevoir du trafic. Si un pod est en cours de démarrage, la sonde de readiness échoue et Kubernetes le retire du load balancer du Service pour éviter les erreurs 500.

## Exemple concret : L'application d'achat
Considérons un déploiement pour le `approval-service` :

```yaml
# Extrait illustratif d'une spec de Pod
spec:
  containers:
  - name: approval-service
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```
Si le `approval-service` se bloque, le point de terminaison `/healthz` ne répond plus. Après 20 secondes, le kubelet détecte l'échec et redémarre le conteneur. Le résultat est une brève interruption plutôt qu'une panne totale.

## Erreur courante : Confondre Liveness et Readiness
Une erreur fréquente consiste à utiliser le même endpoint pour les deux sondes. Si votre base de données est temporairement indisponible, l'échec d'une sonde de Liveness provoquera des redémarrages incessants (CrashLoopBackOff), ce qui ne résout pas le problème DB. Utilisez une sonde de Readiness pour les dépendances externes ; cela maintient l'app active mais stoppe le trafic.

## Exercice pratique
Scénario : Votre pod plante car il met 60 secondes à charger un cache, mais la sonde de liveness commence à vérifier après 5 secondes et le tue immédiatement. Quelle configuration devez-vous modifier ?

Réponse : Vous devez implémenter une Startup Probe ou augmenter le `initialDelaySeconds` de la sonde de Liveness pour laisser le temps au cache de charger.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
