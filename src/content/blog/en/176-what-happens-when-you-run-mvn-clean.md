---
title: "What Happens When You Run mvn clean?"
description: "A deep dive into how the Maven clean plugin manages your build directory to ensure a fresh compilation."
pubDate: 2026-10-13T23:48:00.000Z
translationKey: 176-what-happens-when-you-run-mvn-clean
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you have just changed a critical configuration in your procurement app, but when you run the application, the old settings are still active. You feel like the code isn't updating, even though you saved the file. This happens because Maven stores compiled classes and processed resources in a specific folder that isn't always automatically refreshed.

## The Role of the Target Folder
When you build a Java project, Maven doesn't modify your source code in `src/main/java`. Instead, it creates a directory called `target`. This folder acts as a workspace where `.java` files become `.class` files and properties files are filtered. Over time, this folder can accumulate "stale" artifacts—files from previous versions of your code that are no longer needed but still exist on disk.

## How mvn clean Works
Running `mvn clean` invokes the Maven Clean Plugin. Its primary job is simple: it deletes the `target` directory entirely. By removing this folder, you ensure that no remnants of old builds interfere with your current version. It is important to note that `mvn clean` only removes configured build outputs; it never touches your source code or your `pom.xml`.

## A Practical Example
Consider a procurement app where a `Request` object had a field called `requestDate`. You rename it to `submissionDate`. If you run `mvn compile` without cleaning, some IDEs or build environments might keep the old `Request.class` file in the `target` folder, leading to confusing `NoSuchFieldError` or `ClassNotFoundException` errors during runtime.

```bash
# Incorrect: Just compiling might leave old classes
mvn compile

# Correct: Fresh start
mvn clean compile
```
Outcome: The `target` folder is deleted, and Maven recompiles every single class from scratch, ensuring `submissionDate` is the only version present.

## Common Mistake: Overusing Clean
Many developers run `mvn clean install` every single time they make a change. While safe, this is inefficient for large projects because it forces Maven to recompile everything, ignoring the incremental build capabilities. You only *need* `clean` when you change dependencies, rename classes, or encounter strange build glitches.

## Quick Exercise
If you run `mvn clean`, will your `src/main/resources/application.properties` file be deleted?

**Answer:** No. `mvn clean` only deletes the `target` folder. Your source files in `src` remain untouched.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
