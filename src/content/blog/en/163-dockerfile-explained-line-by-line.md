---
title: "Dockerfile Explained Line by Line"
description: "A detailed breakdown of how a Dockerfile transforms a set of instructions into a runnable container image."
pubDate: 2026-10-13T10:48:00.000Z
translationKey: 163-dockerfile-explained-line-by-line
locale: en
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Imagine you have a Java application that works perfectly on your laptop, but when you send it to a colleague, it fails because they have a different version of the JDK or a missing environment variable. This 'it works on my machine' problem is exactly why we use a Dockerfile. A Dockerfile is a text document containing all the commands a user could call on the command line to assemble an image.

## The Base Image (FROM)
Every Dockerfile must start with a `FROM` instruction. This defines the base image you are building upon. Think of it as the foundation of your house. If you are building a Spring Boot app, you might use `FROM eclipse-temurin:17-jdk-alpine`. The `alpine` tag indicates a lightweight Linux distribution, which keeps your final image size small.

## Setting the Workspace (WORKDIR)
Instead of using absolute paths throughout your file, `WORKDIR /app` creates a directory and ensures all following commands (like `COPY` or `RUN`) execute inside that folder. It is similar to using `cd` in a terminal, but it persists for the rest of the build process.

## Adding Files and Dependencies (COPY & RUN)
`COPY . .` tells Docker to take the files from your local machine and put them into the image. After copying, you use `RUN` to execute shell commands. For example, `RUN ./mvnw package` compiles your code. It is important to remember that each `RUN` command creates a new layer in the image.

## Defining the Entry Point (CMD)
While `RUN` happens during the build, `CMD` happens when the container starts. `CMD ["java", "-jar", "app.jar"]` tells the container which process to run as its main task. If this process stops, the container stops.

## Worked Example: Procurement App
Here is a simplified Dockerfile for a procurement request service:

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /procurement
COPY target/procurement-app.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```
**Outcome:** Docker builds an image containing only the JRE and the compiled JAR. When run, the app listens on port 8080 inside the container.

## Common Mistake: RUN vs CMD
A frequent error is using `RUN` to start the application. `RUN java -jar app.jar` will try to start the app during the image build phase, which will either hang the build or fail because the app can't find a database. Use `CMD` for the startup command.

## Practical Exercise
Which instruction would you use to install a package like `curl` inside your image during the build process?

**Answer:** The `RUN` instruction (e.g., `RUN apk add --no-cache curl`).

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
