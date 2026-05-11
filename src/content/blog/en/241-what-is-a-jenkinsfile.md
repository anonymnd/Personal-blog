---
title: "What Is a Jenkinsfile?"
description: "A comprehensive guide to understanding Pipeline-as-Code using the Jenkinsfile for automated software delivery."
pubDate: 2026-10-16T16:48:00.000Z
translationKey: 241-what-is-a-jenkinsfile
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

Imagine you have a complex deployment process involving building a Java app, running tests, and deploying to a server. If you configure this manually in the Jenkins UI, you lose the history of changes, and if the server crashes, your configuration is gone. This is where the Jenkinsfile solves the problem by treating your pipeline as code.

## The Concept of Pipeline-as-Code
A Jenkinsfile is a text file that contains the definition of a Jenkins Pipeline. Instead of clicking buttons in a web interface, you write the build, test, and deploy steps in a script and commit it directly to your Git repository. This ensures that your CI/CD process is versioned alongside your application code.

## Declarative vs Scripted Syntax
Jenkins offers two styles. Declarative is the modern standard; it uses a structured format that is easier to read and provides built-in error checking. Scripted uses Groovy code and offers more flexibility but is harder to maintain. Most teams prefer Declarative for its simplicity.

## Worked Example: Procurement App Pipeline
Consider a procurement app where a requester submits a request. The pipeline must build the app and run tests before it can be deployed.

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
                echo 'Deploying Procurement App to Staging...'
            }
        }
    }
}
```
In this example, if the `mvn test` step fails, the pipeline stops immediately, preventing a broken version of the procurement app from reaching the server.

## Common Mistake: Hardcoding Credentials
A frequent error is putting passwords or API keys directly inside the Jenkinsfile. Since this file is committed to Git, anyone with access to the repo can see your secrets.

**Correction:** Use the `credentials()` helper in Jenkins to reference secrets stored securely in the Jenkins Credentials Provider.

## Practical Exercise
**Task:** Which section of the Declarative Jenkinsfile is used to define the actual commands to be executed (like shell scripts)?

**Answer:** The `steps` block inside a `stage`.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
