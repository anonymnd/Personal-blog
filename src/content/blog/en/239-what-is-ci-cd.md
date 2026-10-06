---
title: "What Is CI/CD?"
description: "A beginner's guide to understanding the automated pipeline that moves code from a developer's machine to production."
pubDate: 2026-10-16T14:48:00.000Z
translationKey: 239-what-is-ci-cd
locale: en
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine a team of five developers working on a procurement app. One person adds the 'Request' form, another builds the 'Manager Approval' logic, and a third handles the 'Buyer Order' system. Without a system, they might spend hours manually merging code, only to find that the Approval logic broke the Request form. This 'integration hell' is exactly what CI/CD solves.

## Continuous Integration (CI)
CI is the practice of merging all developer working copies to a shared mainline several times a day. Instead of waiting weeks to merge, developers push small changes to a Git repository. This push triggers an automated build and test sequence. If a test fails, the team knows immediately which specific change caused the break, making it easy to fix before the bug reaches other developers.

## Continuous Delivery vs. Deployment
While often grouped together, these two are different. Continuous Delivery ensures that the code is always in a 'releasable state.' The pipeline automates building and testing, but a human still clicks a button to deploy to production. Continuous Deployment goes a step further: if the code passes all automated tests, it is deployed to the live server automatically without human intervention.

## How the Pipeline Works
Consider this simplified YAML excerpt for a pipeline configuration:

```yaml
stages:
  - build: compile_java_app
  - test: run_unit_tests
  - deliver: push_to_staging
  - deploy: push_to_production # Only in Continuous Deployment
```

In our procurement app, when a developer pushes a fix for the 'Buyer Order' module, the CI server automatically compiles the code and runs tests to ensure the 'Manager Approval' flow still works. If the tests pass, the artifact is ready for the next stage.

## Common Mistake: Confusing Tools with Process
A frequent error is thinking that installing Jenkins or GitHub Actions *is* CI/CD. These are tools that automate the process, but CI/CD is a culture of frequent integration and automated testing. Using a tool without writing tests is just 'automated deployment of bugs.'

## Practical Exercise
Scenario: A developer pushes code that breaks the build. In a CI/CD environment, what happens immediately after the push?

**Answer:** The CI pipeline triggers, the build/test stage fails, and the developer is notified immediately to fix the code before it can be merged or deployed.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
