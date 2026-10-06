---
title: "MCD vs Logical Data Model vs Physical Database"
description: "Un guide pour naviguer entre les trois étapes critiques de la conception de base de données, des règles métier à l'implémentation physique."
pubDate: 2026-10-08T09:48:00.000Z
translationKey: 042-mcd-vs-logical-data-model-vs-physical-database
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imaginez que vous créez un système d'achats. Votre responsable vous dit : 'Un demandeur peut soumettre plusieurs demandes, mais chaque demande appartient à un seul demandeur.' Si vous passez directement au SQL, vous risquez d'oublier des contraintes métier cruciales. C'est pourquoi on utilise un processus de modélisation en trois étapes.

## Le Modèle Conceptuel des Données (MCD)
Le MCD se concentre sur le 'quoi'. Il utilise des entités et des relations. Dans notre application, nous avons les entités `Demandeur` et `DemandeAchat`. La relation est 'Soumet'. On y définit les cardinalités : un Demandeur peut soumettre 0 à N demandes, alors qu'une Demande doit être soumise par exactement 1 Demandeur. Il n'y a pas encore de clés étrangères, seulement des règles métier.

## Le Modèle Logique de Données (MLD)
Le MLD traduit le MCD en une structure compréhensible par une base de données, peu importe le logiciel utilisé. C'est ici qu'apparaissent les clés primaires et étrangères. Si nous avons une relation plusieurs-à-plusieurs—par exemple, une `Demande` contient plusieurs `Produits` et un `Produit` peut être dans plusieurs `Demandes`—le MLD crée une 'entité d'association' (ex: `LigneDemande`) pour stocker des attributs comme la `quantité`.

## La Base de Données Physique (MPD)
Le MPD est l'implémentation concrète dans un système comme PostgreSQL ou MySQL. On y définit les types de données (`VARCHAR`, `INT`), les index pour la performance et les contraintes physiques comme le `NOT NULL`.

## Exemple concret : Flux d'achat

| Étape | Représentation |
| :--- | :--- |
| **MCD** | `Demandeur` --(Soumet)--> `DemandeAchat` |
| **MLD** | `Demandeur(id, nom)` → `DemandeAchat(id, date, demandeur_id)` |
| **MPD** | `CREATE TABLE DemandeAchat (id INT PRIMARY KEY, demandeur_id INT REFERENCES Demandeur(id))` |

## Erreur courante : Sauter le MCD
L'erreur classique est de passer directement au modèle physique. On oublie alors que les règles de gestion (comme l'optionalité) sont primordiales. Si vous oubliez qu'un `Manager` peut être optionnel pour certaines demandes, votre base de données bloquera les enregistrements sans manager.

## Exercice pratique
**Scénario :** Un `Acheteur` gère plusieurs `Commandes`, mais une `Commande` est gérée par un seul `Acheteur`.
**Question :** Quel modèle introduit la clé étrangère `acheteur_id` dans la table `Commandes` ?

**Réponse :** Le Modèle Logique de Données (MLD).
