---
title: "Pourquoi votre base de données ne doit pas refléter votre UI"
description: "Découvrez pourquoi concevoir votre base de données selon vos maquettes mène à des systèmes rigides et comment découpler le modèle de données de l'interface."
pubDate: 2026-10-08T17:48:00.000Z
translationKey: 050-why-your-database-should-not-mirror-your-ui
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats. Votre interface possède un 'Formulaire de Demande' où l'utilisateur saisit son nom, son département et une liste d'articles. L'instinct d'un débutant est de créer une table `Demande` avec des colonnes comme `nom_demandeur` et `nom_departement`. C'est un piège : vous miroitez la mise en page de l'UI dans votre schéma.

## Distinguer interface et nouvelles règles métier
Réorganiser des champs, ajouter un tableau de bord ou modifier un filtre devrait surtout changer la présentation ou les requêtes. Une véritable évolution métier peut légitimement modifier le schéma : autoriser plusieurs demandeurs par demande change une relation, même si cela apparaît d'abord dans un formulaire. L'objectif est de modéliser les faits et règles durables, pas de promettre une base de données figée pour toujours.
## Modèle Conceptuel vs Mise en Page Physique
Dans la méthode Merise, on distingue le Modèle Conceptuel des Données (MCD) du modèle physique. Le MCD se concentre sur les règles métier, pas sur les écrans. Par exemple, un 'Demandeur' est une entité, et un 'Département' en est une autre. La relation entre eux est une règle métier (un demandeur appartient à un département), peu importe s'ils apparaissent sur le même écran.

## Exemple concret : Demandes d'achats
Au lieu d'une table plate, on utilise la normalisation.

**Mauvais (Miroir UI) :**
Table `Demandes` : `id`, `nom_article`, `nom_demandeur`, `nom_dept`.

**Correct (Normalisé) :**
- Table `Utilisateur` : `id`, `nom_complet`
- Table `Departement` : `id`, `nom_dept`
- Table `Demande` : `id`, `user_id` (FK), `dept_id` (FK), `date`
- Table `LigneDemande` : `id`, `demande_id` (FK), `produit`, `quantite`

En séparant ces éléments, si l'UI change pour devenir un tableau de bord par département, la base de données reste inchangée ; on utilise simplement une jointure SQL différente.

## Erreur courante : stocker un nom parce qu'il est affiché
Pour les informations actuelles d'un employé, stockez l'identifiant du manager. Le backend retrouve son nom et le fournit dans un DTO de réponse ; le navigateur affiche ce résultat sans interroger directement les tables. Une copie historique volontaire est différente : une facture peut conserver le nom du fournisseur au moment de son émission. Distinguez donnée courante et fait historique avant de choisir normalisation ou instantané.
## Exercice pratique
Scénario : Votre UI a une page 'Projet' qui affiche une liste de 'Tâches' et l' 'Employé' assigné à chacune.

Question : Devez-vous ajouter `nom_employe` dans la table `Tâches` ?

**Réponse :** Non. Ajoutez `employe_id` comme clé étrangère. Le nom appartient à la table `Employé` pour éviter la redondance et les anomalies de mise à jour.
