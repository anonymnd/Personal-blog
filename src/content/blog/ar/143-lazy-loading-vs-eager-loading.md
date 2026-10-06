---
title: "الفرق بين Lazy Loading و Eager Loading"
description: "تعلم كيفاش تحسن لي ريكويست (queries) ديالك فـ PostgreSQL باستعمال JPA و Hibernate عن طريق اختيار طريقة التحميل المناسبة."
pubDate: 2026-10-12T14:48:00.000Z
translationKey: 143-lazy-loading-vs-eager-loading
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). ملي كيدخل manager باش يشوف طلب شراء (Purchase Request)، التطبيق كيولي ثقيل بزاف حيت كيبدا يجيب كاع السلعة، كاع التعاليق، والمعلومات ديال الشخص لي طلب، وخا manager محتاج غير يشوف شحال هو المبلغ الإجمالي. هنا فين كيبان الفرق بين Lazy و Eager loading.

## كيفاش خدامة هاد القضية
فـ JPA، هاد الاستراتيجيات كيحددوا فوقاش Hibernate كيجيب البيانات المرتبطة من PostgreSQL. Eager loading (`FetchType.EAGER`) كتقول لـ Hibernate يجيب كاع المعلومات دابا باستعمال JOIN. أما Lazy loading (`FetchType.LAZY`) كيدير واحد الـ proxy، والبيانات مكيتمش جلبها من لاباز حتى كتحاول تستعمل شي getter باش تقرا دوك المعلومات.

## شنو لي كيجي بـ default
خاصك تعرف بلي JPA عندها قواعد: العلاقات ديال `@ManyToOne` و `@OneToOne` كيكونوا EAGER بـ default. أما `@OneToMany` و `@ManyToMany` كيكونوا LAZY. يعني إلا كانت عندك `PurchaseRequest` فيها بزاف ديال `RequestItems` ، Hibernate ماديش يجيب دوك items حتى تطلبهم صراحة.

## مثال تطبيقي: نظام المشتريات
نشوفو هاد المثال ديال `PurchaseRequest` و `RequestItem` :

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    // هادي LAZY بـ default
    @OneToMany(mappedBy = "request", fetch = FetchType.LAZY)
    private List<RequestItem> items;
}
```

إلا درتي `repository.findById(1L)`، Hibernate كيدير ريكويست وحدة للطلب. ولكن إلا عيطتي لـ `request.getItems().size()`، تما عاد كيدير ريكويست تانية باش يجيب items. كون درتي `EAGER` ، كان غيجيب كلشي فدقة وحدة بـ JOIN.

## مشكل N+1 والأخطاء الشائعة
بزاف ديال الناس كيغلطوا وكيردو كلشي `EAGER` باش يهربوا من `LazyInitializationException`. هادشي كيسبب مشكل N+1: مثلا كتجيب 10 ديال الطلبات (1 query) ومن بعد Hibernate كيدير 10 ديال لي ريكويست باش يجيب items ديال كل طلب. الحل هو تخلي العلاقات `LAZY` وتستعمل "JOIN FETCH" فـ repository ملي تكون عارف راسك محتاج البيانات.

## تمرين تطبيقي
**الحالة:** عندك علاقة `@ManyToOne` بين `RequestItem` و `PurchaseRequest`. واش هادي Eager ولا Lazy بـ default؟ وإلا بغيتي تحبس التحميل ديال الطلب كامل كل مرة كتجيب items، شنو خاصك تبدل؟

**الجواب:** هي EAGER بـ default. خاصك تزيد `fetch = FetchType.LAZY` وسط الـ annotation ديال `@ManyToOne`.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
