---
title: "Comment rédiger des cas d'utilisation sans les complexifier"
description: "Apprenez à documenter les interactions système en vous concentrant sur les acteurs et les objectifs plutôt que sur l'implémentation technique."
pubDate: 2026-10-07T08:48:00.000Z
translationKey: 017-how-to-write-use-cases-without-making-them-complicated
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Beaucoup de développeurs commencent à rédiger des cas d'utilisation en décrivant chaque clic de bouton ou mise à jour de base de données. Cela mène à une surcharge de spécifications, rendant le document impossible à maintenir. Le secret de la simplicité est de se concentrer sur l'objectif de l'acteur, et non sur le mécanisme du logiciel.

## Distinguer Acteur, Utilisateur et Entité
Avant d'écrire, il faut définir qui interagit avec le système. Un **Acteur** est un rôle (ex: 'Responsable Achats'), pas une personne spécifique. Un **Utilisateur** est le détenteur du compte qui se connecte. Une **Entité de Domaine** est l'objet manipulé (ex: 'Demande d'Achat'). Confondre ces notions crée des erreurs ; par exemple, une 'Demande' ne peut pas être un acteur car elle ne peut pas initier d'action.

## Le Chemin Nominal et les Chemins Alternatifs
Un bon cas d'utilisation décrit le 'Happy Path' (chemin nominal) : la séquence idéale où tout se passe bien. Cependant, le logiciel réel rencontre des erreurs. Vous devez documenter les 'Unhappy Paths' (flux alternatifs), comme lorsqu'un manager rejette une demande ou qu'un acheteur constate qu'un article est en rupture de stock.

## Exemple concret : Demande d'achat
Considérons un flux de procurement simple :
- **Acteur** : Demandeur
- **Objectif** : Soumettre une demande pour un nouvel ordinateur.
- **Flux Principal** :
  1. Le Demandeur remplit le formulaire de demande.
  2. Le système vérifie la disponibilité du budget.
  3. Le système notifie le Manager pour approbation.
- **Flux Alternatif (Budget dépassé)** :
  2a. Le système alerte le Demandeur que le montant dépasse la limite.
  2b. Le Demandeur modifie la demande ou l'annule.

## Erreur courante : Ajouter des détails techniques
Une erreur fréquente est d'écrire : "L'utilisateur clique sur le bouton Envoyer, ce qui déclenche une requête POST vers /api/requests." C'est trop précis. Si l'interface change pour une commande vocale, votre cas d'utilisation devient obsolète. Écrivez plutôt : "Le Demandeur soumet la demande."

## Exercice pratique
**Scénario** : Un Manager doit approuver une demande d'achat. Rédigez une étape du chemin nominal et une étape d'un chemin alternatif.

**Correction** :
- Chemin nominal : Le Manager examine la demande et la marque comme 'Approuvée'.
- Chemin alternatif : Le Manager rejette la demande car la justification est insuffisante.
