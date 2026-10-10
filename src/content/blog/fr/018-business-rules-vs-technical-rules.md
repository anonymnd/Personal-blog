---
title: "Classification des Besoins : Règles Métier, Contraintes et Qualité"
description: "Apprenez à distinguer le comportement métier des contraintes techniques via le scénario d'un portail de rendez-vous médicaux."
pubDate: 2026-10-06T19:48:00.000Z
translationKey: 018-business-rules-vs-technical-rules
seriesOrder: 4
locale: fr
tags: ["business-workflows","learning-series"]
draft: false
---

## Le Piège de la Classification

Une erreur fréquente en génie logiciel consiste à qualifier toute « règle » de Besoin Non Fonctionnel (BNF). Si une règle définit le fonctionnement de l'entreprise—par exemple, « un patient ne peut pas prendre deux rendez-vous simultanément »—il s'agit d'une Règle Métier, et non d'une contrainte technique. Les règles métier dictent le *quoi* (comportement), tandis que les contraintes techniques et les exigences de qualité dictent le *comment* (performance, durabilité et environnement).

## Règles Métier vs Contraintes Techniques

**Les Règles Métier** sont des comportements observables. Elles sont souvent exprimées comme une logique devant être vraie pour qu'une transaction soit valide. On les teste via des cas de tests fonctionnels (Étant donné/Quand/Alors).

**Les Contraintes Techniques** sont des limites non négociables. Cela inclut la pile technologique imposée, la conformité réglementaire (RGPD) ou les limitations matérielles. Elles sont vérifiées par des audits ou des contrôles d'environnement.

**Les Exigences de Qualité (BNF)** sont des attributs mesurables du fonctionnement du système. Des termes vagues comme « rapide » ou « sécurisé » sont inutiles ; ils doivent être traduits en métriques observables.

## Exemple Concret : Portail de Rendez-vous de Clinique

Imaginons un portail où les patients réservent des créneaux avec des médecins. Nous devons traduire des demandes vagues en une matrice de besoins testables.

### Matrice de Traduction des Besoins

| Demande Client | Classification | Besoin Testable Affiné | Mesure d'Acceptation |
| :--- | :--- | :--- | :--- |
| "Pas de double réservation" | Règle Métier | Le système doit rejeter une réservation si l'entité Médecin a déjà un rendez-vous pour ce créneau. | Test : Tenter de réserver 10h00 pour le Dr X deux fois → la 2ème tentative échoue. |
| "Doit être rapide" | Qualité (Perf) | Le résultat de la recherche de rendez-vous doit charger en moins de 2 secondes pour 50 utilisateurs concurrents. | Test de charge : 50 utilisateurs virtuels → 95ème percentile ≤ 2s. |
| "Accès sécurisé" | Règle Métier (Auth) | Seuls les utilisateurs avec le rôle 'Patient' peuvent réserver ; seuls les 'Admin' peuvent annuler les rendez-vous d'autrui. | Test Auth : Patient tente d'annuler le créneau d'un Admin → 403 Forbidden. |
| "Données sécurisées" | Qualité (Durabilité) | En cas de crash base de données, moins de 5 minutes de données de réservation peuvent être perdues. | Test récupération : Simuler crash → Vérifier RPO (Recovery Point Objective) ≤ 5 min. |
| "Doit marcher sur tablette" | Contrainte Tech | Le frontend doit être compatible avec Chrome v110+ sur Android et iOS. | Test compatibilité : Vérification manuelle sur les versions OS/Navigateur cibles. |

## Gestion des Cas d'Erreur (Unhappy Path)

Les besoins doivent décrire les échecs par leurs résultats observables, sans imposer un mécanisme non justifié. Si deux patients demandent simultanément le même créneau, au plus une réservation doit réussir ; l’autre reçoit un résultat de conflit compréhensible. Une contrainte en base ou une stratégie de concurrence adaptée doit garantir cela ; un champ de version sur deux nouvelles lignes de rendez-vous indépendantes ne suffit pas.

Si la clinique impose des règles d’éligibilité liées à l’assurance ou à la spécialité, faites-les préciser et confirmer. Le doctorId fourni par le client ne doit pas contourner les contrôles applicables. N’inventez pas de politique d’assurance en traduisant une demande vague.
## Exercice

**Scénario** : La clinique souhaite ajouter une « Politique d'Annulation » : *Les rendez-vous annulés moins de 24 heures avant le début sont facturés, sauf si le patient fournit un justificatif médical.*

**Tâche** : Classifiez ce besoin et rédigez la mesure d'acceptation observable.

**Réponse** :
- **Classification** : Règle Métier (Logique Domaine).
- **Mesure d'Acceptation** : Créer un test où un rendez-vous est prévu demain à 10h00. Tenter de l'annuler aujourd'hui à 11h00 (moins de 24h). Vérifier que l'entité `Frais` est créée et liée au compte `Patient`. Répéter le test en téléchargeant un document `JustificatifMedical` ; vérifier qu'aucun frais n'est généré.
