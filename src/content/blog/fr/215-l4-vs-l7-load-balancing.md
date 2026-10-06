---
title: "L4 vs L7 Load Balancing"
description: "Une comparaison technique entre l'équilibrage de charge de couche transport et de couche application pour optimiser la distribution du trafic."
pubDate: 2026-10-15T14:48:00.000Z
translationKey: 215-l4-vs-l7-load-balancing
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez que vous développiez un système d'achats où des milliers d'employés soumettent des demandes. À mesure que le trafic augmente, un seul serveur ne suffit plus. Vous installez un équilibreur de charge (load balancer), mais vous hésitez : doit-il simplement router les paquets via les adresses IP, ou doit-il inspecter le contenu de la requête pour décider de sa destination ?

## Comprendre l'équilibrage L4
L'équilibrage L4 opère au niveau de la couche Transport du modèle OSI. Il prend des décisions basées sur des données réseau : l'IP source, l'IP destination et les ports TCP/UDP. Il ne regarde pas le contenu du payload HTTP. Comme il ne déchiffre pas les données applicatives, le L4 est extrêmement rapide et consomme peu de CPU.

## Comprendre l'équilibrage L7
L'équilibrage L7 opère au niveau de la couche Application. Il peut lire les en-têtes HTTP, les cookies et le chemin de l'URL. Cela permet un routage "sensible au contenu". Par exemple, les requêtes vers `/api/approvals` peuvent être envoyées vers un cluster de serveurs, tandis que `/api/orders` va vers un autre. Le L7 est plus flexible mais plus lent car il doit terminer la connexion TCP et analyser la requête.

## Tableau Comparatif

| Caractéristique | L4 (Transport) | L7 (Application) |
| :--- | :--- | :--- |
| Base de décision | IP & Port | URL, Header, Cookie |
| Performance | Élevée (Faible latence) | Plus faible (Surcharge) |
| Intelligence | Faible | Élevée |
| Terminaison SSL | Non (Pass-through) | Oui |

## Exemple concret : App d'achats
Dans une application de procurement, on utilise une approche hybride. Un répartiteur L4 distribue d'abord le trafic brut vers plusieurs répartiteurs L7. Le L7 route ensuite selon le rôle de l'utilisateur :
- `GET /requests` $ightarrow$ Serveur réplique en lecture seule
- `POST /approve` $ightarrow$ Serveur d'approbation haute priorité

Résultat : Le système obtient à la fois un débit élevé (via L4) et un pilotage précis du trafic (via L7).

## Erreur courante : L'abus du L7
Certains développeurs utilisent le L7 pour tout. Cependant, utiliser le L7 pour de simples tests de santé (health checks) ou des flux binaires massifs crée un goulot d'étranglement.
**Correction :** Utilisez le L4 comme point d'entrée de votre infrastructure pour gérer les pics de trafic avant de passer au L7 pour le routage logique.

## Exercice pratique
Si vous devez router le trafic en fonction d'un cookie `User-ID` pour garantir qu'un utilisateur tombe toujours sur le même serveur, quelle couche devez-vous utiliser ?

**Réponse :** La couche 7, car les cookies font partie de l'en-tête HTTP, ce qui est invisible pour la couche 4.
