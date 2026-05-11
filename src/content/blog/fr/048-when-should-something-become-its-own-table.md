---
title: "Quand faut-il créer une table distincte ?"
description: "Apprenez à identifier le moment où un attribut de donnée doit devenir une table séparée pour garantir la normalisation et l'évolutivité de la base de données."
pubDate: 2026-10-08T15:48:00.000Z
translationKey: 048-when-should-something-become-its-own-table
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats. Vous commencez par une table `DemandeAchat` et ajoutez une colonne `service_demandeur`. Au début, cela semble correct. Mais vous réalisez ensuite que vous devez stocker le budget du service, son responsable et sa localisation. Si vous continuez à ajouter ces informations comme colonnes dans la table de demande, vous répétez les mêmes données pour chaque demande, ce qui entraîne des redondances massives et des anomalies de mise à jour.

## La règle de l'atomicité et de la redondance
Une donnée doit devenir sa propre table lorsqu'elle représente une entité distincte avec ses propres propriétés, plutôt qu'un simple attribut d'un autre objet. Si vous remarquez que vous répétez un groupe de champs liés (comme le Nom du service, le Code et le Responsable) sur plusieurs lignes, vous avez une 'dépendance transitive'. C'est le signal clair qu'il faut normaliser ces données dans une table séparée.

## Gérer les relations Un-à-Plusieurs
Lorsqu'une entité peut être associée à plusieurs instances d'une autre, une table séparée est obligatoire. Dans notre application, un `Acheteur` peut gérer plusieurs `DemandesAchat`. Bien que la table `DemandeAchat` contienne une clé étrangère vers l'acheteur, les détails de l'acheteur (email, téléphone) doivent résider dans leur propre table `Acheteur`. Cela évite l'inflation de la base de données et garantit qu'une modification de numéro de téléphone se fait à un seul endroit.

## La nécessité des entités d'association
Parfois, la relation elle-même possède des attributs. Si un `Manager` approuve une `DemandeAchat` et que vous devez enregistrer la *date d'approbation* et les *commentaires*, vous ne pouvez pas stocker cela dans la table Manager ou Demande sans créer de confusion. On crée alors une entité de jointure (ex: `Approbation`) qui lie les deux et stocke les métadonnées de l'interaction.

## Exemple concret : Du plat au normalisé
**Design initial (plat) :**
`Demande(id, article, prix, nom_service, manager_service)`

**Design normalisé :**
1. `Service(id_service, nom, manager)`
2. `Demande(id, article, prix, id_service)`

**Résultat :** Si le responsable du service change, vous mettez à jour une seule ligne dans la table `Service` au lieu de parcourir des milliers de demandes.

## Erreur courante : La sur-normalisation
Une erreur fréquente consiste à créer des tables pour chaque attribut (ex: une table pour le `Genre` ou le `Statut`). Si l'attribut est une simple étiquette sans autres propriétés, une colonne ou une Enum suffit. Ne créez une table que si l'attribut possède sa propre identité et des données liées.

## Exercice pratique
Vous avez une table `Projet` et vous voulez suivre le `Client` propriétaire du projet. Vous devez stocker le numéro de TVA et l'adresse du client. Le `Client` doit-il être une colonne ou une table ?

**Réponse :** Une table séparée, car le client possède plusieurs attributs (TVA, Adresse) qui seraient redondants s'ils étaient répétés pour chaque projet.
