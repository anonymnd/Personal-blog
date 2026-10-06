---
title: "Pourquoi les règles métier doivent précéder les tables de base de données"
description: "Découvrez pourquoi la définition de la logique métier doit précéder la création du schéma de base de données pour éviter des refontes architecturales coûteuses."
pubDate: 2026-10-07T11:48:00.000Z
translationKey: 020-why-business-rules-should-come-before-database-tables
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous commencez par créer une table `Requests` avec une colonne statut. Plus tard, vous réalisez qu'une demande ne peut être « Approuvée » que si le demandeur a un budget spécifique et que le manager appartient au même département. Si vos tables sont déjà créées, vous devez maintenant ajouter des contraintes complexes ou des triggers à un schéma qui n'a pas été conçu pour ces dépendances. C'est le piège du « database-first ».

## L'approche centrée sur la logique
Les règles métier définissent le « quoi » et le « comment » d'un processus, tandis que les tables de base de données définissent seulement « où » les données sont stockées. En commençant par les tables, vous concevez pour le stockage et non pour le comportement. En définissant les règles d'abord, vous identifiez les entités du domaine—comme le Demandeur, le Manager et la Commande—et les conditions strictes nécessaires pour tout changement d'état.

## Mapper les règles aux entités
Dans notre exemple d'achats, les règles sont :
1. Un Demandeur (acteur) soumet une demande.
2. Un Manager (utilisateur avec autorité) doit l'approuver si le montant dépasse 500 €.
3. Un Acheteur (entité du domaine) convertit la demande approuvée en Bon de Commande.

En définissant cela d'abord, on comprend qu'il faut une relation plusieurs-à-un entre les demandes et les managers, et une règle de validation stricte pour le montant.

## Exemple concret : Le flux d'approbation
Au lieu d'une simple chaîne de caractères pour le statut, la règle métier stipule : *« Une demande ne peut passer à 'Commandée' que si elle possède un horodatage d'approbation et un identifiant d'acheteur valide. »*

```java
// Extrait illustratif d'une vérification de règle métier
public class ProcurementService {
    public void transitionToOrdered(Request request, User buyer) {
        if (!request.isApproved()) {
            throw new IllegalStateException("La demande doit être approuvée d'abord");
        } 
        if (buyer.getRole() != Role.BUYER) {
            throw new UnauthorizedException("Seuls les acheteurs peuvent commander");
        }
        request.setStatus(Status.ORDERED);
    }
}
```
Résultat : Le système empêche les états invalides, peu importe la structure de la table SQL.

## Erreur courante : La « Table Dieu »
Les développeurs créent souvent une table massive avec 50 colonnes pour couvrir tous les scénarios. Cela arrive quand on ne définit pas les règles métier au préalable. La correction consiste à diviser la table selon la responsabilité de l'acteur (ex: séparer `RequestDetails` de `ApprovalAudit`).

## Exercice pratique
Scénario : Une règle stipule qu'un utilisateur ne peut pas demander un nouvel ordinateur s'il en a reçu un au cours des 24 derniers mois.
Question : Devez-vous gérer cela avec une contrainte `UNIQUE` en base de données ou via une règle métier ?

Réponse : Via une règle métier. Une contrainte `UNIQUE` ne peut pas calculer un intervalle de dates ; elle vérifie seulement les doublons exacts.
