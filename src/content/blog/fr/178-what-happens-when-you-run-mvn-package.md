---
title: "Que se passe-t-il quand on exécute mvn package ?"
description: "Une analyse détaillée des phases du cycle de vie Maven déclenchées lors de l'empaquetage d'une application Java en fichier JAR ou WAR."
pubDate: 2026-10-14T01:48:00.000Z
translationKey: 178-what-happens-when-you-run-mvn-package
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez terminé de coder une nouvelle fonctionnalité pour une application d'achats où un manager approuve des demandes. Vous êtes prêt à envoyer l'application sur le serveur, mais vous ne savez pas si le code compile réellement ou si les tests passent. C'est là qu'intervient `mvn package`. Ce n'est pas une simple commande, mais le déclencheur d'une séquence d'événements appelée le Cycle de Vie par Défaut.

## La réaction en chaîne des phases
Lorsque vous lancez `mvn package`, Maven ne saute pas directement à la fin. Il exécute chaque phase précédente. D'abord, `validate` vérifie la structure du projet. Ensuite, `compile` transforme vos fichiers source `.java` en bytecode `.class`. Après cela, la phase `test` s'active, où le plugin Maven Surefire exécute vos tests unitaires. Si un test échoue, le processus s'arrête immédiatement pour éviter d'empaqueter un build défectueux.

## Le mécanisme d'empaquetage
Une fois les tests réussis, Maven atteint la phase `package`. Il récupère le code compilé dans `target/classes` et le regroupe selon le format défini dans votre `pom.xml` (généralement `<packaging>jar</packaging>` ou `war`). Pour notre application d'achats, cela crée un fichier comme `procurement-app-1.0.jar` dans le dossier `target`. Un JAR Maven ordinaire contient les classes et ressources du projet, sans inclure automatiquement les JAR des dépendances ni devenir exécutable. Un goal Spring Boot repackage configuré peut produire une archive exécutable avec ses dépendances.

## Exemple concret : Build de l'app d'achats
Considérons un extrait de `pom.xml` :
```xml
<groupId>com.app</groupId>
<artifactId>procurement-system</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>jar</packaging>
```
L'exécution de `mvn package` produit :
1. **Compile** : `ProcurementRequest.java` → `ProcurementRequest.class`.
2. **Test** : `ApprovalTest.java` s'exécute ; rapports dans `target/surefire-reports`.
3. **Package** : Toutes les classes sont compressées dans `target/procurement-system-1.0-SNAPSHOT.jar`.

## Erreur courante : Artéfacts obsolètes
Une erreur fréquente consiste à lancer `mvn package` et à se demander pourquoi d'anciennes classes supprimées apparaissent toujours dans le JAR final. Cela arrive parce que `package` ne supprime pas le dossier `target`. Pour corriger cela, vous devez utiliser `mvn clean package`. La commande `clean` efface le répertoire `target`, garantissant un départ à zéro.

## Exercice pratique
Si vous lancez `mvn package` et qu'il échoue durant la phase `test`, le fichier `.jar` sera-t-il créé dans le dossier `target` ?

**Réponse** : Non. Maven interrompt l'exécution du cycle de vie dès la première erreur pour garantir que seul le code vérifié est empaqueté.

Si un test échoue, aucun nouveau JAR n’est empaqueté par cette exécution ; un ancien fichier peut rester dans target. Réussir les tests ne prouve pas l’absence de tout bug.


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
