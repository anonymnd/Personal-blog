---
title: "شنو هو الـ Modular Monolith؟"
description: "شرح كيفاش تنظم تطبيق واحد مقسم لموديلات مستقلة باش تفادى الروينة ديال الكود (Big Ball of Mud)."
pubDate: 2026-10-17T06:48:00.000Z
translationKey: 255-what-is-a-modular-monolith
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على سيستيم ديال الشراء (procurement). فالبداية كلشي ساهل، ولكن ملي كتبدا تزيد ميزات للمستخدمين، المديرين، والمشترين، الكود كيولي مشربك. كتجي تبدل شي حاجة فـ logic ديال الموافقة (approval)، كتلقى راسك خسرتي بلاصة أخرى ديال الطلبيات (ordering). هاد الحالة كنسميوها 'Big Ball of Mud'، فين كلشي مرتبط بكلشي وما بقيتي عارف فين تبدل.

## الفكرة ديال الـ Modular Monolith
الـ Modular Monolith هو واحد الطريقة فـ architecture فين التطبيق كيبقى يتلونصا كقطعة واحدة (مثلا JAR واحد)، ولكن لداخل الكود مقسم لموديلات (modules) مستقلة. الفرق بينو وبين المونوليت العادي هو أننا هنا ما كنقسموش الكود على حسب الطبقات (controllers, services)، ولكن كنقسموه على حسب الخدمة (domain capabilities).

## الحدود والتماسك (Boundaries & Cohesion)
الهدف هو أن كل موديل يكون مجموع ومركّز على خدمتو (high cohesion) ويكون مرتبط بأقل درجة ممكنة مع الموديلات لخرين (low coupling). الحدود ماشي هي غير دوسيات (folders)، بل هي قوانين. مثلا، الموديل ديال `Procurement` ما خاصوش يدخل نيشان لـ database ديال الموديل ديال `Inventory`. خاصو يطلب المعلومة من واحد الـ interface اللي موفرها الموديل ديال `Inventory`.

## مثال تطبيقي: مسار الشراء
نشوفو 3 ديال الموديلات: `Request` (الطلب)، `Approval` (الموافقة)، و `Ordering` (الطلب من المورد).

```java
// داخل الموديل ديال Approval
public class ApprovalService {
    public void approveRequest(Long requestId) {
        // Logic باش نردوا الطلب مقبول
        // من بعد كنصيفطو خبر للموديل ديال Ordering
        orderingClient.createPurchaseOrder(requestId);
    }
}
```
هنا، الموديل ديال `Approval` ما محتاجش يعرف كيفاش كتصاوب `PurchaseOrder`؛ هو عارف غير أن الموديل ديال `Ordering` عندو ميثود كدير هاد الخدمة. هادشي كيخلي السيستيم ساهل فالتطوير وفالتست.

## غلط شائع: وهم الـ Interface
بزاف كيصحاب ليهم غير حيت داروا Interface بين جوج موديلات، راه مابقاش بيناتهم coupling. ولكن إذا كانت الـ Interface ديال الموديل `Request` كطلب Object معقد جاي من الموديل `Ordering` ، راه باقيين مرتبطين بزاف. الحل هو تخدم بـ DTOs بساط أو غير IDs باش تنقل المعلومات.

## تمرين تطبيقي
**الوضعية:** عندك موديل ديال `User` وموديل ديال `Notification`. الموديل ديال `User` بغا يصيفط إيميل ترحيبي ملي يتسجل مستخدم جديد.
**السؤال:** واش الموديل ديال `User` خاصو يدخل لـ database ديال `Notification` باش يقلب على template ديال الإيميل، ولا يعيط لميثود `sendEmail()`؟
**الجواب:** خاصو يعيط لـ `sendEmail()` باش يحترم الحدود وما يوقعش coupling.
