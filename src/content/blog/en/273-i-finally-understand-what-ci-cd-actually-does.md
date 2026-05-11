---
title: "I Finally Understand What CI/CD Actually Does"
description: "A conceptual breakdown of Continuous Integration and Continuous Deployment using a hypothetical procurement system to illustrate the automation pipeline."
pubDate: 2026-10-18T00:48:00.000Z
translationKey: 273-i-finally-understand-what-ci-cd-actually-does
locale: en
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

For a long time, I viewed CI/CD as just a set of tools like Jenkins or GitHub Actions. I struggled to see the difference between 'integrating' and 'deploying' until I imagined a procurement application where a requester submits a purchase request and a manager approves it. In software, the 'request' is the code, and the 'approval' is the automated pipeline.

## The 'CI' Part: Continuous Integration
CI is about the frequent merging of code into a shared repository. Instead of working on a feature for two weeks and facing a 'merge hell,' developers push small changes daily. The goal is to ensure that new code doesn't break existing functionality. When you push code, an automated server triggers a build and runs tests. If a test fails, the build is 'broken,' and the team fixes it immediately.

## The 'CD' Part: Delivery vs. Deployment
Continuous Delivery ensures the code is *ready* to be deployed at any time. It passes all tests and is packaged into an artifact. Continuous Deployment goes one step further: it automatically pushes that artifact into the production environment without human intervention. In our procurement app analogy, Delivery is like having the order ready on the buyer's desk; Deployment is the buyer actually hitting the 'Order' button automatically.

## A Worked Example: The Procurement Flow
Imagine we add a 'Priority' field to the purchase request. 
1. **CI Phase**: The developer pushes the code. The pipeline runs `mvn test`. It checks if the priority field saves correctly. Outcome: Build Success.
2. **CD Phase**: The pipeline packages the app into a Docker image and pushes it to a staging server. 
3. **Deployment**: After a final automated smoke test, the image is updated in the production cluster.

## Common Mistake: Skipping the Test Suite
A frequent error is setting up a pipeline that only 'builds' the code but doesn't 'test' it. If your pipeline only checks if the code compiles, you aren't doing CI; you are just automating a build. You must have automated tests to validate the logic.

## Practical Exercise
If a pipeline fails during the 'Test' stage but succeeds during the 'Build' stage, did the CI process work as intended?

**Answer**: Yes. The purpose of CI is to catch errors before they reach production. A failed test is a successful catch.
