---
title: "Que fait @RequestParam ?"
description: "Apprenez à capturer les paramètres de requête d'une URL pour rendre vos contrôleurs Spring Boot dynamiques."
pubDate: 2026-10-09T09:48:00.000Z
translationKey: 066-what-does-requestparam-do
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Un manager souhaite consulter la liste des demandes, mais pas toutes : il veut uniquement celles d'un service spécifique. Si votre URL est simplement `/requests`, vous recevez tout. Mais comment dire à Spring Boot de filtrer pour « IT » ou « RH » ? C'est là qu'intervient `@RequestParam`.

## Le mécanisme des paramètres de requête
`@RequestParam` est une annotation utilisée dans les contrôleurs Spring Boot pour extraire des valeurs de la chaîne de requête (query string) d'une URL. La chaîne de requête est la partie qui suit le symbole `?`. Par exemple, dans `/requests?dept=IT`, la clé est `dept` et la valeur est `IT`. Spring Boot mappe cette valeur directement dans un paramètre de méthode Java.

## Implémentation pratique
Dans un scénario d'achats, vous pourriez avoir une méthode pour filtrer les demandes. Voici l'exemple de code :

```java
@GetMapping("/requests")
public List<Request> getRequests(@RequestParam(name = "dept") String department) {
    // Logique pour filtrer les demandes par le service fourni
    return requestService.findByDepartment(department);
}
```
Si un utilisateur visite `/requests?dept=Finance`, la variable `department` contiendra la chaîne "Finance".

## Gestion des paramètres optionnels
Par défaut, `@RequestParam` est obligatoire. Si l'utilisateur visite `/requests` sans la partie `?dept=...`, Spring renverra une erreur 400 Bad Request. Pour éviter cela, vous pouvez configurer `required = false` ou fournir une `defaultValue`.

| Attribut | Effet | Résultat si absent |
| :--- | :--- | :--- |
| `required = true` | Comportement par défaut | 400 Bad Request |
| `required = false` | Paramètre optionnel | Variable est `null` |
| `defaultValue` | Fournit une valeur de secours | Variable utilise la valeur par défaut |

## Erreur courante : Confusion avec @PathVariable
Une erreur fréquente consiste à utiliser `@RequestParam` alors que la valeur fait partie du chemin de l'URL (ex: `/requests/123`) au lieu de la chaîne de requête. `@PathVariable` sert à la structure du chemin, tandis que `@RequestParam` sert au filtrage ou aux données optionnelles.

**Correction :** Utilisez `@RequestParam` pour `?clé=valeur` et `@PathVariable` pour `/{id}`.

## Exercice pratique
Créez une méthode de contrôleur qui accepte un paramètre de requête nommé `status` (ex: `PENDING`, `APPROVED`) avec une valeur par défaut `PENDING` si aucun paramètre n'est fourni.

**Vérification :** Votre signature de méthode devrait ressembler à : `public List<Request> getByStatus(@RequestParam(defaultValue = "PENDING") String status)`.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
