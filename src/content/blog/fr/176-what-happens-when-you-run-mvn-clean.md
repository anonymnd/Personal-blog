---
title: "Que se passe-t-il quand on exécute mvn clean ?"
description: "Une analyse détaillée de la gestion du répertoire de build par le plugin Maven Clean pour garantir une compilation propre."
pubDate: 2026-10-13T23:48:00.000Z
translationKey: 176-what-happens-when-you-run-mvn-clean
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous venez de modifier une configuration critique dans votre application de gestion des achats, mais lorsque vous lancez l'application, les anciens paramètres sont toujours actifs. Vous avez l'impression que le code ne se met pas à jour, même après avoir sauvegardé le fichier. Cela arrive parce que Maven stocke les classes compilées dans un dossier spécifique qui n'est pas toujours rafraîchi automatiquement.

## Le rôle du dossier Target
Lorsqu'on build un projet Java, Maven ne modifie pas le code source dans `src/main/java`. À la place, il crée un répertoire nommé `target`. Ce dossier sert d'espace de travail où les fichiers `.java` deviennent des fichiers `.class`. Avec le temps, ce dossier peut accumuler des artefacts "obsolètes"—des fichiers de versions précédentes qui ne sont plus nécessaires mais qui restent sur le disque.

## Le fonctionnement de mvn clean
L'exécution de `mvn clean` appelle le Maven Clean Plugin. Son rôle est simple : il supprime entièrement le répertoire `target`. En effaçant ce dossier, vous vous assurez qu'aucun résidu d'anciens builds n'interfère avec votre version actuelle. Il est crucial de noter que `mvn clean` supprime uniquement les sorties de build configurées ; il ne touche jamais à votre code source ni au fichier `pom.xml`.

## Exemple concret
Considérons une application d'achats où un objet `Request` avait un champ nommé `requestDate`. Vous le renommez en `submissionDate`. Si vous lancez `mvn compile` sans nettoyer, certains environnements pourraient conserver l'ancien fichier `Request.class` dans le dossier `target`, provoquant des erreurs `NoSuchFieldError` incompréhensibles.

```bash
# Incorrect : la compilation seule peut laisser d'anciennes classes
mvn compile

# Correct : nouveau départ
mvn clean compile
```
Résultat : Le dossier `target` est supprimé et Maven recompile chaque classe à partir de zéro, garantissant que seul `submissionDate` existe.

## Erreur courante : L'abus du Clean
Beaucoup de développeurs exécutent `mvn clean install` à chaque modification. Bien que sans risque, c'est inefficace pour les gros projets car cela force Maven à tout recompiler, ignorant les capacités de build incrémental. Le `clean` n'est réellement nécessaire que lors de changements de dépendances, de renommage de classes ou de bugs de build étranges.

## Exercice rapide
Si vous exécutez `mvn clean`, est-ce que votre fichier `src/main/resources/application.properties` sera supprimé ?

**Réponse :** Non. `mvn clean` supprime uniquement le dossier `target`. Vos fichiers sources dans `src` restent intacts.


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
