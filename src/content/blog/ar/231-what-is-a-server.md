---
title: "كيفاش تطلع App من الـ Laptop لـ Serveur"
description: "دليل تقني باش تنقل service ديال appointments لـ VPS Linux، كيشرح الـ configuration، الـ reverse proxy، وكيفاش تسير الـ service."
pubDate: 2026-10-08T19:48:00.000Z
translationKey: 231-what-is-a-server
seriesOrder: 52
locale: ar
tags: ["deployment-devops","learning-series"]
draft: false
---

## الفرق بين الـ Laptop والـ VPS

فاش كتكون خدام فـ laptop، كلشي تحت السيطرة: أنت هو المستخدم الوحيد و الـ database غالباً كتكون local. ولكن فاش كتمشي لـ VPS (Virtual Private Server)، كتولي فـ بيئة فيها network مشترك، و خاص الـ app تبقى خدامة 24/24، و خاصك ترد البال بزاف لـ security. الـ VPS هو بحال واحد الطرف من serveur physique عندو OS ديالو بوحدو، كيعطيك الحق تحكم فـ kernel و الـ packages اللي بغيتي، ماشي بحال shared hosting اللي كيكون محدود.

## تقسيم البيئات (Environments)

باش ما تلوحش كود مازال ما تجربش نيشان عند الناس، كنقسمو البيئات على حسب الدور ديالهم:

*   **Local**: الماكينة ديال developer. مديورة باش تجرب بسرعة وتصلح الـ bugs.
*   **Development/Stage**: VPS كيشبه لـ production. هنا فين كيداروا tests d'intégration و كنتأكدو بلي الـ service ديال appointments خدام مزيان فـ Linux قبل ما يخرج للناس.
*   **Production**: السيرفر الحقيقي. هنا التركيز كيكون على الاستقرار (stability)، السيكوريتي، والسرعة. الدخول ليه كيكون محدود بزاف.

## تسيير الـ Configuration و الـ Secrets

أكبر غلط هو تكتب الـ URL ديال database أو الـ API keys وسط الكود. الحل هو نخدمو بـ externalized configuration. فـ Spring Boot، كنفرقو بين المنطق ديال app و الإعدادات ديال كل بيئة.

**جدول الـ Configuration ديال Service appointments:**

| الإعداد | Local | Stage | Production |
| :--- | :--- | :--- | :--- |
| `server.port` | 8080 | 8080 | 8080 |
| `spring.datasource.url` | jdbc:h2:mem:testdb | jdbc:postgresql://stage-db:5432/app | jdbc:postgresql://prod-db:5432/app |
| `logging.level.root` | DEBUG | INFO | WARN |
| `api.key` | dev-key-123 | stage-secret-abc | prod-high-security-xyz |

الـ secrets (بحال `api.key`) ما خاصهمش يدخلو لـ Git. فـ VPS، كنستعملو environment variables أو ملف `.properties` محمي كيكون عند الـ user اللي كيخدم الـ service.

## الـ Artifact ودورة حياة الـ Service

ما كنصيفطوش الكود source للسيرفر، ولكن كنصيفطو artifact واجد ومبني (مثلاً ملف `.jar`).

**مراحل الـ Deployment:**
1. **Transfer**: كنصيفطو الـ JAR لـ VPS باستعمال SCP أو SFTP.
2. **Execution**: كنخدمو الـ app كـ background process. كنستعملو `systemd` باش الـ app تخدم بوحدها فاش يشعل السيرفر، و تعاود تخدم (restart) إلا طاحت.
3. **Reverse Proxy**: الـ app خدامة فـ port 8080، ولكن المستخدمين كيدخلو بـ port 443 (HTTPS). هنا كنحطو reverse proxy (بحال Nginx) اللي كيتكلف بـ TLS و كيصيفط requests لـ Java process.

## مثال تطبيقي: Plan ديال Deployment لـ Appointment Service

تخيل بغينا نطلعو `appointment-service-v1.jar` فـ VPS Ubuntu.

**1. تعريف الـ Service فـ Systemd (Illustrative)**
هاد الـ config كتقول لـ Linux كيفاش يسير الـ app.

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

**2. Configuration ديال Nginx (Illustrative)**
هنا كنربطو الدومين بـ port الداخلي.

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

**تحليل هاد الـ setup:**
*   **Isolation**: الـ Java app ما معرضاش للأنترنيت نيشان؛ غير Nginx اللي معرض. هكا كنمنعو الـ attackers باش ما يقلبوش الـ app server نيشان.
*   **Resilience**: إلا الـ JVM سالا ليها الـ memory وطاحت، `systemd` كيعيق و كيدير restart مورا 10 ثواني.
*   **Security**: الـ `appuser` عندو صلاحيات محدودة، يعني إلا كانت شي ثغرة فـ app، ما غاديش يقدر الـ attacker يوصل لـ root ديال VPS.

## الـ Smoke Checks و الـ Rollback

فاش كنخدمو الـ service، كانديرو **Smoke Check**: تجارب بسيطة باش نتأكدو بلي الأساسيات خدامة. فـ الحالة ديالنا، كنقلبو الـ endpoint ديال `/health` و كنحاولو نجيبو appointment واحد.

**حالة فشل**: الـ smoke check ما خدمش حيت الـ database ديال production رفضات الاتصال (credentials غلط).

**شروط الـ Rollback**: باش نرجعو للنسخة القديمة، خاصنا نخليو الـ artifact القديم (`appointment-service-v0.jar`) و الـ config ديالو فـ disk. الـ rollback كيكون هو نبدلو المسار فـ `ExecStart` ديال `systemd` للـ JAR القديم و نديرو restart. هادشي أسرع بزااف من أننا نعاودو نصيفطو كلشي من الـ laptop.

## تمرين

**السيناريو**: طلعتي نسخة جديدة من الـ service. الـ logs ديال Nginx كيعطيو `502 Bad Gateway` ولكن الـ status ديال `systemd` كيقول بلي الـ service `active (running)`.

1. شنو هو السبب المرجح لهاد التناقض؟
2. كيفاش تقدر تأكد واش الـ application فعلاً كتجاوب داخلياً؟

**الجواب**:
1. الـ process ديال app خدام، ولكن ما كيسمعش (listening) فـ port اللي كيتسناه Nginx (8080)، أو الـ app واصلة لشي deadlock/startup loop فين الـ process كاين ولكن السيرفر مازال ما واجدش.
2. جرب دير `curl -I http://localhost:8080/health` نيشان فـ VPS. إلا ما خدمتش، المشكل وسط الـ Java app؛ إلا خدمات، المشكل فـ configuration ديال Nginx.

صاوب appuser وJava runtime وpaths وEnvironmentFile محمية بوحدهم. عمر actual Spring datasource vars بحال SPRING_DATASOURCE_PASSWORD؛ DB_PASSWORD ما كتترابطش أوتوماتيكيا بلا configuration. حدد permissions وfirewall وخلي app فـ loopback قبل claim أن غير proxy public. Certificate خاصها تكون صالحة لـ appointments.example.com. Reload systemd بعد unit change وجرب local readiness وpublic HTTPS. 502 عندها أسباب بزاف؛ HEAD /health ناجحة ما كتستبعدش proxy permissions ولا TLS ولا route issue. Rollback خاصها schema/config compatibility ماشي غير JAR قديمة.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
