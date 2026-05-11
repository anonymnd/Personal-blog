---
title: "Comptes Utilisateurs vs Organisations : Modéliser des Applications B2B"
description: "Apprenez à découpler les identités utilisateurs des entités professionnelles pour gérer le multi-tenancy dans les logiciels B2B."
pubDate: 2026-10-08T16:48:00.000Z
translationKey: 049-user-accounts-vs-organizations-how-to-model-b2b-applications
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Au début, vous pensez qu'un utilisateur *est* l'entreprise. Mais soudain, un besoin apparaît : un manager doit superviser trois filiales différentes avec une seule adresse e-mail. Si votre table `User` contient le `nom_entreprise`, vous êtes bloqué. C'est le problème classique de la modélisation B2B où l'identité (qui se connecte) diffère de l'organisation (qui possède les données).

## La Séparation Conceptuelle
Dans un modèle B2B, il faut séparer le **Compte Utilisateur** de l'**Organisation**. Le compte utilisateur gère l'authentification (email, mot de passe), tandis que l'organisation gère la logique métier (numéro SIRET, adresse de facturation, budgets). Le lien entre les deux est une relation d'appartenance.

## Conception de la Relation
Pour implémenter cela, vous avez besoin d'une entité de jointure, souvent appelée `Membership` ou `OrganizationUser`. Cette table ne se contente pas de lier des IDs ; elle stocke le contexte de la relation, comme le rôle de l'utilisateur au sein de cette entreprise spécifique.

| Entité | Responsabilité |
| :--- | :--- |
| Utilisateur | Authentification & Profil |
| Organisation | Identité Métier & Paramètres |
| Appartenance | Rôle & Permissions par Org |

## Exemple Concret : Flux d'Achats
Prenons un demandeur qui soumet une commande. Le système doit savoir non seulement qui est l'utilisateur, mais pour quelle organisation il agit.

```java
// Extrait illustratif du modèle de domaine
public class User {
    private Long id;
    private String email;
}

public class Organization {
    private Long id;
    private String companyName;
}

public class Membership {
    private Long userId;
    private Long organizationId;
    private String role; // ex: "MANAGER", "BUYER"
}
```
Lorsqu'une demande est créée, l'entité `PurchaseRequest` doit référencer l' `OrganizationId` et non seulement l' `UserId`. Ainsi, si un utilisateur quitte l'entreprise, les archives d'achats restent liées à l'organisation.

## Erreur Courante : L'ID d'Organisation Figé
Une erreur fréquente consiste à ajouter un `organization_id` directement dans la table `User`. Cela crée une relation 1:N, limitant l'utilisateur à une seule entreprise. La correction consiste à déplacer cette clé étrangère vers une table `Membership` pour permettre une relation M:N (Plusieurs-à-Plusieurs).

## Exercice Pratique
Si un utilisateur est 'Manager' dans l'Org A et 'Demandeur' dans l'Org B, où doit être placée la colonne `role` : dans la table `User`, `Organization` ou `Membership` ?

**Réponse :** Dans la table `Membership`, car le rôle dépend de la relation spécifique entre l'utilisateur et l'organisation.
