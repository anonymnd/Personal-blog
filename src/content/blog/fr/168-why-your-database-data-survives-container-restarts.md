---
title: "Pourquoi vos données de base de données survivent aux redémarrages de conteneurs"
description: "Comprenez la distinction critique entre la couche éphémère du conteneur et les volumes Docker persistants."
pubDate: 2026-10-13T15:48:00.000Z
translationKey: 168-why-your-database-data-survives-container-restarts
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous redémarrez un conteneur PostgreSQL et vos demandes d'achat sont toujours présentes. C'est normal : redémarrer le même conteneur n'efface pas son système de fichiers inscriptible. Il faut distinguer ce redémarrage de la suppression du conteneur suivie de son remplacement. Le stockage persistant détermine ce qui survit à ce remplacement.
## Redémarrer n'est pas supprimer
La couche inscriptible appartient à un conteneur précis. Stop/start ou restart la conserve ; supprimer le conteneur la détruit. Un volume nommé monté stocke les données en dehors de cette couche. Le remplacement peut donc préserver les fichiers si le nouveau conteneur monte le même volume au bon emplacement. Cela ne supprime pas la récupération après panne et ne rend pas les fichiers compatibles avec toutes les versions de base.
## Un volume nommé est un stockage géré
Avec le pilote local par défaut, Docker gère le stockage sur l'hôte de son moteur. Sur Docker Desktop, cet hôte peut être une VM Linux, pas un dossier Windows directement visible. Le nouveau conteneur retrouve les données s'il monte le volume prévu au bon chemin. Un nom de projet Compose différent peut produire un autre volume : les noms et la configuration comptent autant que la déclaration YAML.
## Exemple : PostgreSQL 15 en local
Fournissez POSTGRES_PASSWORD localement, par exemple dans un fichier .env ignoré. Cet exemple fixe volontairement PostgreSQL 15 et son emplacement de données :

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD locally}
    ports:
      - "127.0.0.1:5332:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

Un restart de db conserve les données. Un compose down ordinaire supprime les conteneurs mais garde ce volume nommé, que le même projet retrouve au prochain up. Les variables d'initialisation créent les identifiants uniquement dans un répertoire vide ; elles ne réinitialisent pas une base existante. Consultez la documentation de l'image avant de changer de version majeure : chemin et procédure de mise à niveau peuvent différer.
## Persistance et sauvegarde sont différentes
Un volume conserve le stockage lors du remplacement d'un conteneur ; il ne crée pas une copie indépendante récupérable. Down -v peut supprimer les fichiers de ce volume de projet. Une panne de stockage ou une modification SQL accidentelle peut aussi les affecter. Maintenez des sauvegardes séparées et testez leur restauration. Volume persistant et sauvegarde répondent à des problèmes distincts.
## Exercice pratique
Quelle opération menace les données présentes uniquement dans la couche du conteneur : restart ou suppression ?

**Réponse :** La suppression. Un volume nommé correctement monté peut survivre, mais supprimer ce volume est une opération distincte. Examinez le montage lorsqu'une base recréée semble vide.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
