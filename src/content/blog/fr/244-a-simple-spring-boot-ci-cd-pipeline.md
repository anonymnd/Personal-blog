---
title: "A Simple Spring Boot CI/CD Pipeline"
description: "Apprenez à automatiser le processus de construction, de test et de déploiement d'une application Spring Boot via un flux CI/CD simple."
pubDate: 2026-10-16T19:48:00.000Z
translationKey: 244-a-simple-spring-boot-ci-cd-pipeline
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez terminé une fonctionnalité pour une application d'achats où un demandeur soumet une requête. Maintenant, vous devez lancer manuellement `./mvnw clean package`, exécuter les tests, créer une image Docker et la pousser vers un serveur. Faire cela à chaque modification de code est fastidieux et risqué.

## Comprendre le flux CI/CD
L'Intégration Continue (CI) consiste à fusionner fréquemment les modifications de code dans un dépôt central, où des builds et des tests automatisés sont lancés. La Livraison Continue (CD) garantit que le code est toujours prêt à être publié, tandis que le Déploiement Continu automatise la mise en production.

## Le mécanisme du pipeline
Lorsqu'un développeur pousse du code vers un dépôt Git, un webhook déclenche le pipeline. Le flux suit généralement ces étapes :
1. **Build** : Compilation du code Java avec Maven ou Gradle.
2. **Test** : Exécution des tests JUnit pour vérifier que la logique (ex: approbation du manager) fonctionne.
3. **Package** : Création d'une image Docker contenant le fichier JAR.
4. **Déploiement** : Envoi de l'image vers un registre et mise à jour du serveur ou du cluster Kubernetes.

## Exemple concret : Pipeline d'application d'achats
Voici un extrait d'une configuration `.github/workflows/main.yml` :

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - run: ./mvnw test
      - run: ./mvnw package -DskipTests
```
Résultat : Si l'étape `test` échoue parce qu'un demandeur ne peut plus soumettre de requête, le pipeline s'arrête, empêchant le code défectueux d'atteindre le serveur.

## Erreur courante : Secrets en clair
Une erreur fréquente est d'écrire les mots de passe de base de données directement dans le script du pipeline, exposant ainsi les identifiants.

**Correction** : Utilisez des variables secrètes (ex: GitHub Secrets). Référencez-les via `${{ secrets.DB_PASSWORD }}` dans votre fichier YAML pour qu'elles restent chiffrées.

## Exercice pratique
Si votre pipeline compile le JAR avec succès mais que l'application ne démarre pas en production à cause d'une variable d'environnement manquante, quelle étape a manqué?

**Réponse** : Le pipeline a validé la compilation et les tests unitaires, mais pas la configuration. C'est pourquoi l'ajout d'un 'Smoke Test' après le déploiement est crucial.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
