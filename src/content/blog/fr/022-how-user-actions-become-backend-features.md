---
title: "Comment les actions utilisateur deviennent des fonctionnalités backend"
description: "Apprenez à traduire l'intention d'un utilisateur en une fonctionnalité backend structurée en reliant les acteurs à la logique métier."
pubDate: 2026-10-07T13:48:00.000Z
translationKey: 022-how-user-actions-become-backend-features
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs commencent à coder dès qu'ils entendent une demande comme 'Je veux demander un nouvel ordinateur'. Cela conduit souvent à oublier des cas critiques, comme le cas où le manager est en congé ou le budget est dépassé. L'écart entre l'action de l'utilisateur et la fonctionnalité backend est l'endroit où réside la logique métier.

## Identifier l'Acteur vs l'Utilisateur
Avant d'écrire du code, il faut distinguer l'Acteur de l'Utilisateur. Un Acteur est un rôle (ex: Demandeur, Manager, Acheteur) qui interagit avec le système. Un Utilisateur est la personne physique connectée à un compte. Une entité de domaine, comme une 'DemandeDachat', est l'objet manipulé. Cette distinction évite les failles d'autorisation où un utilisateur pourrait approuver sa propre demande.

## Cartographier le flux d'action
Pour transformer une action en fonctionnalité, cartographiez le 'Chemin Nominal' (Happy Path) et les 'Chemins d'Erreur' (Unhappy Paths). Pour une application d'achats, l'action 'Soumettre une demande' n'est pas qu'une insertion en base de données. Elle implique de vérifier si le demandeur appartient à un département valide et si l'article est autorisé. Le chemin d'erreur inclut des scénarios comme 'Demande refusée pour budget insuffisant'.

## Exemple concret : La fonctionnalité d'approbation
Considérons l'action : 'Le manager approuve une demande'.

**Flux logique :**
1. Le système vérifie que l'Acteur est bien un 'Manager'.
2. Le système vérifie que le Manager est le superviseur assigné à cette demande spécifique.
3. Le système change le statut de `PENDING` à `APPROVED`.

```java
// Extrait illustratif de la logique d'approbation
public void approveRequest(Long requestId, User manager) {
    PurchaseRequest request = repository.findById(requestId);
    if (!manager.getRole().equals(Role.MANAGER)) {
        throw new UnauthorizedException("Seuls les managers peuvent approuver");
    }
    if (!request.getSupervisor().equals(manager)) {
        throw new BusinessException("Vous n'êtes pas le superviseur assigné");
    }
    request.setStatus(Status.APPROVED);
    repository.save(request);
}
```

## Erreur courante : Oublier les contraintes
Une erreur fréquente est de se concentrer uniquement sur le 'quoi' (mettre à jour un statut) en ignorant le 'comment' (contraintes non-fonctionnelles). Par exemple, exiger qu'une approbation se fasse sous 48 heures ou que le système enregistre l'auteur de l'approbation pour l'audit. Corrigez cela en ajoutant une section 'Contraintes' à vos spécifications.

## Exercice pratique
**Scénario :** Un Acheteur marque une demande comme 'Commandée'. Quel est un 'chemin d'erreur' possible pour cette action ?

**Réponse :** La demande a pu être annulée par le manager après que l'acheteur a ouvert la page mais avant qu'il ne clique sur 'Commander'.
