---
title: "طريقة سهلة باش تصاوب CI/CD Pipeline لـ Spring Boot"
description: "تعلم كيفاش تـautomatiser عملية الـ build والـ test والـ deployment ديال application Spring Boot باستعمال pipeline بسيط."
pubDate: 2026-10-16T19:48:00.000Z
translationKey: 244-a-simple-spring-boot-ci-cd-pipeline
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك ساليتي واحد الـ feature فـ application ديال procurement فين requester كيصيفط demande d'achat. دابا خاصك كل مرة دير `./mvnw clean package` بيدك، وتجرب tests، وتصاوب Docker image وتصيفطها للسيرفر. هاد الخدمة يدوياً كل مرة بدلتي فيها سطر واحد ديال الكود كتاخد الوقت وممكن تغلط فيها.

## شنو هو الـ CI/CD
الـ Continuous Integration (CI) هي فاش كنجمعو الكود اللي كتبو المطورين فـ repository واحد بزاف د المرات ف النهار، وكيخدمو tests و build automatic. أما الـ Continuous Delivery (CD) كتعني أن الكود ديما واجد باش يتلونصا، والـ Continuous Deployment هي فاش كيمشي الكود نيشان لـ production بلا تدخل يدوي.

## كيفاش كيخدم الـ Pipeline
غير كيدير المطور `git push` للكود، واحد الـ webhook كيـtrigger الـ pipeline اللي كيدوز من هاد المراحل:
1. **Build**: كيتجمع الكود Java باستعمال Maven ولا Gradle.
2. **Test**: كيدوزو JUnit tests باش نتأكدو بلي logic ديال approval ديال manager مازال خدام.
3. **Package**: كنصاوبو Docker image فيها الـ JAR file.
4. **Deploy**: كنصيفطو الـ image لـ registry وكنـupdatio السيرفر ولا Kubernetes.

## مثال تطبيقي: Pipeline ديال application d'achats
ها واحد الطرف من configuration ديال `.github/workflows/main.yml`:

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - run: ./mvnw test
      - run: ./mvnw package -DskipTests
```
النتيجة: إلا طاح الـ `test` حيت requester مابقاش قادر يصيفط demande، الـ pipeline كيوقف تما ومكيخليش الكود الخاسر يوصل للسيرفر.

## غلط شائع: كتابة الـ Secrets ف الكود
بزاف د الناس كيكتبو passwords ديال database نيشان ف الـ script ديال pipeline، وهادشي خطر حيت أي واحد عندو access لـ repo يقدر يشوفهم.

**التصحيح**: خاصك تستعمل Secret Variables (بحال GitHub Secrets). عيط ليهم بـ `${{ secrets.DB_PASSWORD }}` باش يبقاو مشفرين.

## تمرين تطبيقي
إلا كان الـ pipeline صاوب الـ JAR بنجاح ولكن application مابغاتش تخدم فـ production حيت ناقصة شي variable d'environnement، فين كان المشكل ف الـ pipeline؟

**الجواب**: الـ pipeline دوز الـ build والـ tests ولكن ماجربش الـ configuration. داكشي علاش خاصنا نزيدو 'Smoke Test' مورا الـ deployment باش نتأكدو بلي كلشي خدام.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
