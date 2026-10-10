---
title: "Normaliser une Base de Données sans Perdre le Sens Métier"
description: "Utilisation des dépendances fonctionnelles pour éliminer les anomalies tout en préservant les instantanés historiques dans les factures de réparation."
pubDate: 2026-10-06T23:48:00.000Z
translationKey: 047-what-is-database-normalization-and-why-should-you-care
seriesOrder: 8
locale: fr
tags: ["database-design","learning-series"]
draft: false
---

## Le Danger de la Redondance

Lorsqu'une table stocke plusieurs faits distincts dans une seule ligne, elle génère des anomalies de mise à jour, d'insertion et de suppression. Prenons une table `FactureReparation` contenant : `IDFacture`, `IDClient`, `TelClient`, `IDPiece`, `NomFournisseur`, `TelFournisseur` et `PrixFacturé`.

Dans cette structure, le `TelClient` dépend uniquement de l' `IDClient`, et le `TelFournisseur` dépend uniquement de l' `IDPiece` (en supposant un fournisseur par pièce). Ce sont des dépendances fonctionnelles. Comme ces informations sont répétées à chaque facture, nous rencontrons trois risques :

1. **Anomalie de Mise à Jour** : Si un client change de numéro, il faut modifier chaque facture historique. Un oubli crée une incohérence des données.
2. **Anomalie d'Insertion** : Impossible d'enregistrer les coordonnées d'un nouveau fournisseur tant qu'on n'a pas vendu une de ses pièces sur une facture.
3. **Anomalie de Suppression** : Supprimer la seule facture contenant une pièce spécifique entraîne la perte totale des coordonnées du fournisseur.

## Distinguer l'État de l'Historique

Une erreur courante lors de la normalisation est de supprimer des données qui semblent redondantes mais sont en réalité des instantanés (snapshots) historiques.

Dans notre scénario, le `PrixFacturé` semble dépendre de l' `IDPiece`. Cependant, les prix évoluent. Si vous déplacez le prix vers une table `Pieces` et le supprimez de la `LigneFacture`, modifier le prix aujourd'hui modifiera rétroactivement le total d'une facture d'il y a trois ans. C'est une perte de sens métier.

- **Données Dynamiques** : Le téléphone du client (état actuel).
- **Données Snapshot** : Le prix au moment de la vente (fait historique).

## Solution Travaillée : Le Plan de Normalisation

Pour résoudre les anomalies tout en préservant le prix, nous décomposons la table selon les dépendances fonctionnelles.

### 1. Identification des Dépendances
- `IDFacture` → `IDClient`, `DateFacture`
- `IDClient` → `TelClient`
- `IDPiece` → `IDFournisseur`, `NomPiece`
- `IDFournisseur` → `NomFournisseur`, `TelFournisseur`
- `(IDFacture, IDPiece)` → `PrixFacturé` (Le prix est lié à la transaction, pas seulement à la pièce).

### 2. Schéma Résultant (Modèle Logique)

- **Clients** : (`IDClient` [PK], `TelClient`)
- **Fournisseurs** : (`IDFournisseur` [PK], `NomFournisseur`, `TelFournisseur`)
- **Pieces** : (`IDPiece` [PK], `NomPiece`, `IDFournisseur` [FK])
- **Factures** : (`IDFacture` [PK], `IDClient` [FK], `DateFacture`)
- **LignesFacture** : (`IDFacture` [FK], `IDPiece` [FK], `PrixFacturé`) → PK Composite (`IDFacture`, `IDPiece`)

### 3. Analyse du Résultat
En séparant les tables, nous traitons les anomalies :
- **Mise à jour** : On change le téléphone une seule fois dans la table `Clients`.
- **Insertion** : On ajoute un fournisseur sans avoir besoin de facture.
- **Suppression** : On supprime une ligne de facture sans perdre l'existence du fournisseur.
- **Intégrité** : Le `PrixFacturé` reste dans `LignesFacture`, garantissant que les archives sont immuables malgré les hausses de prix futures.

## Exercice

**Scénario** : Vous avez une table `AffectationProjet` : `IDProjet`, `NomProjet`, `IDEmploye`, `NomEmploye`, `Role`, et `TauxHoraire`. Le `TauxHoraire` est négocié spécifiquement pour cette affectation, et non le salaire général de l'employé.

**Tâche** : Identifiez les dépendances fonctionnelles et précisez quels champs doivent rester dans l'entité de jointure pour ne pas perdre le sens métier.

**Réponse** :
- Dépendances : `IDProjet` → `NomProjet` ; `IDEmploye` → `NomEmploye`.
- Le `Role` et le `TauxHoraire` dépendent de la combinaison `(IDProjet, IDEmploye)`.
- Pour préserver le sens métier, le `TauxHoraire` doit rester dans l'entité de jointure `AffectationProjet` car c'est un snapshot de l'accord pour ce projet précis, et non un attribut global de l'employé.

La clé de ligne suppose une occurrence de chaque pièce par facture ; utilisez un identifiant de ligne distinct si une pièce peut apparaître à plusieurs prix. Le prix facturé conserve son sens indépendamment du catalogue, sans rendre techniquement la ligne immuable. Contrôlez séparément les modifications de l’historique.
