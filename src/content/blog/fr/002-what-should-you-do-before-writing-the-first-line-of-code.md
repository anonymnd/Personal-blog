---
title: "Que faire avant d'écrire la première ligne de code ?"
description: "Apprenez à passer du codage impulsif à un processus de planification structuré pour garantir que votre logiciel résout réellement le problème visé."
pubDate: 2026-10-06T17:48:00.000Z
translationKey: 002-what-should-you-do-before-writing-the-first-line-of-code
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Beaucoup de développeurs ressentent la 'panique de la page blanche' ou, pire, passent trois jours à coder une fonctionnalité pour réaliser qu'ils ont mal compris le besoin métier. Cela arrive quand on considère le code comme le point de départ et non comme l'étape finale d'une conception.

## Définir le résultat attendu pour l'utilisateur
Avant d'ouvrir votre IDE, demandez-vous : 'Que cherche l'utilisateur à accomplir concrètement ?' Au lieu de penser à un 'Formulaire de demande', pensez au résultat : 'Un demandeur doit informer l'entreprise qu'il a besoin d'un équipement spécifique.' En vous concentrant sur le résultat, vous évitez de créer des champs inutiles.

## Établir des règles métier claires
Les règles métier sont les contraintes qui régissent la logique. Pour une application d'achat, une règle pourrait être : 'Toute demande supérieure à 500 € nécessite l'approbation d'un manager, tandis que les demandes inférieures sont approuvées automatiquement.' Les noter en langage clair évite les oublis logiques coûteux.

## Identifier une petite tranche verticale (Vertical Slice)
Ne tombez pas dans le piège de concevoir toute l'architecture système d'un coup. Identifiez une 'tranche verticale' : le chemin le plus court qui apporte de la valeur. Par exemple : Demandeur soumet → Manager approuve → Acheteur voit la demande. Cela valide le concept avant de passer à l'échelle.

## Fixer des critères d'acceptation
Les critères d'acceptation sont la 'définition du terminé'. Ce sont des conditions spécifiques qui doivent être remplies.

**Exemple :**
- Étant donné qu'une demande est soumise,
- Quand le manager clique sur 'Approuver',
- Alors le statut doit passer à 'Approuvé' et l'acheteur doit être notifié.

## Erreur courante : Le sur-ingénierie architecturale
Une erreur fréquente est de passer des semaines sur un schéma de base de données parfait ou de choisir un framework de microservices complexe avant même de connaître les règles métier.

**Correction :** Commencez par un modèle simple. Si votre application n'a que trois rôles, une structure de table basique suffit. Laissez l'architecture évoluer avec la complexité des besoins.

## Exercice pratique
**Scénario :** Vous créez une fonctionnalité de 'Demande de Congés'. Écrivez une règle métier et un critère d'acceptation.

**Vérification :**
- Règle : 'Les employés ne peuvent pas demander plus de 20 jours de congé par an.'
- Critère : 'Lorsque l'utilisateur soumet sa demande, le système doit vérifier le solde restant avant d'enregistrer.'
