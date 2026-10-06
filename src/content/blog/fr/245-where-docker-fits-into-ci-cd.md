---
title: "Where Docker Fits Into CI/CD"
description: "Comprendre comment Docker sert de couche d'emballage cohérente pour combler le fossé entre l'intégration et le déploiement continus."
pubDate: 2026-10-16T20:48:00.000Z
translationKey: 245-where-docker-fits-into-ci-cd
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imaginez un développeur affirmant : « Ça marche sur ma machine », alors que l'application plante dès son arrivée sur le serveur de production. Cet écart survient généralement parce que le serveur possède une version de Java différente ou qu'une bibliothèque système est manquante. C'est précisément ce problème que Docker résout au sein d'un pipeline CI/CD.

## Le Pont d'Emballage
Dans un flux CI/CD, Docker n'est pas l'outil d'automatisation lui-même (comme Jenkins ou GitHub Actions), mais l'artéfact que ces outils déplacent. Alors que la CI se concentre sur la construction et le test fréquents du code, Docker garantit que l'environnement utilisé pour ces tests est identique à celui de la production. Au lieu de déployer du code brut, le pipeline crée une image Docker contenant l'OS, le runtime et le code.

## Mécanisme dans le Pipeline
1. **Phase CI** : Le développeur pousse le code vers Git. Le serveur CI déclenche un build, exécute les tests, puis crée une image Docker. Cette image est taguée et poussée vers un registre.
2. **Phase CD** : L'outil de déploiement récupère cette image spécifique et l'exécute sous forme de conteneur sur le serveur. Comme l'image est immuable, il n'y a aucun risque de « dépendances manquantes » lors du déploiement.

## Exemple Concret : App de Procurement
Prenons une application de gestion d'achats où un demandeur soumet une requête.
- **Build** : Le pipeline CI compile le code Java et l'emballe dans une image Docker : `procurement-app:v1.2`.
- **Test** : Le pipeline lance un conteneur à partir de cette image et effectue des tests d'intégration.
- **Déploiement** : Une fois validée, l'image est déployée en production. Le manager peut alors approuver les demandes dans un environnement stable.

## Erreur Courante : L'Image « Géante »
Une erreur fréquente consiste à inclure les outils de build (comme Maven ou Gradle) dans l'image de production finale, la rendant lourde et moins sécurisée.
**Correction** : Utilisez les "multi-stage builds". Utilisez une étape pour compiler le code et une seconde étape légère pour ne copier que le fichier JAR résultant dans une image JRE minimaliste.

## Exercice Pratique
Si un pipeline CI échoue lors de l'étape de « Test », l'image Docker doit-elle être poussée vers le registre de production ?

**Réponse** : Non. L'image ne doit être poussée vers le registre qu'après la réussite de tous les tests pour garantir que seules les versions stables atteignent la phase de déploiement.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
