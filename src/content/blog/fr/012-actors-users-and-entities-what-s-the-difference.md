---
title: "Distinguer Acteurs, Comptes et Entités de Domaine"
description: "Apprenez à séparer les rôles d'interaction, les identités d'authentification et les objets métier via un scénario de consignes automatiques."
pubDate: 2026-10-06T18:48:00.000Z
translationKey: 012-actors-users-and-entities-what-s-the-difference
seriesOrder: 3
locale: fr
tags: ["business-workflows","learning-series"]
draft: false
---

## La Frontière Conceptuelle

Une erreur courante en conception logicielle consiste à fusionner l'« Utilisateur » en un objet unique gérant l'authentification, la logique métier et l'interaction système. Pour bâtir un système évolutif, il faut découpler trois concepts distincts : l'Acteur, le Compte et l'Entité de Domaine.

1. **L'Acteur** : Une entité externe qui interagit avec le système pour atteindre un objectif. Les acteurs sont des rôles, pas des personnes. Un acteur peut être un humain (ex: un Coursier) ou un système externe (ex: une Passerelle de Paiement).
2. **Le Compte** : Le principal de sécurité. C'est l'identité utilisée pour l'authentification (email/mot de passe, clé API) et l'autorisation (permissions).
3. **L'Entité de Domaine** : Un objet possédant une identité métier unique qui persiste dans le temps, indépendamment de qui interagit avec lui. Par exemple, un « Colis » est une entité ; il existe que le coursier soit en train de le scanner ou non.

## Scénario Appliqué : Le Système de Consignes

Choisissez le backend comme frontière du système. Expéditeur, coursier et destinataire interagissent avec lui dans des rôles distincts. La borne se trouve aussi hors de cette frontière et appelle son API. Si le système modélisé englobe toute la consigne physique, la borne peut devenir un composant interne : la classification des acteurs dépend de la frontière.

Une personne peut expédier un colis personnel et livrer des colis professionnels avec le même compte stable. À l’inverse, un destinataire peut retirer un colis avec un code à usage unique sans créer de compte. Ce code est un justificatif d’accès ou une capacité, pas un compte. L’application vérifie sa validité et son droit sur le colis concerné avant de changer l’état du colis et de la case.
## Artefact d'Implémentation : Modèle d'Identité basé sur les Rôles

Pour une revue de conception, préparez un inventaire conceptuel avant de créer une classe par acteur.

| Élément | Classification | Conséquence |
| --- | --- | --- |
| Expéditeur | Rôle d’acteur | Décrit un objectif à la frontière choisie |
| Compte A101 | Compte stable | Une personne peut l’utiliser dans plusieurs rôles |
| Code de retrait | Justificatif/capacité | Prouve un droit limité sans créer un compte |
| Colis P52 | Entité de domaine | Conserve son identité métier pendant la livraison |
| Case S8 | Entité de domaine | Possède une identité et un état d’occupation |
| Borne appelant le backend | Acteur système externe pour cette frontière | Initie une interaction avec l’API |

Un même objet réel peut apparaître dans plusieurs vues. Une borne peut être un acteur externe dans un modèle d’interactions et avoir une fiche d’inventaire dans le domaine. Chaque rôle ne doit pas devenir une sous-classe de User ; chaque entité métier n’a pas besoin d’un compte de connexion.
## Cas d'Échec et Cas Limites

Quand une personne est coursier et destinataire, distinguez le rôle exercé du colis auquel elle peut accéder. Un rôle ne prouve pas la propriété. Pour un invité utilisant un code de retrait, contrôlez l’expiration et le colis concerné sans traiter le code comme un compte durable. Si la frontière du système change, revoyez la liste des acteurs. Ces décisions de modélisation n’imposent pas une implémentation particulière de l’authentification.
## Exercice

Un technicien doit ouvrir une case pour réparation et consulter des diagnostics, mais ne doit pas accéder aux coordonnées du destinataire dans l’application. Identifiez acteur, compte et entités concernées.

**Vérification :** MaintenanceTechnician est un rôle d’acteur ; le technicien peut utiliser un compte employé. LockerSlot est l’entité concernée. Une règle d’autorisation contrôle l’ouverture et les diagnostics, sans exposer les coordonnées du destinataire. L’accès physique demande des mesures opérationnelles distinctes : cacher un champ API ne garantit pas qu’une personne ayant accès à la case ne puisse inspecter le colis.
