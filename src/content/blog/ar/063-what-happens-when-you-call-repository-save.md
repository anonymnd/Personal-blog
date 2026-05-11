---
title: "شنو كيوقع ملي كنعيطو لـ repository.save()؟"
description: "شرح مفصل كيفاش Spring Data JPA كيقرر واش يدير insert ولا update للبيانات."
pubDate: 2026-10-09T06:48:00.000Z
translationKey: 063-what-happens-when-you-call-repository-save
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على application ديال الشراء (procurement). واحد الموظف صيفط طلب شراء، وأنت عيطتي لـ `repository.save(request)`. بزاف كيسحاب ليهم بلي هاد السطر كيسيفط `INSERT` نيشان لـ database، ولكن فالحقيقة كاين واحد المنطق لداخل هو لي كيقرر.

## كيفاش Spring Data كيختار persist ولا merge؟
فالكشف الافتراضي، Spring Data كيشوف أولا version من نوع ماشي primitive إلا كانت موجودة: إلا كانت `null` كيعتبر entity جديدة. إلا ما كايناش هاد version، كيشوف واش ID هو `null`. والـ class اللي كتطبق `Persistable` تقدر تحدد هاد القرار بـ `isNew()`. Entity الجديدة كتدوز لـ `EntityManager.persist()` والأخرى لـ `merge()`. هادشي ماشي بحث فـ database باش يتأكد واش السطر كاين؛ merge حتى هو يقدر يؤدي لـ insert ولا update. إلا كان object detached، كينقل المعلومات لنسخة managed، ما كيربطش نفس object القديم.
## النتيجة ديال save والمدة ديال transaction
إلا كانت entity detached، خدم بالنسخة اللي رجعاتها `save()` وما تفترضش بلي object القديم ولى managed. إلا كانت ديجا managed، merge يقدر يرجع نفس النسخة. ورد البال حتى لحدود transaction: إلا كنتي خدام غير بـ transaction ديال repository، تقدر تسالي قبل ما يرجع التحكم للكود اللي عيط عليها، وحتى object اللي رجع يولي ماشي managed تما. داخل transaction كبيرة ديال service، التغييرات ديال managed entities كتبقى كتتراقب حتى يسالي persistence context. النتيجة ديال save ماشي ضمان بلي أي تغيير من بعد غيتسجل بوحدو.
## فوقاش كيتم تنفيذ SQL؟
ماشي ديما `save()` كتعني SQL دابا. JPA كيخدم بـ 'write-behind'، يعني كيجمع التغييرات فـ Persistence Context وكيصيفطهم دقة وحدة (flush) ملي كيسالي transaction أو ملي كتحتاج دير query. ولكن، إلا كنتي خدام بـ `IDENTITY` فـ الـ ID، Hibernate كيضطر يدير `INSERT` ديك الساعة باش يعرف الـ ID لي عطاتو database.

## مثال تطبيقي: طلب شراء
```java
// كنكرييو طلب جديد
PurchaseRequest req = new PurchaseRequest("Laptop", 1200.00);
PurchaseRequest savedReq = repository.save(req); 
// النتيجة: persist() تخدمات -> INSERT تدار (إلا كان IDENTITY)

// كنبدلو الحالة ديال الطلب
savedReq.setStatus("APPROVED");
PurchaseRequest updatedReq = repository.save(savedReq);
// النتيجة: merge() تخدمات -> UPDATE غيدار فاش يوقع flush
```

## غلط شائع: L'entité détachée
**الغلط:** تعيط لـ `repository.save(entity)` وتكمل الخدمة على `entity` بلا ما تستعمل النتيجة لي رجعات.
**التصحيح:** ديما دير: `entity = repository.save(entity);`.

## تمرين تطبيقي
Entity عندها ID محدد وماشي `null`، وما عندهاش version nullable ولا تطبيق خاص ديال `Persistable.isNew()`. فالكشف الافتراضي، save غيعيط لـ persist ولا merge؟

**الجواب:** Merge. ولكن هاد القرار بوحدو ما كيحسمش واش SQL غيكون INSERT ولا UPDATE؛ الحالة ديال entity وشنو كاين فـ database حتى هوما مهمين.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
