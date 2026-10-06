---
title: "علاش الـ Controller ما خاصوش يهضر نيشان مع الـ Database؟"
description: "تعلم علاش خاصك تفرق بين الطبقة ديال الويب والطبقة ديال البيانات باش التطبيق ديالك يبقى ساهل في الصيانة."
pubDate: 2026-10-08T20:48:00.000Z
translationKey: 053-why-shouldn-t-a-controller-talk-directly-to-the-database
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك خدام على تطبيق ديال الشريات (procurement app)، فين الموظف كيصيفط طلب شراء. باش تزرب، قررتي دير `PurchaseRequestRepository` نيشان وسط `PurchaseController`. في الأول كلشي خدام مزيان، ولكن من بعد، المدير طلب منك أي طلب فات 1000 دولار خاصو يتسجل كـ 'Senior Review' قبل ما يتسيفا. هنا غتلقى راسك كتكتب logic معقد ديال if-else وسط الـ Controller، وخلطتي ما بين الـ HTTP routing و القواعد ديال الخدمة (business rules).

## مشكل الـ Leaky Abstractions
ملي الـ Controller كيهضر نيشان مع الـ database، كيوقع واحد المشكل سميتو 'leaky abstractions'. الـ Controller خاصو يهتم غير بـ HTTP requests، الـ status codes، و JSON. ملي كيدخل في الـ database logic، كيولي مرتبط بزاف بـ schema ديال البيانات. إلا بدلتي شي حاجة في الجدول أو بدلتي نوع الـ database، غتضطر تبدل الـ web layer كاملة، وهي اللي كان خاصها تبقى بعيدة على كيفاش كنخزنو البيانات.

## الدور ديال الـ Service Layer
ملي كنزيدو Service layer، كنصاوبو بحال واحد 'البونط' (buffer). الـ Controller كيقول *شنو* بغينا (الطلب)، والـ Service كيشرح *كيفاش* غنديروها (المنطق). الـ Service layer هي فين كنطبقو القواعد اللي الـ Repository ما كيعرفهمش. مثلا، واش الموظف عندو ميزانية كافية قبل ما نديرو `.save()`، هادي قاعدة ديال business ماشي عملية ديال database.

## مثال تطبيقي: الموافقة على الطلب
نشوفو هاد الحالة: المدير بغا يوافق على طلب.

```java
// غلط: الـ Controller كيدير كلشي
@PostMapping("/approve")
public ResponseEntity<?> approve(@RequestBody Long id) {
    var req = repository.findById(id).orElseThrow();
    req.setStatus("APPROVED"); // Business logic هنا! غلط
    repository.save(req);
    return ResponseEntity.ok().build();
}

// صحيح: الـ Controller كيعطي الخدمة للـ Service
@PostMapping("/approve")
public ResponseEntity<?> approve(@RequestBody Long id) {
    service.approveRequest(id);
    return ResponseEntity.ok().build();
}
```
في النسخة الصحيحة، الـ `PurchaseService` هو اللي كيتكلف بتبديل الـ status وأي حاجة أخرى (بحال صيفط email)، وهكدا الـ controller كيبقى خفيف.

## غلط شائع: الاعتماد الكلي على Repositories
بزاف كيسحاب ليهم أن `JpaRepository` كافية باش تسير الـ business logic. وخا `.save()` كتحفظ البيانات، ولكن ما كتعرفش أن الطلب ما يمكنش يتوافق عليه إلا كان أصلا ملغي (cancelled). خاصك ضروري تغلف هاد العملية وسط service method باش تفيريفي هاد الحالات.

## تمرين تطبيقي
**الحالة:** بغيتي تأكد أن `PurchaseRequest` فيها وصف (description) فيه كتر من 10 ديال الحروف قبل ما تسيفيها.
**السؤال:** فين خاص هاد الـ validation تكون باش نحترمو الـ architecture اللي هضرنا عليها؟
**الجواب:** خاصها تكون في الـ Service layer، قبل ما نعيطو على méthode save ديال الـ repository.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
