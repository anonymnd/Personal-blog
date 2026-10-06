---
title: "Que se passe-t-il quand on clique sur un bouton dans une application web ?"
description: "Une analyse étape par étape du trajet entre le clic du navigateur et la réponse du serveur."
pubDate: 2026-10-14T16:48:00.000Z
translationKey: 193-what-happens-when-you-click-a-button-in-a-web-application
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous utilisez une application d'achats. Vous avez rempli une demande pour un nouvel ordinateur et vous cliquez sur le bouton 'Envoyer la demande'. Un indicateur de chargement apparaît. Mais que se passe-t-il réellement en coulisses durant ces quelques millisecondes ?

## Le déclenchement de l'événement
Lors du clic, le navigateur détecte un 'événement de clic'. Dans le code frontend (JavaScript), un écouteur d'événement attend cette action. Au lieu de rafraîchir toute la page, les applications modernes utilisent un appel API (via `fetch` ou `axios`) pour envoyer des données de manière asynchrone. Le navigateur emballe votre demande dans un paquet HTTP contenant une méthode (généralement POST), une URL de destination et le corps de la requête (les détails de l'ordinateur au format JSON).

## Le voyage réseau et le CORS
Avant que la requête ne parte, le navigateur vérifie l' 'Origine' (schéma, hôte et port). Si l'API est sur un domaine différent du site, le navigateur applique la politique CORS (Cross-Origin Resource Sharing). Il est crucial de comprendre que le CORS est une politique appliquée par le navigateur pour empêcher la lecture non autorisée des réponses ; il n'empêche pas la requête d'atteindre le serveur, mais il peut bloquer l'accès du JavaScript à la réponse si le serveur ne donne pas son accord.

## Le traitement côté serveur
Une fois la requête arrivée, un contrôleur la réceptionne. Dans un environnement Java Jakarta EE, cela ressemblerait à ceci :

```java
@POST
@Path("/requests")
public Response submitRequest(ProcurementRequest request) {
    // Logique métier : vérifier le budget
    boolean approved = budgetService.verify(request.getAmount());
    return Response.ok(new ResponseDto("Envoyé", approved)).build();
}
```
Le serveur exécute la logique métier, enregistre la demande en base de données et génère une réponse HTTP (ex: `201 Created` ou `400 Bad Request`).

## La mise à jour du frontend
Le navigateur reçoit la réponse. La promesse JavaScript est résolue, et le code met à jour le DOM (Document Object Model) pour masquer le spinner et afficher un message de succès.

## Erreur courante : Confondre CORS et Sécurité
Une erreur fréquente est de croire que le CORS est un mur de sécurité qui bloque toutes les requêtes malveillantes. En réalité, le CORS protège uniquement l'utilisateur du navigateur. Un attaquant utilisant un terminal (curl) peut ignorer totalement le CORS. Vous devez impérativement implémenter une autorisation côté serveur.

## Exercice pratique
Si un clic envoie une requête vers `api.company.com` depuis `app.company.com` et que la console affiche une 'erreur CORS', le serveur a-t-il reçu la requête ?

**Réponse :** Oui, la requête atteint généralement le serveur, mais le navigateur bloque la lecture de la réponse car les en-têtes du serveur n'autorisaient pas cette origine.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
