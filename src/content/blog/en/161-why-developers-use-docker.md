---
title: "Build Reproducible Application Images with Docker"
description: "A deep dive into Dockerfile layers, the image-to-container relationship, and the limits of environment reproducibility."
pubDate: 2026-10-08T03:48:00.000Z
translationKey: 161-why-developers-use-docker
seriesOrder: 36
locale: en
tags: ["docker","learning-series"]
draft: false
---

## The Core Distinction: Image vs. Container

To achieve reproducibility, we must first distinguish between the blueprint and the execution. A Docker Image is a read-only, immutable template. It contains everything the application needs to run: the OS filesystem, the runtime (like Java or Python), libraries, and your compiled code. When you start a container, Docker adds a thin writable layer on top of this immutable image. 

Crucially, a container is not a Virtual Machine. While a VM bundles a full guest operating system and its own kernel, a container shares the host machine's Linux kernel. On Windows or macOS, Docker Desktop runs a lightweight Linux VM in the background to provide this kernel, but the containers themselves remain isolated processes using namespaces and cgroups rather than hardware virtualization.

## Anatomy of a Reproducible Build

Choose the build context explicitly and exclude unnecessary files with .dockerignore. Modern BuildKit can transfer only needed files and reuse unchanged content, so do not assume every local byte always travels to a daemon. A smaller relevant context still reduces accidental inclusion and improves builds.

Order filesystem-changing instructions to preserve useful cache entries: copy dependency descriptors before frequently changed source, then compile. COPY and RUN can produce filesystem layers; metadata instructions such as ENV or ENTRYPOINT need not add a filesystem layer. Cache reuse depends on instruction inputs, not just whether the Dockerfile text changed.

A version tag narrows a dependency choice but remains mutable. Pin a verified image digest when exact base content matters, manage dependency versions and toolchain inputs, and rebuild deliberately for updates. These controls improve reproducibility; they do not prove byte-for-byte identical builds or universal runtime behavior.
## Worked Example: CSV Conversion CLI

Imagine a Java-based CLI tool that converts CSV files to JSON. It requires a specific version of the OpenJDK and a specific set of environment variables for the input path.

### The Dockerfile (Illustrative)
```dockerfile
# Use a specific digest or version, never 'latest'
FROM eclipse-temurin:17-jre-alpine

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /app

# Copy only the compiled jar to keep the image small
COPY target/csv-converter-1.0.jar app.jar

# Switch to the non-root user
USER appuser

# Define the entrypoint to ensure the app runs as the primary process
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Analysis of the Artifact
1. **`FROM eclipse-temurin:17-jre-alpine`**: By using `alpine`, we reduce the attack surface and image size. Specifying `17` prevents the app from breaking when Java 21 becomes the default.
2. **`COPY target/csv-converter-1.0.jar app.jar`**: We copy the artifact, not the source code. This separates the build phase (Maven/Gradle) from the packaging phase.
3. **`ENTRYPOINT`**: Unlike `CMD`, `ENTRYPOINT` makes the container behave like an executable. Any arguments passed to `docker run` are appended to this command.

### Execution Trace
To run this converter on a file named `data.csv` located in the current directory:
`docker run --rm --mount "type=bind,source=$PWD,target=/inputs,readonly" csv-converter /inputs/data.csv` 

*Note: The `--rm` flag ensures the container is deleted after execution, preventing the accumulation of stopped containers on the host.*

## The Limits of Reproducibility

While the image is immutable, the execution environment is not. Docker solves the "it works on my machine" problem for the application stack, but it cannot control:

1. **The Host Kernel**: If your app relies on a specific Linux kernel module or a very recent kernel version, a container running on an old host kernel may fail.
2. **External Services**: If the CSV converter calls an external API or a database, the image cannot guarantee that the API version remains the same.
3. **Hardware Architecture**: An image built for `amd64` will not run on `arm64` (Apple Silicon) without emulation (QEMU), which can introduce performance discrepancies or subtle bugs.
4. **Entropy and Time**: System clocks and random number generators are shared with the host; if the app is time-sensitive, the host environment still matters.

## Exercise

**Scenario**: You have a Dockerfile that copies the entire project folder (`COPY . /app`) before running `mvn clean package` inside the container. Every time you change a single line of code, the `mvn install` step takes 5 minutes because it redownloads all dependencies.

**Question**: How do you restructure the Dockerfile to use layer caching to avoid redownloading dependencies on every code change?

**Answer**: 
Separate the dependency resolution from the code compilation. Copy only the `pom.xml` first, run the dependency download command, and then copy the source code.

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package
```
This ensures that as long as `pom.xml` doesn't change, Docker skips the `go-offline` layer and goes straight to compiling the updated source code.

That run command is a POSIX-shell example and assumes the image has already been built with docker build -t csv-converter . and the current directory contains data.csv. The bind mount supplies the host file; an argument path alone does not copy it. The non-root user must have read permission. The image supplies Linux user-space files, not its own kernel; these statements concern Linux containers. A smaller Alpine image does not by itself prove lower security risk or compatibility.

## Further reading

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
