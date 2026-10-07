---
title: "Exécuter et Diagnostiquer une Pile Applicative avec Docker Compose"
description: "Maîtriser l'orchestration d'une API de recettes et PostgreSQL, en se concentrant sur la disponibilité basée sur la santé et les outils de diagnostic."
pubDate: 2026-10-08T06:48:00.000Z
translationKey: 171-what-does-docker-exec-it-do
seriesOrder: 39
locale: fr
tags: ["docker","learning-series"]
draft: false
---

## Orchestration de la Pile API de Recettes

Lors du déploiement d'un backend avec une base de données, le défi principal n'est pas seulement de démarrer les conteneurs, mais de s'assurer que l'application ne plante pas parce que la base de données est encore en cours d'initialisation. Bien que `depends_on` contrôle l'ordre de démarrage, il ne garantit pas que le logiciel à l'intérieur du conteneur est prêt à accepter des connexions.

## Configuration Pratique

Dans ce scénario, nous déployons une API de recettes et une instance PostgreSQL. Nous utilisons un fichier `.env` externe pour fournir les identifiants, évitant ainsi de coder les secrets en dur dans le YAML.

**Fichier .env (illustratif)**
```env
DB_USER=recipe_admin
DB_PASSWORD=secure_password_123
DB_NAME=recipe_db
```

**docker-compose.yml**
```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    depends_on:
      db:
        condition: service_healthy
```

## Mécanisme : Disponibilité vs Démarrage

Si nous utilisions un simple `depends_on: [db]`, Docker démarrerait le conteneur PostgreSQL puis immédiatement l'API. Cependant, PostgreSQL prend plusieurs secondes pour initialiser son répertoire de données et lancer l'écouteur. L'API tenterait de se connecter, échouerait, et s'arrêterait probablement avec une exception `ConnectionRefused`.

En ajoutant le `healthcheck` au service `db`, nous utilisons l'utilitaire `pg_isready`, conçu spécifiquement pour vérifier l'état de connexion d'un serveur PostgreSQL sans nécessiter une authentification complète. Le service `api` utilise désormais `condition: service_healthy`, ce qui signifie qu'il reste en attente jusqu'à ce que le healthcheck de `db` retourne un code de sortie réussi (0).

## Diagnostiquer la Pile

Même avec des healthchecks, des erreurs surviennent (ex: mauvais identifiants). Le diagnostic nécessite de passer de la perspective de l'hôte à celle du namespace du conteneur.

#### 1. Analyse des Logs
Pour comprendre pourquoi l'API ne démarre pas, on suit les logs :
`docker compose logs -f api` 

Si les logs indiquent `FATAL: password authentication failed for user "recipe_admin"`, nous savons que les variables d'environnement de l'API ne correspondent pas à celles de la DB.

#### 2. Inspection Interactive
Quand les logs ne suffisent pas, on utilise `docker exec -it`. Cette commande alloue un pseudo-TTY et garde l'entrée standard (STDIN) ouverte, nous permettant d'exécuter des commandes dans le conteneur en cours d'exécution.

Pour vérifier si la base de données est joignable depuis le réseau de l'API :
`docker compose exec api ping db` 

Pour tester la connexion manuellement depuis le conteneur DB :
`docker compose exec db pg_isready -U recipe_admin -d recipe_db` 

Si `pg_isready` confirme que les connexions sont acceptées dans le conteneur DB mais que l'API échoue toujours, le problème vient probablement de l'URL de connexion ou du bridge réseau, et non du processus de base de données.

## Cas d'Échec et Conséquences

*   **`start_period` incorrect** : Si elle est trop courte et que la DB est lente, le healthcheck peut épuiser ses `retries` avant que la DB ne soit prête, empêchant l'API de démarrer.
*   **Mauvais Port dans l'URL** : Utiliser `localhost:5432` dans `SPRING_DATASOURCE_URL` échouera. Dans le réseau Docker, `localhost` désigne le conteneur API lui-même. Il faut utiliser le nom du service `db:5432`.
*   **Conteneurs Zombies** : Si l'API crash en boucle, `docker compose up` peut tenter de la redémarrer sans cesse. Utilisez `docker compose stop` pour figer l'état et diagnostiquer.

## Exercice

Pour tester le port TCP local sans supposer netstat ou ss installés, lancez docker compose exec db pg_isready -h 127.0.0.1 -p 5432 -U recipe_admin -d recipe_db. Un succès indique que 127.0.0.1:5432 accepte les connexions avec code 0. Cela prouve cette interface locale, pas l’authentification de l’API ni l’accès réseau interconteneurs. Testez séparément la connexion datasource avec un outil présent ou un conteneur diagnostic sur le même réseau.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
