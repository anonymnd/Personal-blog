---
title: "Dockerfile Explained Line by Line"
description: "Une analyse détaillée de la manière dont un Dockerfile transforme des instructions en une image de conteneur exécutable."
pubDate: 2026-10-13T10:48:00.000Z
translationKey: 163-dockerfile-explained-line-by-line
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Imaginez que vous avez une application Java qui fonctionne parfaitement sur votre ordinateur, mais lorsqu'elle est envoyée à un collègue, elle échoue car il possède une version différente du JDK. Ce problème du « ça marche sur ma machine » est précisément la raison pour laquelle nous utilisons un Dockerfile. Un Dockerfile est un document texte contenant toutes les commandes qu'un utilisateur pourrait taper pour assembler une image.

## L'image de base (FROM)
Tout Dockerfile doit commencer par l'instruction `FROM`. Cela définit l'image de base sur laquelle vous construisez. Considérez cela comme les fondations d'une maison. Pour une application Spring Boot, on utilisera `FROM eclipse-temurin:17-jdk-alpine`. Le tag `alpine` indique une distribution Linux très légère, ce qui réduit la taille finale de l'image.

## Définir l'espace de travail (WORKDIR)
Au lieu d'utiliser des chemins absolus, `WORKDIR /app` crée un répertoire et garantit que toutes les commandes suivantes (comme `COPY` ou `RUN`) s'exécutent dans ce dossier. C'est l'équivalent d'un `cd` dans un terminal, mais cela persiste pour tout le processus de construction.

## Ajout de fichiers et dépendances (COPY & RUN)
`COPY . .` indique à Docker de prendre les fichiers de votre machine locale et de les placer dans l'image. Ensuite, on utilise `RUN` pour exécuter des commandes shell. Par exemple, `RUN ./mvnw package` compile votre code. Chaque commande `RUN` crée une nouvelle couche (layer) dans l'image.

## Définir le point d'entrée (CMD)
Alors que `RUN` s'exécute pendant la construction, `CMD` s'exécute au démarrage du conteneur. `CMD ["java", "-jar", "app.jar"]` indique au conteneur quel processus lancer comme tâche principale. Si ce processus s'arrête, le conteneur s'arrête.

## Exemple concret : App de Procurement
Voici un Dockerfile simplifié pour un service de demandes d'achat :

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /procurement
COPY target/procurement-app.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```
**Résultat :** Docker crée une image contenant uniquement le JRE et le JAR compilé. Au lancement, l'application écoute sur le port 8080 à l'intérieur du conteneur.

## Erreur courante : RUN vs CMD
Une erreur fréquente est d'utiliser `RUN` pour démarrer l'application. `RUN java -jar app.jar` tentera de lancer l'app pendant la phase de build, ce qui bloquera la construction ou échouera. Utilisez `CMD` pour la commande de démarrage.

## Exercice pratique
Quelle instruction utiliseriez-vous pour installer un paquet comme `curl` dans votre image pendant le processus de build ?

**Réponse :** L'instruction `RUN` (ex: `RUN apk add --no-cache curl`).

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
