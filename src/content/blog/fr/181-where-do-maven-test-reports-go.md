---
title: "Où vont les rapports de tests Maven ?"
description: "Un guide pour localiser et comprendre les fichiers de sortie générés par les plugins Maven Surefire et Failsafe."
pubDate: 2026-10-14T04:48:00.000Z
translationKey: 181-where-do-maven-test-reports-go
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Vous venez de lancer `mvn test` sur un projet important. La console affiche quelques échecs, mais la trace d'erreur est tronquée et vous ne savez pas exactement quelle assertion a échoué. Vous savez que les tests ont été exécutés, mais vous ignorez où se trouvent les rapports détaillés sur votre disque.

## Le répertoire de sortie par défaut
Par défaut, Maven place tous les artefacts de construction dans le dossier `target`. Ce répertoire est temporaire ; l'exécution de `mvn clean` le supprimera complètement. Les rapports de tests ne sont pas stockés dans vos dossiers sources car ce sont des résultats générés et non du code source.

## Rapports Surefire vs Failsafe
Maven utilise deux plugins différents selon le type de test exécuté. Il est essentiel de savoir lequel est utilisé pour trouver le bon dossier :

| Plugin | Type de Test | Emplacement du Rapport |
| :--- | :--- | :--- |
| Maven Surefire | Tests Unitaires | `target/surefire-reports` |
| Maven Failsafe | Tests d'Intégration | `target/failsafe-reports` |

Surefire s'exécute pendant la phase `test`. Failsafe s'exécute pendant les phases `integration-test` et `verify`. Si vous lancez uniquement `mvn test`, le dossier `failsafe-reports` sera probablement vide ou inexistant.

## Exemple concret : Application d'achats
Imaginez un système d'achats où un `RequestService` empêche un demandeur d'approuver sa propre demande. Vous écrivez un test `testSelfApprovalFails()`. En lançant `mvn test`, la console indique `Tests run: 10, Failures: 1`.

Pour trouver les détails, allez dans :
`votre-projet/target/surefire-reports/com.procurement.RequestServiceTest.txt`

Dans ce fichier texte, vous trouverez la trace complète, incluant la section `Caused by:`, qui pointe vers la ligne exacte de votre code Java où l' `AssertionError` s'est produite.

## Erreur courante : Se tromper de phase
Une erreur classique consiste à lancer `mvn package` et à se demander pourquoi les tests d'intégration n'ont pas signalé d'échecs. Bien que `package` exécute la phase `test`, il n'exécute pas automatiquement la phase `verify` où les rapports Failsafe sont finalisés. Pour garantir la génération des rapports d'intégration, utilisez `mvn verify`.

## Exercice pratique
Si vous lancez `mvn verify` et qu'un test d'intégration complexe pour le module acheteur échoue, quel répertoire spécifique devez-vous vérifier pour le rapport détaillé ?

**Réponse :** `target/failsafe-reports`


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
