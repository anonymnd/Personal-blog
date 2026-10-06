---
title: "Que signifie le Port Mapping ?"
description: "Un guide pour débutants pour comprendre comment Docker connecte les ports de votre ordinateur à ceux d'un conteneur."
pubDate: 2026-10-13T11:48:00.000Z
translationKey: 164-what-does-port-mapping-mean
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez une base de données qui tourne dans un conteneur Docker. Vous essayez de vous y connecter via `localhost:5432` sur votre machine, mais la connexion est refusée. Bien que la base de données fonctionne parfaitement à l'intérieur du conteneur, elle est enfermée dans son propre espace réseau isolé. Le conteneur est comme une pièce fermée sans porte ; le port mapping consiste à créer une porte spécifique entre votre machine hôte et cette pièce.

## Le mécanisme de mapping
Par défaut, les conteneurs possèdent leurs propres adresses IP et ports internes. Cependant, votre navigateur ou votre client API communique avec votre système d'exploitation hôte. Le mapping de ports (ou redirection de port) indique à Docker : "Tout trafic arrivant sur l'hôte au port X doit être redirigé vers le conteneur au port Y". Cela s'exprime sous la forme `port_hôte:port_conteneur`. Il est crucial de comprendre que le `localhost` du conteneur est différent du `localhost` de votre machine.

## Exemple concret : Application d'achats
Supposons que vous développiez une application d'achats où un demandeur soumet une requête. Le backend tourne sur le port 8080 à l'intérieur du conteneur, mais vous voulez y accéder via le port 9000 sur votre ordinateur pour éviter des conflits.

```bash
# Mapping du port hôte 9000 vers le port conteneur 8080
docker run -p 9000:8080 procurement-backend
```

**Résultat :** Lorsque vous visitez `http://localhost:9000`, Docker intercepte la requête et l'envoie vers le port 8080 à l'intérieur du conteneur. L'application traite la demande et renvoie la réponse par le même tunnel.

## Erreur courante : Inverser l'ordre
Une erreur fréquente est d'inverser les ports, par exemple écrire `-p 8080:9000` alors que l'application interne écoute sur le 8080.

**Correction :** Retenez toujours le schéma `Externe:Interne`. Si votre application Java Spring Boot utilise `server.port=8080`, le deuxième chiffre de votre mapping doit être 8080.

## Communication entre conteneurs
Si vous avez un service de gestion et un service d'achat dans le même réseau Docker Compose, ils n'utilisent pas le port mapping pour communiquer. Ils utilisent le nom du service et le port interne. Par exemple, le service gestion contacte le service achat via `http://buyer:8080`, contournant totalement le réseau de l'hôte.

## Exercice pratique
Vous avez un conteneur PostgreSQL qui écoute sur le port 5432 en interne. Vous voulez vous y connecter en utilisant le port 5332 sur votre machine hôte. Quel est le flag docker run correct ?

**Réponse :** `-p 5332:5432`

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
