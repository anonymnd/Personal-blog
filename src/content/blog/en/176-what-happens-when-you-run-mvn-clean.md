---
title: "Understand Maven Lifecycle Commands and Build Artifacts"
description: "A deep dive into Maven phases, the target folder, and the distinction between unit and integration test reports."
pubDate: 2026-10-08T07:48:00.000Z
translationKey: 176-what-happens-when-you-run-mvn-clean
seriesOrder: 40
locale: en
tags: ["maven-debugging","learning-series"]
draft: false
---

## The Maven Lifecycle Mechanism

mvn package traverses the default lifecycle up to package, executing the goals bound to those phases for the project’s packaging and configuration. validate → compile → test → package is a simplified outline that omits intermediate phases. Tests can be skipped, absent or configured differently, so a packaged JAR is not proof of passing tests. Inspect the effective POM and build log.
## The Target Folder and the 'Clean' Necessity

All build outputs are directed to the `target/` directory. This includes `.class` files, generated sources, and the final JAR.

`mvn clean` is a separate lifecycle. Its sole purpose is to delete the `target/` folder. This is critical because Maven does not always detect every change in complex dependency trees or resource files. If a previous build failed or left stale artifacts, a subsequent `mvn package` might bundle outdated code. Running `mvn clean package` ensures a deterministic build from a blank slate.

## Unit Tests vs. Integration Tests

Surefire normally runs unit tests in the test phase for a JAR project, with default patterns such as Test*, *Test, *Tests and *TestCase. Failsafe runs integration-test and verify only when the project configures its executions; typical patterns include IT*, *IT and *ITCase. Defaults can be changed.

Surefire failures normally stop the build before package. Failsafe records ordinary test failures during integration-test so lifecycle execution can reach post-integration-test cleanup, then verify reports failure. Run mvn verify rather than invoking integration-test alone. Infrastructure or plugin errors can still stop execution earlier; cleanup needs its own robust design.
## Plugin Goals vs. Lifecycle Phases

Commands like `mvn spring-boot:run` are not lifecycle phases. They are **plugin goals**. A goal is a specific task executed by a plugin. While `package` is a phase that triggers many goals, `spring-boot:run` bypasses the standard lifecycle to launch the application directly from the compiled classes in `target/classes`, without needing to bundle a JAR first.

## Worked Scenario: The Report-Export Project

**Scenario**: You are working on a report-export project. You run `mvn package`. The build fails. You check `target/` and see a JAR file. You are confused because the build failed.

**The Trace**:
1. **Execution**: `mvn package` starts.
2. **Compile**: Success. `.class` files are created in `target/classes`.
3. **Test**: The Surefire plugin runs. One test fails. The build stops here.
4. **The Artifact**: You see a JAR in `target/`. This is a **stale artifact** from a previous successful build. Because the current build failed at the `test` phase, the `package` phase was never reached. The JAR you see is old and does not contain your latest changes.

**The Fix**:
To diagnose and resolve, run:
`mvn clean test`

This wipes the stale JAR and focuses on the failure. You then check `target/surefire-reports/TEST-com.project.ReportExportTest.xml` to find the exact assertion failure.

## Packaging: Plain JAR vs. Executable JAR

A plain JAR contains compiled classes/resources and can be executable when its manifest and runtime classpath are configured appropriately; bundling all dependencies is not a universal requirement for java -jar. Spring Boot’s repackage goal produces its particular executable archive format with dependencies and launcher support. Configure that goal explicitly; merely declaring an arbitrary plugin does not guarantee every package command runs it.

Similarly, spring-boot:run is a plugin goal but can request prerequisite lifecycle execution before starting the application. clean removes configured build directories and stale outputs; it does not alone guarantee a deterministic build because dependencies, tools and environment still matter.
## Exercise

**Question**: You run `mvn verify`. The build fails. You find that the unit tests passed, but an integration test failed. Where do you look for the report, and why is there a JAR file in the `target` folder despite the failure?

**Answer**:
1. Look in `target/failsafe-reports`. Since unit tests passed, the build progressed past the `test` phase into `integration-test`.
2. The JAR exists because the `package` phase occurs *before* the `integration-test` and `verify` phases. Therefore, Maven successfully bundled the JAR before the integration test failed.

## Further reading

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
