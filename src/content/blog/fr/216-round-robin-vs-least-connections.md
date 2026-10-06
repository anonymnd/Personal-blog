---
title: "Round Robin vs Least Connections"
description: "Une comparaison de deux algorithmes fondamentaux d'équilibrage de charge pour optimiser la distribution du trafic."
pubDate: 2026-10-15T15:48:00.000Z
translationKey: 216-round-robin-vs-least-connections
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que vous gérez une application d'achats où les employés soumettent des demandes de commande. Avec l'augmentation du trafic, un seul serveur ne suffit plus, et vous déployez trois instances identiques. La question est : comment décider quel serveur reçoit la prochaine requête ?

## Le mécanisme Round Robin
Le Round Robin est la stratégie la plus simple. L'équilibreur de charge maintient une liste des serveurs disponibles et distribue les requêtes de manière séquentielle. La requête 1 va au Serveur A, la 2 au Serveur B, la 3 au Serveur C, puis la 4 revient au Serveur A. Il fonctionne principalement au niveau de la couche transport (L4), sans inspecter le contenu de la requête.

## Le mécanisme Least Connections
Contrairement à la rotation aveugle du Round Robin, le Least Connections est dynamique. L'équilibreur suit le nombre de connexions actives sur chaque serveur. Lorsqu'une nouvelle requête arrive, elle est envoyée au serveur ayant le moins de sessions ouvertes. C'est idéal pour le trafic de couche application (L7) où certaines tâches, comme l'exportation d'un rapport d'achat, sont beaucoup plus longues que d'autres.

## Analyse Comparative

| Caractéristique | Round Robin | Least Connections |
| :--- | :--- | :--- |
| Complexité | Très faible | Modérée |
| État du serveur | Sans état (Stateless) | Sensible à l'état |
| Cas d'usage | Charge uniforme | Temps de traitement variables |
| Surcharge | Minimale | Plus élevée (suivi des connexions) |

## Exemple concret : App d'achats
Supposons deux serveurs. Le Serveur A traite l'exportation d'un PDF lourd (connexion longue), tandis que le Serveur B est inactif.
- **Round Robin :** Envoie les 5 prochaines requêtes équitablement (3 à A, 2 à B), risquant de saturer le Serveur A déjà occupé.
- **Least Connections :** Voit que A a 1 connexion et B en a 0. Il redirige tout vers B jusqu'à ce que le PDF soit terminé ou que B soit rattrapé.

## Erreur courante : Ignorer la capacité matérielle
Une erreur fréquente est d'utiliser Least Connections sur un cluster avec du matériel hétérogène (ex: un serveur de 8 Go de RAM et un autre de 32 Go). L'algorithme suppose que tous les serveurs sont égaux. Si le serveur faible termine vite des petites tâches, il pourrait attirer plus de connexions que sa capacité réelle. La solution est d'utiliser le **Weighted Least Connections** (Connexions pondérées).

## Exercice pratique
Scénario : Votre application reçoit des milliers de pings API qui prennent tous exactement 10ms. Quel algorithme est le plus efficace ?

**Réponse :** Round Robin. Puisque la charge est uniforme et le temps de traitement constant, le coût de suivi des connexions du Least Connections n'apporte aucun avantage.
