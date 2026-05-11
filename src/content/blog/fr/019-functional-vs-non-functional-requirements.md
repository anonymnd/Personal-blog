---
title: "Exigences Fonctionnelles vs Non Fonctionnelles"
description: "Apprenez à distinguer ce que le système fait de la manière dont il le fait pour éviter des erreurs d'architecture coûteuses."
pubDate: 2026-10-07T10:48:00.000Z
translationKey: 019-functional-vs-non-functional-requirements
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Imaginez que vous développez une application d'achats. Vous commencez immédiatement à coder le bouton 'Soumettre la demande', mais à mi-chemin, vous réalisez que le système plante quand dix managers approuvent des demandes simultanément. Cela arrive quand on se concentre uniquement sur le 'quoi' en ignorant le 'comment'.

## Définir les Exigences Fonctionnelles
Les exigences fonctionnelles décrivent le comportement spécifique du système. Elles définissent les interactions entre un acteur (un rôle externe comme le 'Demandeur') et le système. Une exigence fonctionnelle doit couvrir le 'chemin nominal' (succès) et les 'cas d'erreur'. Par exemple, un demandeur doit pouvoir soumettre une demande d'achat, mais le système doit rejeter la demande si le champ budget est vide.

## Définir les Exigences Non Fonctionnelles
Les exigences non fonctionnelles (ENF) sont des contraintes imposées au système. Elles ne décrivent pas une fonctionnalité précise, mais la qualité du service. Elles doivent être mesurables. Au lieu de dire 'l'application doit être rapide', une ENF précisera : 'l'écran d'approbation doit charger en moins de 2 secondes pour 100 utilisateurs simultanés'. On y retrouve la scalabilité, la disponibilité et la fiabilité.

## Exemple Concret : Flux d'Achats

| Type d'exigence | Détail de l'exigence |
| :--- | :--- |
| Fonctionnelle | Un Manager peut approuver ou rejeter une demande soumise par un Demandeur. |
| Fonctionnelle | Le système doit notifier l'Acheteur par email une fois la demande approuvée. |
| Fonctionnelle | Seuls les utilisateurs ayant le rôle 'Manager' peuvent accéder au tableau de bord d'approbation (Autorisation). |
| Non Fonctionnelle | Le système doit maintenir une disponibilité de 99,9% pendant les heures de bureau. |

## Erreur Courante : L'Exigence Vague
Une erreur classique est de rédiger une exigence non fonctionnelle comme si elle était fonctionnelle. Par exemple : "Le système doit être sécurisé." C'est inutile pour un développeur.

**Correction :** "Toutes les données de demande doivent être cryptées en AES-256 pendant le transit et au repos." Cela donne une contrainte technique mesurable.

## Exercice Pratique
Scénario : Vous ajoutez une fonction de 'Recherche' à l'application d'achats.
1. Écrivez une exigence fonctionnelle pour cette fonction.
2. Écrivez une exigence non fonctionnelle pour cette fonction.

**Correction :**
1. EF : L'utilisateur peut rechercher des demandes par ID de commande.
2. ENF : Les résultats de recherche doivent s'afficher en moins de 500ms.
