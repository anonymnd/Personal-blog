---
title: "Qu'est-ce que le CI/CD ?"
description: "Un guide pour débutants sur le pipeline automatisé qui déplace le code de la machine du développeur vers la production."
pubDate: 2026-10-16T14:48:00.000Z
translationKey: 239-what-is-ci-cd
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez une équipe de cinq développeurs travaillant sur une application d'achats. L'un ajoute le formulaire de 'Demande', un autre crée la logique d' 'Approbation Manager', et un troisième gère le système de 'Commande Acheteur'. Sans système, ils passeraient des heures à fusionner manuellement le code, pour s'apercevoir que la logique d'approbation a cassé le formulaire de demande. Cet 'enfer de l'intégration' est précisément ce que le CI/CD résout.

## Intégration Continue (CI)
Le CI est la pratique consistant à fusionner toutes les copies de travail des développeurs dans une ligne principale partagée plusieurs fois par jour. Au lieu d'attendre des semaines, les développeurs poussent de petits changements vers un dépôt Git. Ce push déclenche une séquence automatisée de construction (build) et de test. Si un test échoue, l'équipe sait immédiatement quel changement a causé l'erreur.

## Livraison Continue vs Déploiement Continu
Bien que souvent regroupés, ces deux concepts diffèrent. La Livraison Continue (Continuous Delivery) garantit que le code est toujours dans un état 'prêt à être publié'. Le pipeline automatise le build et les tests, mais un humain doit cliquer sur un bouton pour déployer en production. Le Déploiement Continu (Continuous Deployment) va plus loin : si le code passe tous les tests, il est déployé automatiquement sur le serveur live.

## Fonctionnement du Pipeline
Voici un extrait simplifié d'une configuration de pipeline :

```yaml
stages:
  - build: compile_java_app
  - test: run_unit_tests
  - deliver: push_to_staging
  - deploy: push_to_production # Uniquement en Déploiement Continu
```

Dans notre application d'achats, quand un développeur pousse une correction pour le module 'Commande Acheteur', le serveur CI compile automatiquement le code et vérifie que le flux d' 'Approbation Manager' fonctionne toujours.

## Erreur Courante : Confondre Outils et Processus
Une erreur fréquente est de penser que l'installation de Jenkins ou GitHub Actions *est* le CI/CD. Ce sont des outils qui automatisent le processus, mais le CI/CD est une culture d'intégration fréquente et de tests automatisés. Utiliser un outil sans écrire de tests revient simplement à 'automatiser le déploiement de bugs'.

## Exercice Pratique
Scénario : Un développeur pousse du code qui fait échouer le build. Dans un environnement CI/CD, que se passe-t-il immédiatement après le push ?

**Réponse :** Le pipeline CI se déclenche, l'étape de build/test échoue, et le développeur est notifié immédiatement pour corriger le code avant qu'il ne puisse être fusionné ou déployé.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
