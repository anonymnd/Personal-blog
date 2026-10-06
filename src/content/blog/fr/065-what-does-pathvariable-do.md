---
title: "À quoi sert @PathVariable ?"
description: "Découvrez comment extraire des valeurs dynamiques d'une URL pour créer des points de terminaison API flexibles et RESTful avec Spring Boot."
pubDate: 2026-10-09T08:48:00.000Z
translationKey: 065-what-does-pathvariable-do
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement. Vous avez des milliers de demandes d'achat et vous devez pouvoir en récupérer une seule via son identifiant. Si vous créiez un point de terminaison distinct pour chaque ID, votre code serait infini. C'est là que les débutants bloquent : comment dire à Spring Boot qu'une partie de l'URL est une variable et non une chaîne de caractères statique ?

## Le mécanisme de @PathVariable

L'annotation `@PathVariable` est utilisée pour lier une variable de modèle URI à un paramètre de méthode dans un contrôleur Spring. Lorsqu'une requête arrive, Spring analyse le chemin du `@RequestMapping`. S'il voit un espace réservé entre accolades, comme `{id}`, il extrait la valeur à cette position dans l'URL réelle et l'assigne à la variable annotée avec `@PathVariable`.

## Implémentation pratique

Dans une application d'achat, un manager doit approuver une demande spécifique. Au lieu d'envoyer l'ID dans une chaîne de requête (comme `?id=10`), nous utilisons une variable de chemin pour un design RESTful plus propre.

```java
@RestController
@RequestMapping("/requests")
public class RequestController {

    @GetMapping("/{requestId}")
    public String getRequestDetails(@PathVariable Long requestId) {
        // Dans une vraie app, on appellerait un service ici
        return "Récupération des détails pour la demande ID: " + requestId;
    }
}
```

Si un utilisateur visite `/requests/502`, Spring identifie `502` comme le `requestId`. Le résultat est une réponse indiquant : "Récupération des détails pour la demande ID: 502".

## Erreur courante : Incohérence de nommage

Une erreur fréquente survient lorsque le nom entre accolades ne correspond pas au nom du paramètre de la méthode. Par exemple, utiliser `/{id}` dans le mapping mais `@PathVariable Long requestId` dans la méthode. Cela provoque une erreur car Spring ne trouve pas de variable nommée `requestId` dans le chemin.

**Correction :** Soit vous rendez les noms identiques, soit vous définissez explicitement le nom dans l'annotation : `@PathVariable("id") Long requestId`.

## PathVariable vs RequestParam

| Caractéristique | @PathVariable | @RequestParam |
| :--- | :--- | :--- |
| Style URL | `/requests/10` | `/requests?id=10` |
| Objectif | Identifier une ressource | Filtrer ou trier |
| Obligation | Généralement obligatoire | Peut être optionnel |

## Exercice pratique

Créez une méthode de mapping qui permet à un acheteur de mettre à jour le statut d'une commande en utilisant une variable de chemin pour l' `orderId` et une autre pour le `status` (ex: `/orders/123/status/shipped`).

**Vérification :** Votre signature de méthode devrait ressembler à : `public String updateStatus(@PathVariable Long orderId, @PathVariable String status)`.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
