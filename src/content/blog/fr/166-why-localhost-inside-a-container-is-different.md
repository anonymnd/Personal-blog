---
title: "Pourquoi localhost à l'intérieur d'un conteneur est différent"
description: "Comprendre l'isolation réseau entre votre machine hôte et les conteneurs Docker pour résoudre les erreurs de connexion."
pubDate: 2026-10-13T13:48:00.000Z
translationKey: 166-why-localhost-inside-a-container-is-different
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats où le backend doit se connecter à une base de données PostgreSQL. Vous lancez la base de données dans un conteneur et le backend sur votre machine. Vous utilisez `localhost:5432` dans votre configuration, mais la connexion échoue. Cela arrive parce que `localhost` n'est pas une adresse globale ; c'est une interface de bouclage spécifique à l'espace réseau (network namespace) du processus qui l'utilise.

## Le concept d'espace réseau
Dans Docker, chaque conteneur fonctionne dans son propre espace réseau isolé. Lorsqu'un processus à l'intérieur d'un conteneur appelle `localhost` ou `127.0.0.1`, il s'adresse à lui-même, et non à la machine hôte ni aux autres conteneurs. Le conteneur croit être le seul élément actif sur cette interface réseau virtuelle. Cette isolation permet de lancer plusieurs conteneurs écoutant tous sur le port 80 sans conflit.

## Mappage Hôte vs Conteneur
Pour permettre à l'extérieur (votre hôte) de communiquer avec le conteneur, on utilise le mappage de ports. Par exemple, `-p 5332:5432` indique à Docker : "Prends le trafic arrivant sur l'hôte au port 5332 et redirige-le vers le conteneur au port 5432".

| Perspective | Adresse à utiliser | Cible |
| :--- | :--- | :--- |
| Hôte → Conteneur | `localhost:5332` | Le port mappé sur l'hôte |
| Conteneur → Soi-même | `localhost:5432` | Son propre port interne |
| Conteneur → Hôte | `host.docker.internal` | La machine hôte |

## Exemple concret : Base de données d'achats
Considérez cet extrait de `docker-compose.yml` pour un système de gestion d'achats :

```yaml
services:
  db:
    image: postgres
    ports:
      - "5332:5432"
  api:
    build: .
    depends_on:
      - db
```

Si le conteneur `api` tente de se connecter à `localhost:5432`, cela échouera car la base de données est dans un autre conteneur. Docker Compose crée un DNS interne. L' `api` doit donc utiliser `db:5432` pour atteindre la base de données.

## Erreur courante : Le piège du localhost
**Erreur :** Utiliser `localhost` dans un fichier `.env` partagé entre l'environnement de développement local et l'environnement Docker.
**Correction :** Utilisez des variables d'environnement pour l'hôte de la DB. Utilisez `localhost` pour l'exécution native et le nom du service (ex: `db`) pour Docker.

## Exercice pratique
Si vous avez un conteneur qui mappe le port 8080 de l'hôte vers le port 80 du conteneur, et que vous lancez `curl localhost:80` dans le shell du conteneur, cela fonctionnera-t-il ?

**Réponse :** Oui, car à l'intérieur du conteneur, le service écoute réellement sur le port 80.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
