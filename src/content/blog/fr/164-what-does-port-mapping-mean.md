---
title: "Ports Docker, localhost et Découverte de Services dans un Modèle Réseau Unique"
description: "Analyse approfondie de la distinction entre les ports publiés sur l'hôte, les namespaces de conteneurs et le DNS Compose pour la communication inter-services."
pubDate: 2026-10-08T04:48:00.000Z
translationKey: 164-what-does-port-mapping-mean
seriesOrder: 37
locale: fr
tags: ["docker","learning-series"]
draft: false
---

## Le Modèle Mental du Réseau Docker

L'une des confusions les plus fréquentes lors de l'utilisation de Docker est la distinction entre l'endroit où un service écoute et la manière dont on y accède. Pour comprendre cela, il faut différencier le Réseau de l'Hôte et le Namespace Réseau du Conteneur.

Chaque conteneur s'exécute dans son propre namespace réseau isolé. Cela signifie qu'il possède sa propre interface réseau virtuelle et sa propre adresse de bouclage (`127.0.0.1`). Lorsqu'un processus à l'intérieur d'un conteneur se lie à `localhost:8080`, il se lie à la boucle locale du conteneur, et non à celle de l'hôte. Si vous tentez d'accéder à `localhost:8080` depuis votre navigateur sur la machine hôte, la requête échouera car le loopback de l'hôte est totalement distinct de celui du conteneur.

## Le Mappage de Ports : Le Pont

Avec le bridge Compose habituel, 5332:5432 publie le port hôte 5332 vers le port conteneur 5432. Le processus doit écouter sur ce port et une interface adaptée comme 0.0.0.0. EXPOSE documente seulement un port : il ne crée ni listener ni publication. Écouter uniquement sur le loopback du conteneur peut empêcher cet accès.

Pour une base locale de développement, utilisez 127.0.0.1:5332:5432 ; sans adresse, la publication peut concerner toutes les interfaces hôte. Les conteneurs du même réseau Compose utilisent db:5432 sans port DB publié. Ces explications supposent le bridge habituel, pas host networking ni un namespace partagé.
## Découverte de Services et Communication Interne

Si le mappage de ports est essentiel pour le développeur ou l'utilisateur final, il est irrelevant pour la communication entre conteneurs sur un même réseau Docker.

Avec Docker Compose, Docker crée un réseau bridge par défaut. Chaque service défini dans le `docker-compose.yml` reçoit une entrée DNS correspondant à son nom de service. Les conteneurs communiquent via ces noms et leurs **ports internes**, contournant totalement la pile réseau de l'hôte.

## Exemple Pratique : API de Recherche et Base de Données

Appliquons cela à un scénario où une API de recherche (Java/Spring) doit se connecter à une base de données PostgreSQL.

### Configuration (`docker-compose.yml` extrait illustratif)
```yaml
services:
  db:
    image: postgres:15
    ports:
      - "127.0.0.1:5332:5432"
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD locally}

  search-api:
    image: search-api:latest
    ports:
      - "8088:8080"
    environment:
      # Note : On utilise le nom de service 'db' et le port interne 5432
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/postgres
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:?Set DB_PASSWORD locally}
    depends_on:
      - db
```

### Analyse du Flux de Trafic

1. **Utilisateur Externe → API :** L'utilisateur visite `http://localhost:8088`. L'hôte redirige cela vers le conteneur `search-api` sur le port `8080`.
2. **API → Base de Données :** Le conteneur `search-api` a besoin de données. Il cherche le nom d'hôte `db` via le DNS interne de Docker, le résout en IP interne du conteneur, et se connecte au port `5432`. Il n'utilise **pas** `localhost:5332` car `localhost` dans le conteneur API désigne le conteneur lui-même.
3. **Développeur → Base de Données :** Le développeur utilise un outil GUI (comme pgAdmin) sur l'hôte. Il se connecte à `localhost:5332`. Docker redirige cela vers le conteneur `db` sur le port `5432`.

### Cas d'Échec
- **Utiliser `localhost:5432` dans la config API :** L'API cherchera PostgreSQL à l'intérieur de son propre conteneur. La connexion sera refusée.
- **Utiliser `localhost:5332` dans la config API :** L'API cherchera un service sur son propre port 5332. Échec également.
- **Omettre la section `ports` pour `db` :** L'API peut toujours contacter la DB car elles sont sur le même réseau. Cependant, le développeur ne peut plus se connecter via l'hôte car aucun pont n'existe.

## Exercice Ciblé

**Scénario :** Vous avez un service `cache` sur le port `6379` et un service `app` sur le port `80`. Vous voulez que `app` accède au `cache`, et vous voulez pouvoir utiliser `redis-cli` depuis votre hôte pour inspecter le cache.

**Question :**
1. Quel doit être le mappage de ports pour le service `cache` dans `docker-compose.yml` ?
2. Quelle chaîne de connexion `app` doit-il utiliser pour joindre le `cache` ?
3. Si vous changez le mappage en `7000:6379`, la chaîne de connexion de `app` change-t-elle ?

**Réponse :**
1. `6379:6379` (ou tout autre port hôte).
2. `cache:6379`.
3. Non. L'application utilise le réseau interne ; elle ignore le port publié sur l'hôte `7000`.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
