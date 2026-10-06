---
title: "Pourquoi les microservices ne sont pas automatiquement meilleurs"
description: "Une analyse critique des compromis entre architectures monolithiques et microservices pour éviter le sur-ingénierie prématurée."
pubDate: 2026-10-17T05:48:00.000Z
translationKey: 254-why-microservices-are-not-automatically-better
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête, un manager l'approuve et un acheteur passe la commande. Vous pourriez être tenté de créer trois services distincts immédiatement, pensant que c'est la norme moderne. Pourtant, diviser cela en microservices avant même d'avoir un utilisateur introduit souvent plus de problèmes qu'il n'en résout.

## Le malentendu sur le monolithe
Une erreur courante est de croire qu'un monolithe est forcément un code désorganisé. En réalité, un monolithe peut être parfaitement modulaire. Vous pouvez avoir des packages séparés pour `requester`, `manager` et `buyer` au sein d'un seul déploiement. Cela vous offre l'organisation des microservices sans le cauchemar opérationnel de gérer plusieurs serveurs et pipelines de déploiement.

## Le coût de la distribution
Les microservices introduisent des défaillances distribuées. Dans un monolithe, l'appel à un module d'approbation est quasi instantané. Dans les microservices, cet appel devient une requête HTTP. Si le service d'approbation est hors ligne ou si le réseau ralentit, le service de demande échoue également. Vous devez alors gérer les timeouts et les circuit breakers, une complexité inexistante dans un monolithe modulaire.

## Les défis de la cohérence des données
Dans un monolithe, la mise à jour du statut d'une demande et la notification de l'acheteur se font dans une seule transaction base de données. Avec les microservices, chaque service a sa propre base. Si le service d'approbation met à jour le statut mais que le service acheteur ne reçoit pas l'événement, vos données deviennent incohérentes. Résoudre cela demande des patterns complexes comme Saga ou Outbox.

## Exemple : Modulaire vs Distribué
Voici la logique simplifiée d'un flux d'achat :

```java
// Monolithe Modulaire : Simple appel de méthode
public void approveRequest(Long id) {
    Request req = requestRepo.findById(id);
    approvalService.markAsApproved(req);
    buyerService.notifyBuyer(req);
}
```

En microservices, `buyerService.notifyBuyer(req)` devient un appel REST. Si le réseau tombe, la demande est approuvée mais l'acheteur n'est jamais prévenu. Il faudrait ajouter un broker de messages (comme RabbitMQ) pour garantir la fiabilité, augmentant ainsi la charge infrastructurelle.

## Erreur classique : L'illusion de l'interface
Certains pensent qu'une interface propre élimine le couplage. Le couplage concerne la logique, pas seulement les dossiers. Si modifier l'objet `Request` oblige à mettre à jour cinq microservices, vous avez un 'monolithe distribué', le pire des deux mondes.

## Exercice pratique
**Scénario :** Vous avez une petite équipe de deux développeurs et une application simple avec trois modules. Devez-vous passer aux microservices pour 'anticiper la montée en charge' ?

**Réponse :** Non. Commencez par un monolithe modulaire. Ne séparez les services que lorsque vous avez une mesure concrète (ex: un module consomme 10x plus de CPU) ou que la taille de l'équipe rend le code unique ingérable.
