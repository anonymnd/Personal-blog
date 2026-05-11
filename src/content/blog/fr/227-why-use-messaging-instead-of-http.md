---
title: "Pourquoi utiliser la messagerie plutôt que le HTTP ?"
description: "Une exploration des modèles de communication asynchrones pour pallier les limites des cycles requête-réponse synchrones dans les systèmes distribués."
pubDate: 2026-10-16T02:48:00.000Z
translationKey: 227-why-use-messaging-instead-of-http
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats. Lorsqu'un demandeur soumet une demande, le système doit notifier le manager, vérifier le budget et enregistrer l'événement. Si vous utilisez le HTTP pour tout, le navigateur de l'utilisateur reste bloqué jusqu'à ce que chacun de ces services réponde. Si le service de budget tombe pendant une seule seconde, toute la requête échoue et l'utilisateur voit une erreur 500.

## Le goulot d'étranglement synchrone
Le HTTP est un protocole synchrone. Il suit un modèle requête-réponse où le client attend que le serveur traite la logique et renvoie un résultat. Dans une architecture microservices, cela crée un « couplage temporel ». Si le Service A appelle le Service B, et que le Service B appelle le Service C, le Service A est bloqué jusqu'à ce que toute la chaîne soit terminée. Cela augmente la latence et crée un point de défaillance unique.

## Le découplage via la messagerie
La messagerie introduit un intermédiaire appelé Broker de messages (comme RabbitMQ ou Kafka). Au lieu d'appeler une API, le producteur envoie un message à une file d'attente et renvoie immédiatement une réponse de succès à l'utilisateur. Les services consommateurs récupèrent le message et le traitent à leur propre rythme. C'est la communication asynchrone.

## Exemple concret : Flux d'approvisionnement
Dans un flux HTTP, le point de terminaison `SubmitRequest` appelle `BudgetService.check()` et `NotificationService.send()`. Si `NotificationService` est lent, l'utilisateur attend.

Dans un flux de messagerie :
1. `ProcurementService` enregistre la demande en base de données.
2. Il publie un message : `{ "requestId": 101, "status": "SUBMITTED" }` vers le `request_topic`.
3. `BudgetService` et `NotificationService` consomment ce message indépendamment.

**Résultat :** L'utilisateur reçoit instantanément un message « Demande soumise », et les tâches de fond s'exécutent sans bloquer l'interface.

## Erreur courante : Supposer une livraison garantie
Une erreur fréquente consiste à traiter une file de messages comme le remplacement d'une transaction de base de données. Les développeurs supposent souvent que l'envoi d'un message garantit qu'il sera traité exactement une fois. En réalité, des problèmes réseau peuvent entraîner des messages dupliqués.

**Correction :** Implémenter l'idempotence. Le `BudgetService` doit vérifier s'il a déjà traité le `requestId: 101` avant de déduire les fonds, garantissant que les doublons n'entraînent pas de doubles déductions.

## Exercice pratique
Scénario : Un utilisateur télécharge un PDF volumineux pour un audit d'achat. Le système doit générer une miniature et analyser le fichier pour détecter des virus.

Question : Pourquoi le HTTP est-il un mauvais choix pour l'étape d'analyse antivirus ?

**Réponse :** L'analyse antivirus est chronophage. Une connexion HTTP expirerait probablement (timeout), et l'utilisateur ne devrait pas garder son navigateur ouvert pendant que le serveur analyse le fichier.
