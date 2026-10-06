---
title: "Roles vs Permissions"
description: "Apprenez à découpler l'identité de l'utilisateur des actions spécifiques pour construire un système d'autorisation évolutif."
pubDate: 2026-10-15T05:48:00.000Z
translationKey: 206-roles-vs-permissions
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Au début, vous créez un rôle 'Manager' et lui donnez accès à la page d'approbation. Plus tard, vous réalisez qu'un 'Acheteur Senior' doit également approuver des demandes, mais qu'il ne doit pas avoir accès aux rapports de paie du manager. Si vous n'utilisez que des rôles, vous finirez par créer des dizaines de rôles redondants comme 'ManagerAvecDroitsAcheteur', ce qui devient vite un cauchemar de maintenance.

## La Différence Conceptuelle
Les rôles sont essentiellement des collections de permissions. Un rôle répond à la question 'Qui êtes-vous dans l'organisation ?' (ex: Admin, Demandeur), tandis qu'une permission répond à 'Qu'avez-vous le droit de faire ?' (ex: `request:create`, `request:approve`). En assignant des permissions aux rôles, et des rôles aux utilisateurs, vous créez une couche d'abstraction qui rend votre politique de sécurité flexible.

## Mise en œuvre du Mécanisme
Dans une application Spring utilisant Jakarta EE, vous ne devriez pas vérifier les rôles directement dans votre logique métier. Vérifiez plutôt la permission spécifique requise pour l'action.

```java
// À éviter : if (user.hasRole("MANAGER")) { ... }

// Préférer : vérifier la permission spécifique
if (user.hasPermission("request:approve")) {
    approvalService.process(requestId);
}
```

## Exemple Concret : Flux d'Achats
Considérons ces mappings :
- **Rôle : Demandeur** → Permissions : `request:create`, `request:view_own`.
- **Rôle : Manager** → Permissions : `request:approve`, `request:view_all`.
- **Rôle : Acheteur** → Permissions : `order:place`, `request:view_all`.

Si un utilisateur est 'Manager', il peut approuver une demande car la permission `request:approve` est liée à son rôle. Si l'entreprise décide que les Acheteurs doivent aussi approuver les petites demandes, vous ajoutez simplement `request:approve` au rôle Acheteur sans modifier le code Java.

## Erreur Courante : L'Inflation des Rôles
Une erreur fréquente consiste à créer un nouveau rôle pour chaque cas particulier. Par exemple, créer un `ManagerRegional` et un `ManagerGlobal` simplement parce que leur périmètre de données diffère.

**Correction :** Gardez le rôle `Manager` et utilisez un attribut 'Scope' ou 'Tenant' distinct pour filtrer les données visibles, tout en conservant les mêmes permissions (`request:approve`).

## Exercice Pratique
**Scénario :** Vous devez ajouter un 'Auditeur de Conformité' qui peut voir toutes les demandes et commandes, mais ne peut rien créer ni approuver. Quelle approche est la meilleure ?
1. Créer un rôle 'Auditeur' et lui donner les permissions `request:view_all` et `order:view_all`.
2. Créer un rôle 'Auditeur' et lui attribuer le rôle 'Manager'.

**Réponse :** Option 1. Lui donner le rôle Manager lui accorderait incorrectement la permission `request:approve`.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
