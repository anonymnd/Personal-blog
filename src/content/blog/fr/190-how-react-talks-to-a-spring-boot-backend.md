---
title: "Comment React communique avec un backend Spring Boot"
description: "Un guide pour débutants sur la connexion d'un frontend React à une API Spring Boot via fetch et la configuration CORS."
pubDate: 2026-10-14T13:48:00.000Z
translationKey: 190-how-react-talks-to-a-spring-boot-backend
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez créé un tableau de bord d'achat en React où un demandeur peut soumettre une requête. Vous cliquez sur 'Envoyer', mais rien ne se passe car vos données restent dans le navigateur alors que votre logique Java est sur un serveur. Le pont entre les deux est le protocole HTTP, généralement via une API REST.

## Le Cycle Requête-Réponse
React s'exécute dans le navigateur de l'utilisateur, tandis que Spring Boot s'exécute sur un serveur. Pour communiquer, React envoie une requête HTTP (comme GET ou POST) vers une URL spécifique (endpoint). Spring Boot écoute ces requêtes, traite la logique métier—comme l'enregistrement d'une demande—et renvoie une réponse, généralement au format JSON. Le JSON est le langage universel ici car JavaScript et Java peuvent le traiter facilement.

## Gérer les Barrières CORS
Lors de votre première tentative de connexion, vous verrez probablement une 'erreur CORS' dans la console. Le Cross-Origin Resource Sharing (CORS) est une sécurité imposée par le navigateur. Comme votre application React est peut-être sur `localhost:3000` et Spring Boot sur `localhost:8080`, le navigateur bloque la réponse car les origines diffèrent. Vous devez indiquer à Spring Boot d'autoriser les requêtes provenant de l'origine React.

## Exemple Concret : Soumettre une Demande
Dans Spring Boot, vous créez un contrôleur pour gérer la demande d'achat :

```java
@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class ProcurementController {
    @PostMapping
    public ResponseEntity<String> createRequest(@RequestBody PurchaseRequest req) {
        return ResponseEntity.ok("Demande " + req.getId() + " soumise!");
    }
}
```

Dans React, vous utilisez l'API `fetch` pour envoyer les données :

```javascript
const submitRequest = async (data) => {
  const response = await fetch('http://localhost:8080/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.text();
  console.log(result);
};
```

## Erreur Courante : L'oubli du Content-Type
Une erreur fréquente est l'omission de l'en-tête `'Content-Type': 'application/json'` dans l'appel fetch. Sans cela, le `@RequestBody` de Spring Boot ne saura pas comment désérialiser les octets entrants en objet Java, provoquant une erreur `415 Unsupported Media Type`.

## Exercice Pratique
Si votre application React est hébergée sur `https://app.procure.com` et votre API sur `https://api.procure.com`, quelle annotation ou configuration est nécessaire dans Spring Boot pour permettre la communication ?

**Réponse :** Utiliser `@CrossOrigin(origins = "https://app.procure.com")` sur le contrôleur ou un bean `WebMvcConfigurer` global pour autoriser cette origine spécifique.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
