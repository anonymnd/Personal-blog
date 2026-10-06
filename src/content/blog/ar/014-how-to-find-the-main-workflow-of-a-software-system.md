---
title: "كيفاش تلقى الـ Workflow الرئيسي ديال سيستيم لوجيسيل"
description: "دليل باش تعرف المنطق ديال البيزنس (business logic) والطرق الأساسية لي كيخدم بها السيستيم قبل ما تبدا تكودي."
pubDate: 2026-10-07T05:48:00.000Z
translationKey: 014-how-to-find-the-main-workflow-of-a-software-system
locale: ar
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك شديتي واحد الكود كبير بزاف ولا requirements ما واضحينش ديال سيستيم ديال الشراء (procurement). كتشوف مئات ديال الـ classes و tables، ولكن ما عارفش فين كاين القلب ديال هاد التطبيق. هاد المشكل كيوقع حيت بزاف ديال المطورين كيمشيو نيشان لـ database schema قبل ما يفهمو كيفاش المعلومات كتحرك وسط السيستيم.

## تحديد الـ Actor والهدف الأساسي
أول حاجة خاصك تفرق بين الـ Actor والـ User. الـ Actor هو دور (مثلا: 'Responsable Achats')، أما الـ User فهو الحساب (account) لي داخل. باش تلقى الـ workflow الرئيسي، سول راسك: 'شنو هو أهم هدف خاص هاد السيستيم يحققو؟' فـ application ديال الشراء، الهدف ماشي هو 'نحفظو البيانات'، ولكن هو 'نحولوا طلب (request) لـ commande واصلة'.

## رسم الطريق الساهلة (Happy Path)
الـ 'Happy Path' هو الترتيب ديال الأحداث فاش كلشي كيدوز مزيان. تبع الـ domain entities وكيفاش كيتبدل الـ status ديالهم. مثلا:
1. **Requester** (Actor) كيكريي `PurchaseRequest` (Entity).
2. **Manager** (Actor) كيراجع وكيرد الـ status هو `APPROVED`.
3. **Buyer** (Actor) كيحول هاد الطلب لـ `PurchaseOrder`.

## الحالات لي مكاتمشيش مزيان (Unhappy Paths)
الـ workflow ميكونش كامل إلا مالحقتيش 'شنو وقع إلا...'. خاصك تعرف فين يقدر يحبس البروسيس. واش الـ Manager يقدر يرفض الطلب؟ واش الـ Buyer يلقى السلعة سالات؟ هاد الحالات ماشي bugs، بل هي جزء أساسي من الـ business logic.

## مثال تطبيقي: Approval ديال طلب
شوف هاد الطرف ديال الكود كيفاش كيتعامل مع الطلب:

```java
public class RequestService {
    public void submitRequest(User user, Request request) {
        if (!user.hasRole("REQUESTER")) {
            throw new UnauthorizedException("غير الـ requesters لي يقدروا يبداو هاد الـ workflow");
        }
        request.setStatus(Status.PENDING_APPROVAL);
        // Logique باش نصيفطو notification للـ Manager
    }
}
```
**النتيجة:** السيستيم كيضمن أن الـ entity بدات فـ status صحيح وكيأكد أن الـ actor عندو الحق يدير هاد العملية.

## غلط شائع: تخلط بين الـ Entities والـ Workflow
بزاف كيغلطو وكيصحاب ليهم بلي table ديال `User` ولا `Product` هي الـ workflow. الـ tables راهم جامدين (static)، ولكن الـ workflow كيتحرك (dynamic). الـ table هو اسم، والـ workflow هو فعل. بلاصة ما تركز على table ديال `Order` ركز على كيفاش كينتقل الطلب من `Requested` لـ `Ordered`.

## تمرين تطبيقي
**السيناريو:** سيستيم ديال مكتبة فين واحد العضو كيسلف كتاب.
**المطلوب:** حدد الـ actor الرئيسي، الـ entity الأساسية، وحالة وحدة (unhappy path).

**الجواب:** الـ Actor: Member؛ الـ Entity: Book/Loan؛ الـ Unhappy Path: العضو عندو خطية (fine) وما يمكنش ليه يسلف كتاب دابا.
