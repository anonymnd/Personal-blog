---
title: "Deploy an Application from a Laptop to a Server"
description: "A technical guide on moving a Java appointment service to a Linux VPS, covering environment configuration, reverse proxies, and service lifecycle."
pubDate: 2026-10-08T19:48:00.000Z
translationKey: 231-what-is-a-server
seriesOrder: 52
locale: en
tags: ["deployment-devops","learning-series"]
draft: false
---

## The Conceptual Shift: Laptop vs. VPS

Developing on a laptop provides a controlled environment where the developer is the only user and the database is often a local instance. Moving to a Virtual Private Server (VPS) introduces a shared network environment, persistent uptime requirements, and the need for strict security boundaries. A VPS is essentially a slice of a physical server with its own OS, allowing you to manage the kernel and installed packages, unlike a shared hosting plan.

## Environment Stratification

To avoid deploying untested code directly to users, we categorize environments by their purpose and configuration:

*   **Local**: The developer's machine. Optimized for fast feedback and debugging.
*   **Development/Stage**: A VPS that mirrors production. This is where integration tests happen and where the 'appointment service' is verified against a real Linux environment before the final move.
*   **Production**: The live server. Optimized for stability, security, and performance. Access is strictly limited.

## Configuration and Secret Management

Hardcoding database URLs or API keys is a critical failure. Instead, we use externalized configuration. For a Spring Boot appointment service, we separate the application logic from the environment settings.

**Configuration Matrix for Appointment Service:**

| Setting | Local | Stage | Production |
| :--- | :--- | :--- | :--- |
| `server.port` | 8080 | 8080 | 8080 |
| `spring.datasource.url` | jdbc:h2:mem:testdb | jdbc:postgresql://stage-db:5432/app | jdbc:postgresql://prod-db:5432/app |
| `logging.level.root` | DEBUG | INFO | WARN |
| `api.key` | dev-key-123 | stage-secret-abc | prod-high-security-xyz |

Secrets (like the `api.key`) should never be in Git. On the VPS, these are typically injected via environment variables or a protected `.properties` file owned by the service user.

## The Deployment Artifact and Lifecycle

We do not move source code to the server; we move a compiled, immutable artifact (e.g., a `.jar` file).

**The Deployment Sequence:**
1. **Transfer**: The JAR is uploaded to the VPS via SCP or SFTP.
2. **Execution**: The application is run as a background process. Using a tool like `systemd` ensures the app starts automatically on boot and restarts if it crashes.
3. **Reverse Proxy**: The application runs on port 8080, but users access it via port 443 (HTTPS). A reverse proxy (like Nginx) sits in front, handling TLS termination and forwarding requests to the Java process.

## Worked Example: Deployment Plan for Appointment Service

Assume we are deploying `appointment-service-v1.jar` to a Ubuntu VPS.

**1. Systemd Service Definition (Illustrative)**
This configuration tells Linux how to manage the app lifecycle.

```ini
[Unit]
Description=Appointment Service
After=network.target

[Service]
User=appuser
ExecStart=/usr/bin/java -jar /opt/app/appointment-service-v1.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
Environment=SPRING_PROFILES_ACTIVE=prod
EnvironmentFile=/etc/appointment-service/app.env
Environment=SERVER_ADDRESS=127.0.0.1
Environment=SERVER_PORT=8080

[Install]
WantedBy=multi-user.target
```

**2. Nginx Reverse Proxy Configuration (Illustrative)**
This maps the public domain to the internal port.

```nginx
server {
    listen 443 ssl;
    server_name appointments.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Analysis of this setup:**
*   **Isolation**: The Java app is not exposed to the internet directly; only Nginx is. This prevents attackers from probing the application server directly.
*   **Resilience**: If the JVM runs out of memory and crashes, `systemd` detects the exit and triggers a restart after 10 seconds.
*   **Security**: The `appuser` has limited permissions, meaning a vulnerability in the app doesn't grant root access to the VPS.

## Smoke Checks and Rollback

Once the service is started, we perform a **Smoke Check**: a minimal set of tests to ensure the core functionality works in the new environment. For our service, this means checking the `/health` endpoint and attempting to fetch one appointment.

**Failure Scenario**: The smoke check fails because the production database rejects the connection (wrong credentials).

**Rollback Prerequisite**: To roll back, we must keep the previous version's artifact (`appointment-service-v0.jar`) and its corresponding configuration on the disk. Rollback involves updating the `systemd` `ExecStart` path to the old JAR and restarting the service. This is faster than re-uploading from a laptop.

## Exercise

**Scenario**: You deployed a new version of the appointment service. The Nginx logs show `502 Bad Gateway`, but the `systemd` status shows the service is `active (running)`.

1. What is the most likely cause of this discrepancy?
2. How would you verify if the application is actually accepting requests internally?

**Answer**:
1. The application process is running, but it is not listening on the port Nginx expects (8080), or it is stuck in a startup loop/deadlock where the process exists but the server isn't ready.
2. Run `curl -I http://localhost:8080/health` directly on the VPS. If this fails, the issue is inside the Java app; if it succeeds, the issue is in the Nginx configuration.

Create appuser, the installed Java runtime, paths and a protected EnvironmentFile separately. Populate actual Spring datasource variables there, including SPRING_DATASOURCE_PASSWORD; DB_PASSWORD is not automatically mapped without application configuration. Restrict file permissions and firewall access, and bind the app to loopback before claiming only the proxy is public. The certificate paths must refer to a valid certificate for appointments.example.com. Reload systemd configuration after changing the unit and verify both local readiness and public HTTPS. A 502 has several possible causes; a successful HEAD /health does not alone rule out proxy permissions, TLS or path-specific failures. Keep schema and configuration rollback compatibility, not just an old JAR.

## Further reading

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
