---
title: "Qu'est-ce que l'Architecture Orientée Événements ?"
description: "Un guide pour débutants pour comprendre comment les systèmes communiquent via des événements asynchrones plutôt que des requêtes directes."
pubDate: 2026-10-16T04:48:00.000Z
translationKey: 229-what-is-event-driven-architecture
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Dans un système traditionnel, lorsqu'un demandeur soumet une demande, le système attend que le manager l'approuve et que l'acheteur passe la commande dans une seule chaîne connectée. Si le service de l'acheteur est indisponible, tout le processus échoue. Ce « couplage fort » est un goulot d'étranglement courant.

## Le Mécanisme Fondamental
L'Architecture Orientée Événements (EDA) résout cela en utilisant un « Event Broker » (comme Kafka ou RabbitMQ). Au lieu que le Service A appelle directement le Service B, le Service A publie simplement un événement—une notification disant que « quelque chose s'est produit»—vers le broker. Les autres services s'abonnent à ces événements et réagissent à leur arrivée. C'est une communication asynchrone : l'émetteur n'attend pas de réponse.

## Flux de l'Application d'Achats
Dans un système d'achats EDA, le flux est le suivant :
1. **Service Demandeur** : Publie l'événement `RequestCreated`.
2. **Service Manager** : Écoute `RequestCreated`, traite l'approbation et publie `RequestApproved`.
3. **Service Acheteur** : Écoute `RequestApproved` et déclenche la commande externe.

Comme ces services sont découplés, le Service Acheteur peut être hors ligne pour maintenance, et l'événement `RequestApproved` restera simplement dans le broker jusqu'à ce que le service redémarre.

## Exemple Concret : Charge Utile de l'Événement
Un événement est généralement un petit objet JSON. Pour notre application, l'événement `RequestApproved` pourrait ressembler à ceci :

```json
{
  "eventId": "evt_123",
  "type": "RequestApproved",
  "payload": {
    "requestId": "req_99",
    "approverId": "mgr_01",
    "timestamp": "2023-10-27T10:00:00Z"
  }
}
```
Résultat : Le Service Acheteur reçoit ceci, voit `req_99` et sait exactement quel article acheter sans jamais avoir communiqué avec le Service Manager.

## Erreur Courante : Supposer une Livraison Unique
Les débutants pensent souvent qu'un événement est livré exactement une fois. En réalité, des problèmes réseau peuvent pousser le broker à envoyer le même événement deux fois. Si le Service Acheteur n'est pas **idempotent** (traiter le même événement deux fois ne crée pas deux commandes), vous achèterez le même ordinateur deux fois.

**Correction** : Implémentez une vérification. Stockez l' `eventId` dans une base de données ; si l'ID a déjà été traité, ignorez le doublon.

## Exercice Pratique
Si un « Service de Notification » doit envoyer un email chaque fois qu'une demande est créée, approuvée ou rejetée, comment doit-il être intégré à l'application ?

**Réponse** : Le Service de Notification doit s'abonner aux trois types d'événements (`RequestCreated`, `RequestApproved`, `RequestRejected`) et envoyer l'email correspondant au type d'événement reçu.
