---
title: "شنو هو الـ Development Server؟"
description: "شرح بسيط على البيئة المحلية فين كيكتب المبرمج الكود ديالو ويجربو قبل ما يوصل للمستخدمين."
pubDate: 2026-10-16T07:48:00.000Z
translationKey: 232-what-is-a-development-server
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك صاوبتي واحد الخاصية جديدة فـ application ديال الشرا (procurement app) اللي كتخلي manager يوافق على طلب شراء. ما يمكنش تمشي تحط هاد الكود نيشان فالسيت اللي خدامين بيه الناس وتتمنى يخدم؛ حيت إلا كان غير غلط صغير فـ logic، السيستيم كامل ديال الشركة يقدر يوقف. هنا فين كينفعنا الـ development server.

## البلاصة فين كنتجربو (Local Sandbox)
الـ development server هو واحد البيئة مؤقتة كتكون فـ PC ديالك، كيخدم بها المبرمج باش يشوف الكود كيفاش غادي يخدم وهو مازال كيكتب فيه. الفرق بينو وبين الـ production server (اللي كيكون مجهز باش يتحمل آلاف الناس ويكون محمي مزيان) هو أن الـ dev server مديور باش يكون سريع فـ التغيير. غالباً كيخدم بـ `localhost` وكيعطيك النتيجة ديك الساعة.

## كيفاش كيخدم؟
بزاف ديال الـ frameworks دابا فيهم dev server داخلي. ملي كتشعلو، كيولي يتسنى الطلبات (requests) فـ واحد الـ port معين (مثلاً 8080 أو 3000). كاين واحد الميزة سميتها "Hot Reloading"، اللي هي أن السيرفر كيعيق بلي بدّلتي شي حاجة فـ الكود وكيدير restart راسو أو كيحدث الصفحة فـ browser بلا ما تحتاج تبرك على refresh بيدك.

## مثال تطبيقي: الموافقة على الطلب
نفترضو أنك كتصاوب logic ديال الموافقة فـ application بـ Java Jakarta EE. صاوبتي method باش تبدل الحالة ديال الطلب من `PENDING` لـ `APPROVED`.

```java
// طرف من الكود باش نبينو الفكرة
public void approveRequest(Long requestId) {
    Request req = repository.findById(requestId);
    req.setStatus("APPROVED");
    repository.save(req);
    System.out.println("Request " + requestId + " is now approved!");
}
```

ملي كتجرب هادشي فـ dev server، تقدر تعيط على `approveRequest` وتشوف ديك الساعة فـ base de données المحلية ديالك واش الحالة تبدلات. إلا لقيتي شي غلط، كتصلحو فـ ثواني بلا ما تخسر داتا حقيقية.

## غلط شائع: "خدام عندي فـ PC"
واحد الغلط كيديروه بزاف هو ملي كيديرو configuration فـ dev server ما كايناش فـ production، مثلاً كيكتب طريق ديال ملف (path) بحال `C:\users\dev\data`. ملي كيحط الكود فـ السيرفر الحقيقي، التطبيق كيوقف حيت هاد الطريق ما كايناش تما. الحل هو تخدم بـ environment variables لأي path أو configuration.

## تمرين تطبيقي
إلا كان الـ dev server ديالك خدام فـ `localhost:8080` وبدّلتي شي حاجة فـ CSS ولكن browser باقي كيبين الستيل القديم، شنو هو السبب المرجح؟

**الجواب:** الـ browser دار cache للنسخة القديمة ديال الملف، أو أن الـ hot-reload ديال السيرفر ما خدامش.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
