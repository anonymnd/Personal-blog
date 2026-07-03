---
title: "Transformer un Flux Métier en Cas d'Utilisation Explicites"
description: "Guide pour extraire les flux, gérer les exceptions et documenter la logique via des cas d'utilisation et des tables de décision (scénario de bibliothèque)."
pubDate: 2026-10-06T17:48:00.000Z
translationKey: 011-how-to-understand-a-business-workflow-before-designing-the-backend
seriesOrder: 2
locale: fr
tags: ["business-workflows","learning-series"]
draft: false
---

## Du Flux à la Logique

L'échec d'un logiciel provient souvent de la traduction directe d'un processus métier vague en code, sans exposer les règles "cachées". Un flux (workflow) est la séquence d'étapes suivies par l'entreprise ; un cas d'utilisation est l'interaction spécifique entre un acteur et le système pour atteindre un objectif. Pour combler l'écart, il faut passer d'une description narrative à un ensemble structuré de règles et d'exceptions.

## Extraction du Flux : Le Scénario de la Bibliothèque

Imaginons un système de bibliothèque. Une description superficielle dirait : "Les utilisateurs empruntent des livres et peuvent les renouveler s'ils ne sont pas en retard." Pour transformer cela en spécification technique, vous devez interroger les parties prenantes pour identifier les chemins bloqués.

**Questions d'entretien pour exposer la logique :**
* "Que se passe-t-il si un utilisateur tente de renouveler un livre déjà réservé par quelqu'un d'autre ?"
* "Un utilisateur peut-il renouveler un livre s'il a une amende impayée ?"
* "Quel est le déclencheur exact qui marque un prêt comme 'en retard' ?"

Grâce à ces questions, nous découvrons une règle métier critique : un renouvellement est bloqué si l'article est réservé OU si l'utilisateur a des amendes dépassant 10 $, quel que soit le statut du livre.

## Structurer le Cas d'Utilisation Textuel

Un cas d'utilisation doit se concentrer sur l'interaction, pas sur l'interface utilisateur (UI). Il identifie l'Acteur (le rôle), les Préconditions, le Scénario Nominal (le chemin heureux) et les Extensions (les chemins d'erreur).

**Cas d'Utilisation : Renouveler un Article de Bibliothèque**
* **Acteur :** Membre de la Bibliothèque
* **Précondition :** Le membre est authentifié et possède un prêt actif pour l'article.
* **Scénario Nominal :**
    1. Le membre demande le renouvellement d'un article spécifique.
    2. Le système vérifie que l'article n'est pas réservé.
    3. Le système vérifie que le compte du membre est en règle (amendes ≤ 10 $).
    4. Le système prolonge la date d'échéance de 14 jours.
    5. Le système informe le membre de la nouvelle date.
* **Extensions :**
    2a. L'article est réservé → Le système informe le membre que le renouvellement est bloqué en raison d'une réservation.
    3a. Les amendes dépassent 10 $ → Le système informe le membre que le renouvellement est bloqué jusqu'au paiement.
    3b. L'article est un livre de référence 'Haute Demande' → Le système refuse le renouvellement (certains articles ne sont pas renouvelables).

## Cartographier la Logique Complexe avec des Tables de Décision

Lorsque plusieurs conditions se chevauchent, les descriptions textuelles deviennent ambiguës. Une table de décision rend les combinaisons explicites. Le tableau ci-dessous présente des cas représentatifs ; vérifiez aussi les conditions de blocage simultanées. Une réservation, une amende excessive ou un article non renouvelable suffit à bloquer le renouvellement.

| Condition | Règle 1 | Règle 2 | Règle 3 | Règle 4 |
| :--- | :---: | :---: | :---: | :---: |
| Article Réservé ? | Non | Oui | Non | Non |
| Amendes > 10 $ ? | Non | Non | Oui | Non |
| Non-renouvelable ? | Non | Non | Non | Oui |
| **Action : Autoriser Renouvellement** | **Oui** | **Non** | **Non** | **Non** |
| **Action : Afficher Erreur** | Aucune | "Réservé" | "Amendes" | "Politique" |

## Analyse de l'Artéfact

Cette approche évite l'erreur classique de coder le 'Chemin Heureux' en premier et de découvrir la logique des 'Réservations' ou des 'Amendes' pendant la phase de QA. En définissant la table de décision, le développeur sait exactement quelle logique `if/else` ou `switch` est requise dans la couche service avant d'écrire une seule ligne de Java. Les cas d'échec (Extensions) deviennent des exigences de premier plan, et non des réflexions après coup.

## Exercice Ciblé

**Scénario :** La bibliothèque introduit un 'Délai de Grâce'. Si un livre est rendu avec 1 à 3 jours de retard, aucune amende n'est appliquée. S'il a 4 jours ou plus, une amende journalière est appliquée. Cependant, si l'utilisateur est un 'Membre Premium', le délai de grâce est porté à 7 jours.

**Tâche :** Créez une table de décision pour déterminer si une amende doit être appliquée en fonction de : `Jours de Retard`, `Type de Membre (Standard/Premium)`.

**Réponse :**

| Condition | Règle 1 | Règle 2 | Règle 3 | Règle 4 |
| :--- | :---: | :---: | :---: | :---: |
| Jours de Retard | 1-3 | 4-7 | 4-7 | 8+ |
| Type de Membre | Standard | Standard | Premium | N'importe |
| **Appliquer Amende ?** | **Non** | **Oui** | **Non** | **Oui** |
