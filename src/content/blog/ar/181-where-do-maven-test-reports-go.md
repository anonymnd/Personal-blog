---
title: "فين كيمشيو التقارير ديال Maven Tests؟"
description: "دليل باش تعرف فين كتلقى الملفات ديال النتائج لي كيخرجوا Maven Surefire و Failsafe."
pubDate: 2026-10-14T04:48:00.000Z
translationKey: 181-where-do-maven-test-reports-go
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

تخيل راسك درتي `mvn test` فواحد المشروع كبير. الكونسول (console) وراتك بلي كاينين شي أخطاء، ولكن الـ stack trace مقطوعة وماعرفتيش بالضبط أما assertion لي فشلات. عارف بلي التيستات دازو، ولكن ماعرفتيش فين كاينين التقارير المفصلة فالديسك ديالك.

## الدوسي ديال الخروج (Output Directory)
بشكل افتراضي، Maven كيحط كاع داكشي لي كيتبنى (artifacts) فالدوسي `target`. هاد الدوسي مؤقت، يعني يلا درتي `mvn clean` كيمسح كولشي. التقارير ديال التيستات ماكيكونوش فالدوسيات ديال السورس (source) حيت هما نتائج ماشي كود.

## الفرق بين Surefire و Failsafe
Maven كيخدم بجوج ديال لي بلولجين (plugins) على حساب نوع التيست لي كدير. خاصك تعرف شكون فيهم باش تلقى الدوسي الصحيح:

| Plugin | نوع التيست | فين كاين التقرير |
| :--- | :--- | :--- |
| Maven Surefire | Unit Tests | `target/surefire-reports` |
| Maven Failsafe | Integration Tests | `target/failsafe-reports` |

Surefire كيخدم فالمرحلة ديال `test`. أما Failsafe كيخدم فـ `integration-test` و `verify`. يلا درتي غير `mvn test` بوحدها، غالباً ماغاديش تلقى والو فـ `failsafe-reports`.

## مثال تطبيقي: تطبيق ديال المشتريات (Procurement)
تخيل عندك سيستيم ديال المشتريات، وفيه `RequestService` لي كيمنع الموظف باش يوافق على الطلب ديالو راسو. درتي تيست سميتو `testSelfApprovalFails()`. ملي خدمتي `mvn test` لقتي `Tests run: 10, Failures: 1`.

باش تعرف التفاصيل، سير لهاد المسار:
`your-project/target/surefire-reports/com.procurement.RequestServiceTest.txt`

فهاد الملف غادي تلقى الـ stack trace كاملة، وبالضبط البلاصة ديال `Caused by:` لي كتقول ليك السطر فين وقع المشكل فـ Java.

## غلط شائع: تخلط بين المراحل (Phases)
بزاف ديال الناس كيديرو `mvn package` وكيستغربو علاش تيستات الـ integration ماعطاو حتى تقرير. وخا `package` كيدوز على `test` ، ولكن ماكيدوزش على `verify` فين كيتسدوا التقارير ديال Failsafe. باش تضمن بلي التقارير ديال integration تخرج، خدم `mvn verify`.

## تمرين تطبيقي
يلا درتي `mvn verify` وواحد التيست ديال integration فالموديل ديال الشاري (buyer) فشل، أما دوسي خاصك تقلب فيه على التقرير المفصل؟

**الجواب:** `target/failsafe-reports`


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
