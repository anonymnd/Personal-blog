---
title: "Comment comprendre un flux métier avant de concevoir le backend"
description: "Apprenez à cartographier les processus métier et à identifier les acteurs et entités pour éviter des refontes architecturales coûteuses."
pubDate: 2026-10-07T02:48:00.000Z
translationKey: 011-how-to-understand-a-business-workflow-before-designing-the-backend
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Imaginez que vous commenciez à coder un système d'achat dès que vous entendez : « les employés doivent pouvoir demander des ordinateurs ». Vous créez une table simple et une API, pour découvrir une semaine plus tard que les demandes nécessitent l'approbation d'un manager, une vérification budgétaire et la confirmation d'un acheteur. Votre schéma de base de données est désormais obsolète car vous avez ignoré les transitions d'état de la logique métier.

## Distinguer Acteurs et Utilisateurs
Une erreur courante consiste à traiter chaque personne comme un objet « Utilisateur ». Dans un flux, vous devez distinguer l'**Acteur** (le rôle interagissant avec le système) de l'**Utilisateur** (l'identité du compte). Par exemple, dans une application d'achat, le « Demandeur » et l'« Approbateur » sont des Acteurs. Une seule personne peut cumuler les deux rôles, mais la logique métier s'intéresse au rôle, pas à l'individu.

## Cartographier les Entités du Domaine
Les entités sont les « objets » que l'entreprise suit. Alors qu'un Utilisateur est une identité, une `DemandeAchat` est une entité de domaine. Elle a un cycle de vie : *Brouillon* → *En attente* → *Commandé* → *Reçu*. Comprendre ces états évite de créer un système rigide incapable de gérer une demande « Rejetée ».

## Capturer les Chemins d'Échec (Unhappy Paths)
La plupart des développeurs ne conçoivent que le « chemin nominal ». Un backend robuste doit prévoir :
1. **Échecs d'autorisation** : Que se passe-t-il si un demandeur tente d'approuver sa propre demande ?
2. **Contraintes métier** : Que faire si le budget est dépassé ?
3. **Délais** : Que se passe-t-il si un manager n'approuve pas la demande pendant 10 jours ?

## Exemple Concret : Flux d'Achat
Considérons cette logique simplifiée :
- **Acteur : Demandeur** → crée une `DemandeAchat` (État : PENDING).
- **Acteur : Manager** → vérifie le budget ; si OK, passe l'état à APPROVED.
- **Acteur : Acheteur** → commande chez le fournisseur ; passe l'état à ORDERED.

Si vous vous contentez d'une table `Request` avec une colonne `status`, vous pourriez oublier l'entité `ApprovalLog` nécessaire pour l'audit (qui a approuvé quoi et quand).

## Erreur Courante : Sauter vers les Tables
**Erreur** : Créer immédiatement une table `Users` et une table `Requests`.
**Correction** : D'abord, dessinez un schéma du processus. Définissez les transitions. Ensuite seulement, décidez si vous avez besoin d'une table `Role` ou d'un enum `State`.

## Exercice Pratique
**Scénario** : Un système de bibliothèque où un membre emprunte un livre, mais cela doit être approuvé par un bibliothécaire si le livre est « Rare ».
**Question** : Identifiez les Acteurs et l'Entité de Domaine.
**Réponse** : Acteurs : Membre, Bibliothécaire. Entité de Domaine : DemandeEmprunt (avec des états comme EnAttente, Approuvé, Emprunté).
