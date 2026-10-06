---
title: "How Your Code Goes From Laptop to Server"
description: "Un guide pour débutants sur le trajet du code source depuis l'environnement local jusqu'au serveur de production."
pubDate: 2026-10-16T10:48:00.000Z
translationKey: 235-how-your-code-goes-from-laptop-to-server
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imaginez que vous ayez terminé une nouvelle fonctionnalité pour une application d'achats où un manager peut approuver une demande. Tout fonctionne sur votre ordinateur, mais comment cela arrive-t-il concrètement aux utilisateurs ? Ce passage n'est pas un simple copier-coller, c'est un pipeline structuré appelé CI/CD.

## Le point de départ : Le contrôle de version
Tout commence avec Git. Vous ne transmettez pas de fichiers par email ; vous effectuez des commits dans un dépôt local. Lorsque vous poussez (push) ces modifications vers un service comme GitHub, vous ne faites pas que stocker du code : vous déclenchez un signal. Ce push est le catalyseur qui informe le serveur d'automatisation que du nouveau code est prêt.

## CI : L'Intégration Continue
Une fois le code poussé, le pipeline CI prend le relais. Il récupère automatiquement le code, le compile et exécute des tests. Pour notre application d'achats, le serveur CI vérifie que la logique du bouton 'approuver' fonctionne toujours sans casser le flux de 'demande'. Si un test échoue, le pipeline s'arrête, empêchant le code défectueux d'avancer.

## CD : Livraison vs Déploiement
La Livraison Continue (Continuous Delivery) garantit que le code est toujours dans un état 'prêt à être publié', mais un humain doit généralement valider le passage en production. Le Déploiement Continu (Continuous Deployment) va plus loin : si les tests passent, le code est automatiquement déployé sur le serveur.

## Packaging et Orchestration
Pour garantir que le code s'exécute de la même manière sur le serveur que sur votre laptop, on utilise Docker pour emballer l'application dans un conteneur. Kubernetes orchestre ensuite ces conteneurs. Si un conteneur plante, le kubelet le redémarre selon la politique de redémarrage. Cette 'auto-guérison' permet à l'application de rester disponible.

## Erreur courante : Confondre CI et Déploiement
Beaucoup de débutants pensent que l'outil de CI (comme Jenkins) est celui qui 'héberge' l'application. En réalité, l'outil CI gère seulement le flux de travail. L'exécution réelle se passe dans un conteneur géré par un orchestrateur.

## Exercice pratique
**Scénario :** Vous avez poussé le code, le build a réussi, mais l'application n'est pas à jour sur le serveur. Quelle étape du pipeline devez-vous vérifier en priorité ?

**Réponse :** Vérifiez l'étape de Déploiement ou l'état des pods Kubernetes pour voir si le nouveau conteneur a échoué au démarrage ou si le déclencheur manuel a été oublié.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
