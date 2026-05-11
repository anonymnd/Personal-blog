---
title: "J'ai enfin compris le rôle d'un Load Balancer"
description: "Une exploration conceptuelle de la manière dont les équilibreurs de charge distribuent le trafic pour éviter les pannes."
pubDate: 2026-10-18T05:48:00.000Z
translationKey: 278-i-finally-understand-what-a-load-balancer-does
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où les employés soumettent des demandes. Au début, tout fonctionne bien avec un seul serveur. Mais soudain, l'entreprise grandit et mille personnes envoient des demandes simultanément. Votre serveur commence à ralentir, le CPU atteint 100% et l'application finit par planter. On pourrait penser qu'il suffit d'un serveur plus puissant, mais cela crée un point de défaillance unique : si ce serveur tombe, tout s'arrête.

## L'analogie du policier de la circulation
J'ai réalisé qu'un load balancer n'est pas juste un matériel, c'est comme un policier devant un groupe de serveurs. Au lieu que chaque utilisateur sollicite le même serveur, ils passent d'abord par l'équilibreur. Celui-ci décide quel serveur sain est le mieux placé pour traiter la requête. Cela permet de passer à l'échelle horizontalement en ajoutant plusieurs petits serveurs plutôt qu'un seul serveur coûteux et risqué.

## Le mécanisme de distribution
Les load balancers utilisent des algorithmes pour orienter le trafic. Le plus courant est le 'Round Robin', où l'équilibreur cycle simplement dans la liste : la requête 1 va au Serveur A, la 2 au Serveur B, et ainsi de suite. Des méthodes plus avancées utilisent le 'Least Connections', envoyant l'utilisateur vers le serveur ayant le moins de tâches actives.

## Flux hypothétique d'achat
Dans notre application d'achats, quand un manager clique sur 'Approuver', la requête HTTP arrive au Load Balancer.

```http
GET /approve/request/123 HTTP/1.1
Host: procurement-app.com
```

Le Load Balancer vérifie son pool : le Serveur A est occupé, mais le Serveur B est disponible. Il redirige la requête vers le Serveur B. Le manager reçoit une réponse rapide, et le Serveur A reste libre pour d'autres demandes.

## L'erreur classique : Les sessions collantes
Une erreur courante est d'oublier les données de session. Si un utilisateur se connecte sur le Serveur A, mais que le load balancer envoie son prochain clic vers le Serveur B, ce dernier ne saura pas qui il est. La solution est d'utiliser des 'Sticky Sessions' ou, idéalement, de stocker les sessions dans un cache Redis partagé.

## Exercice pratique
Si vous avez 3 serveurs et utilisez l'algorithme Round Robin, quel serveur reçoit la 7ème requête ?

**Réponse :** Le Serveur A (1–A, 2–B, 3–C, 4–A, 5–B, 6–C, 7–A).
