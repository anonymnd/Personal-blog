---
title: "Mise à l'échelle des instances et routage via Load Balancer"
description: "Apprenez à scaler un service de rendu de documents en externalisant l'état et en choisissant entre le routage L4 et L7."
pubDate: 2026-10-08T13:48:00.000Z
translationKey: 213-why-run-multiple-instances-of-the-same-application
seriesOrder: 46
locale: fr
tags: ["system-design","learning-series"]
draft: false
---

## Le problème du passage à l'échelle vertical

Lorsqu'une instance unique atteint ses limites de CPU ou de mémoire, la réponse classique est d'ajouter des ressources (scaling vertical). Cependant, cela a un plafond physique et crée un point de défaillance unique. Le scaling horizontal—exécuter plusieurs instances identiques de la même application—permet de répartir la charge.

Mais passer d'une seule instance à plusieurs introduit un défi majeur : **l'état (state)**. Si un utilisateur télécharge un document sur l'Instance A et demande ensuite le statut du rendu à l'Instance B, l'Instance B n'aura aucune trace du travail si l'état est stocké en mémoire locale ou sur un disque local. Pour scaler, l'application doit être sans état (stateless). Tout état durable (sessions, statut des tâches, fichiers) doit être déplacé vers un stockage partagé externe, comme une base de données ou un cache distribué.

## Load Balancing L4 vs L7

Pour distribuer le trafic entrant, on utilise un Load Balancer (LB). Le choix entre le niveau 4 (Transport) et le niveau 7 (Application) dépend de la compréhension nécessaire du trafic.

### Load Balancing de Niveau 4 (L4)
Le L4 opère au niveau TCP/UDP. Il regarde uniquement l'adresse IP et le port, sans inspecter le contenu du paquet.
- **Mécanisme** : Il redirige simplement les paquets TCP vers les instances backend.
- **Avantages** : Extrêmement rapide, faible consommation CPU, car il ne déchiffre pas le SSL/TLS et n'analyse pas les headers HTTP.
- **Inconvénients** : Aveugle au contenu. Impossible de router selon un chemin d'URL ou un cookie.

### Load Balancing de Niveau 7 (L7)
Le L7 opère au niveau Applicatif (HTTP/HTTPS). Il termine la connexion, lit la requête, puis prend une décision de routage.
- **Mécanisme** : Il peut inspecter les headers HTTP, les cookies et le chemin de l'URL.
- **Avantages** : Routage intelligent. On peut envoyer les requêtes `/status` vers un pool d'instances légères et les requêtes `/render` vers un pool optimisé pour le CPU.
- **Inconvénients** : Latence et usage CPU plus élevés car il doit parser les données applicatives.

## Algorithmes de routage : Round Robin vs Least Connections

Round robin répartit les sélections sans égaliser le coût CPU. L4 répartit normalement connexions ou flux : plusieurs requêtes HTTP d’une connexion persistante peuvent rester sur un backend. L7 peut décider par requête selon son implémentation.

Least connections utilise un indicateur, pas la charge réelle. Une connexion peut porter plusieurs streams HTTP/2, un long rendu ou seulement du keep-alive inactif. Comparez trafic, concurrence et files d’attente. Pondération et concurrence bornée aident à ne pas dépasser la capacité sûre d’un processus.
## Exemple concret : Service de rendu de documents

Imaginons un service avec deux types de trafic :
1. `GET /status/{id}` (Rapide, faible CPU)
2. `POST /render` (Lent, fort CPU)

### Plan d'architecture
- **État externe** : Utilisation d'une base PostgreSQL partagée pour les métadonnées et d'un stockage S3 pour les documents. Ainsi, n'importe quelle instance peut traiter n'importe quelle requête.
- **Choix du LB** : Load Balancer L7 pour permettre le **routage basé sur le chemin (Path-Based Routing)**.
- **Logique de routage** :
    - Chemin `/status` → Route vers le "Pool Léger" (petites instances) via **Round Robin** (requêtes uniformes).
    - Chemin `/render` → Route vers le "Pool Lourd" (instances optimisées CPU) via **Least Connections** (temps de rendu variables).
- **Health Checks** : Le LB interroge périodiquement `/health`. Si une instance renvoie une erreur 500 ou expire, elle est retirée de la rotation jusqu'à son rétablissement.

### Mesure de capacité
Pour savoir quand scaler, on surveille les **Requêtes Concurrentes par Instance**. Si la moyenne du "Pool Lourd" atteint 80% de la capacité maximale de rendus simultanés, on déclenche la création d'une nouvelle instance.

## Exercice

Une pression mémoire inégale malgré des compteurs similaires invite à examiner coût, réutilisation des connexions, fuites et concurrence ; elle ne prouve pas la faute d’un algorithme. Profilez la mémoire des rendus et bornez les jobs simultanés. Mettez en file ou séparez les endpoints lourds si les mesures le justifient ; testez le routage adapté.

Un état partagé simplifie cette API stateless, mais des services stateful peuvent aussi évoluer par partitionnement ou réplication. Un cache distribué n’est pas automatiquement durable. Les contrôles de santé et scale-out prennent du temps : vérifiez drainage, retries, protection contre doublons et capacité lors d’une panne. Le seuil 80% est une politique à tester, pas une règle universelle.
