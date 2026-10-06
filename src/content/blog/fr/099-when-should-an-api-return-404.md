---
title: "Quand une API doit-elle retourner un 404 ?"
description: "Un guide pour distinguer les ressources manquantes des requêtes invalides afin de garantir un contrat API prévisible."
pubDate: 2026-10-10T18:48:00.000Z
translationKey: 099-when-should-an-api-return-404
locale: fr
tags: ["software-engineering","validation-errors","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats. Un manager tente d'approuver une demande d'achat avec l'ID `REQ-123`. Si le serveur retourne un 404, cela signifie-t-il que l'ID est mal formaté, ou simplement que la demande n'existe pas en base de données ? Confondre ces deux scénarios rend la gestion des erreurs côté client difficile et frustrante.

## La définition fondamentale du 404
Le code d'état `404 Not Found` doit être utilisé exclusivement lorsque le serveur ne trouve pas la ressource demandée. En termes REST, l'URI identifie une entité spécifique. Si cette entité est absente de la couche de persistance, le 404 est la réponse correcte. Cela indique que le point de terminaison est valide, mais que l'instance demandée ne l'est pas.

## 404 vs 400 Bad Request
Une erreur courante consiste à retourner un 404 lorsque l'entrée est mal formée. Si un utilisateur envoie un ID de requête trop court ou contenant des caractères interdits, il s'agit d'une erreur de validation, pas d'une ressource manquante. Vous devez retourner `400 Bad Request`. La validation (via `@NotBlank` ou `@NotNull` dans Jakarta EE) intervient avant même l'interrogation de la base de données. Si la forme de l'entrée est incorrecte, arrêtez-vous là avec un 400.

## Exemple concret : Approbation d'achat
Considérons l'endpoint `PUT /requests/{id}/approve`.

1. **Scénario A (400) :** Le client envoie `PUT /requests/abc-123/approve` alors que l'ID doit être numérique. Le serveur rejette la requête immédiatement.
   *Résultat :* `400 Bad Request` - "Format d'ID invalide".
2. **Scénario B (404) :** Le client envoie `PUT /requests/999/approve`. L'ID est numérique, mais aucune demande avec l'ID 999 n'existe.
   *Résultat :* `404 Not Found` - "Demande d'achat 999 non trouvée".

## Erreur classique : L'erreur générique
Les développeurs utilisent souvent un bloc `try-catch` générique qui retourne 404 pour toute exception. Par exemple, si une connexion à la base de données échoue, retourner 404 induit le client en erreur en lui faisant croire que la donnée a disparu. Mappez toujours des exceptions de domaine spécifiques (ex: `ResourceNotFoundException`) vers le 404, et laissez les erreurs imprévues devenir des `500 Internal Server Error`.

## Exercice pratique
Quel code d'état doit être retourné si un utilisateur demande `/orders/55` mais que la commande existe et que l'utilisateur n'a simplement pas la permission de la voir ?

**Réponse :** `403 Forbidden` (ou `404` si vous voulez masquer l'existence de la ressource pour des raisons de sécurité), mais jamais `400` car la requête était syntaxiquement correcte.


## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
