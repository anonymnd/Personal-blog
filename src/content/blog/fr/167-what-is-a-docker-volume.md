---
title: "Persister les Données de Conteneur avec les Volumes et Sauvegardes"
description: "Analyse approfondie du cycle de vie des données PostgreSQL sous Docker, distinction entre redémarrages, remplacements et destruction de volumes."
pubDate: 2026-10-08T05:48:00.000Z
translationKey: 167-what-is-a-docker-volume
seriesOrder: 38
locale: fr
tags: ["docker","learning-series"]
draft: false
---

## Couche Writable vs Volumes Persistants

Lorsqu'un conteneur s'exécute, il crée une couche d'écriture (writable layer) mince au-dessus de l'image en lecture seule. Toute donnée écrite ici—comme les logs PostgreSQL ou des fichiers temporaires—n'existe que tant que l'instance du conteneur existe. Si vous arrêtez et redémarrez un conteneur, cette couche est conservée. Cependant, si vous supprimez le conteneur (`docker rm`) ou si vous le recréez via Compose, cette couche est détruite et votre base de données est effacée.

Pour éviter cela, on utilise des **Volumes Nommés**. Un volume est un répertoire géré par Docker sur le système de fichiers de l'hôte, monté dans le conteneur. Contrairement à la couche writable, un volume nommé existe indépendamment du cycle de vie du conteneur.

## Scénario Pratique : Cycle de Vie PostgreSQL 15

Dans PostgreSQL 15, les données se trouvent dans `/var/lib/postgresql/data`. Nous allons examiner trois scénarios de changement d'état avec un volume nommé `pgdata`.

### Configuration (Illustrative)
```yaml
services:
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: securepassword

volumes:
  pgdata:
```

### Scénario 1 : Le Redémarrage
**Action :** `docker compose stop` suivi de `docker compose start`.
**Résultat :** Le processus du conteneur est arrêté puis redémarré. La couche writable et le volume persistent. Les données sont en sécurité.

### Scénario 2 : Le Remplacement
**Action :** `docker compose up -d` après avoir modifié une variable d'environnement ou mis à jour la version de l'image.
**Résultat :** Docker détruit l'ancien conteneur et en crée un nouveau. La couche writable est perdue, mais le nouveau conteneur monte le volume `pgdata` existant. PostgreSQL retrouve ses fichiers dans `/var/lib/postgresql/data` et reprend exactement là où il s'était arrêté.

### Scénario 3 : La Destruction
**Action :** `docker compose down -v`.
**Résultat :** Le flag `-v` (ou `--volumes`) indique explicitement à Docker de supprimer les volumes nommés définis dans le fichier Compose. Le volume `pgdata` est supprimé de l'hôte. Même en relançant `up`, la base de données démarre vide car la source de vérité a été détruite.

## Sauvegardes et Vérification de la Restauration

Un volume nommé est le stockage actif, pas une seconde copie ni un historique de récupération. Suppression et corruption affectent ces données. Utilisez une sauvegarde adaptée à la base et vérifiez sa restauration. Les exemples utilisent les noms de services Compose, un shell POSIX et une base my_catalog existante. N’allouez pas de TTY pour rediriger le dump.

```bash
docker compose exec -T db pg_dump -U postgres my_catalog > catalog_backup.sql
# Projet de restauration séparé et jetable :
docker compose -p restore -f compose.restore.yml exec -T db \
  psql -U postgres -d my_catalog -v ON_ERROR_STOP=1 < catalog_backup.sql
```

Le projet de restauration doit utiliser un autre volume et une base cible vide créée au préalable. Vérifiez codes de sortie, lignes représentatives, contraintes et lectures applicatives ; un seul nombre de lignes ne suffit pas. pg_dump sauvegarde une base, pas tous les rôles du cluster ni chaque besoin opérationnel.
## Exercice

**Question :** Vous avez une base de données de production utilisant un volume nommé. Vous lancez `docker compose down` (sans le flag `-v`), vous mettez à jour l'image vers une version mineure plus récente, et vous lancez `docker compose up -d`. Vos données seront-elles présentes ? Si vous lancez ensuite `docker compose down -v`, qu'arrive-t-il aux données ?

**Réponse :** Oui, les données seront présentes car `docker compose down` préserve les volumes nommés ; le nouveau conteneur remontera simplement le volume existant. Cependant, l'exécution de `docker compose down -v` supprimera définitivement le volume nommé de l'hôte, entraînant une perte totale des données.

Gardez la même identité de projet Compose et de volume lors du test. stop/start termine et redémarre le processus ; ce n’est pas pause/unpause. Un changement de version majeure PostgreSQL exige une migration compatible, pas simplement une nouvelle image sur l’ancien répertoire. down -v ne supprime pas les volumes externes.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
