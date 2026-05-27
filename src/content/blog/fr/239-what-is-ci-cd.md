---
title: "Construire un Pipeline CI/CD avec des Portes de Sortie Claires"
description: "Guide technique pour implémenter un pipeline 'build-once, deploy-many' pour un service de rapports de facturation utilisant des artefacts immuables."
pubDate: 2026-10-08T21:48:00.000Z
translationKey: 239-what-is-ci-cd
seriesOrder: 54
locale: fr
tags: ["deployment-devops","learning-series"]
draft: false
---

## Le Mécanisme Central : Construire une fois, Déployer partout

Une erreur courante en CI/CD consiste à reconstruire l'application pour chaque environnement (par exemple, exécuter `mvn package` pour le staging, puis à nouveau pour la production). Cela introduit un risque : le binaire testé en staging pourrait ne pas être identique à celui déployé en production à cause d'un changement de version de dépendance ou de drapeaux de compilation différents.

L'approche professionnelle est l'**Artefact Immuable**. Le pipeline compile le code une seule fois, le package dans une image Docker et lui assigne un digest unique (SHA). Cette image exacte est ensuite promue vers le staging puis la production. Les différences liées à l'environnement sont gérées via une configuration versionnée (variables d'environnement), et non en modifiant le code.

## Architecture du Pipeline pour un Service de Facturation

Dans notre scénario, un service de rapports de facturation doit être strictement validé avant la mise en production. Nous distinguons la **Livraison Continue** (Continuous Delivery), où l'artefact est toujours prêt mais le déploiement en production est une décision manuelle, du **Déploiement Continu** (Continuous Deployment), où tout passage réussi va directement en production.

Pour la facturation, nous utilisons la Livraison Continue pour garantir qu'un humain vérifie les rapports avant leur mise en ligne.

### Trace du Flux de Travail
1. **Événement Push** : Un développeur pousse le code sur la branche `main`. Cela déclenche le pipeline Jenkins via un webhook.
2. **Étape CI** : Le code est compilé et les tests unitaires sont exécutés. Si un test échoue, le pipeline s'arrête immédiatement.
3. **Packaging** : Une image Docker est construite et poussée vers un registre privé. Elle est taguée avec le hash du commit Git (ex: `billing-service:a1b2c3d`).
4. **Déploiement Staging** : Le pipeline met à jour l'environnement de staging pour utiliser l'image `a1b2c3d`. Des tests d'intégration sont lancés sur cette instance.
5. **Porte de Sortie (Release Gate)** : Le pipeline s'arrête. Il attend un signal d'approbation manuelle d'un responsable QA ou Product Owner.
6. **Déploiement Production** : Après approbation, la même image `a1b2c3d` est promue en production.

## Artefact Travaillé : Le Plan du Jenkinsfile

Voici le plan structurel du `Jenkinsfile`. Celui-ci est stocké dans le dépôt pour que le pipeline évolue avec le code.

```groovy
pipeline {
    agent any

    environment {
        REGISTRY = "my-company-registry.io"
        IMAGE_NAME = "billing-report-service"
        IMAGE_TAG = "${env.GIT_COMMIT}"
    }

    stages {
        stage('Build & Test') {
            steps {
                // Compilation et tests JUnit
                sh './mvnw clean package'
            }
        }

        stage('Package Image') {
            steps {
                // Construction de l'image immuable et push vers le registre
                sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Staging') {
            steps {
                // Mise à jour du staging avec le tag de l'image
                sh "./deploy.sh staging ${IMAGE_TAG}"
            }
        }

        stage('Integration Tests') {
            steps {
                // Tests contre l'URL de staging
                sh './run-integration-tests.sh staging'
            }
        }

        stage('Production Approval') {
            steps {
                // Pause pour intervention manuelle
                input message: "Promouvoir le build ${IMAGE_TAG} en Production?", ok: "Déployer"
            }
        }

        stage('Deploy to Production') {
            steps {
                // Promotion de l'image EXACTE en production
                sh "./deploy.sh prod ${IMAGE_TAG}"
            }
        }
    }

    post {
        failure {
            echo "Échec du pipeline. Notification de l'équipe via Slack/Email."
        }
    }
}
```

## Gestion des Secrets et Rollbacks

Un tag de commit est pratique mais peut être écrasé. Capturez le digest du manifeste publié et déployez repository@sha256:… en staging et production. Le Jenkinsfile est un plan : deploy.sh doit résoudre et conserver le digest vérifié, utiliser des credentials gérés, contrôler readiness et résultat. Les scripts de tests doivent exister et renvoyer les bons codes. Un echo Slack/Email n’envoie pas de notification.

Promouvez seulement le digest testé avec configuration compatible versionnée. Gardez l’ancien digest et la compatibilité schéma ; le rollback peut prendre du temps ou être empêché par une migration. Limitez approbateurs et objet précis de l’approbation. La gate exige aussi le contrôle des bypass et credentials.
## Cas d'Échec et Conséquences

*   **Échec des Tests d'Intégration** : Si les tests de staging échouent, le pipeline s'arrête avant l'étape d'approbation. L'environnement de production reste intact.
*   **Timeout d'Approbation** : Si l'approbation manuelle est ignorée trop longtemps, le pipeline peut être configuré pour s'annuler, évitant ainsi le déploiement accidentel de builds obsolètes.
*   **Indisponibilité du Registre** : Si le registre d'images est inaccessible lors de l'étape de production, le déploiement échoue. Cela souligne l'importance d'un registre hautement disponible.

## Exercice

**Scénario** : Vous modifiez le pipeline. Vous voulez vous assurer que le déploiement en production n'arrive que si les tests d'intégration réussissent ET que l'approbation manuelle est accordée. Cependant, vous remarquez que si l'étape `Integration Tests` échoue, le pipeline saute l'approbation mais ne notifie pas explicitement l'équipe de la raison du blocage.

**Question** : Où devriez-vous ajouter la logique de notification pour que l'équipe sache si le build est "Staging-Failed" ou "Pending-Approval", et comment l'image immuable garantit-elle qu'un correctif dans le code ne saute pas la phase de staging ?

**Réponse** : La logique de notification doit être placée dans le bloc `post { failure { ... } }` ou un bloc `catch` spécifique aux tests d'intégration. Pour garantir qu'un correctif ne saute pas le staging, le pipeline doit être linéaire : tout changement de code → nouveau hash de commit → nouvelle image → déploiement staging obligatoire → tests obligatoires → approbation. On ne peut pas "promouvoir" un correctif directement en production car l'étape de production exige un tag d'image qui a déjà réussi l'étape de staging dans l'exécution actuelle du pipeline.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
