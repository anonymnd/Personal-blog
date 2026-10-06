---
title: "Comment savoir quelle fonctionnalité développer en premier"
description: "Un guide pour prioriser votre première fonctionnalité en vous concentrant sur les résultats utilisateurs et les tranches verticales plutôt que sur une architecture exhaustive."
pubDate: 2026-10-07T00:48:00.000Z
translationKey: 009-how-to-know-what-feature-you-should-build-first
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous avez une longue liste d'idées : un tableau de bord de reporting complexe, un système de notifications et un flux d'approbation à plusieurs niveaux. Si vous essayez de concevoir tout le schéma de la base de données et l'architecture pour toutes ces fonctionnalités avant d'écrire une seule ligne de code, vous risquez de construire un système qui ne résout pas le problème principal de l'utilisateur.

## Se concentrer sur le résultat utilisateur
Au lieu de demander « De quelles fonctionnalités avons-nous besoin ? », demandez « Quel est le plus petit résultat qui apporte de la valeur ? ». Dans une application d'achats, le résultat central n'est pas « d'avoir une base de données de demandes », mais « de faire passer une demande d'un demandeur à un acheteur ». Tout le reste est secondaire. Définissez clairement les règles métier : un demandeur soumet une demande, un manager l'approuve et un acheteur commande.

## La puissance de la tranche verticale
Évitez l'approche « horizontale » où vous construisez toute la couche UI, puis toute la couche API, puis la base de données. À la place, créez une tranche verticale. Cela signifie implémenter un petit chemin de l'UI à la base de données pour une seule fonctionnalité. Par exemple, créez uniquement le bouton « Soumettre la demande », le point de terminaison API correspondant et la logique de sauvegarde. Vous avez maintenant un logiciel fonctionnel, même s'il est incomplet.

## Définir les critères d'acceptation
Pour savoir quand une fonctionnalité est « terminée », vous avez besoin de critères d'acceptation. Pour notre tranche d'achats, le critère pourrait être : « Étant donné un demandeur connecté, lorsqu'il soumet un formulaire valide, le statut de la demande passe à PENDING et devient visible pour le manager ». Cela évite la dérive du périmètre.

## Architecture itérative
Beaucoup de développeurs tombent dans le piège de la « conception globale préalable ». Ils passent des semaines sur une hiérarchie de classes parfaite. En réalité, l'architecture doit être itérative. Construisez la tranche, voyez où elle échoue et refactorisez. Votre entité `Request` initiale sera simple, puis évoluera avec la logique d'approbation.

## Exemple concret : La première tranche

**Objectif :** Permettre à un utilisateur de soumettre une demande d'achat.

```java
// Extrait illustratif d'une entité Request simple
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemDescription;
    private Double estimatedCost;
    private String status = "PENDING";
    // Getters et setters
}
```
**Résultat :** Le demandeur clique sur « Soumettre », l'enregistrement arrive en BDD, et le manager peut le voir. Le reporting et les notifications sont ignorés pour l'instant.

**Erreur courante :** Construire un « Moteur de Notifications » générique avant que le bouton « Soumettre » ne fonctionne.
**Correction :** Codez d'abord un simple message de log ; créez le moteur seulement quand plusieurs fonctionnalités en auront besoin.

## Exercice pratique
Scénario : Vous ajoutez l'« Approbation du Manager » à l'application. Quelle est la plus petite tranche verticale et un critère d'acceptation pour cette fonctionnalité ?

**Réponse :** Tranche : Un bouton « Approuver » sur la vue manager qui met à jour le statut en 'APPROVED'. Critère : Le statut de la demande doit passer de PENDING à APPROVED dans la base de données après le clic.
