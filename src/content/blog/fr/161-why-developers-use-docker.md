---
title: "Construire des Images d'Application Reproductibles avec Docker"
description: "Analyse approfondie des couches Dockerfile, de la relation image-conteneur et des limites de la reproductibilité environnementale."
pubDate: 2026-10-08T03:48:00.000Z
translationKey: 161-why-developers-use-docker
seriesOrder: 36
locale: fr
tags: ["docker","learning-series"]
draft: false
---

## Distinction Fondamentale : Image vs Conteneur

Pour garantir la reproductibilité, il faut d'abord distinguer le plan de l'exécution. Une Image Docker est un modèle immuable en lecture seule. Elle contient tout ce dont l'application a besoin : le système de fichiers de l'OS, le runtime (comme Java ou Python), les bibliothèques et le code compilé. Lorsqu'on lance un conteneur, Docker ajoute une fine couche d'écriture par-dessus cette image immuable.

Un conteneur n'est pas une Machine Virtuelle (VM). Alors qu'une VM embarque un système d'exploitation complet avec son propre noyau, un conteneur partage le noyau Linux de la machine hôte. Sur Windows ou macOS, Docker Desktop utilise une VM Linux légère en arrière-plan pour fournir ce noyau, mais les conteneurs restent des processus isolés via des namespaces et des cgroups, et non via une virtualisation matérielle complète.

## Anatomie d'un Build Reproductible

Choisissez le contexte et excluez les fichiers inutiles avec .dockerignore. BuildKit peut transférer seulement les fichiers nécessaires et réutiliser du contenu inchangé ; chaque octet local ne part donc pas toujours au daemon. Un contexte pertinent réduit tout de même les inclusions accidentelles.

Placez les descripteurs de dépendances avant les sources qui changent souvent, puis compilez. COPY et RUN peuvent produire des couches de fichiers ; ENV et ENTRYPOINT sont des métadonnées et n’en ajoutent pas nécessairement. Le cache dépend des entrées des instructions, pas seulement du texte Dockerfile.

Un tag de version précise le choix mais reste mutable. Utilisez un digest vérifié si le contenu exact compte, maîtrisez dépendances et outils, puis reconstruisez volontairement pour les mises à jour. Cela améliore la reproductibilité sans prouver une identité bit à bit ni un comportement universel.
## Exemple Concret : CLI de Conversion CSV

Imaginons un outil CLI basé sur Java qui convertit des fichiers CSV en JSON. Il nécessite une version spécifique de l'OpenJDK et des variables d'environnement pour le chemin d'entrée.

### Le Dockerfile (Illustratif)
```dockerfile
# Utilisation d'un digest ou d'une version spécifique, jamais 'latest'
FROM eclipse-temurin:17-jre-alpine

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Définition du répertoire de travail
WORKDIR /app

# Copie uniquement du jar compilé pour garder l'image légère
COPY target/csv-converter-1.0.jar app.jar

# Passage à l'utilisateur non-root
USER appuser

# ENTRYPOINT pour garantir que l'app est le processus principal
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Analyse de l'Artéfact
1. **`FROM eclipse-temurin:17-jre-alpine`** : L'utilisation d'`alpine` réduit la surface d'attaque et la taille. Spécifier `17` évite que l'app ne casse quand Java 21 deviendra le défaut.
2. **`COPY target/csv-converter-1.0.jar app.jar`** : On copie l'artéfact, pas le code source. Cela sépare la phase de build (Maven/Gradle) de la phase de packaging.
3. **`ENTRYPOINT`** : Contrairement à `CMD`, `ENTRYPOINT` transforme le conteneur en exécutable. Tout argument passé à `docker run` est ajouté à cette commande.

### Trace d'Exécution
Pour lancer ce convertisseur sur un fichier `data.csv` situé dans le répertoire courant :
`docker run --rm --mount "type=bind,source=$PWD,target=/inputs,readonly" csv-converter /inputs/data.csv` 

*Note : Le flag `--rm` assure que le conteneur est supprimé après exécution, évitant l'accumulation de conteneurs arrêtés sur l'hôte.*

## Les Limites de la Reproductibilité

Bien que l'image soit immuable, l'environnement d'exécution ne l'est pas. Docker résout le problème du "ça marche sur ma machine" pour la pile applicative, mais il ne peut pas contrôler :

1. **Le Noyau Hôte** : Si votre app dépend d'un module noyau Linux spécifique, un conteneur sur un hôte avec un vieux noyau peut échouer.
2. **Les Services Externes** : Si le convertisseur appelle une API externe, l'image ne peut pas garantir que la version de l'API reste identique.
3. **L'Architecture Matérielle** : Une image `amd64` ne tournera pas sur `arm64` (Apple Silicon) sans émulation (QEMU), ce qui peut créer des écarts de performance ou des bugs subtils.
4. **L'Entropie et le Temps** : L'horloge système et les générateurs de nombres aléatoires sont partagés avec l'hôte.

## Exercice

**Scénario** : Vous avez un Dockerfile qui copie tout le dossier du projet (`COPY . /app`) avant de lancer `mvn clean package` dans le conteneur. À chaque modification d'une seule ligne de code, l'étape `mvn install` prend 5 minutes car elle retélécharge toutes les dépendances.

**Question** : Comment restructurer le Dockerfile pour utiliser le cache des couches et éviter le retéléchargement des dépendances ?

**Réponse** : 
Il faut séparer la résolution des dépendances de la compilation du code. Copiez d'abord le `pom.xml`, lancez la commande de téléchargement, puis copiez le code source.

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package
```
Cela garantit que tant que le `pom.xml` ne change pas, Docker saute la couche `go-offline` et passe directement à la compilation du code source mis à jour.

La commande run suppose un shell POSIX, une image construite par docker build -t csv-converter . et data.csv dans le dossier courant. Le bind mount fournit le fichier hôte ; son chemin passé en argument ne le copie pas. L’utilisateur non root doit pouvoir le lire. L’image fournit l’espace utilisateur Linux, pas son propre noyau ; ces explications concernent les conteneurs Linux. Une petite image Alpine ne prouve pas seule sécurité ou compatibilité.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
