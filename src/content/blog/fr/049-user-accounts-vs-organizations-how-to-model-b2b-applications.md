---
title: "Modélisation des Utilisateurs, Organisations et Adhésions"
description: "Analyse approfondie du multi-tenant B2B où les utilisateurs appartiennent à plusieurs organisations avec une unicité scoped au tenant."
pubDate: 2026-10-07T00:48:00.000Z
translationKey: 049-user-accounts-vs-organizations-how-to-model-b2b-applications
seriesOrder: 9
locale: fr
tags: ["database-design","learning-series"]
draft: false
---

## Le Défi de l'Adhésion Multi-Tenant

Dans les logiciels B2B, une erreur courante consiste à traiter l'Utilisateur comme un simple enfant d'une Organisation. Cela échoue lorsqu'un consultant travaille pour plusieurs entreprises simultanément. Pour supporter cela, nous devons découpler l'identité (Utilisateur) du contexte organisationnel (Organisation) via une entité d'adhésion explicite.

Imaginons un consultant qui appartient à deux cabinets différents. Chaque cabinet a ses propres contacts de facturation et listes de projets. Le consultant doit basculer entre ces contextes, et son identité (email/mot de passe) reste globale, mais ses accès et détails de profil peuvent varier selon le tenant.

## Le Modèle Logique

Pour implémenter cela, nous utilisons une relation Plusieurs-à-Plusieurs résolue par une entité de jointure. Cela nous permet de stocker des métadonnées sur la relation elle-même, comme la date d'adhésion ou le statut spécifique au tenant.

### Définition des Entités
- **User** : Identité globale (ex: `userId`, `email`, `passwordHash`).
- **Organization** : L'entité tenant (ex: `orgId`, `companyName`, `billingAddress`).
- **Membership** : Le lien entre les deux (ex: `membershipId`, `userId`, `orgId`, `joinedAt`).

### Unicité Scopée au Tenant
Une exigence critique est de s'assurer que certains attributs sont uniques *uniquement au sein d'un tenant*. Par exemple, un utilisateur peut avoir un "Nom d'utilisateur" ou un "ID Employé" spécifique au sein de l'Entreprise A, qui pourrait chevaucher un ID dans l'Entreprise B. Cet attribut doit se trouver dans l'entité `Membership`, et non dans l'entité `User`.

## Exemple Concret : Le Scénario du Consultant

Traçons les données pour une consultante, Sarah, qui travaille pour "TechCorp" et "DesignStudio".

### Trace des Données

**Table Users**
| userId | email |
| :--- | :--- |
| U1 | sarah@email.com |

**Table Organizations**
| orgId | companyName |
| :--- | :--- |
| O1 | TechCorp |
| O2 | DesignStudio |

**Table Memberships**
| membershipId | userId | orgId | tenantUsername |
| :--- | :--- | :--- | :--- |
| M1 | U1 | O1 | sarah_tech |
| M2 | U1 | O2 | sarah_design |

### Vérification des Ressources du Tenant
Lorsque Sarah demande un projet, le système ne doit pas simplement vérifier si elle est une utilisatrice. Il doit vérifier le lien d'adhésion.

**Flux Logique :**
1. Requête reçue : `GET /projects/{projectId}`
2. Le système identifie l' `orgId` associé au `{projectId}`.
3. Le système interroge : `SELECT 1 FROM memberships WHERE userId = :currentUserId AND orgId = :projectOrgId`.
4. Si aucun enregistrement n'existe, l'accès est refusé, même si Sarah est une utilisatrice valide du système.

## Cas d'Échec

- **La Fuite Globale** : Stocker l' `orgId` directement sur l'entité `Project` mais oublier de vérifier la table `Membership` lors de la requête. Cela permet à n'importe quel utilisateur authentifié d'accéder à n'importe quel projet s'il devine l'ID.
- **La Collision d'Identité** : Placer le `tenantUsername` dans la table `User`. Cela empêche Sarah d'avoir des alias différents selon ses deux entreprises.
- **L'Adhésion Orpheline** : Supprimer une Organisation sans supprimer en cascade les adhésions, laissant des utilisateurs liés à des tenants inexistants.

## Exercice

**Scénario** : Vous devez ajouter une "Date d'adhésion" et un "Statut d'adhésion" (Actif/En attente) au modèle. Où ces attributs doivent-ils se trouver, et pourquoi ?

**Réponse** : Les deux appartiennent à l'entité `Membership`. La "Date d'adhésion" est spécifique au moment où l'utilisateur a rejoint une organisation *particulière*, et non au moment de la création du compte utilisateur. Le "Statut" est spécifique au tenant ; un utilisateur peut être "Actif" dans l'Entreprise A mais "En attente" dans l'Entreprise B.
