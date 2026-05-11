---
title: "Comment identifier les acteurs d'une application"
description: "Apprenez à distinguer les acteurs, les utilisateurs et les entités pour établir une base précise de la logique métier de votre application."
pubDate: 2026-10-07T04:48:00.000Z
translationKey: 013-how-to-identify-the-actors-of-an-application
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Imaginez que vous deviez créer un système d'achats. Vous commencez par lister « l'Employé » et « la Demande » comme acteurs principaux. Soudain, vous réalisez que vous mélangez des personnes et des données. C'est un obstacle courant : confondre l'acteur (celui qui déclenche l'action) avec l'entité (ce sur quoi on agit) ou l'utilisateur (le compte technique).

## Acteur vs Utilisateur vs Entité
Un acteur est un rôle joué par une entité externe qui interagit avec votre système pour atteindre un objectif. Ce n'est pas une personne spécifique, mais un rôle fonctionnel. Un *utilisateur* est l'implémentation technique d'un acteur (un compte avec mot de passe). Une *entité* est un objet métier (comme une Facture) qui existe dans le système mais ne peut rien « faire » seule.

| Concept | Nature | Exemple | Action |
| :--- | :--- | :--- | :--- |
| Acteur | Rôle | Responsable Achats | Approuve une demande |
| Utilisateur | Compte | jean_dupont_88 | Se connecte au système |
| Entité | Donnée | Demande d'Achat | Passe au statut 'Approuvé' |

## Cartographie du flux d'achats
Dans une application de procurement, on identifie les acteurs en regardant qui initie un processus.
1. **Demandeur** : La personne qui a besoin d'un outil et soumet une demande.
2. **Manager** : La personne qui vérifie le budget et donne son accord.
3. **Acheteur** : La personne qui contacte le fournisseur pour passer commande.
4. **Système Fournisseur** : Une API qui envoie une notification d'expédition (un acteur peut être un autre système).

## Exemple concret : Le déclencheur d'approbation
Action : « Approuver la demande d'achat ».
- **Acteur** : Manager.
- **Objectif** : S'assurer que la dépense respecte le budget.
- **Résultat** : Le statut de la demande passe de `PENDING` à `APPROVED`.
- **Cas d'échec (Unhappy Path)** : Le Manager rejette la demande. Le système doit alors notifier le Demandeur.

## Erreur courante : L'acteur « Système »
Les débutants listent souvent « Le Système » comme acteur. Le système est ce que vous construisez ; il ne peut pas être son propre acteur. Si le système effectue une tâche planifiée (comme un rapport nocturne), l'acteur est en réalité un **Timer** ou un **Planificateur**.

## Exercice pratique
Scénario : Une application de bibliothèque où un membre emprunte un livre et un bibliothécaire gère le stock.
**Question** : Identifiez les acteurs et une entité.
**Réponse** : Acteurs : Membre, Bibliothécaire. Entité : Livre.
