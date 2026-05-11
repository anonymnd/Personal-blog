---
title: "شنو هي الـ Database Transaction؟"
description: "شرح مبسط للمبادئ ديال ACID وكيفاش كيخدمو الترانزاكشنز فـ base de données باستعمال مثال ديال تطبيق ديال الشراء."
pubDate: 2026-10-12T20:48:00.000Z
translationKey: 149-what-is-a-database-transaction
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا خدام على تطبيق ديال الشراء (procurement app). واحد الموظف كيصيفط طلب، والمدير كيوافق عليه. دابا السيستيم خاصو ينقص الثمن من الميزانية (budget) ديال القسم ويقيد الطلبية (order) فـ base de données. إلا تنقصات الفلوس ولكن وقع مشكل فاش جا يسجل الطلبية، غادي تولي عندنا مشكلة: الفلوس مشاو والطلبية ما كايناش. هنا فين كينفعنا الـ Database Transaction.

## المفهوم ديال الـ Atomicity
الترانزاكشن هي مجموعة ديال العمليات (SQL statements) اللي كيتعبرو كأنهم حاجة وحدة. أهم خاصية فيها هي الـ Atomicity (الحرف A فـ ACID). هاد الخاصية كتقول لينا: يا إما كاع العمليات اللي وسط الترانزاكشن ينجحو كاملين، يا إما حتى وحدة ما تدار. إلا وقع غلط فشي بلاصة، السيستيم كيدير rollback، يعني كيرجع كولشي كيف كان فـ الأول.

## شرح مبادئ ACID
من غير الـ Atomicity، كاينين تلاتة ديال الحوايج خرين مهمين:
- **Consistency**: الداتا خاصها تبقى ديما منطقية ومحترمة القواعد (constraints) ديال base de données.
- **Isolation**: إلا كانوا جوج ديال الترانزاكشنز خدامين فدقة وحدة، وحدة ما كتشوفش شنو كدير الأخرى حتى تسالي وتدير commit.
- **Durability**: ملي كانديرو commit، التغييرات كتولي دائمة وخا يطفا السيرفور فديك اللحظة.

## مثال تطبيقي: طلب شراء
شوف هاد الكود كيفاش كيكون بـ Jakarta Persistence (@Transactional):

```java
@Transactional
public void processOrder(Long requestId, double amount) {
    Budget budget = budgetRepo.findByDept(requestId);
    budget.setBalance(budget.getBalance() - amount);
    budgetRepo.save(budget);
    
    Order order = new Order(requestId, "PENDING");
    orderRepo.save(order);
    // إلا وقع Exception هنا، ديك النقصة ديال الفلوس كتمسح (rollback)
}
```
فـ هاد الحالة، إلا `orderRepo.save()` عطات خطأ، PostgreSQL كيرجع الفلوس للميزانية أوتوماتيكيا.

## غلط شائع: الحوايج اللي خارج الـ DB
بزاف ديال الناس كيغلطو وكيصحاب ليهم الترانزاكشن كترجع كولشي. مثلا، إلا صيفطتي Email ديال التأكيد وسط الميثود `@Transactional` قبل ما تسجل الطلبية، ووقع rollback فـ الداتا، داك الـ Email ما يمكنش يرجع. داكشي علاش ديما صيفط الإيميلات حتى تتأكد بلي الترانزاكشن دارت commit بنجاح.

## تمرين تطبيقي
**الوضعية**: عندك ترانزاكشن كاتبدل معلومات ديال مستخدم وكتسجل هاد التغيير فـ جدول ديال audit. ولكن التسجيل فـ جدول الـ audit فشل حيت كاين مشكل فـ constraints.

**السؤال**: شنو غادي يوقع للتغيير ديال معلومات المستخدم؟

**الجواب**: التغيير ديال المستخدم غادي يطرا ليه rollback، يعني حتى حاجة ما غادي تسجل فـ base de données.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
