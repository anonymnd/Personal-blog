---
title: "Du Clic React à la Requête SQL : Le Parcours Complet d'une Requête"
description: "Une analyse étape par étape de la manière dont une interaction utilisateur dans React déclenche la récupération de données dans une base SQL."
pubDate: 2026-10-14T17:48:00.000Z
translationKey: 194-from-react-click-to-sql-query-the-full-request-journey
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un manager clique sur le bouton 'Approuver' pour une demande d'achat, mais vous ne savez pas exactement ce qui se passe entre ce clic et la mise à jour de l'enregistrement en base de données. Ce fossé entre l'interface et le disque est souvent source de confusion pour les débutants.

## Le Déclencheur : Gestion d'Événement React
Tout commence par un écouteur d'événement. Dans React, le bouton possède un gestionnaire `onClick`. Lors du clic, cette fonction déclenche une requête HTTP asynchrone, généralement via l'API `fetch` ou Axios. Le navigateur emballe cette requête avec une URL, une méthode (comme POST) et un corps contenant l'ID de la demande.

## Le Pont : HTTP et CORS
La requête voyage sur le réseau vers le serveur. Avant que le navigateur n'autorise le frontend à lire la réponse, il vérifie le CORS (Cross-Origin Resource Sharing). Si votre application React est sur `localhost:3000` et votre API sur `localhost:8080`, le navigateur s'assure que le serveur autorise explicitement cette origine. Le CORS est une politique de sécurité appliquée par le navigateur pour empêcher la lecture non autorisée, et non un système d'authentification.

## La Logique : Le Contrôleur Backend
Une fois que la requête atteint le serveur (par exemple, une application Spring Boot), un Contrôleur l'intercepte. Il analyse le corps JSON et transmet les données à une couche Service. C'est ici que la logique métier s'applique : le système vérifie si l'utilisateur a réellement l'autorité d'approuver cette demande d'achat spécifique.

## L'Étape Finale : Exécution SQL
Enfin, le backend utilise un dépôt pour exécuter une requête SQL. Pour notre application d'achats, cela ressemblerait à ceci :

```sql
UPDATE purchase_requests 
SET status = 'APPROVED' 
WHERE id = 123 AND status = 'PENDING';
```

## Erreur Courante : Confondre CORS et Sécurité
Une erreur fréquente consiste à croire que la configuration CORS empêche les utilisateurs non autorisés d'accéder à l'API. En réalité, le CORS empêche seulement le *navigateur* de lire la réponse. Un attaquant utilisant un terminal (cURL) peut contourner le CORS. Vous devez toujours valider la session et les permissions côté serveur.

## Exercice Pratique
Si une application React envoie une requête et que la console affiche une 'erreur CORS', mais que l'enregistrement en base de données a quand même été mis à jour, comment est-ce possible ?

**Réponse :** La requête a atteint le serveur et a exécuté le SQL, mais le serveur n'a pas renvoyé l'en-tête `Access-Control-Allow-Origin` correct, donc le navigateur a bloqué la lecture de la réponse.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
