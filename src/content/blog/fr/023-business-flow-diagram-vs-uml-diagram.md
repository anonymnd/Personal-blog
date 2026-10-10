---
title: "Choisir le bon diagramme UML pour la bonne question"
description: "Guide pour sélectionner et construire des diagrammes UML selon la question technique à résoudre, basé sur un scénario de réservation de billets."
pubDate: 2026-10-06T20:48:00.000Z
translationKey: 023-business-flow-diagram-vs-uml-diagram
seriesOrder: 5
locale: fr
tags: ["uml-modeling","learning-series"]
draft: false
---

## Le problème central : Le mauvais usage d'UML

Beaucoup de développeurs traitent l'UML comme un rituel obligatoire plutôt que comme un outil de communication. L'erreur la plus fréquente est d'utiliser le mauvais diagramme pour répondre à une question spécifique. Par exemple, tenter d'expliquer une branche de décision métier via un diagramme de déploiement est impossible, car ce dernier décrit l'infrastructure physique, pas la logique.

Pour choisir le bon outil, vous devez d'abord identifier la question : « Qui est impliqué ? », « Quel est le flux ? », « Dans quel ordre les objets communiquent-ils ? », « Quelle est la structure ? » ou « Où s'exécute le code ? »

## Correspondance Questions → Diagrammes

| La Question | Le Diagramme Correct | Focus Principal |
| :--- | :--- | :--- |
| Qui interagit avec le système pour atteindre un but ? | Diagramme de Cas d'Utilisation | Acteurs et Objectifs |
| Quelles sont les étapes logiques et les embranchements ? | Diagramme d'Activité | Workflow et Flux de Contrôle |
| Dans quel ordre exact les composants échangent-ils des messages ? | Diagramme de Séquence | Interactions chronologiques |
| Quelles sont les entités conceptuelles et leurs relations ? | Diagramme de Classes | Structure Statique et Logique |
| Comment le système est-il divisé en parties modulaires ? | Diagramme de Composants | Modules Physiques/Logiques |
| Quel serveur ou appareil héberge quel composant ? | Diagramme de Déploiement | Matériel et Environnement d'Exécution |

## Scénario appliqué : Réservation de billets d'événement

Imaginons un système où un utilisateur réserve des places. Les places sont bloquées pendant 10 minutes. Si le paiement réussit, la réservation est confirmée ; si le minuteur expire ou si le paiement échoue, les places sont libérées.

### 1. La question du flux : Diagramme d'Activité
Un diagramme d’activité est utile pour ce workflow : il met en avant les actions, les branches et la concurrence. Un diagramme de séquence peut aussi représenter des branches et des interactions parallèles ; choisissez-le pour une question sur les messages entre participants.

**Trace Logique :**
- Début → Sélection des places → [Bloquer places] → Décision : Paiement reçu ?
- Si Oui → Confirmer billet → Fin.
- Si Non → Attendre timeout → Décision : Temps expiré ?
- Si Oui → Libérer places → Fin.

### 2. La question de l'interaction : Diagramme de Séquence
Une fois le flux établi, nous devons savoir *quels* objets gèrent la logique. Le diagramme de séquence mappe le flux d'activité sur des lignes de vie (Acteurs et Objets).

**Trace d'interaction illustrative :**
- Utilisateur → ReservationController: requestHold(seatId)
- ReservationController → SeatService: lockSeat(seatId)
- SeatService → Database: updateStatus('HELD')
- ReservationController → Utilisateur: return holdConfirmation
- [Boucle : Vérification statut paiement]
- PaymentGateway → ReservationController: notifyPaymentSuccess()
- ReservationController → SeatService: finalizeBooking()

**Notations clés utilisées :**
- **alt (Alternative) :** Utilisé pour les chemins succès vs échec du paiement.
- **loop (Boucle) :** Utilisé pour le polling du statut ou la vérification du timeout.
- **par (Parallèle) :** Utilisé si le système envoie un email de confirmation tout en mettant à jour la base de données.
- **Lignes de vie :** L'Utilisateur est une ligne de vie d'acteur ; le SeatService est une ligne de vie d'objet.

### 3. La question structurelle : Diagramme de Classes
Alors que la séquence montre la *discussion*, le diagramme de classes montre la *connaissance*.

**Distinction cruciale : Classe Conceptuelle vs Table SQL**
Une classe UML représente un concept métier avec un comportement (méthodes), pas seulement une ligne de données. Une classe `Reservation` peut avoir une méthode `calculateExpiry()`, alors qu'une table SQL n'a qu'une colonne `expiry_date`.

**Artéfact du modèle :**
- Classe `Ticket` : attributs (id, prix, numeroPlace).
- Classe `Reservation` : attributs (id, heureDebut), méthodes (confirm(), cancel()).
- Relation : `Reservation` a une association 1..* avec `Ticket`.

## Pourquoi les diagrammes de déploiement échouent pour la logique

Si vous essayez de montrer la logique du « Timeout de paiement » dans un diagramme de déploiement, vous échouerez. Un diagramme de déploiement montre que `PaymentService.jar` s'exécute sur `Serveur-A` et se connecte via HTTPS à `PaymentGateway-API`. Il décrit le *où*, pas le *comment*. La logique appartient aux diagrammes d'activité ou de séquence ; l'infrastructure appartient au déploiement.

## Exercice

**Scénario :** Un utilisateur télécharge une photo de profil. Le système doit redimensionner l'image, la scanner pour détecter des malwares, puis l'enregistrer dans un bucket cloud. Si le scan échoue, l'image est supprimée immédiatement.

**Question :** Quels sont les deux diagrammes que vous utiliseriez pour modéliser la logique « Scan Malware → Suppression » et la connexion « Serveur App → Bucket Cloud » ? Expliquez pourquoi.

**Réponse :**
1. **Diagramme d'Activité** (ou de Séquence) pour la logique : Il gère la branche de décision (Succès vs Échec du scan) et l'action résultante (Enregistrer vs Supprimer).
2. **Diagramme de Déploiement** pour la connexion : Il mappe la relation physique entre le serveur d'application et le fournisseur de stockage cloud.

## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
