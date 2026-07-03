---
title: "Comprendre les Origines, le CORS et l'Accès Imposé par le Navigateur"
description: "Analyse approfondie de la politique de même origine (SOP), des mécanismes de preflight et de la distinction cruciale entre CORS et authentification."
pubDate: 2026-10-08T09:48:00.000Z
translationKey: 195-what-is-cors
seriesOrder: 42
locale: fr
tags: ["web-communication","learning-series"]
draft: false
---

## Le Tuple d'Origine

La sécurité dans le navigateur repose sur la Same-Origin Policy (SOP). Une « origine » n'est pas simplement un domaine ; c'est un tuple strict composé de trois éléments : **le Schéma (Protocole), l'Hôte et le Port**. Si l'un de ces éléments diffère, le navigateur considère la requête comme cross-origin.

Prenons notre scénario : un tableau de bord sur `http://localhost:3000` tentant d'appeler un backend sur `http://localhost:8080`.

*   **Schéma :** `http` == `http` (Correspondance)
*   **Hôte :** `localhost` == `localhost` (Correspondance)
*   **Port :** `3000` != `8080` (Différence)

Comme les ports sont différents, ce sont des origines distinctes. Cela s'applique également aux sous-domaines : `dashboard.example.com` et `api.example.com` sont des origines différentes car les hôtes diffèrent.

## SOP vs CORS : La Politique de Lecture

Une idée reçue courante est que la SOP bloque l' *envoi* des requêtes. En réalité, la SOP bloque principalement la *lecture* de la réponse. Pour beaucoup de requêtes, le navigateur envoie les données au serveur, le serveur les traite et renvoie une réponse, mais le navigateur empêche le code JavaScript d'accéder à cette réponse, à moins que le serveur ne l'autorise explicitement via le Cross-Origin Resource Sharing (CORS).

## Requêtes Simples vs Preflight

Toutes les requêtes cross-origin ne sont pas traitées de la même manière. Le navigateur les classe en requêtes « Simples » ou « Preflighted ».

### Requêtes Simples
Les requêtes utilisant `GET`, `POST` ou `HEAD` avec des headers standards (comme `Accept`, `Content-Type: application/x-www-form-urlencoded`, `multipart/form-data` ou `text/plain`) sont envoyées immédiatement. Le navigateur vérifie le header `Access-Control-Allow-Origin` dans la réponse. S'il ne correspond pas à l'origine demanderesse, le navigateur génère une erreur CORS et masque la réponse au script.

### Requêtes Preflight (OPTIONS)
Si une requête utilise une méthode comme `PUT` ou `DELETE`, ou un header comme `Content-Type: application/json`, le navigateur envoie d'abord une requête `OPTIONS`. C'est le « Preflight ». Il demande au serveur : « J'ai l'intention d'envoyer une requête PUT en JSON ; l'autorisez-vous ? »

Si le serveur répond par un `200 OK` avec les headers `Access-Control-Allow-Methods` et `Access-Control-Allow-Headers` appropriés, le navigateur envoie alors la requête réelle.

## Identifiants et le Piège du Wildcard

Pour les cookies cross-origin, le client utilise credentials: include ou withCredentials, et la réponse exige Access-Control-Allow-Credentials: true avec une origine explicite autorisée plutôt que *. Domain, SameSite et politiques du navigateur peuvent encore empêcher les cookies.

Un header Authorization fourni manuellement est distinct : envoyez-le explicitement et autorisez-le au preflight ; credentials: include n’est pas nécessaire uniquement pour ce header. Ne confondez pas bearer token et cookies. Réfléchir aveuglément tout Origin contournerait une allowlist.
## Exemple Concret : Trace de Diagnostic

Le dashboard envoie un POST JSON avec cookies. Le preflight contient Origin, Access-Control-Request-Method: POST et Access-Control-Request-Headers: content-type. Il faut les autorisations adaptées d’origine, credentials et headers. L’absence de Allow-Headers: content-type bloque ce JSON. POST est lui-même safelisted : la seule absence de Allow-Methods n’est donc pas le bon exemple ici.

La réponse réelle doit aussi autoriser origine explicite et credentials. Allow-Origin: * la rend illisible en mode include. Un preflight 204 peut réussir ; 200 n’est pas le seul succès acceptable.
## Le CORS n'est pas une Sécurité

Le CORS est un mécanisme imposé par le navigateur pour protéger les données de l'utilisateur contre des scripts malveillants dans d'autres onglets. Ce n'est **pas** un remplacement pour :
*   **L'Authentification :** Le CORS ne vérifie pas l'identité de l'utilisateur.
*   **L'Autorisation :** Le CORS ne vérifie pas si l'utilisateur a le droit de supprimer une ressource.
*   **La Protection CSRF :** Comme les requêtes simples sont envoyées *avant* la vérification CORS, un site malveillant peut toujours déclencher une requête POST changeant l'état (CSRF), même s'il ne peut pas lire la réponse.

## Exercice

**Question :** Vous avez un environnement de production où le frontend est sur `https://app.example.com` et l'API sur `https://api.example.com`. Le frontend envoie une requête `DELETE` avec un header personnalisé `X-Request-ID` et inclut des cookies de session. Quels headers spécifiques le serveur doit-il renvoyer lors du preflight et de la réponse réelle pour autoriser cela ?

**Réponse :**
1.  **Preflight (OPTIONS) :**
    *   `Access-Control-Allow-Origin: https://app.example.com`
    *   `Access-Control-Allow-Methods: DELETE`
    *   `Access-Control-Allow-Headers: X-Request-ID`
    *   `Access-Control-Allow-Credentials: true`
2.  **Réponse Réelle (DELETE) :**
    *   `Access-Control-Allow-Origin: https://app.example.com`
    *   `Access-Control-Allow-Credentials: true`

## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
