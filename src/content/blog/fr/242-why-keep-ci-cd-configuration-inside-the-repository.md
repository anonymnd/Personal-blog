---
title: "Pourquoi garder la configuration CI/CD dans le dépôt ?"
description: "Une exploration de l'approche 'Pipeline as Code' et pourquoi stocker la logique de déploiement avec le code source garantit la cohérence."
pubDate: 2026-10-16T17:48:00.000Z
translationKey: 242-why-keep-ci-cd-configuration-inside-the-repository
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez une application d'achat où un demandeur soumet une requête. Tout fonctionne sur votre machine, mais lors du déploiement, le build échoue car le serveur utilise une version de Java obsolète. Vous passez des heures à chercher quel paramètre caché dans l'interface utilisateur de l'outil CI a causé le crash. C'est le problème de la 'boîte noire' de la configuration externe.

## Le concept de Pipeline as Code
Stocker votre configuration CI/CD (comme `.github/workflows/main.yml`) dans le dépôt transforme votre processus de déploiement en 'Pipeline as Code'. Au lieu de cliquer sur des boutons dans une interface web, vous écrivez un fichier déclaratif. Les instructions pour compiler, tester et déployer l'application d'achat vivent ainsi juste à côté du code Java.

## Versionnage et Synchronisation
Lorsque la configuration est dans le dépôt, le pipeline évolue avec la fonctionnalité. Si vous mettez à jour votre application vers Jakarta EE 10, vous pouvez modifier le script de build dans le même commit. Si un développeur revient sur une ancienne branche pour corriger un bug, la configuration CI/CD revient automatiquement à la version compatible avec ce code ancien. Cela évite qu'une nouvelle configuration ne casse le build d'une version stable.

## Transparence et Revue par les Pairs
Comme le pipeline est un simple fichier, il suit le même processus de Pull Request (PR) que le code applicatif. Si un collègue change la cible de déploiement d'un serveur de staging vers un cluster de production, vous le verrez dans le diff. Cela élimine les 'changements fantômes' où un réglage est modifié dans une interface sans laisser de trace.

## Exemple concret : Le Pipeline d'Achat
Voici un extrait YAML illustrant un déclencheur de build :

```yaml
# Extrait illustratif d'une config CI
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - run: mvn clean verify
```
Résultat : Chaque push déclenche cette séquence exacte. Si l'étape `mvn verify` échoue, le pipeline s'arrête, garantissant que la logique d'approbation de l'application est testée avant tout déploiement.

## Erreur courante : Hardcoder les secrets
Une erreur fréquente consiste à inscrire les clés API ou les mots de passe de base de données directement dans le fichier YAML pour gagner du temps.
**Correction :** Utilisez le magasin de 'Secrets' de l'outil CI. Référencez-les comme `${{ secrets.DB_PASSWORD }}`. Cela garde la logique dans le dépôt mais les données sensibles sécurisées.

## Exercice pratique
Si vous déplacez un projet d'un fournisseur Git à un autre, pourquoi est-il utile d'avoir la configuration dans le dépôt ?

**Réponse :** Cela fournit un plan documenté des besoins du build (version JDK, commandes de test), facilitant grandement la recréation du pipeline dans le nouveau système.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
