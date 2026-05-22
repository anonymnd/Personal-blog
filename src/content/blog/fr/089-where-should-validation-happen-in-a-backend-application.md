---
title: "Validation des Entrées, Éligibilité Métier et Invariants de Base de Données"
description: "Analyse approfondie des trois couches de validation via un scénario d'inscription à un atelier pour éviter les données invalides et les conditions de concurrence."
pubDate: 2026-10-07T10:48:00.000Z
translationKey: 089-where-should-validation-happen-in-a-backend-application
seriesOrder: 19
locale: fr
tags: ["validation-errors","learning-series"]
draft: false
---

## Les Trois Couches de Validation

La validation d’entrée contrôle la forme : @NotNull rejette null, @NotBlank rejette null ou une chaîne sans caractère non blanc, @Positive impose une valeur positive (ajoutez @NotNull pour un wrapper nullable). @Valid cascade la validation lorsque le mécanisme environnant s’exécute ; une annotation sur une méthode quelconque ne suffit pas à l’activer.

L’éligibilité vérifie si l’atelier est ouvert et si l’utilisateur peut participer. Les invariants DB protègent l’état stocké face aux requêtes concurrentes. Une contrainte unique empêche les doublons, pas à elle seule la surréservation. Contraintes, mises à jour conditionnelles atomiques, verrous ou transactions sérialisables traitent des courses précises ; choisissez une transaction complète.
## Exemple Pratique : Inscription à un Atelier

La requête contient contactEmail, requestedSeats positif et workshopId. Validez-la à la frontière HTTP avec @Valid et décidez si contactEmail exige @Email ainsi qu’une normalisation explicite. @NotBlank ne valide pas à lui seul une adresse email.

Une implémentation vulnérable lit la dernière place puis insère une réservation : deux requêtes passent la même lecture. Réservez plutôt les places par un UPDATE conditionnel dans la même transaction que l’insertion :

```sql
UPDATE workshop
SET available_seats = available_seats - :requested
WHERE id = :workshop_id
  AND is_open = TRUE
  AND available_seats >= :requested;
```

Exigez une ligne modifiée ; zéro signifie atelier absent, fermé ou capacité insuffisante, à classifier selon le contrat. Insérez ensuite la réservation avec requestedSeats et une contrainte unique sur (workshop_id, normalized_contact_email). Tout échec d’insertion doit annuler la transaction entière et restaurer les places. CHECK available_seats >= 0 ajoute une protection mais ne remplace pas la mise à jour du compteur.

Ne traduisez pas toutes les DataIntegrityViolationException en doublon. Identifiez la contrainte connue à une frontière transactionnelle adaptée. save peut différer le SQL jusqu’au flush ou commit ; son seul try/catch peut donc manquer l’erreur. Dans PostgreSQL, une instruction échouée peut imposer un rollback. Testez deux utilisateurs visant la dernière place et le même utilisateur se réinscrivant.
## Exercice Ciblé

**Scénario** : Vous créez un système où un utilisateur peut rejoindre un "Groupe Premium".
- Le `groupCode` ne doit pas être vide.
- L'utilisateur doit avoir au moins 18 ans (Vérification métier).
- Un utilisateur ne peut être que dans un seul Groupe Premium à la fois (Invariant DB).

**Question** : Quel outil/couche de validation utilisez-vous pour chaque exigence, et pourquoi ?

**Réponse** :
1. `groupCode` : `@NotBlank` dans le DTO de requête (Validation d'Entrée). C'est un simple contrôle de forme.
2. Âge ≥ 18 : Logique de service vérifiant l'entité User (Éligibilité Métier). Cela nécessite l'accès aux données du profil.
3. Un seul groupe : Contrainte unique sur `user_id` dans la table `group_members` (Invariant DB). Cela empêche une condition de concurrence si l'utilisateur clique deux fois rapidement sur "Rejoindre".

## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
