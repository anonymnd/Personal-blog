---
title: "Acteurs, Utilisateurs et Entités : Quelle est la différence ?"
description: "Apprenez à distinguer les rôles qui interagissent avec votre système des objets de données qui y résident."
pubDate: 2026-10-07T03:48:00.000Z
translationKey: 012-actors-users-and-entities-what-s-the-difference
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous conceviez un système d'achat. Vous commencez par noter « Le Manager » dans vos besoins. Mais attention : le Manager est-il une personne devant un écran, un rôle avec des permissions, ou un enregistrement en base de données ? Confondre ces trois concepts mène à un code rigide et des failles de sécurité.

## L'Acteur Externe
Un Acteur est toute entité *extérieure* aux limites du système qui interagit avec lui. Un acteur est un rôle, pas une personne spécifique. Par exemple, un « Demandeur » est un acteur. Curieusement, un acteur n'a pas besoin d'être humain ; une « API de Comptabilité » externe qui envoie des confirmations de paiement est aussi un acteur. Les acteurs définissent *qui* ou *quoi* déclenche un processus.

## L'Utilisateur Authentifié
Alors qu'un acteur est un rôle, un Utilisateur est un compte spécifique. L'Utilisateur est le pont entre la personne physique et le système. Un seul Utilisateur peut jouer plusieurs rôles d'Acteur. Par exemple, « Ahmed » est un Utilisateur qui peut agir à la fois comme « Demandeur » (pour demander un ordinateur) et comme « Manager » (pour approuver les demandes de son équipe).

## L'Entité de Domaine
Une Entité est un objet métier avec une identité unique qui persiste dans le temps. Contrairement à l'Utilisateur (qui concerne l'accès), l'Entité concerne la logique métier. Dans notre application d'achat, une `PurchaseRequest` est une entité. Elle a un ID, un statut et un montant. Même si l'Utilisateur qui l'a créée quitte l'entreprise, l'entité `PurchaseRequest` reste dans le système.

## Exemple concret : Le flux d'approbation
Considérons cette logique dans une structure de type Java :

```java
// Entité : L'objet métier
public class PurchaseRequest {
    private Long id;
    private String item;
    private RequestStatus status;
    // Getters et setters
}

// Logique : Vérification du rôle de l'Acteur
public void approveRequest(User user, PurchaseRequest request) {
    if (!user.hasRole("MANAGER")) {
        throw new UnauthorizedException("Seuls les Managers peuvent approuver");
    }
    request.setStatus(RequestStatus.APPROVED);
}
```
Résultat : Le système valide le rôle de l'Utilisateur (Acteur) avant de modifier l'état de l'objet métier (Entité).

## Erreur courante : La fusion Utilisateur-Entité
Une erreur fréquente consiste à traiter le compte Utilisateur comme l'entité métier principale. Si vous stockez le « Département » ou le « Plafond d'approbation » directement sur l'objet User, vous ne pouvez pas suivre facilement l'évolution de ces limites. Créez plutôt une entité `EmployeeProfile` liée à l'Utilisateur.

## Exercice pratique
Dans un système où un « Acheteur » passe une commande basée sur une demande approuvée, identifiez l'Acteur, l'Utilisateur et l'Entité.

**Réponse :** Acteur : Acheteur ; Utilisateur : La personne connectée (ex: Sarah) ; Entité : Commande.
