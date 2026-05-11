---
title: "Comment trouver les relations entre les entités de base de données"
description: "Apprenez à identifier et définir les connexions entre les entités de données en utilisant les règles métier et la cardinalité."
pubDate: 2026-10-08T05:48:00.000Z
translationKey: 038-how-to-find-relationships-between-database-entities
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imaginez que vous développez une application d'achats. Vous avez une liste d'« Employés » et une liste de « Demandes d'achat », mais vous bloquez : comment les lier logiquement pour que le système sache qui a demandé quoi ? C'est tout l'enjeu de la modélisation de données : traduire des règles métier en relations techniques.

## Identifier la règle métier
La première étape consiste à oublier la base de données et à observer le processus métier. Posez-vous la question : « Quelle est l'action qui relie ces deux éléments ? ». Dans notre application, un Employé *soumet* une Demande. Le verbe « soumet » représente la relation. Vous devez ensuite définir le sens et les contraintes. Est-ce que chaque demande nécessite un employé ? Oui. Un employé peut-il soumettre plusieurs demandes ? Oui.

## Comprendre la cardinalité
La cardinalité définit les contraintes numériques de la relation. On examine généralement les occurrences minimales et maximales :
- **Un-à-Plusieurs (1:N) :** Un Employé peut avoir plusieurs Demandes, mais une Demande appartient à un seul Employé.
- **Plusieurs-à-Plusieurs (M:N) :** Une Demande peut nécessiter l'approbation de plusieurs Managers, et un Manager approuve plusieurs Demandes.
- **Un-à-Un (1:1) :** Un Employé possède exactement un Compte Utilisateur.

## Le rôle de l'entité de jointure
Face à une relation Plusieurs-à-Plusieurs, on ne peut pas lier les tables directement. Il faut créer une « Entité de jointure » (table associative). Par exemple, pour lier `Demande` et `Approbateur`, on crée la table `Demande_Approbation`. Cette table stocke les IDs des deux entités et peut contenir des données supplémentaires, comme la `date_approbation`.

## Exemple concret : Flux d'achat
Modélisons le lien entre `Employé` et `DemandeAchat` :
- **Entité A :** `Employé` (id, nom)
- **Entité B :** `DemandeAchat` (id, article, montant)
- **Relation :** Un-à-Plusieurs. On place l' `employé_id` comme clé étrangère dans la table `DemandeAchat`.

**Résultat :** La requête `SELECT * FROM DemandeAchat WHERE employé_id = 101` retourne toutes les demandes de cette personne.

## Erreur courante : Le sur-maillage
Une erreur fréquente est de créer une relation M:N alors qu'une relation 1:N suffit. Par exemple, créer une table de jointure pour `Employé` et `Département` alors qu'un employé ne peut appartenir qu'à un seul département. Cela complexifie inutilement les requêtes.

## Exercice pratique
**Scénario :** Un `Acheteur` passe une `Commande`, et une `Commande` peut contenir plusieurs `Produits`. Un `Produit` peut figurer dans plusieurs `Commandes`.
**Question :** Quel type de relation existe entre `Commande` et `Produit`, et que faut-il pour l'implémenter ?

**Réponse :** C'est une relation Plusieurs-à-Plusieurs (M:N). Il faut une entité de jointure (ex: `Ligne_Commande`) pour les lier.
