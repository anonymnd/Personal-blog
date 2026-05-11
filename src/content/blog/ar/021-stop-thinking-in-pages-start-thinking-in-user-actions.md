---
title: "حبس التفكير فـ الصفحات: بدا تفكر فـ الأفعال ديال المستخدم"
description: "تعلم كيفاش تحول الطريقة باش كتصمم البرامج ديالك من مجرد شاشات لـ أفعال حقيقية باش تبني logic صحيح ومزيان."
pubDate: 2026-10-07T12:48:00.000Z
translationKey: 021-stop-thinking-in-pages-start-thinking-in-user-actions
locale: ar
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المبرمجين فالبداية كيبداو يرسمو الشاشات (screens). كيقولو « خاصني صفحة ديال Login، وصفحة Dashboard، وصفحة طلب». هاد الطريقة هي فخ. حيت ملي كتفكر غير فـ الصفحات، كتنسا القواعد ديال business اللي كتوقع *بين* دوك الصفحات، وهادشي كيخلي الـ logic مشتت وكيدير مشاكل ملي كتبغي تبدل الـ UI.

## الـ Actor مقابل الصفحة
عوض ما تفكر فـ الصفحة، فكر فـ **الـ Actor**. الـ Actor هو دور (بحال Requester ولا Manager) اللي كيخدم بالسيستيم باش يوصل لواحد الهدف. فعل واحد يقدر يدوز من بزاف ديال الصفحات ولا يوقع غير فـ الخلفية. ملي كتركز على الفعل (مثلاً: « صيفط طلب شراء »)، كتحدد شنو السيستيم *كيدير* بلا ما يهم واش خدام فـ تطبيق موبايل ولا سيت ويب.

## كيفاش ترسم تدفق الفعل (Action Flow)
تخيل تطبيق ديال المشتريات. عوض « صفحة الفورمير »، غنديرو فعل: **صيفط طلب (Submit Request)**.
- **الـ Actor**: Requester
- **الـ Entity**: ProcurementRequest
- **الطريق العادية (Happy Path)**: المستخدم كيعمر المعلومات → السيستيم كيتحقق من الميزانية → الحالة كتولي 'Pending'.
- **طريق الخطأ (Unhappy Path)**: المستخدم كيصيفط مبلغ خاوي → السيستيم كيرجع error ديال validation.
- **الصلاحيات (Authorization)**: غير الناس اللي عندهم rôle ديال 'Employee' اللي يقدروا يديرو هاد الفعل.

## مثال تطبيقي: عملية الموافقة
إلا فكرنا فـ الصفحات، غنديرو غير « صفحة الموافقة » فيها بوتون. ولكن إلا فكرنا فـ الأفعال، غنصممو **وافق على الطلب (Approve Request)**:

```java
// مثال بسيط ديال Service layer
public class ProcurementService {
    public void approveRequest(Long requestId, User manager) {
        // 1. واش عندو الصلاحية؟
        if (!manager.hasRole("MANAGER")) throw new UnauthorizedException();
        
        // 2. logic ديال business
        ProcurementRequest request = repository.findById(requestId);
        if (request.getStatus() != Status.PENDING) throw new IllegalStateException("الطلب ماشي Pending");
        
        request.setStatus(Status.APPROVED);
        repository.save(request);
    }
}
```
النتيجة: الـ logic مابقاش لاصق فـ الشاشة. إلا بغيتي تزيد ميزة ديال « الموافقة التلقائية » من بعد، غتخدم بنفس هاد الفعل بلا ما تحتاج صفحة جديدة.

## غلط شائع: الـ Logic اللي تابع الـ UI
بزاف كيغلطو وكيديرو قواعد business وسط البوتون فـ الـ frontend.
**غلط**: `if (amount > 1000) { showManagerAlert(); }` 
**تصحيح**: هادشي خاصو يكون فـ الـ backend action. الـ UI غير كيعطي الأمر، والسيستيم هو اللي كيقرر شنو يوقع.

## تمرين تطبيقي
حدد الفعل ديال **طلب السلعة (Order Item)** بالنسبة لـ Buyer. عطيني طريق وحدة عادية (happy path) وشرط واحد ديال الصلاحيات.

**الجواب**: الطريق العادية: الـ Buyer كيختار طلب موافق عليه → كيصاوب Purchase Order. الشرط: غير اللي عندو rôle ديال 'Buyer' اللي يقدر يدير هاد الفعل.
