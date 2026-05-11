---
title: "Qu'est-ce qu'un Volume Docker ?"
description: "Découvrez comment les volumes Docker résolvent le problème de la perte de données lors de la suppression ou de la mise à jour des conteneurs."
pubDate: 2026-10-13T14:48:00.000Z
translationKey: 167-what-is-a-docker-volume
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous gérez une application d'achats où des demandeurs soumettent des requêtes. Votre conteneur de base de données stocke toutes ces demandes. Un jour, vous devez mettre à jour la version de la base de données, vous supprimez donc l'ancien conteneur pour en lancer un nouveau. Soudain, toutes vos données d'achats ont disparu. Cela arrive parce que les conteneurs sont éphémères ; leur couche d'écriture interne est détruite lorsque le conteneur est supprimé.

## Le Mécanisme de Persistance
Les volumes Docker sont des répertoires spécialisés stockés sur le système de fichiers de la machine hôte, mais gérés par Docker. Contrairement à la couche d'écriture du conteneur, un volume existe indépendamment du cycle de vie du conteneur. Lorsque vous montez un volume, Docker mappe un chemin à l'intérieur du conteneur vers un emplacement sur l'hôte. Cela garantit que lorsqu'un conteneur est remplacé, la nouvelle instance peut simplement se reconnecter au même volume.

## Mise en Œuvre Pratique
Considérons une application d'achats utilisant PostgreSQL. Pour s'assurer que les requêtes sont sauvegardées, nous utilisons un volume nommé. Voici un extrait illustratif d'un fichier `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - procurement_data:/var/lib/postgresql/data

volumes:
  procurement_data:
```

Dans cette configuration, toute donnée écrite dans `/var/lib/postgresql/data` à l'intérieur du conteneur est en réalité stockée dans le volume `procurement_data` sur l'hôte. Si vous exécutez `docker compose down` puis `docker compose up`, les données persistent.

## Erreur Courante : Volume vs Sauvegarde
Une erreur fréquente consiste à croire que les volumes remplacent les sauvegardes. Bien que les volumes persistent après le redémarrage ou le remplacement des conteneurs, ils ne sont que des fichiers sur un disque. Si le disque de l'hôte tombe en panne ou si quelqu'un exécute accidentellement `docker compose down -v` (l'option `-v` supprime explicitement les volumes), les données sont perdues. Prévoyez toujours une stratégie de dump de base de données.

## Exercice Rapide
Si vous avez un volume nommé `app_logs` monté sur `/app/logs` et que vous supprimez le conteneur avec `docker rm -f my_container`, qu'advient-il des logs ?

**Réponse :** Les logs restent en sécurité dans le volume `app_logs` sur l'hôte et peuvent être récupérés par tout nouveau conteneur montant ce même volume.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
