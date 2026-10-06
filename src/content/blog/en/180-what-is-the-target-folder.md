---
title: "What Is the target Folder?"
description: "An essential guide to understanding where Maven stores compiled code and build artifacts."
pubDate: 2026-10-14T03:48:00.000Z
translationKey: 180-what-is-the-target-folder
locale: en
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

You have just written your first Java class in a Maven project, you run the build, and suddenly a new folder named `target` appears. You might wonder if you accidentally created it or if it is a system file you should ignore. This folder is the heart of the Maven build lifecycle, but for beginners, it often feels like a 'black box' where code disappears and binaries emerge.

## The Purpose of the Target Directory
In Maven, there is a strict separation between source code (located in `src`) and generated output. The `target` folder is the designated destination for everything Maven produces during the build process. Instead of cluttering your source directories with `.class` files, Maven isolates them here. This ensures that your version control system (like Git) only tracks your logic, not the machine-generated artifacts.

## What Lives Inside Target
When you run a command like `mvn package`, Maven populates this folder with several sub-directories:
- `classes`: Contains the compiled `.class` files of your main application.
- `test-classes`: Contains the compiled code for your unit tests.
- `surefire-reports`: Where the results of your unit tests are stored.
- `failsafe-reports`: Where integration test results are kept.
- The final JAR or WAR file: The packaged application ready for deployment.

## Worked Example: A Procurement Request
Imagine a procurement app where a `Requester` submits a `PurchaseRequest`. You write the code in `src/main/java`. When you run `mvn compile`, Maven translates your `.java` files into bytecode. 

**Outcome:** You will find `target/classes/com/app/PurchaseRequest.class`. If you then run `mvn package`, a file like `procurement-app-1.0.jar` appears in the root of the `target` folder. This JAR is what you actually deploy to a server.

## Common Mistake: Manual Edits
A frequent error is trying to fix a bug by editing a file inside the `target` folder. Because this folder is temporary, any changes you make there will be permanently deleted the next time you run `mvn clean` or `mvn compile`. Always edit files in `src`.

## Practical Exercise
**Question:** Which Maven command completely wipes the `target` folder to ensure a fresh build from scratch?

**Answer:** `mvn clean`. This removes the entire directory, forcing Maven to recompile every single class.


## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
