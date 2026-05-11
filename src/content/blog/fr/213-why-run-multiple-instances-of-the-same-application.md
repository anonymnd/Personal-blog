---
title: "Pourquoi exécuter plusieurs instances de la même application ?"
description: "Une exploration de la mise à l'échelle horizontale pour améliorer la disponibilité et les performances via la distribution de la charge."
pubDate: 2026-10-15T12:48:00.000Z
translationKey: 213-why-run-multiple-instances-of-the-same-application
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que vous ayez créé une application d'achats où les employés soumettent des demandes. Au début, un seul serveur gère tout parfaitement. Mais avec la croissance de l'entreprise, des centaines de personnes soumettent des demandes simultanément. Soudain, le serveur ralentit, les requêtes expirent et si ce serveur unique tombe en panne, tout le processus d'achat s'arrête. C'est le problème du « point de défaillance unique ».

## Mise à l'échelle horizontale vs verticale
Lorsqu'un serveur peine, on peut ajouter du CPU ou de la RAM (Scaling Vertical), mais il existe une limite physique à la taille d'une machine. Exécuter plusieurs instances de la même application (Scaling Horizontal) permet de répartir la charge sur plusieurs petites machines. Cela garantit que si une instance échoue, les autres continuent de traiter les requêtes.

## Le rôle du Load Balancer
Pour que plusieurs instances fonctionnent, il faut un Load Balancer (répartiteur de charge). Il agit comme un agent de circulation, recevant les requêtes HTTP et les routant vers les instances disponibles. Il peut utiliser différents algorithmes : le Round Robin alterne simplement entre les serveurs, tandis que le Least Connections envoie le trafic vers l'instance ayant la charge la plus faible.

## Gestion de l'état partagé
Un défi critique est que les instances doivent être sans état (stateless). Si un demandeur télécharge un document sur l'Instance A et que le manager tente de l'approuver via l'Instance B, l'Instance B ne trouvera pas le fichier s'il est stocké localement. Vous devez déplacer l'état vers un stockage externe partagé, comme une base de données ou un cache distribué tel que Redis.

## Exemple concret : Approbation d'achat
Considérons un flux de requête :
1. **Demandeur** envoie POST `/request` → Load Balancer → **Instance 1**. L'Instance 1 enregistre la demande dans une DB PostgreSQL partagée.
2. **Manager** envoie GET `/pending` → Load Balancer → **Instance 2**. L'Instance 2 récupère les données depuis la même DB PostgreSQL.

**Résultat :** Le système reste disponible même si l'Instance 1 plante pendant la revue du manager.

## Erreur courante : Sessions locales
Les développeurs stockent souvent les sessions utilisateur en mémoire locale (`HttpSession` dans Jakarta EE). Dans une configuration multi-instances, un utilisateur peut être connecté à l'Instance 1 mais être routé vers l'Instance 2, provoquant une déconnexion soudaine.
**Correction :** Utilisez un magasin de sessions distribué ou des JWT (JSON Web Tokens) pour que n'importe quelle instance puisse vérifier l'utilisateur.

## Exercice pratique
Si vous avez 3 instances et utilisez un load balancer Round Robin, quelle instance reçoit la 4ème requête ?

**Réponse :** L'Instance 1 (Le cycle redémarre : 1, 2, 3, puis 1).
