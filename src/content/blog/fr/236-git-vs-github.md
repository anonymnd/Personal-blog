---
title: "Git vs GitHub"
description: "Une distinction claire entre le système de contrôle de version local et la plateforme d'hébergement dans le cloud."
pubDate: 2026-10-16T11:48:00.000Z
translationKey: 236-git-vs-github
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imaginez que vous travaillez sur une application d'achats. Vous avez passé des heures à écrire la logique permettant à un demandeur de soumettre une demande d'achat. Soudain, vous effectuez une modification qui casse tout le flux de soumission, et vous réalisez que vous ne vous souvenez plus exactement de l'état du code d'il y a vingt minutes. C'est là que le contrôle de version devient essentiel, mais les débutants confondent souvent l'outil qui sauvegarde le travail et l'endroit où le travail est stocké.

## Comprendre Git comme le Moteur
Git est un système de contrôle de version distribué et local. C'est un logiciel que vous installez sur votre propre ordinateur. Git suit l'historique de vos fichiers, vous permettant de créer des 'instantanés' (commits) de votre projet. Comme il est distribué, chaque développeur possède une copie complète de l'historique sur sa machine. Vous n'avez pas besoin de connexion internet pour valider des modifications, créer des branches ou revenir à une version précédente.

## Comprendre GitHub comme le Hub
GitHub est un service d'hébergement basé sur le cloud qui gère des dépôts Git. Si Git est comme un éditeur de documents qui suit les changements, GitHub est comme un Google Drive spécialisé pour Git. Il offre une interface graphique, une gestion des utilisateurs et des outils de collaboration comme les Pull Requests. Alors que Git gère la version technique, GitHub permet à un manager de réviser le code avant que le module de commande d'un acheteur ne soit fusionné.

## Exemple concret : Le flux d'achat
Supposons que vous développiez la classe `RequestService.java` :

1. **Action Locale (Git) :** Vous écrivez le code et lancez `git commit -m "Ajout logique soumission"`. Cela sauvegarde l'état localement.
2. **Action Distante (GitHub) :** Vous lancez `git push origin main`. Cela télécharge votre commit local vers le serveur GitHub.
3. **Collaboration (GitHub) :** Votre lead développeur ouvre une Pull Request sur GitHub pour examiner vos changements.

## Erreur courante : "GitHub est en panne, je ne peux pas commit"
Beaucoup de débutants pensent que s'ils perdent la connexion internet ou si GitHub est hors ligne, ils ne peuvent plus sauvegarder leur travail. C'est faux. Puisque Git est local, vous pouvez continuer à commit, créer des branches et fusionner sur votre machine. GitHub n'est nécessaire que pour partager ou sauvegarder votre code à distance.

## Exercice pratique
Quel outil utiliseriez-vous pour créer une nouvelle branche nommée `feature-manager-approval` alors que vous êtes hors ligne ?

**Réponse :** Git. La création de branche est une opération locale gérée par le logiciel Git sur votre machine.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
