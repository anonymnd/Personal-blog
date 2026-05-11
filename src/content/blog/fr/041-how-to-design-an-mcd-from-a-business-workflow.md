---
title: "Comment concevoir un MCD à partir d'un flux métier"
description: "Apprenez à transformer des processus métier réels en un modèle conceptuel de données en utilisant la méthode Merise."
pubDate: 2026-10-08T08:48:00.000Z
translationKey: 041-how-to-design-an-mcd-from-a-business-workflow
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Beaucoup de débutants éprouvent des difficultés lors du passage d'un processus métier écrit à un schéma de base de données. Ils commencent souvent par créer des tables immédiatement, pour réaliser plus tard qu'ils ont oublié une relation critique ou dupliqué des données. Le secret réside dans le MCD (Modèle Conceptuel des Données), qui se concentre sur *ce que* sont les données, et non sur *comment* elles sont stockées.

## Identifier les entités métier et leurs identifiants
Cherchez des objets avec une identité et un cycle de vie, sans transformer chaque nom en entité. Dans une application d'achats, Demandeur, Manager et Acheteur peuvent être des rôles du même Employé. DemandeAchat, Produit et Commande sont d'autres entités candidates. À ce stade conceptuel, un identifiant distingue une occurrence d'une autre ; il ne définit pas encore le type d'une clé primaire SQL. Une demande peut aussi porter une date de création et un montant estimé.
## Déduire les participations des règles métier
Posez la question dans les deux sens. Un employé peut soumettre zéro à plusieurs demandes ; chaque demande soumise a exactement un demandeur. Un manager peut approuver plusieurs demandes, alors qu'une demande en attente n'a pas encore d'approbateur. Avec une seule approbation possible, une demande participe donc à zéro ou une association d'approbation. Si plusieurs approbations sont nécessaires, modélisez explicitement cette autre règle et changez les cardinalités.
## Placer les attributs des associations
La quantité appartient à l'association entre une demande et un produit : le même produit peut apparaître dans plusieurs demandes avec des quantités différentes. Cette association plusieurs-à-plusieurs devient généralement une table LigneDemande dans le modèle logique. Un attribut d'association n'impose pourtant pas toujours une table séparée. Si une demande possède au maximum une approbation, l'identifiant de l'approbateur et la date peuvent être stockés sur Demande. Une entité Approbation distincte devient utile pour plusieurs occurrences, un historique ou un statut propre.
## Exemple avec les cardinalités Merise
Les nombres à l'extrémité d'une entité indiquent combien de fois une occurrence de cette entité participe à l'association. Pour ce processus volontairement simplifié :

```text
Employé (0,N) -- soumet   -- Demande (1,1)
Manager (0,N) -- approuve -- Demande (0,1)
Demande (0,N) -- contient -- Produit (0,N)
                [quantité : attribut de l'association]
```

La dernière règle autorise un brouillon vide et des produits jamais demandés. La soumission peut exiger au moins une ligne : c'est alors une règle liée à l'état de la demande. Manager représente ici un rôle d'Employé, pas nécessairement une entité stockée séparément. Notez ces hypothèses à côté du modèle pour les distinguer des règles générales.
## Erreur courante : Mélanger les niveaux
Une erreur fréquente est d'ajouter des clés étrangères (comme `manager_id`) directement dans le MCD. Le MCD est conceptuel ; il utilise des lignes de relation, pas des colonnes. Les clés étrangères n'apparaissent que dans le Modèle Logique de Données (MLD).

## Exercice pratique
**Scénario** : Un outil de gestion de projet où un Projet possède plusieurs Tâches, et une Tâche appartient à exactement un Projet.
**Question** : Identifiez les entités et la cardinalité de la relation.

**Réponse** : Entités : `Projet` et `Tâche`. Relation : `Projet` (0,N) <--- (1,1) `Tâche`.
