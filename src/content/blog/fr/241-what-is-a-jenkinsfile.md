---
title: "Qu'est-ce qu'un Jenkinsfile ?"
description: "Un guide complet pour comprendre le Pipeline-as-Code via le Jenkinsfile pour la livraison logicielle automatisée."
pubDate: 2026-10-16T16:48:00.000Z
translationKey: 241-what-is-a-jenkinsfile
locale: fr
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imaginez que vous ayez un processus de déploiement complexe comprenant la compilation d'une application Java, l'exécution de tests et le déploiement sur un serveur. Si vous configurez cela manuellement dans l'interface Jenkins, vous perdez l'historique des modifications et, en cas de crash du serveur, votre configuration disparaît. C'est là que le Jenkinsfile intervient en traitant votre pipeline comme du code.

## Le Concept de Pipeline-as-Code
Un Jenkinsfile est un fichier texte qui contient la définition d'un pipeline Jenkins. Au lieu de cliquer sur des boutons dans une interface web, vous écrivez les étapes de construction, de test et de déploiement dans un script que vous commitez directement dans votre dépôt Git. Cela garantit que votre processus CI/CD est versionné en même temps que le code de votre application.

## Syntaxe Déclarative vs Scriptée
Jenkins propose deux styles. Le mode Déclaratif est la norme moderne ; il utilise un format structuré, plus facile à lire et offre une vérification d'erreurs intégrée. Le mode Scripté utilise du code Groovy et offre plus de flexibilité, mais est plus difficile à maintenir. La plupart des équipes préfèrent le Déclaratif pour sa simplicité.

## Exemple concret : Pipeline d'application de gestion des achats
Prenons une application de gestion des achats où un demandeur soumet une requête. Le pipeline doit compiler l'application et exécuter les tests avant le déploiement.

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Déploiement de l\'app Achats vers Staging...'
            }
        }
    }
}
```
Dans cet exemple, si l'étape `mvn test` échoue, le pipeline s'arrête immédiatement, empêchant une version défectueuse de l'application d'atteindre le serveur.

## Erreur Courante : Identifiants en dur
Une erreur fréquente consiste à inscrire des mots de passe ou des clés API directement dans le Jenkinsfile. Comme ce fichier est commité dans Git, toute personne ayant accès au dépôt peut voir vos secrets.

**Correction :** Utilisez l'assistant `credentials()` de Jenkins pour référencer des secrets stockés en toute sécurité dans le gestionnaire de credentials de Jenkins.

## Exercice Pratique
**Question :** Quelle section du Jenkinsfile Déclaratif est utilisée pour définir les commandes réelles à exécuter (comme des scripts shell) ?

**Réponse :** Le bloc `steps` à l'intérieur d'un `stage`.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
