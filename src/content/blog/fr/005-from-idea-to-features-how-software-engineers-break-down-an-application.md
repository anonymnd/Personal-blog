---
title: "De l'idée aux fonctionnalités : Comment les ingénieurs logiciels décomposent une application"
description: "Apprenez le processus systématique pour transformer une idée métier vague en un ensemble concret de fonctionnalités logicielles implémentables."
pubDate: 2026-10-06T20:48:00.000Z
translationKey: 005-from-idea-to-features-how-software-engineers-break-down-an-application
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Imaginez qu'on vous demande de « créer un système d'approvisionnement ». Pour un débutant, c'est paralysant. Par où commencer ? Faut-il concevoir toute la base de données d'abord ? L'erreur classique est de vouloir architecturer tout le système avant d'écrire une seule ligne de code, ce qui mène à la « paralysie par l'analyse ».

## Partir du résultat utilisateur
Au lieu de penser aux tables ou aux API, commencez par le résultat souhaité. Dans une application d'achat, le résultat principal est : « Un employé obtient l'équipement dont il a besoin pour travailler ». Cet objectif de haut niveau dicte tout le reste. Vous n'avez pas besoin d'une architecture complète, mais d'un but.

## Définir les règles métier
Une fois le résultat clair, définissez les contraintes. Les règles métier sont les « lois » de votre application. Par exemple :
- Une demande doit être soumise par un Demandeur.
- Une demande ne peut être commandée qu'après l'approbation d'un Manager.
- Seul un Acheteur peut marquer une demande comme « Commandée ».
Ces règles vous évitent de créer des fonctionnalités inutiles.

## L'approche par tranche verticale (Vertical Slice)
Plutôt que de construire toute la couche « Gestion des utilisateurs » puis la couche « Base de données », créez une tranche verticale. Une tranche est un petit morceau de fonctionnalité qui traverse tout le système, de l'interface à la base de données.

**Exemple concret : La tranche de soumission de demande**
1. **UI** : Un formulaire simple avec « Nom de l'article » et « Quantité ».
2. **Logique** : Un service qui vérifie que la quantité est supérieure à zéro.
3. **Données** : Une entité `PurchaseRequest` enregistrée en base.

Résultat : L'utilisateur peut désormais soumettre une demande. Le système est incomplet, mais fonctionnel.

## Établir les critères d'acceptation
Comment savoir si une fonctionnalité est « terminée » ? Utilisez les critères d'acceptation (AC). Pour la soumission, l'AC serait : « Étant un utilisateur connecté, quand je soumets un nom d'article valide, alors le statut de la demande doit être 'PENDING' et enregistré en base ».

## Erreur courante : Le sur-ingénierie précoce
**Erreur** : Concevoir un « Moteur d'approbation » complexe gérant 10 rôles différents avant même qu'une seule demande ne soit soumise.
**Correction** : Codez la logique d'approbation du Manager en dur d'abord. Refactorisez vers un moteur générique seulement quand vous aurez réellement un deuxième ou troisième rôle à gérer.

## Exercice pratique
**Tâche** : Définissez une tranche verticale et deux règles métier pour la partie « Approbation Manager » de l'application.

**Correction** : 
- Tranche : Le Manager voit la liste des demandes → clique sur « Approuver » → le statut passe à 'APPROVED'.
- Règles : 1. Un Manager ne peut pas approuver sa propre demande. 2. Une demande ne peut être approuvée si elle a déjà été rejetée.
