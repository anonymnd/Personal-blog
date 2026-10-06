---
title: "Que se passe-t-il après avoir poussé le code ?"
description: "Une exploration du voyage automatisé depuis un git push local jusqu'à un conteneur actif en production."
pubDate: 2026-10-16T18:48:00.000Z
translationKey: 243-what-happens-after-you-push-code
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imaginez que vous venez de terminer une fonctionnalité pour une application d'achats où un manager approuve une demande. Vous exécutez `git push origin main`, et soudain, votre code est en ligne. Pour un débutant, cela ressemble à de la magie, mais c'est en fait une séquence de déclencheurs appelée pipeline CI/CD.

## Le Déclencheur et l'Intégration Continue (CI)
Lorsque vous poussez du code vers un dépôt distant comme GitHub, le serveur envoie une notification webhook à un outil de CI. Le serveur CI récupère votre code et lance une phase de 'Build'. Il compile le code source et exécute des tests unitaires pour s'assurer que la nouvelle logique d'approbation ne casse pas le formulaire de soumission du demandeur.

## Livraison Continue vs Déploiement Continu
Une fois le build réussi, le code entre dans la phase de livraison. En Livraison Continue (Continuous Delivery), l'artéfact est stocké et un humain clique manuellement sur 'Déployer'. En Déploiement Continu (Continuous Deployment), ce processus est entièrement automatisé : si les tests passent, le code va directement en production.

## Packaging avec Docker et Kubernetes
Pour garantir que l'application fonctionne de la même manière partout, le pipeline l'emballe dans une image Docker. Cette image est ensuite déployée sur un cluster Kubernetes. Kubernetes ne compile pas le code ; il orchestre les conteneurs en remplaçant l'ancienne version de l'application par la nouvelle sur plusieurs serveurs.

## Auto-guérison et Sondes de Santé
Une fois en ligne, Kubernetes surveille l'application. Il utilise une 'Liveness Probe' pour vérifier si l'app a planté ; si c'est le cas, il redémarre le conteneur. Une 'Readiness Probe' vérifie que l'app est prête avant de lui envoyer du trafic utilisateur, évitant ainsi les erreurs 500 pendant le démarrage.

## Erreur Courante : Confondre CI et Orchestration
Une erreur fréquente est de croire que Kubernetes exécute vos tests. En réalité, l'outil de CI (comme Jenkins) exécute les tests et crée l'image, tandis que Kubernetes gère uniquement le conteneur en cours d'exécution.

## Exercice Pratique
Si une Liveness Probe échoue répétitivement pour un pod de votre application, que fait Kubernetes ?

**Réponse :** Il redémarrera le conteneur selon la politique de redémarrage définie pour tenter de rétablir le service.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
