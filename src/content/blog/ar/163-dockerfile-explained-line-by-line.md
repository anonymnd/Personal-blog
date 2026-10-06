---
title: "شرح Dockerfile سطر بسطر"
description: "شرح مفصل كيفاش Dockerfile كيحول مجموعة ديال التعليمات لـ image ديال container خدامة."
pubDate: 2026-10-13T10:48:00.000Z
translationKey: 163-dockerfile-explained-line-by-line
locale: ar
tags: ["software-engineering","docker","learning-series"]
draft: false
---

تخيل عندك application Java خدامة مزيان فـ PC ديالك، ولكن ملي صيفطتيها لواحد صاحبك، ما بغاتش تخدم حيت عندو version ديال JDK مختلفة. هاد المشكل ديال "خدامة عندي فـ PC" هو علاش كنستعملو Dockerfile. الـ Dockerfile هو عبارة عن ملف نصي فيه كاع الأوامر اللي خاص Docker يدير باش يصاوب لينا image.

## الصورة الأساسية (FROM)
أي Dockerfile خاصو يبدا بـ `FROM`. هادي هي الساس فين غنبنيو. مثلا، إلا كنتي خدام بـ Spring Boot، تقدر تستعمل `FROM eclipse-temurin:17-jdk-alpine`. هاد `alpine` كتعني أن Linux اللي لداخل خفيف بزاف باش الـ image ما تجيش تقيلة.

## تحديد بلاصة الخدمة (WORKDIR)
باش ما نبقاوش نكتبو المسارات (paths) كاملين، كنستعملو `WORKDIR /app`. هادي كتقول لـ Docker يصاوب dossier سميتو app وأي حاجة غنديروها من بعد (بحال `COPY` أو `RUN`) غتكون وسط هاد الدوسي. بحال إلا درتي `cd` فـ terminal.

## إضافة الملفات والـ dependencies (COPY & RUN)
الأمر `COPY . .` كيقول لـ Docker يهز الملفات من PC ديالك ويحطهم وسط الـ image. من بعد كنستعملو `RUN` باش نخدمو أوامر shell. مثلا `RUN ./mvnw package` باش نـ compilé الكود. خاصك تعرف بلي كل `RUN` كيزيد طبقة (layer) جديدة للـ image.

## أمر التشغيل (CMD)
كاين فرق كبير بين `RUN` و `CMD`. الـ `RUN` كتخدم ملي كنصاوبو الـ image، ولكن `CMD` كتخدم حتى كنـ launch-يو الـ container. مثلا `CMD ["java", "-jar", "app.jar"]` كتقول للـ container شنو هو البرنامج الأساسي اللي خاصو يخدم. إلا حبس هاد البرنامج، الـ container كيحبس.

## مثال تطبيقي: App ديال Procurement
ها واحد Dockerfile بسيط لـ service ديال طلبات الشراء:

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /procurement
COPY target/procurement-app.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```
**النتيجة:** Docker كيصاوب image فيها غير JRE و الـ JAR. ملي كنخدموه، الـ app كتكون كتسنى requests فـ port 8080 لداخل ديال الـ container.

## غلط شائع: RUN مقابل CMD
بزاف ديال الناس كيغلطو وكيديرو `RUN java -jar app.jar`. هادشي غلط حيت `RUN` كتخدم فـ وقت الـ build، والـ app ما غاديش تخدم تما. باش تخدم الـ app ملي يبدا الـ container، خاصك ضروري تستعمل `CMD`.

## تمرين تطبيقي
أنا أمر غتستعمل باش تـ install-ي شي حاجة بحال `curl` وسط الـ image وأنت كتصاوبها؟

**الجواب:** غنستعمل الأمر `RUN` (مثلا: `RUN apk add --no-cache curl`).

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
