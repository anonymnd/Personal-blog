---
title: "Qu'est-ce qu'un Load Balancer ?"
description: "Un guide complet pour comprendre comment les équilibreurs de charge distribuent le trafic réseau entre plusieurs serveurs pour garantir la haute disponibilité."
pubDate: 2026-10-15T13:48:00.000Z
translationKey: 214-what-is-a-load-balancer
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que vous ayez une application d'achats où les employés soumettent des demandes. Au début, un seul serveur gère tout. Mais avec la croissance de l'entreprise, ce serveur plante sous la pression de centaines de requêtes simultanées. Vous ajoutez trois serveurs, mais un nouveau problème surgit : comment décider quel serveur doit traiter quelle requête ?

## Le Mécanisme Fondamental
Un load balancer (équilibreur de charge) agit comme un proxy inverse, positionné entre le client et un groupe de serveurs backend. Au lieu que le client se connecte directement à un serveur, il contacte le load balancer, qui redirige la requête selon un algorithme précis. Cela évite qu'un serveur unique ne devienne un goulot d'étranglement et garantit que si un serveur tombe, le trafic est redirigé vers ceux qui sont opérationnels.

## Équilibrage L4 vs L7
Les load balancers opèrent à différentes couches du modèle OSI. La couche 4 (Transport) est rapide car elle ne regarde que les adresses IP et les ports TCP/UDP. Elle ignore le contenu du paquet. La couche 7 (Application) est plus intelligente ; elle peut inspecter les en-têtes HTTP, les cookies ou les chemins d'URL. Par exemple, elle peut envoyer les requêtes `/orders` vers un groupe de serveurs et `/approvals` vers un autre.

## Algorithmes de Distribution
Le choix de l'algorithme dépend de votre flux de trafic :

| Algorithme | Logique | Meilleur Cas d'Usage |
| :--- | :--- | :--- |
| Round Robin | Ordre séquentiel | Serveurs aux spécifications identiques |
| Least Connections | Serveur avec le moins de tâches | Connexions longues (WebSockets) |
| IP Hash | L'IP client détermine le serveur | Persistance de session basique |

## Exemple Concret : App d'Achats
Supposons trois serveurs (S1, S2, S3) et un load balancer en Round Robin.
1. Le demandeur A soumet une requête → LB l'envoie vers S1.
2. Le manager B ouvre le tableau de bord → LB l'envoie vers S2.
3. L'acheteur C traite une commande → LB l'envoie vers S3.
4. Le demandeur D soumet une requête → LB revient vers S1.

Résultat : Le trafic est réparti équitablement et aucun serveur n'est saturé.

## Erreur Courante : Le Piège de l'État
Les développeurs oublient souvent que les load balancers rendent le système "stateless". Si un utilisateur se connecte sur S1 et que sa requête suivante va vers S2, S2 ne saura pas qui il est.
**Correction :** Utilisez un état externe partagé (comme Redis) ou des "Sticky Sessions" (affinité de session) pour maintenir l'utilisateur sur le même serveur.

## Exercice Pratique
Si vous avez des serveurs avec des capacités CPU et RAM très différentes, pourquoi le Round Robin est-il un mauvais choix ?

**Réponse :** Le Round Robin traite tous les serveurs comme égaux. Un serveur faible sera submergé tandis qu'un serveur puissant sera sous-utilisé.
