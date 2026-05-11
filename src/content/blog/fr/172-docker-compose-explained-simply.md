---
title: "Docker Compose Expliqué Simplement"
description: "Apprenez à orchestrer plusieurs conteneurs via un seul fichier YAML pour simplifier votre environnement de développement."
pubDate: 2026-10-13T19:48:00.000Z
translationKey: 172-docker-compose-explained-simply
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Vous avez un backend Java pour les demandes, une base de données PostgreSQL pour les commandes et un cache Redis. Lancer tout cela manuellement nécessite trois commandes `docker run` distinctes avec des drapeaux réseau complexes. Si vous oubliez un paramètre, le backend ne trouvera pas la base de données, provoquant une erreur de connexion.

## Qu'est-ce que Docker Compose ?
Docker Compose est un outil permettant de définir et de lancer des applications multi-conteneurs. Au lieu de taper de longues commandes, vous utilisez un fichier `docker-compose.yml`. Ce fichier sert de plan, indiquant à Docker quelles images utiliser, comment les lier et quels ports ouvrir.

## Le Mécanisme d'Orchestration
Compose crée un réseau dédié pour vos services. À l'intérieur de ce réseau, les conteneurs n'utilisent pas d'adresses IP, mais le nom du service défini dans le YAML. Par exemple, si votre service de base de données s'appelle `db`, le backend se connecte via `jdbc:postgresql://db:5432/orders`. Notez que si l'hôte accède à la base via un port mappé, les conteneurs communiquent entre eux via le port interne.

## Exemple Concret : App d'Achats
Voici un extrait illustratif d'un fichier `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: pass
  backend:
    build: . 
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  db_data:
```

L'exécution de `docker compose up -d` lance les deux. Le volume nommé `db_data` garantit que vos données persistent même si vous remplacez le conteneur. Pour inspecter le backend, utilisez `docker compose exec backend sh`.

## Erreur Courante : Ordre vs Disponibilité
Une erreur fréquente est de croire que `depends_on` garantit que la base de données est prête à accepter des connexions. `depends_on` gère l'ordre de démarrage du conteneur, pas l'état de l'application. Si le backend démarre plus vite que Postgres, il peut planter. La solution est d'ajouter une logique de tentative (retry) dans votre code Java.

## Exercice Pratique
Si vous avez un service nommé `cache` exécutant Redis sur le port 6379, et que vous voulez y accéder depuis un autre conteneur du même fichier Compose, quel nom d'hôte devez-vous utiliser ?

**Réponse :** Utilisez `cache` comme nom d'hôte.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
