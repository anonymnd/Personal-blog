---
title: "Qu'est-ce que Kafka ?"
description: "Une introduction à Apache Kafka en tant que plateforme de streaming d'événements distribuée pour découpler les microservices."
pubDate: 2026-10-16T01:48:00.000Z
translationKey: 226-what-is-kafka
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que vous développiez un système d'approvisionnement. Lorsqu'un demandeur soumet une demande d'achat, plusieurs actions doivent être déclenchées : le manager doit être notifié, le service budget doit vérifier les fonds et le journal d'audit doit enregistrer l'entrée. Si vous utilisez des appels API directs, votre système devient un ensemble de dépendances complexes. Si le service budget est hors ligne, toute la demande échoue. C'est là qu'Apache Kafka intervient en agissant comme un journal de validation distribué.

## Le Mécanisme Fondamental
Kafka fonctionne sur un modèle de publication-abonnement. Au lieu d'envoyer un message directement à un destinataire, un 'Producer' envoie des données (un événement) vers un 'Topic'. Un topic est comme une catégorie. Ces données sont stockées dans des 'Partitions', ce qui permet à Kafka de s'étendre sur plusieurs serveurs. Les 'Consumers' s'abonnent ensuite à ces topics pour lire les données à leur propre rythme. Comme Kafka persiste les données sur disque, un consommateur peut planter et reprendre exactement là où il s'était arrêté.

## Exemple d'Application d'Approvisionnement
Dans notre application, le topic 'Request-Submitted' gère le flux :
1. **Producer** : Le service de demande envoie un événement JSON : `{"id": 101, "item": "Laptop", "amount": 1200}`.
2. **Topic** : Kafka stocke cet événement dans le topic `purchase_requests`.
3. **Consumers** :
   - Le **Service de Notification** lit l'événement et envoie un email au manager.
   - Le **Service Budget** lit le même événement pour réserver les fonds.

Résultat : Le service de demande n'a pas besoin de savoir qui écoute ; il publie l'événement et continue son travail.

## Ordre et Idempotence
Un détail crucial est que Kafka garantit l'ordre des messages *uniquement au sein d'une seule partition*. Si vous avez plusieurs partitions, les messages peuvent être traités dans le désordre. De plus, comme des pannes réseau peuvent pousser un producteur à envoyer le même message deux fois, vos consommateurs doivent être 'idempotents'. Cela signifie que traiter deux fois le même ID de demande ne doit pas entraîner deux déductions budgétaires.

## Erreur Courante : Utiliser Kafka comme Base de Données
Certains développeurs confondent Kafka avec une base de données principale car il stocke des données. Cependant, Kafka est optimisé pour le streaming séquentiel, pas pour les requêtes d'accès aléatoire.

**Correction** : Utilisez Kafka pour déplacer les données entre les services, mais stockez l'état final (comme le statut de la commande) dans une base de données comme PostgreSQL ou MongoDB.

## Exercice Pratique
Si vous avez un topic avec 3 partitions et 4 consommateurs dans le même groupe de consommation, qu'arrive-t-il au 4ème consommateur ?

**Réponse** : Le 4ème consommateur restera inactif car chaque partition d'un groupe ne peut être assignée qu'à un seul consommateur.
