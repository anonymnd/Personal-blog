---
title: "كيفاش تعرف شنو هي أول Feature خاصك تصاوبها"
description: "دليل باش ترتب الأولويات ديالك وتركز على النتيجة اللي كيحتاجها المستخدم بلا ما تضيع الوقت فـ architecture معقدة من الدقة الأولى."
pubDate: 2026-10-07T00:48:00.000Z
translationKey: 009-how-to-know-what-feature-you-should-build-first
locale: ar
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات). عندك ليستة طويلة ديال الأفكار: dashboard ديال التقارير، système ديال notifications، و workflow ديال الموافقة (approval). إلا حاولتي ترسم database schema و architecture كاملة لهادشي كامل قبل ما تكتب سطر واحد ديال الكود، غادي تضيع الوقت فشي حاجة اللي تقدر ما تكونش هي اللي كتحل المشكل الأساسي ديال المستخدم.

## ركز على النتيجة (User Outcome)
عوض ما تسول « شنو هما لي fonctionnalités اللي خاصني؟»، سول « شنو هي أصغر نتيجة تقدر تعطي قيمة للمستخدم؟ ». فـ application ديال المشتريات، الهدف ماشي هو « يكون عندي database ديال الطلبات»، ولكن هو « الطلب يوصل من عند اللي طلبو (requester) حتى للشاري (buyer)». هادي هي القاعدة: requester كيصيفط، manager كيوافق، و buyer كيطلب السلعة.

## قوة الـ Vertical Slice
بعد من الطريقة « الأفقية » فين كتصاوب UI كامل، عاد API كامل، عاد Database. بلاصتها، خدم بـ vertical slice. يعني صاوب طريق صغيرة من UI حتى لـ database لـ feature وحدة. مثلاً، صاوب غير Bouton ديال « Submit Request»، و l'endpoint ديال API اللي كتاخدها، و logic باش تسجلها فـ table. دابا عندك حاجة خدامة، واخا تكون ناقصة.

## حدد معايير القبول (Acceptance Criteria)
باش تعرف بلي الـ feature سالات، خاصك criteria واضحة. مثلاً فـ slice ديالنا: « ملي requester يكون connecté ويصيفط formulaire صحيحة، status ديال الطلب خاصو يولي PENDING و يبان عند manager ». هادشي كيخليك مركز وما تزيدش حاجات ما عندهاش معنى دابا.

## Architecture كتطور مع الوقت
بزاف ديال developers كيغلطو وكيحاولو يصاوبو architecture مثالية من النهار الأول. الحقيقة هي أن architecture خاصها تكون iterative. صاوب الـ slice، شوف فين كاين المشكل، و عاد عدل (refactor). الـ entity ديال `Request` فالبداية غتكون بسيطة، و غتطور ملي تزيد logic ديال الموافقة.

## مثال تطبيقي: أول Vertical Slice

**الهدف:** نخليو المستخدم يصيفط طلب شراء.

```java
// مثال بسيط لـ Request entity
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemDescription;
    private Double estimatedCost;
    private String status = "PENDING";
    // Getters and setters
}
```
**النتيجة:** المستخدم كيورك على « Submit»، الداتا كتمشي لـ DB، و manager كيشوفها. التقارير و notifications كنساوهم دابا.

**غلط شائع:** تصاوب « Notification Engine » معقد قبل ما يكون Bouton ديال « Submit » خدام.
**التصحيح:** دير غير message بسيط فـ log فالبداية، و صاوب الـ engine حتى تولي محتاجو فبزاف ديال البلايص.

## تمرين تطبيقي
سيناريو: بغيتي تزيد « موافقة المدير » (Manager Approval) فـ application. شنو هي أصغر vertical slice و شنو هو criterion ديال القبول لهاد الـ feature؟

**الجواب:** الـ Slice: Bouton ديال « Approve » فـ vue ديال manager كيبدل status لـ 'APPROVED'. الـ Criterion: status ديال الطلب خاصو يتبدل من PENDING لـ APPROVED فـ database ملي يورك المدير على Bouton.
