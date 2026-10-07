---
title: "Maîtriser le Cycle de Vie Maven : Du Clean aux Artefacts"
description: "Analyse approfondie des phases Maven, du dossier target et de la distinction entre rapports de tests unitaires et d'intégration."
pubDate: 2026-10-08T07:48:00.000Z
translationKey: 176-what-happens-when-you-run-mvn-clean
seriesOrder: 40
locale: fr
tags: ["maven-debugging","learning-series"]
draft: false
---

## Le Mécanisme du Cycle de Vie Maven

mvn package parcourt le cycle par défaut jusqu’à package et exécute les goals liés selon le packaging et la configuration. validate → compile → test → package est un schéma simplifié qui omet des phases intermédiaires. Les tests peuvent être absents, ignorés ou configurés autrement : un JAR ne prouve pas leur réussite. Examinez POM effectif et logs.
## Le Dossier Target et la Nécessité du 'Clean'

Tous les résultats de la construction sont dirigés vers le répertoire `target/`. Cela inclut les fichiers `.class`, les sources générées et le JAR final.

`mvn clean` appartient à un cycle de vie distinct. Son seul but est de supprimer le dossier `target/`. C'est crucial car Maven ne détecte pas toujours tous les changements dans les arbres de dépendances complexes ou les fichiers de ressources. Si une construction précédente a échoué ou a laissé des artefacts obsolètes, un `mvn package` ultérieur pourrait inclure du code périmé. L'exécution de `mvn clean package` garantit une construction déterministe à partir d'une base vierge.

## Tests Unitaires vs Tests d'Intégration

Surefire exécute normalement les tests unitaires à test pour un projet JAR, avec des motifs comme Test*, *Test, *Tests et *TestCase. Failsafe exécute integration-test et verify seulement si ses executions sont configurées ; ses motifs incluent IT*, *IT et *ITCase. Ces valeurs peuvent être modifiées.

Un échec Surefire arrête normalement avant package. Failsafe enregistre les échecs de tests ordinaires pour laisser atteindre le nettoyage post-integration-test, puis verify signale l’échec. Lancez mvn verify plutôt que integration-test seul. Une panne de plugin ou infrastructure peut arrêter plus tôt ; le nettoyage doit être robuste.
## Objectifs de Plugin vs Phases de Cycle de Vie

Les commandes comme `mvn spring-boot:run` ne sont pas des phases de cycle de vie. Ce sont des **objectifs de plugin** (plugin goals). Un objectif est une tâche spécifique exécutée par un plugin. Alors que `package` est une phase qui déclenche plusieurs objectifs, `spring-boot:run` contourne le cycle de vie standard pour lancer l'application directement depuis les classes compilées dans `target/classes`, sans avoir besoin de créer un JAR au préalable.

## Scénario Pratique : Projet d'Export de Rapports

**Scénario** : Vous travaillez sur un projet d'export de rapports. Vous lancez `mvn package`. La construction échoue. Vous vérifiez `target/` et voyez un fichier JAR. Vous êtes confus car la construction a échoué.

**Le Traceur** :
1. **Exécution** : `mvn package` démarre.
2. **Compile** : Succès. Les fichiers `.class` sont créés dans `target/classes`.
3. **Test** : Le plugin Surefire s'exécute. Un test échoue. La construction s'arrête ici.
4. **L'Artefact** : Vous voyez un JAR dans `target/`. C'est un **artefact obsolète** d'une construction réussie précédente. Comme la construction actuelle a échoué à la phase `test`, la phase `package` n'a jamais été atteinte. Le JAR que vous voyez est ancien et ne contient pas vos dernières modifications.

**La Solution** :
Pour diagnostiquer et résoudre, lancez :
`mvn clean test` 

Cela supprime le JAR obsolète et se concentre sur l'échec. Vous consultez ensuite `target/surefire-reports/TEST-com.project.ReportExportTest.xml` pour trouver l'erreur d'assertion exacte.

## Emballage : Plain JAR vs Executable JAR

Un JAR classique contient classes et ressources et peut être exécutable avec un manifeste et un classpath adaptés ; java -jar n’exige pas universellement toutes les dépendances embarquées. Le goal repackage de Spring Boot produit son format d’archive exécutable avec dépendances et lanceur. Configurez-le : déclarer un plugin quelconque ne garantit pas son exécution à package.

De même, spring-boot:run est un goal qui peut demander des phases préalables avant de lancer l’application. clean retire les répertoires configurés et sorties anciennes ; il ne garantit pas seul le déterminisme, qui dépend aussi des outils, dépendances et environnement.
## Exercice

**Question** : Vous lancez `mvn verify`. La construction échoue. Vous constatez que les tests unitaires ont réussi, mais qu'un test d'intégration a échoué. Où cherchez-vous le rapport, et pourquoi y a-t-il un fichier JAR dans le dossier `target` malgré l'échec ?

**Réponse** :
1. Regardez dans `target/failsafe-reports`. Puisque les tests unitaires ont réussi, la construction a progressé au-delà de la phase `test` vers `integration-test`.
2. Le JAR existe car la phase `package` a lieu *avant* les phases `integration-test` et `verify`. Par conséquent, Maven a réussi à emballer le JAR avant que le test d'intégration n'échoue.

## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
