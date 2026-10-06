---
title: "واش خاصنا نتستيو الـ Private Methods؟"
description: "شرح علاش من الأحسن نتستيو السلوك اللي كيبان (observable behavior) بلا ما ندخلو في التفاصيل ديال الـ private methods."
pubDate: 2026-10-11T11:48:00.000Z
translationKey: 116-should-you-test-private-methods
locale: ar
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك دوزتي ساعات وأنت كتكتب واحد الـ algorithm معقد وسط واحد الـ private method. كتحس بلي كاين نقص حيت هاديك الـ logic ما مـtestياش، وكتفكر تستعمل reflection ولا تبدل الـ modifier لـ 'protected' غير باش ترضي الـ test suite ديالك. هادشي فخ كيخلي الـ tests ديالك هشاشين (brittle).

## الفلسفة ديال الـ Public API
الـ Unit tests خاصهم يكونو بحال شي دليل (specification) كيشرح كيفاش الـ class كتصرف، ماشي كيفاش مخدومة من الداخل. الـ private method هي تفصيل داخلي. إلا تستيتيها مباشرة، الـ tests ديالك كيوليو لاصقين بزاف في الـ structure. نهار تبغي تبدل الكود (refactoring)—مثلا تقسم method وحدة لـ جوج—الـ tests غادي يطيحو واخا النتيجة النهائية باقة صحيحة.

## التست عبر السلوك اللي كيبان
بلا ما تمشي نيشان للـ private method، تستي الـ public method اللي كتعيط ليها. إلا كانت الـ private method معقدة بزاف لدرجة أنك ما قدرتيش تستيها عن طريق الـ public API، فهذا دليل بلي الـ class كدير بزاف ديال الحوايج. في هاد الحالة، خاصك تخرج ديك الـ logic لـ class جديدة فين تولي ديك الخدمة public.

## مثال تطبيقي: Approval ديال الطلبات
نشوفو `RequestService` فيها واحد الـ private method سميتها `validateBudget()` كتشوف واش الطلب فات الميزانية ديال القسم.

```java
public class RequestService {
    public boolean submitRequest(Request req) {
        if (!validateBudget(req)) return false;
        // process request
        return true;
    }

    private boolean validateBudget(Request req) {
        return req.getAmount() <= 1000;
    }
}
```

باش تستي `validateBudget` ما كاين لاش تمشي ليها نيشان، عيط لـ `submitRequest` بمبلغ ديال 1500 وتأكد بلي رجعات `false`. هنا أنت كتستي *النتيجة* (الطلب ترفض)، ماشي *الطريقة* (واش الـ private method تـعيط ليها).

## غلط شائع: تبديل الـ Visibility
بزاف ديال الـ developers كيبدلو `private` لـ `package-private` وكيزيدو `@VisibleForTesting`. هادشي كيخلي التفاصيل الداخلية ديال الـ class باينة لـ classes خرين في نفس الـ package. الحل هو تخليها private وتزيد في الـ coverage ديال الـ public method.

## تمرين تطبيقي
إلا كانت عندك private method سميتها `calculateTax()` كيخدم بها `processInvoice()`، كيفاش تستي غلط في حساب الضريبة؟

**الجواب:** عيط لـ `processInvoice()` بداتا اللي كدير غلط في الضريبة، وتأكد بلي الـ public method رجعات error response ولا لحت exception مناسبة.


## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
