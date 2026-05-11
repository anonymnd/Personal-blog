---
title: "شنو كيدير @Transactional بالضبط؟"
description: "شرح كيفاش @Transactional كتحافظ على سلامة البيانات فـ Spring والمشاكل لي كيطراو مع الـ Proxy."
pubDate: 2026-10-12T21:48:00.000Z
translationKey: 150-what-does-transactional-actually-do
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). واحد الموظف كيصيفط طلب شراء، والسيستيم خاصو يدير جوج حاجات فدقة وحدة: يبدل الحالة ديال الطلب لـ 'SUBMITTED' وينقص الثمن من الميزانية ديال القسم. إلا وقع مشكل فالميزانية وبقى الطلب 'SUBMITTED'، البيانات غادي يتخربقو. هنا فين كنحتاجو `@Transactional`.

## Proxy والـ propagation ديال transaction
فالإعداد العادي ديال Spring بالـ proxies، bean اللي عندها المعالجة transactionnelle كتتعيط عبر JDK ولا CGLIB proxy. REQUIRED الافتراضية كتلتحق بـ transaction كاينة ولا كتخلق وحدة إلا ما كايناش. Transaction manager كينظم النهاية فـ boundary اللي مالكاها؛ ماشي كل method مشاركة كتدير commit بوحدها لنفس transaction. العيطة الداخلية كتفوت advice ديال proxy ديال هاد method، ولكن transaction خارجية ديجا خدامة تقدر تبقى سارية.
## مثال تطبيقي
شوف هاد الكود ديال خدمة المشتريات:

```java
@Service
public class ProcurementService {
    @Transactional
    public void processRequest(Long requestId) {
        Request req = requestRepo.findById(requestId).orElseThrow();
        req.setStatus(Status.SUBMITTED);
        
        Budget budget = budgetRepo.findByDept(req.getDept());
        budget.setAmount(budget.getAmount() - req.getCost());
        // Hibernate dirty checking كيتكلف يسجل التغييرات فالاخير
    }
}
```
هنا، إلا وقع مشكل فـ `budgetRepo.findByDept` وبان Exception، داك التغيير ديال الحالة لـ 'SUBMITTED' ما غاديش يتسجل فـ PostgreSQL. يا إما كولشي كيدوز يا إما والو.

## الغلط ديال Self-Invocation
واحد الغلط شائع هو ملي كتعيط لميثود فيها `@Transactional` من ميثود أخرى فـ نفس الكلاس. حيت كتعيط ليها مباشرة (this.method)، الـ Proxy ما كيدخلش فالسلسلة، والـ Transaction ما كتفتحش أصلاً.

**غلط:**
```java
public void submit(Long id) { 
    this.processRequest(id); // هنا الـ Proxy ما خدامش!
}
@Transactional
public void processRequest(Long id) { ... }
```
**الحل:** حط الميثود اللي فيها `@Transactional` فـ Service بوحدو، ولا عيط ليها من Bean خارجي.

## الـ Rollback والحدود ديالو
Spring كيدير Rollback غير مع `RuntimeException` و `Error`. أما الـ checked exceptions ما كيديرش ليهم Rollback إلا إلا حددتيها بـ `@Transactional(rollbackFor = Exception.class)`. وحاجة مهمة: الـ Transaction كتحكم غير فـ Database. إلا صيفطتي Email وسط الميثود ومن بعد وقع Rollback، داك الـ Email ما يمكنش يرجع فيه السيستيم.

## تمرين تطبيقي
**الحالة:** عندك ميثود كتدير تحديث لبروفيل المستخدم وكتسجل هاد العملية فـ جدول ديال التاريخ (history). بغيتي الـ log يتسجل وخا التحديث ديال البروفيل يفشل.
**السؤال:** واش خاص هاد الجوج يكونو فـ نفس الميثود `@Transactional`؟
**الجواب:** لا. خاص الميثود ديال الـ log تكون عندها Transaction بوحدها (مثلاً باستعمال `Propagation.REQUIRES_NEW`) باش تسجل وخا العملية الرئيسية تفشل.

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
