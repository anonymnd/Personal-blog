---
title: "Qu'est-ce que le Contrôle d'Accès Basé sur les Rôles (RBAC) ?"
description: "Un guide pour débutants sur la gestion des permissions utilisateurs en les regroupant par rôles plutôt qu'individuellement."
pubDate: 2026-10-15T06:48:00.000Z
translationKey: 207-what-is-role-based-access-control
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Vous avez cinquante employés, et chacun a besoin de permissions différentes. Si vous attribuez manuellement 'peut_approuver_budget' ou 'peut_creer_commande' à chaque utilisateur, vous finirez par faire une erreur, donnant à un employé junior le pouvoir d'approuver sa propre demande d'un million d'euros. Ce chaos manuel est la raison pour laquelle nous utilisons le RBAC.

## Le Mécanisme Central du RBAC
Le RBAC introduit une couche intermédiaire entre l'utilisateur et la permission. Au lieu de mapper Utilisateur → Permission, nous mappons Utilisateur → Rôle → Permission. Un rôle est essentiellement un ensemble de permissions. Lorsqu'un utilisateur se voit attribuer un rôle, il hérite de toutes les permissions qui y sont associées. Cela rend la gestion évolutive ; si la politique de l'entreprise change, vous mettez à jour le rôle une seule fois, et tous les utilisateurs affectés sont mis à jour instantanément.

## Le RBAC en Action : Application d'Achats
Dans notre système d'achats, nous définissons trois rôles distincts :

| Rôle | Permissions |
| :--- | :--- |
| Demandeur | `CREATE_REQUEST`, `VIEW_OWN_REQUESTS` |
| Manager | `APPROVE_REQUEST`, `VIEW_DEPARTMENT_REQUESTS` |
| Acheteur | `PLACE_ORDER`, `UPDATE_VENDOR_STATUS` |

Si Sarah est Manager, elle reçoit le rôle `MANAGER`. Lorsqu'elle tente d'accéder au point de terminaison `/approve`, le système vérifie si son rôle contient la permission `APPROVE_REQUEST`. Si oui, l'accès est accordé.

## Exemple d'Implémentation
Dans une application Java Spring utilisant Jakarta security, vous pourriez protéger une méthode ainsi :

```java
@Service
public class ProcurementService {
    @PreAuthorize("hasRole('MANAGER')")
    public void approveRequest(Long requestId) {
        // Logique pour approuver la demande d'achat
    }
}
```

## Erreur Courante : L'Explosion des Rôles
Une erreur fréquente consiste à créer trop de rôles granulaires (ex: `MANAGER_NORD`, `MANAGER_SUD`). C'est ce qu'on appelle l'« explosion des rôles », ce qui annule l'intérêt du RBAC. Utilisez plutôt un rôle `MANAGER` unique et gérez les restrictions régionales via des attributs (ABAC).

## Exercice Pratique
**Scénario :** Vous devez ajouter un « Auditeur de Conformité » qui peut voir toutes les demandes et commandes, mais ne peut rien créer ni approuver. Comment implémenter cela en RBAC ?

**Réponse :** Créer un nouveau rôle nommé `AUDITOR` et lui attribuer uniquement la permission `VIEW_ALL`. Affectez ensuite ce rôle au compte de l'auditeur.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
