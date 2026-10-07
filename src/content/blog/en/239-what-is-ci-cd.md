---
title: "Build a CI/CD Pipeline with Clear Release Gates"
description: "A technical guide to implementing a build-once, deploy-many pipeline for a billing report service using immutable artifacts and manual approval gates."
pubDate: 2026-10-08T21:48:00.000Z
translationKey: 239-what-is-ci-cd
seriesOrder: 54
locale: en
tags: ["deployment-devops","learning-series"]
draft: false
---

## The Core Mechanism: Build Once, Deploy Many

A common mistake in CI/CD is rebuilding the application for every environment (e.g., running `mvn package` for staging and then again for production). This introduces risk: the binary tested in staging might not be identical to the one deployed to production due to dependency version shifts or environment-specific build flags.

The professional approach is the **Immutable Artifact**. The pipeline builds the code once, packages it into a Docker image, and assigns it a unique digest (SHA). This exact same image is then promoted through staging and production. Environment-specific differences are handled via versioned configuration (environment variables or config maps), not by changing the code.

## Pipeline Architecture for a Billing Report Service

In our scenario, a billing report service must be strictly validated before hitting production. We distinguish between **Continuous Delivery** (where the artifact is always ready, but production release is a manual decision) and **Continuous Deployment** (where every pass goes straight to production).

For billing, we use Continuous Delivery to ensure a human verifies the reports before they are live.

### The Workflow Trace
1. **Push Event**: A developer pushes code to the `main` branch. This triggers the Jenkins pipeline via a webhook.
2. **CI Stage**: The code is compiled, and unit tests are executed. If any test fails, the pipeline stops immediately.
3. **Packaging**: A Docker image is built and pushed to a private registry. It is tagged with the Git commit hash (e.g., `billing-service:a1b2c3d`).
4. **Staging Deployment**: The pipeline updates the staging environment to use image `a1b2c3d`. Integration tests run against this live instance.
5. **Release Gate**: The pipeline pauses. It waits for a manual 'Approval' signal from a QA lead or Product Owner.
6. **Production Deployment**: Upon approval, the same image `a1b2c3d` is promoted to production.

## Worked Artifact: The Jenkinsfile Plan

Below is the structural plan for the `Jenkinsfile`. This is stored in the repository so that the pipeline evolves with the code.

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
                // Compile and run JUnit tests
                sh './mvnw clean package'
            }
        }

        stage('Package Image') {
            steps {
                // Build immutable image and push to registry
                sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Staging') {
            steps {
                // Update staging environment to use the new image tag
                // This uses a versioned config file or API call
                sh "./deploy.sh staging ${IMAGE_TAG}"
            }
        }

        stage('Integration Tests') {
            steps {
                // Run tests against the staging URL
                sh './run-integration-tests.sh staging'
            }
        }

        stage('Production Approval') {
            steps {
                // The pipeline pauses here for manual intervention
                input message: "Promote build ${IMAGE_TAG} to Production?", ok: "Deploy"
            }
        }

        stage('Deploy to Production') {
            steps {
                // Promote the EXACT same image tag to production
                sh "./deploy.sh prod ${IMAGE_TAG}"
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed. Notifying team via Slack/Email."
        }
    }
}
```

## Handling Secrets and Rollbacks

A Git commit tag is a convenient label, but tags can be overwritten. Capture the pushed registry manifest digest and deploy repository@sha256:… to both staging and production. The Jenkinsfile above is an outline: deploy.sh must resolve and persist the verified digest, authenticate using managed credentials, check readiness and report deployment outcome. The integration-test scripts must exist and return failure codes correctly. Printing a Slack/Email message does not send a notification.

Promote only the digest that passed the chosen checks, together with compatible versioned configuration. Record the previous digest and compatible schema for rollback; deployment can take more than seconds and data migrations may prevent a simple reversal. Restrict who can approve and which commit/digest their approval covers. A gate helps only when bypass paths and deployment credentials are controlled.
## Failure Cases and Consequences

*   **Integration Test Failure**: If the staging tests fail, the pipeline stops before the 'Production Approval' stage. The production environment remains safe and untouched.
*   **Approval Timeout**: If the manual gate is ignored for too long, the pipeline can be configured to abort, preventing "stale" builds from accidentally being deployed days later.
*   **Registry Downtime**: If the image registry is unavailable during the production stage, the deployment fails. This highlights the need for a highly available registry.

## Exercise

**Scenario**: You are modifying the pipeline. You want to ensure that the production deployment only happens if the integration tests pass AND the manual approval is granted. However, you notice that if the `Integration Tests` stage fails, the pipeline currently skips the `Production Approval` but doesn't explicitly notify the team why the release was blocked.

**Question**: Where should you add the notification logic to ensure the team knows the build is "Staging-Failed" versus "Pending-Approval", and how does the immutable image ensure that a fix in the code doesn't accidentally skip the staging phase?

**Answer**: Notification logic should be placed in the `post { failure { ... } }` block or a specific `catch` block around the integration tests. To ensure a fix doesn't skip staging, the pipeline must be linear: any code change triggers a new commit hash → new image → mandatory staging deployment → mandatory tests → approval. You cannot "promote" a fix directly to production because the production stage requires an image tag that has already successfully passed the staging stage in the current pipeline execution.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
