---
title: "شنو كيوقع ملي Hibernate كيسيف (Save) شي Entity؟"
description: "شرح مفصل لشنو كيوقع لداخل فـ Hibernate ملي كنستعملو save وكيفاش كياخد القرارات ديالو."
pubDate: 2026-10-09T12:48:00.000Z
translationKey: 069-what-happens-when-hibernate-saves-an-entity
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال المشتريات (procurement app). واحد الموظف صيفط طلب شراء، وأنت عيطتي لـ `repository.save(request)`. بزاف كيصحاب ليهم بلي هاد السطر كيمشي نيشان يدير `INSERT` فـ la base de données، ولكن Hibernate عندو طريقة ذكية كتر من هكا.

## الفرق بين Persist و Merge
ملي كتخدم بـ `save()` ديال Spring Data JPA، أول حاجة كيديرها هي كيشوف واش هاد الـ entity جديدة. إلا كان الـ ID ماكاينش (null)، Hibernate كيخدم بـ `persist()`. هادشي كيعني أن الـ Persistence Context دابا ولا هو المسؤول على هاد l'objet. أما إلا كان الـ ID ديجا كاين، كيخدم بـ `merge()`. هنا خاصك ترد البال: `merge` ماشي غير كيدير update، بل كياخد المعلومات من l'objet اللي عندك وكيكوبيهم فـ نسخة أخرى managed جاية من la base.

## الدور ديال Persistence Context
Hibernate ما كيهضرش مع la base de données فكل مرة بدلتي شي حاجة. كاين واحد الـ 'First-Level Cache' (سميتو Persistence Context). ملي كيسيف الـ entity، كتولي 'managed'. Hibernate كيبقى عاقل على أي تغيير درتيه. الـ SQL الحقيقي غالباً كيتعطل حتى كتوصل transaction لـ commit أو حتى كدير `flush()` بيدك.

## التوقيت ديال الـ ID
الوقت باش كيخرج الـ `INSERT` كيعتمد على `@GeneratedValue`. إلا كنتي خدام بـ `SEQUENCE` ، Hibernate يقدر يجيب الـ ID الجاي بلا ما يدير INSERT ديك الساعة. ولكن إلا كنتي خدام بـ `IDENTITY` (بحال فـ MySQL)، Hibernate خاصو يدير `INSERT` ديك الساعة حيت ضروري يرجع ليه الـ ID من la base باش يقدر يسير l'objet فـ cache.

## مثال تطبيقي: طلب شراء
```java
// مثال توضيحي
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String item = "Laptop";
}

// فـ service:
PurchaseRequest req = new PurchaseRequest();
PurchaseRequest savedReq = repository.save(req); 
// مع IDENTITY، الـ INSERT كيوقع هنايا.
// مع SEQUENCE، الـ INSERT كيتسنى حتى لـ flush.
```
النتيجة: `savedReq` دابا ولا managed. أي تغيير درتيه فيه من بعد بلا ما تعيط لـ `save()` مرة أخرى، غادي يتسيف أوطوماتيكياً فـ la base ملي تسالي transaction.

## غلط شائع: نسيان قيمة الـ Return
بزاف ديال المطورين كيديرو `repository.save(entity)` وكيبقاو خدامين بـ `entity` القديمة. ملي كيكون `merge()`، l'objet القديم كيبقى detached، غير اللي رجعاتو `save()` هي اللي managed.

**التصحيح:** ديما استعمل النتيجة: `entity = repository.save(entity);`.

## تمرين تطبيقي
إلا كنتي خدام بـ `GenerationType.SEQUENCE` وعيطتي لـ `save()` لشي entity جديدة، واش الـ `INSERT` كيوقع ديك الساعة؟

**الجواب:** لا، غالباً كيتسنى حتى لـ flush ديال session أو commit ديال transaction، واخا الـ ID كيتجاب ديك الساعة.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
