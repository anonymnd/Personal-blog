---
title: "Développement Feature-First vs Architecture-First"
description: "Apprenez à équilibrer la valeur métier immédiate et la stabilité du système en choisissant entre les tranches verticales et la conception exhaustive."
pubDate: 2026-10-06T22:48:00.000Z
translationKey: 007-feature-first-development-vs-architecture-first-development
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Votre manager veut un bouton « Demander un achat » pour vendredi. Si vous passez toute la semaine à concevoir le schéma de base de données parfait et des couches d'abstraction pour tous les scénarios futurs, vous n'aurez rien à présenter. C'est le piège du développement Architecture-First.

## Le piège de l'Architecture-First
Le développement Architecture-First considère la conception du système comme un prérequis. L'objectif est de créer une fondation « parfaite » avant d'écrire la moindre fonctionnalité. Bien que cela semble prudent, cela mène souvent au « sur-ingénierie » : construire des systèmes complexes pour des problèmes que l'entreprise n'a pas encore.

## L'approche Feature-First
Le développement Feature-First se concentre sur la « Tranche Verticale » (Vertical Slice). Au lieu de construire toute la couche de données, puis toute la couche service, vous créez un chemin spécifique de l'interface utilisateur vers la base de données pour une seule fonctionnalité. Pour notre application, une tranche verticale serait : Le demandeur soumet une requête → La requête est enregistrée → Une confirmation s'affiche.

## Exemple concret : Demande d'achat
Dans une approche Feature-First, on commence par le résultat : « Le manager peut approuver une demande ».

```java
// Extrait illustratif : Focalisé uniquement sur la fonctionnalité d'approbation
public class ApprovalService {
    public void approveRequest(Long requestId, Long managerId) {
        // 1. Valider les permissions du manager
        // 2. Mettre à jour le statut en 'APPROUVÉ'
        // 3. Déclencher la notification pour l'acheteur
    }
}
```
Résultat : L'entreprise dispose immédiatement d'un flux d'approbation fonctionnel. L'architecture évolue au fur et à mesure que nous ajoutons des fonctions de « Rejet » ou de « Vérification budgétaire ».

## Erreur courante : Le sophisme du « Sans Architecture »
Une erreur fréquente est de croire que Feature-First signifie « pas de design ». Certains développeurs écrivent du code désordonné dans le contrôleur pour aller vite.
**Correction :** Utilisez l'« Architecture Itérative ». Concevez la structure la plus simple supportant la fonctionnalité actuelle, tout en restant propre pour permettre un refactoring lors de l'ajout de complexité.

## Exercice pratique
Scénario : Vous devez ajouter une fonctionnalité de « Commande Acheteur ». Devez-vous d'abord construire un « Framework de gestion des commandes » générique, ou implémenter le flux spécifique pour un seul bon de commande ?

**Réponse :** Implémentez d'abord le flux spécifique pour un seul bon de commande (Feature-First). Une fois que vous avez trois types de commandes différents, refactorisez la logique commune dans un framework.
