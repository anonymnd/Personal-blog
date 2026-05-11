---
title: "Feature-Based Packages vs Layer-Based Packages"
description: "A comparison between organizing code by technical roles versus business capabilities to improve maintainability."
pubDate: 2026-10-17T07:48:00.000Z
translationKey: 256-feature-based-packages-vs-layer-based-packages
locale: en
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Imagine you are working on a procurement application. You need to add a new field to the 'Purchase Request' form. In a layer-based structure, you find yourself jumping between a `controller` package, a `service` package, and a `repository` package, even though all these changes relate to one single business feature. This 'yo-yo' effect makes navigation tedious as the project grows.

## The Layer-Based Approach
Layer-based packaging organizes code by technical function. You have folders like `com.app.controllers`, `com.app.services`, and `com.app.repositories`. This is intuitive for beginners because it separates the 'how' (technical layer) from the 'what' (business logic). However, it creates low cohesion; files that change together are scattered across the entire project tree.

## The Feature-Based Approach
Feature-based packaging (or packaging by component) groups code by business capability. Instead of a global `services` folder, you have a `com.app.procurement.request` package containing its own controller, service, and repository. This increases cohesion because everything related to 'Requests' is in one place. If you need to delete the 'Approval' feature, you delete one package rather than hunting for files in five different layers.

## Worked Example: Procurement App
Consider how these two structures handle a 'Buyer' module:

| Layer-Based | Feature-Based |
| :--- | :--- |
| `src/controllers/BuyerController.java` | `src/buyer/BuyerController.java` |
| `src/services/BuyerService.java` | `src/buyer/BuyerService.java` |
| `src/repositories/BuyerRepository.java` | `src/buyer/BuyerRepository.java` |

In the feature-based model, the `Buyer` package acts as a module. Other features, like `Request`, interact with `Buyer` through a defined interface, reducing the cognitive load when exploring the code.

## Common Mistake: The 'God' Feature
A frequent error is creating a feature package that is too broad, such as `com.app.core`. This effectively turns the project back into a layer-based system under a different name. To fix this, split `core` into specific domain capabilities like `inventory` or `billing` based on the business requirements.

## Practical Exercise
If you have a `ManagerApproval` class and a `ManagerRepository` class, where should they live in a feature-based structure?

**Answer:** Both should be placed inside a `com.app.approval` (or similar feature-named) package.
