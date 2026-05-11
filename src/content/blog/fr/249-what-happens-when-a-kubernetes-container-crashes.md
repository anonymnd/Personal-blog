---
title: "Que se passe-t-il lorsqu'un conteneur Kubernetes plante ?"
description: "Une exploration du mécanisme d'auto-guérison de Kubernetes et de la gestion des pannes par le kubelet."
pubDate: 2026-10-17T00:48:00.000Z
translationKey: 249-what-happens-when-a-kubernetes-container-crashes
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez une application d'achat où le 'Service de Demande' est en cours d'exécution. Soudain, une fuite de mémoire provoque le plantage du conteneur. Vous pourriez craindre que tout le système soit hors service, mais dans Kubernetes, un plantage n'est pas la fin ; c'est le début d'un flux de récupération.

## Le rôle du Kubelet
Lorsqu'un conteneur plante, le premier intervenant est le kubelet, l'agent présent sur chaque nœud. Le kubelet surveille le runtime du conteneur. Si un processus s'arrête avec un statut non nul, le kubelet détecte cet échec immédiatement. Il ne cherche pas à deviner la cause ; il se réfère simplement à la `restartPolicy` définie dans la spécification du Pod.

## Comprendre les politiques de redémarrage
Kubernetes utilise trois politiques principales pour décider de la suite :
- `Always` : Le conteneur est redémarré quel que soit le code de sortie.
- `OnFailure` : Redémarré uniquement si le conteneur s'est arrêté avec une erreur.
- `Never` : Le conteneur reste dans un état terminé.

## Liveness vs Readiness
Alors qu'un plantage est une panne franche, un conteneur peut être 'vivant' mais bloqué (ex: deadlock). C'est là qu'interviennent les sondes. Une Liveness Probe indique si le conteneur est sain. Si elle échoue, Kubernetes tue le conteneur et le redémarre. Une Readiness Probe, elle, contrôle seulement si le conteneur reçoit du trafic via un Service ; elle ne déclenche pas de redémarrage.

## Exemple concret : Pod de demande d'achat
Considérez un Pod avec cet extrait :
```yaml
spec:
  containers:
  - name: request-app
    image: procurement-req:v1
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
    restartPolicy: Always
```
Si `request-app` plante à cause d'une erreur de segmentation, le kubelet voit la sortie du processus et le redémarre. Si l'application gèle tout en restant active, la sonde `/healthz` échoue, et Kubernetes force un redémarrage.

## Erreur courante : Le CrashLoopBackOff
Une erreur fréquente est d'ignorer le statut `CrashLoopBackOff`. Cela arrive quand un conteneur plante immédiatement après son démarrage. Kubernetes ne le redémarre pas en boucle infinie ; il ajoute un délai croissant (10s, 20s, 40s...) pour éviter de surcharger le nœud.
**Correction :** Ne vous contentez pas de redémarrer le Pod. Vérifiez les logs avec `kubectl logs <pod-name>` pour trouver la cause racine (ex: variable d'environnement manquante).

## Exercice pratique
Si un Pod a une `restartPolicy: OnFailure` et que l'application s'arrête avec le code 0 (succès), Kubernetes redémarrera-t-il le conteneur ?

**Réponse :** Non, car le code 0 indique une exécution réussie, pas un échec.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
