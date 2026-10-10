---
title: "Git pour l'Historique et GitHub pour la Collaboration"
description: "Distinction entre le contrôle de version local et l'hébergement distant via un scénario d'annuaire communautaire."
pubDate: 2026-10-08T20:48:00.000Z
translationKey: 236-git-vs-github
seriesOrder: 53
locale: fr
tags: ["deployment-devops","learning-series"]
draft: false
---

## Contrôle de Version Distribué vs Hébergement Centralisé

Une confusion courante consiste à croire que Git et GitHub sont le même outil. Git est un système de contrôle de version distribué (DVCS) qui s'exécute localement sur votre machine. Il suit les modifications des fichiers, permet de revenir à des états antérieurs et gère différentes lignes de développement (branches).

GitHub est un service d'hébergement basé sur le cloud qui stocke des dépôts Git. Il est tout à fait possible de développer sans GitHub. Comme Git est distribué, chaque contributeur possède une copie complète de l'historique du projet sur son disque dur. Cela permet un fonctionnement hors ligne : vous pouvez effectuer des commits, créer des branches et consulter les logs sans connexion internet. GitHub sert simplement de point de synchronisation commun (un "remote") où les contributeurs envoient leur historique local pour le partager.

## Pourquoi l'Historique n'est pas une Sauvegarde

Bien que Git conserve chaque version de chaque fichier, il ne remplace pas une stratégie de sauvegarde. Un dépôt Git suit l'évolution du code source, mais ne protège pas contre la panne matérielle du disque local ou la suppression accidentelle du dossier `.git`. De plus, Git est conçu pour des fichiers texte ; stocker de gros fichiers binaires dans l'historique Git alourdit le dépôt pour chaque personne qui le clone, car tout l'historique doit être téléchargé.

## Scénario Pratique : L'Annuaire Communautaire

Deux bénévoles, Alice et Bob, gèrent un fichier `directory.txt` contenant des contacts communautaires.

### 1. Initialisation Locale et Premier Commit
Alice commence le projet localement. Elle crée le fichier et initialise le dépôt.

```bash
# Illustratif : Configuration locale d'Alice
git init -b main community-dir
cd community-dir
echo "Alice: 555-0101" > directory.txt
git add directory.txt
git commit -m "Initial directory setup"
```

### 2. Branchement pour Nouvelles Fonctionnalités
Bob souhaite ajouter une catégorie "Commerces Locaux" sans risquer de corrompre la liste principale. Il crée une branche de fonctionnalité.

```bash
# Illustratif : Bob crée une ligne de travail séparée
git checkout -b add-businesses
echo "Bakery: 555-0202" >> directory.txt
git add directory.txt
git commit -m "Add bakery contact"
```

### 3. Revue du Diff
Avant de fusionner, Bob examine précisément ce qui a changé. La commande `diff` affiche les lignes ajoutées ou supprimées.

```bash
# Illustratif : Vérification des changements par rapport à main
git diff main add-businesses
```
**Signification du résultat :** Le résultat affiche un signe `+` à côté de "Bakery: 555-0202", indiquant que cette ligne existe dans la branche de fonctionnalité mais pas dans la branche principale.

### 4. Synchronisation Distante
Pour partager le travail, ils utilisent un dépôt GitHub comme distant.

```bash
# Illustratif : Connexion du local au distant
git remote add origin https://github.com/user/community-dir.git
git push -u origin main
# Bob envoie sa branche
git push origin add-businesses
```

## Conséquences du Flux de Travail

En utilisant des branches, Bob a évité de modifier directement la liste principale. S'il avait commité directement sur `main` et commis une erreur, il aurait dû naviguer dans l'historique pour annuler. En poussant vers un serveur distant, Alice peut désormais utiliser `git fetch` pour récupérer les changements de Bob, les examiner et les fusionner dans `main` uniquement après vérification.

## Exercice

Distinguez deux cas. Pour abandonner une modification non committée, git restore config.json restaure normalement depuis l’index ; examinez git diff et git diff --cached, car l’index peut différer de HEAD. Pour le contenu committé explicitement, git restore --source=HEAD -- config.json remplace le fichier de travail après confirmation de votre intention de perdre cette édition.

Si l’erreur est déjà committée et partagée, git revert <commit> crée un commit inverse en conservant l’historique. Pour un seul fichier, restaurez depuis un commit choisi, revoyez le diff et committez. restore n’annule pas lui-même un commit.

Bob a besoin d’un clone ou checkout local partagé convenu avant les commandes ; ce préalable est omis. Git stocke les snapshots committés, pas tous les fichiers ignorés/non suivis. Les clones shallow/partial peuvent manquer de l’historique. Une branche isole sans prouver la correction.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
