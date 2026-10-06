---
title: "How to Run Backend + Database With Docker Compose"
description: "Apprenez à orchestrer une application multi-conteneurs avec Docker Compose pour lier un backend à une base de données."
pubDate: 2026-10-13T20:48:00.000Z
translationKey: 173-how-to-run-backend-database-with-docker-compose
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous avez développé un backend Java et une base de données PostgreSQL. Tout fonctionne localement, mais dès que vous lancez les conteneurs, le backend plante car il ne trouve pas la base de données sur 'localhost'. Cela arrive parce que chaque conteneur possède son propre espace réseau ; 'localhost' dans le conteneur backend désigne le conteneur lui-même, pas celui de la base de données.

## Un projet et un réseau partagé
Compose décrit services, réseaux et stockage dans une configuration. Sur le réseau de projet par défaut, les services se trouvent par leur nom. Le backend utilise donc db et le port interne 5432. Un port publié concerne un client extérieur à ce réseau ; il n'est pas nécessaire pour la seule communication backend-base.
## Exemple Compose avec Spring Boot
Supposons un Dockerfile backend fonctionnel qui lance l'application sur le port 8080. Fournissez POSTGRES_PASSWORD localement. Les variables utilisées sont celles du datasource Spring Boot, et non un DB_URL arbitraire qui demanderait un binding applicatif personnalisé :

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d procurement"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build: .
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/procurement
      SPRING_DATASOURCE_USERNAME: app
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    depends_on:
      db:
        condition: service_healthy

volumes:
  db_data:
```
## Connexion et données conservées
Le backend utilise jdbc:postgresql://db:5432/procurement et les identifiants app qui initialisent une base vide. L'hôte ouvre le backend sur localhost:8080. Cet exemple PostgreSQL 15 monte db_data au chemin montré. Un compose down ordinaire conserve le volume. Un volume non vide conserve aussi les identifiants existants : modifier les variables d'initialisation ne les réécrit pas.
## Ordre de démarrage et disponibilité
Le healthcheck et la condition service_healthy attendent le signal de santé avant le démarrage initial du backend. Un simple depends_on sous forme de liste ordonne seulement le démarrage. Cette disponibilité ne garantit ni un fonctionnement éternel ni la fin de chaque migration applicative. Le backend doit encore gérer les tentatives de connexion et les échecs à l'exécution. Construisez et lancez le projet préparé avec docker compose up --build.
## Exercice pratique
Vous voulez consulter les logs puis ouvrir un shell interactif. Quelles commandes utiliser ?

**Réponse :** `docker compose logs -f db` suit les logs du service. `docker compose exec db sh` ouvre un shell dans le conteneur actif. Ces outils sont différents : lire la sortie standard ne nécessite pas d'entrer dans le conteneur.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
