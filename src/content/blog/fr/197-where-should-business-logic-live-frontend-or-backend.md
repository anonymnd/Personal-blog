---
title: "Où doit se situer la logique métier : Frontend ou Backend ?"
description: "Un guide pour décider où placer les validations et les règles pour garantir la sécurité et la performance de l'application."
pubDate: 2026-10-14T20:48:00.000Z
translationKey: 197-where-should-business-logic-live-frontend-or-backend
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achat où un demandeur soumet une requête. Vous ajoutez une règle : « Les demandes de plus de 1 000 $ nécessitent l'approbation d'un manager ». Vous implémentez ce contrôle dans le frontend React pour afficher un avertissement. Cependant, un utilisateur malin ouvre la console du navigateur et envoie une requête API manuelle de 5 000 $, contournant totalement votre interface. La requête est traitée car le serveur n'a pas vérifié la règle. C'est le dilemme classique du placement de la logique métier.

## Le rôle de la logique Frontend
La logique frontend sert principalement l'expérience utilisateur (UX). Son but est de fournir un retour immédiat. Lorsque vous vérifiez si un email est bien formaté ou si un champ obligatoire est vide avant l'envoi, vous utilisez la logique frontend. Cela évite des allers-retours réseau inutiles. Cependant, comme le navigateur est contrôlé par l'utilisateur, toute logique ici peut être contournée.

## La nécessité de la logique Backend
La logique backend est la « source de vérité ». Elle est responsable de la sécurité, de l'intégrité des données et des règles métier. Peu importe ce que le frontend envoie, le serveur doit valider la requête. Dans notre application d'achat, le backend doit vérifier le montant de la demande par rapport aux permissions de l'utilisateur avant de l'enregistrer. C'est indispensable car le serveur est le seul environnement totalement maîtrisé par le développeur.

## Exemple concret : Flux d'approbation
Considérons la soumission d'une demande. Le frontend gère la logique « visuelle », tandis que le backend gère la logique « autoritaire ».

**Frontend (Extrait illustratif) :**
```javascript
if (requestAmount > 1000) {
  showNotification("Ceci nécessitera l'approbation d'un manager");
}
```
**Backend (Extrait Jakarta EE) :**
```java
public Response processRequest(PurchaseRequest req) {
    if (req.getAmount() > 1000 && !req.isManagerApproved()) {
        return Response.status(403).entity("Approbation requise").build();
    }
    return service.save(req);
}
```
**Résultat :** L'utilisateur voit un indice utile dans l'interface, mais le système reste sécurisé même si l'UI est contournée.

## Erreur courante : Faire confiance au client
Une erreur fréquente est d'implémenter un calcul complexe (comme un prix remisé) uniquement sur le frontend et d'envoyer le total final au serveur. Un utilisateur peut modifier le prix à 0,01 $ dans le corps de la requête.

**Correction :** Envoyez uniquement l'ID de l'article et la quantité. Laissez le backend calculer le prix en utilisant la liste officielle des prix en base de données.

## Exercice pratique
Scénario : Un utilisateur doit avoir au moins 18 ans pour s'inscrire. Où ce contrôle doit-il être effectué ?

**Réponse :** Aux deux endroits. Frontend pour une meilleure UX (message d'erreur instantané), et Backend pour empêcher les inscriptions non autorisées via des outils API.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
