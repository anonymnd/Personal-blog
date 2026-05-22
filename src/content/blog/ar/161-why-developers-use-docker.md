---
title: "كيفاش تصاوب Application Images Reproductibles بـ Docker"
description: "شرح عميق لـ Dockerfile layers، الفرق بين Image و Container، وفين كتحبس هاد الـ reproducibility."
pubDate: 2026-10-08T03:48:00.000Z
translationKey: 161-why-developers-use-docker
seriesOrder: 36
locale: ar
tags: ["docker","learning-series"]
draft: false
---

## الفرق الأساسي: Image مقابل Container

باش نضمنو أن التطبيق كيخدم بنفس الطريقة في أي بلاصة، خاصنا نفرقو بين الـ blueprint (البلان) والتنفيذ. الـ Docker Image هي عبارة عن template immuable (ما كيتغيرش) وقابل للقراءة فقط. فيها كلشي: الـ OS filesystem، الـ runtime (بحال Java)، الـ libraries، والكود ديالك مكومبيلي. ملي كتشعل Container، Docker كيزيد واحد الطبقة رقيقة ديال الكتابة (writable layer) فوق هاد الـ image.

واحد الحاجة مهمة: الـ Container ماشي هو Virtual Machine (VM). الـ VM كيكون فيها OS كامل بـ kernel ديالو، ولكن الـ container كيشارك الـ Linux kernel ديال الماكينة اللي خدام فيها (host). في Windows ولا macOS، Docker Desktop كيخدم واحد VM Linux خفيفة في الخلفية باش يوفر هاد الـ kernel، ولكن الـ containers كيبقاو غير processes معزولين باستعمال namespaces و cgroups، ماشي virtualisation matérielle كاملة.

## كيفاش يكون الـ Build Reproductible

اختار build context بوضوح وحيد files الزائدين بـ .dockerignore. BuildKit تقدر تصيفط غير files الضروريين وتعاود تستعمل content ما تبدلش؛ ما نفترضوش كاع bytes ديال folder كتسافر دائما لـ daemon. Context مناسبة كتبقى كتقلل inclusion بالغلط.

حط dependency descriptors قبل source اللي كتبدل بزاف، ومن بعد compile. COPY وRUN يقدرو يصاوبو filesystem layers؛ ENV وENTRYPOINT metadata وماشي ضروري يزيدو layer ديال files. Cache كتعلق بـ inputs ماشي غير نص Dockerfile.

Version tag كتحدد الاختيار ولكن تقدر تتبدل. استعمل digest محققة إلا المحتوى بالضبط مهم، وتحكم فـ dependencies وtools، وعاود build للتحديثات بقرار واضح. هادشي كيحسن reproducibility ولكن ما كيضمنش نفس bytes ولا behavior فكل بيئة.
## مثال تطبيقي: CSV Conversion CLI

تخايل عندنا tool بـ Java كيحول ملفات CSV لـ JSON. محتاج version محددة ديال OpenJDK و environment variables محددين.

### الـ Dockerfile (Illustrative)
```dockerfile
# كنستعملو version محددة، ماشي 'latest'
FROM eclipse-temurin:17-jre-alpine

# كنصاوبو user ماشي root باش تكون security أحسن
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# كنحددو فين غادي يكون التطبيق
WORKDIR /app

# كنكوبيو غير الـ jar المكومبيلي باش تكون image صغيرة
COPY target/csv-converter-1.0.jar app.jar

# كنحولوا لـ user اللي صاوبنا
USER appuser

# ENTRYPOINT باش نخليو الـ container يخدم بحال executable
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### تحليل هاد الـ Artifact
1. **`FROM eclipse-temurin:17-jre-alpine`**: استعملنا `alpine` باش نقصو من الحجم والـ surface d'attaque. وحددنا `17` باش التطبيق ما يهرسش ملي تخرج Java 21 وتولي هي default.
2. **`COPY target/csv-converter-1.0.jar app.jar`**: كوبينا الـ artifact ماشي السورس كود. هكا كنفرقو بين مرحلة الـ build (Maven/Gradle) ومرحلة الـ packaging.
3. **`ENTRYPOINT`**: عكس `CMD` ، الـ `ENTRYPOINT` كيخلي الـ container يخدم بحال شي برنامج. أي argument زدناه في `docker run` كيتزاد لهاد الـ command.

### تجربة التشغيل (Execution Trace)
باش نخدمو هاد الـ converter على ملف سميتو `data.csv` كاين في الدوسي الحالي:
`docker run --rm --mount "type=bind,source=$PWD,target=/inputs,readonly" csv-converter /inputs/data.csv` 

*ملاحظة: الـ flag `--rm` كيخلي الـ container يتمسح ملي يسالي، باش ما يبقاوش عندنا بزاف ديال containers واقفين في الماكينة.*

## فين كتحبس الـ Reproducibility

وخا الـ image immuable، الـ environment فين كتخدم ماشي ديما بحال بحال. Docker كيحيد مشكل "خدام عندي في الماكينة" بالنسبة للـ application stack، ولكن ما يقدرش يتحكم في:

1. **الـ Host Kernel**: إلا كان التطبيق ديالك محتاج شي module محدد في Linux kernel، وخدمتيه في host عندو kernel قديم، يقدر ما يخدمش.
2. **الخدمات الخارجية (External Services)**: إلا كان الـ converter كيعيط لشي API خارجية، الـ image ما تضمنش أن الـ API بقات بنفس الـ version.
3. **الـ Hardware Architecture**: Image مصاوبة لـ `amd64` ما غاديش تخدم في `arm64` (Apple Silicon) بلا émulation (QEMU)، وهذا يقدر يدير فرق في الـ performance ولا bugs صغار.
4. **الوقت والـ Entropy**: الساعة ديال السيستيم و generators ديال random numbers كيكونوا مشتركين مع الـ host.

## تمرين

**السيناريو**: عندك Dockerfile كيكوبي الدوسي كامل ديال المشروع (`COPY . /app`) عاد كيدير `mvn clean package` وسط الـ container. كل مرة بدلتي سطر واحد في الكود، الـ `mvn install` كتاخد 5 دقايق حيت كتعاود تيليشارجي كاع الـ dependencies.

**السؤال**: كيفاش تبدل الـ Dockerfile باش تستعمل الـ layer caching وتفادى تعاود تيليشارجي الـ dependencies في كل مرة؟

**الجواب**: 
خاصك تفرق بين مرحلة جلب الـ dependencies ومرحلة كومبيلاسيون ديال الكود. كوبي `pom.xml` هو الأول، دير command ديال download، وعاد كوبي السورس كود.

```dockerfile
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package
```
هكا، مادام `pom.xml` ما تبدلش، Docker غادي ينقز الـ layer ديال `go-offline` ويمشي نيشان يكومبيلي الكود اللي تبدل.

Run command ديال POSIX shell وكتفترض image تصاوبات بـ docker build -t csv-converter . وdata.csv كاينة فـ directory الحالية. Bind mount كتدخل host file؛ path فـ argument ما كتنسخش file. Non-root user خاصو read permission. Image كتجيب Linux user-space files ماشي kernel ديالها؛ هاد الكلام على Linux containers. Image Alpine صغيرة ما كتثبتش بوحدها security ولا compatibility.

## باش تزيد تفهم

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
