---
title: "Utiliser la Messagerie et Kafka quand le Travail doit Survivre à la Requête"
description: "Apprenez à découpler les flux critiques avec Kafka, en vous concentrant sur le pattern Outbox, l'ordre des partitions et l'idempotence pour l'impression d'étiquettes et l'analytique."
pubDate: 2026-10-08T18:48:00.000Z
translationKey: 226-what-is-kafka
seriesOrder: 51
locale: fr
tags: ["system-design","learning-series"]
draft: false
---

## Arbitrage entre Synchrone et Asynchrone

Lorsqu'un client envoie une requête à une API, le serveur a deux options : terminer tous les effets de bord avant de répondre (Synchrone) ou accuser réception et traiter le travail plus tard (Asynchrone).

Dans un flux synchrone, si le service d'impression d'étiquettes est hors ligne, toute la requête de commande échoue, même si la commande a été enregistrée avec succès dans la base de données. Cela crée un couplage fort où la disponibilité du système est le produit de la disponibilité de chaque dépendance.

La communication asynchrone via un broker comme Kafka brise cette chaîne. L'API enregistre la commande et produit un message. L'API peut ensuite retourner un code `202 Accepted`. L'imprimante et le moteur d'analytique consomment ce message à leur propre rythme. Si l'imprimante est indisponible pendant dix minutes, les messages s'accumulent simplement dans Kafka ; ils ne sont pas perdus, et le processus de commande du client n'est pas bloqué.

## Rôles du Broker : Kafka vs Base de Données vs Cache

Une base relationnelle sert état, transactions et requêtes ; une file de travail en base peut aussi convenir. Mesurez polling et contention sans la rejeter universellement. Redis pub/sub est transitoire ; d’autres structures Redis ont d’autres possibilités de persistance et livraison.

Kafka fournit logs partitionnés, replay et groupes. Il ne remplace pas la base des commandes et ne conserve pas automatiquement chaque événement pour toujours. Configurez réplication, acknowledgements, rétention et récupération. Séparez les groupes étiquettes et analytics si chacun doit voir tous les événements.
## Mécanismes Fondamentaux de Kafka

Chaque partition contient des enregistrements ordonnés avec offsets. L’offset committé d’un groupe désigne normalement le prochain enregistrement à consommer, sans prouver tous les effets externes. Dans un groupe classique, une partition est affectée à un consumer à la fois ; retries, rebalances et crashes peuvent répéter le traitement.

Une clé order_id et un partitionnement stables regroupent les événements ; changer nombre de partitions ou routage demande attention. L’ordre du log ne garantit pas l’ordre de fin de handlers asynchrones. Une clé ne corrige pas non plus des producteurs émettant dans le désordre métier.
## Fiabilité : Pattern Outbox et Idempotence

Validez commande et outbox dans une même transaction SQL. Le relay publie avec event_id stable et marque sa progression après l’acknowledgement configuré. Cela rend la publication récupérable, sans la garantir sans relay fonctionnel, données conservées et retries. Un crash après publication peut la dupliquer.

| Moment de panne | Récupération requise |
| --- | --- |
| Avant commit SQL | Ni commande ni ligne outbox ne persistent |
| Après commit, avant publication | Le relay réessaie la ligne conservée |
| Après publication, avant confirmation | Un doublon peut être publié |
| Après impression, avant reçu local | Résultat incertain ; idempotence côté imprimante nécessaire |

Pour analytics interne, insérez event_id sous contrainte unique et modifiez le compteur dans la même transaction DB. Un check-then-act séparé est racy. Committez l’offset Kafka après réussite de cette transaction.

L’impression est un effet physique externe. Vérifier processed_events, imprimer puis enregistrer un marqueur permet un crash après impression et une réimpression au retry. Marquer avant risque de ne jamais imprimer. Envoyez une clé idempotente stable à un service qui déduplique durablement et expose le statut, ou prévoyez rapprochement/revue des résultats incertains. Sans coopération externe, ne promettez pas une impression physique unique. L’outbox coordonne SQL et événement, pas tous les effets ultérieurs.
## Exercice

Avec trois partitions et quatre consumers d’un groupe classique, au plus trois reçoivent une affectation ; l’activité réelle dépend des données. A et C dans une partition ont un ordre dans le log, mais leur fin de traitement ne le suit que si le handler le préserve.

Les transactions Kafka coordonnent les lectures/écritures Kafka prises en charge selon leur contrat. Elles n’incluent pas automatiquement une imprimante ou une base externe quelconque. Identifiez frontière et fenêtres de crash avant de promettre un résultat métier exactly-once.
