---
title: "طريقة منظمة باش تدير Debugging للتطبيقات ديال Backend"
description: "تعلم كيفاش تحل المشاكل (debug) فـ backend بطريقة منظمة باستعمال logs و Maven."
pubDate: 2026-10-14T10:48:00.000Z
translationKey: 187-a-systematic-debugging-process-for-backend-applications
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك يلاه زدتي ميزة جديدة فـ application ديال الشراء (procurement app). manager بغا يوافق على طلب، ولكن السيستيم عطاه 'Internal Server Error'. دابا ما عارفش واش المشكل فـ validation، ولا فـ logic ديال الموافقة، ولا فـ connection مع base de données. إلا بقيتي كتبدل فـ code غير باش تجرب، غادي تزيد غير المشاكل.

## كيفاش تعزل البلاصة فين كاين المشكل
قرا رسالة الخطأ وسلسلة الأسباب كاملة، وربط السطور المهمة بالكود والعملية اللي فشلات. سطور framework تقدر تبين مشكل فـ configuration ولا connection ولا proxy؛ ما تتجاهلهاش أوتوماتيكيا. عاود نفس المشكل قبل ما تختار التصحيح.
## استعمال Maven باش تنقي الـ Build
شي مرات المشكل ما كيكونش فـ code، ولكن كيكون build قديم مخلط. إلا بدلتي شي dependency وبدا الـ app كيدير تصرفات غريبة، استعمل Maven. دير `mvn clean` باش تمسح dossier `target` وتضمن بلي حتى شي class قديمة ما بقات. من بعد دير `mvn package` باش تعاود compile و package. عقل بلي `mvn package` كيدوز أوتوماتيكيا على مراحل بحال `compile` و `test`.

## تحليل تقارير الاختبارات (Test Reports)
إلا كان المشكل كيتعاود، كتب ليه test. إلا كنتي خدام بـ Maven Surefire للـ unit tests، شوف `target/surefire-reports`. أما بالنسبة للـ integration tests اللي خدامين بـ Failsafe، قلب فـ `target/failsafe-reports`. هاد التقارير كيعطيوك الحالة ديال الـ app فاش وقع المشكل.

## مثال تطبيقي: مشكل الموافقة
نفترض أن `ApprovalService` كيوقع فيه crash ملي manager كيوافق على طلب. الـ log كيقول: `Caused by: java.lang.NullPointerException at ApprovalService.java:42`.

```java
// مثال توضيحي
public void approveRequest(Long requestId) {
    Request req = repository.findById(requestId).orElse(null);
    // السطر 42: هنا كاين المشكل إلا كان req null
    req.setStatus(Status.APPROVED);
    repository.save(req);
}
```
**التصحيح:** خاصك تزيد check واش `req` null ولا تستعمل `orElseThrow()` باش تعامل مع الطلبات اللي ما كاينينش.

## غلط شائع: تسريب المعلومات فـ logs
بزاف ديال الناس كيطبعوا (print) objects كاملين ولا variables ديال l'environnement باش يلقاو المشكل. رُد بالك تخرج credentials ولا API keys فـ logs. من الأحسن تخرج غير identifiers بحال `requestId` باش تتبع المسار.

## تمرين تطبيقي
الـ build ديالك كيوقع فيه فشل فـ phase `verify` ولكن `mvn compile` خدامة مزيان. فين غادي تقلب على تفاصيل الفشل ديال integration test؟

**الجواب:** غادي تقلب فـ dossier `target/failsafe-reports`.

فهاد المثال اللي فيه bug عمدا، repository ديال Spring Data و findById كيرجع Optional. orElse(null) كيبين مشكل null؛ التصحيح هو orElseThrow مع exception مناسبة. تقارير tests فيها الأخطاء و logs المسجلين، ماشي نسخة كاملة من حالة التطبيق.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
