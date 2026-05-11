---
title: "Liveness Probe vs Readiness Probe"
description: "Apprenez à distinguer les sondes de santé qui redémarrent les conteneurs de celles qui gèrent le flux de trafic dans Kubernetes."
pubDate: 2026-10-17T02:48:00.000Z
translationKey: 251-liveness-probe-vs-readiness-probe
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une application d'achats où le 'Service d'Approbation' se fige soudainement à cause d'un deadlock. Le processus tourne toujours, donc Kubernetes pense que le Pod est sain, mais aucun manager ne peut approuver les demandes. C'est là qu'interviennent les sondes pour éviter les 'pannes silencieuses'.

## Comprendre la Liveness Probe
La Liveness Probe indique au kubelet si le conteneur est toujours vivant. Si la sonde échoue, Kubernetes tue le conteneur et en lance un nouveau selon la politique de redémarrage. Elle est conçue pour récupérer un état où l'application est bloquée ou a planté intérieurement sans que le processus ne se soit arrêté.

## Comprendre la Readiness Probe
La Readiness Probe détermine si un conteneur est prêt à accepter du trafic réseau. Si elle échoue, le Pod n'est pas supprimé du cluster, mais il est retiré des points de terminaison (endpoints) du Service. C'est essentiel quand une application charge un cache volumineux ou attend une connexion DB au démarrage.

## Exemple Pratique : App d'Achats
Considérons un service qui gère les bons de commande. Nous définissons les deux sondes dans le YAML :

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 15
```

**Résultat :** Si l'app charge encore ses règles d'achat depuis la DB, `/health/ready` renvoie 503. Le Service arrête d'envoyer des requêtes à ce Pod, évitant ainsi des erreurs aux utilisateurs. Une fois chargé, il renvoie 200 et le trafic reprend. Si l'app se bloque plus tard, `/health/live` échoue et Kubernetes redémarre le Pod.

## Erreur Courante : Le même Endpoint
Une erreur fréquente est d'utiliser le même endpoint `/health` pour les deux sondes. Si votre base de données tombe temporairement, la Readiness probe doit échouer (arrêter le trafic), mais la Liveness probe doit rester saine. Si la Liveness échoue aussi, Kubernetes redémarrera le conteneur en boucle, ce qui ne réparera pas la DB et surchargera le cluster.

## Exercice Rapide
Scénario : Votre app met 30 secondes à démarrer. Vous configurez une Liveness probe avec `initialDelaySeconds: 5`. Que se passe-t-il ?

**Réponse :** La Liveness probe échouera avant que l'app ne soit prête, forçant Kubernetes à redémarrer le conteneur sans cesse (crash loop).

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
