---
title: "Entité vs Attribut : Comment Décider ?"
description: "Apprenez les critères fondamentaux pour distinguer une entité autonome d'un simple attribut lors de la modélisation conceptuelle de données."
pubDate: 2026-10-08T04:48:00.000Z
translationKey: 037-entity-vs-attribute-how-do-you-decide
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imaginez que vous concevez un système d'achats. Vous avez une 'Demande d'Achat' et vous devez gérer le 'Service' auquel elle appartient. Le 'Service' doit-il être une simple colonne de texte (attribut) dans la table des demandes, ou sa propre table (entité) ? C'est le dilemme le plus courant du Modèle Conceptuel des Données (MCD).

## La Règle de l'Indépendance
Un attribut est une propriété qui décrit une entité ; il ne peut exister sans elle. Par exemple, la `dateDemande` d'un achat est un attribut car elle n'a aucun sens en dehors de cette demande précise. Une entité, en revanche, possède sa propre identité et ses propres propriétés. Si vous devez stocker le budget du service, son responsable et sa localisation, le service n'est plus une simple étiquette—c'est une entité.

## Le Test de la Multiplicité
Posez-vous la question : 'Cette valeur est-elle partagée entre plusieurs enregistrements et possède-t-elle ses propres attributs ?'. Si vous stockez seulement le nom 'Service Informatique' sous forme de chaîne de caractères, vous risquez des incohérences (ex: 'IT' vs 'Informatique'). En en faisant une entité, vous créez une source de vérité unique. Si un service peut exister même si aucune demande d'achat n'a encore été soumise, c'est obligatoirement une entité.

## Exemple Concret : App d'Achats
Comparons les deux approches dans un modèle conceptuel :

**Approche A (Attribut) :**
`DemandeAchat` { idDemande, montant, nomService }

**Approche B (Entité) :**
`DemandeAchat` { idDemande, montant } → appartient à → `Service` { idService, nomService, budget }

Dans l'approche B, si le manager change le nom du service, vous le modifiez à un seul endroit, et non dans chaque demande. L' `idService` deviendra une clé étrangère dans le modèle logique.

## Erreur Courante : Le Piège de la Table Plate
Les débutants ajoutent souvent tout comme attributs pour éviter les jointures. Par exemple, mettre `adresseFournisseur` et `telFournisseur` directement dans l'entité `Commande`.
**Correction :** Puisqu'un fournisseur existe indépendamment d'une commande unique, créez une entité `Fournisseur`. Cela évite la redondance et garantit que la mise à jour d'un téléphone ne nécessite pas de modifier des milliers de lignes de commandes.

## Exercice Pratique
Scénario : Vous ajoutez la 'Catégorie de Produit' à votre application. Vous devez stocker le nom de la catégorie et une description. 'Catégorie' est-elle une entité ou un attribut ?

**Réponse :** C'est une entité, car elle possède ses propres propriétés (description) et est partagée entre plusieurs produits.
