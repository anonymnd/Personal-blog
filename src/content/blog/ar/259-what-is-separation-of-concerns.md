---
title: "شنو هي Separation of Concerns؟"
description: "واحد المبدأ فـ l'architecture ديال البرمجة كايقسم الكود لأجزاء، كل جزء مكلف بحاجة وحدة محددة باش ما يتخلطش كلشي."
pubDate: 2026-10-17T10:48:00.000Z
translationKey: 259-what-is-separation-of-concerns
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا كاتصاوب تطبيق ديال الشراء (procurement app). فالبداية، درتي واحد الـ function وحدة كادير كلشي: كاتشوف واش كاين الميزانية، كاتسجل الطلب فـ la base de données، وكاتصيفط email للمدير. فـ الأول كاتبان ساهلة، ولكن ملي كيكبر التطبيق، إلا بغيتي تبدل غير الشركة ديال emails، خاصك تقيس الكود ديال الميزانية. هاد الروينة هي اللي كنسميوها 'Big Ball of Mud'.

## كيفاش كاتخدم هاد القضية
الـ Separation of Concerns (SoC) هي ملي كنقسمو البرنامج لأجزاء، وكل جزء كيكون مسؤول على 'concern' وحدة. الهدف هو نوصلو لـ high cohesion (الحوايج اللي عندهم علاقة يكونو مجموعين) و low coupling (الأجزاء ما يكونوش معولين على بعضياتهم بزاف).

## تطبيق SoC فـ تطبيق الشراء
فـ الخدمة ديال بصح، كنقسمو التطبيق لـ layers. الـ Web layer كاتكلف بـ HTTP، الـ Service layer كاتكلف بالقواعد ديال البيزنس (مثلا شكون يوافق على الطلب)، و الـ Data layer كاتكلف بـ la base de données.

```java
// Service Layer: هنا كاين غير البيزنس لوجيك
public class ProcurementService {
    private RequestRepository repository;
    private NotificationService notifier;

    public void submitRequest(PurchaseRequest request) {
        if (request.getAmount() > 1000) {
            repository.save(request);
            notifier.sendApprovalEmail(request.getManager());
        }
    }
}
```

## واش SoC غير فـ Microservices؟
بزاف ديال الناس كايصحاب ليهم SoC كاينة غير فـ microservices. هادشي غلط. حتى Monolith يقدر يكون مقسم لـ modules نقيين فـ deployment واحد. الـ microservices كايزيدو يعطيو استقلالية فـ التشغيل، ولكن كايجيبو معاهم مشاكل ديال network و data consistency. المهم هو التقسيم يكون على حساب domain capabilities ماشي غير سميات ديال folders.

## غلط شائع: وهم الـ Interface
كاين اللي كايصحاب ليه غير دار Interface راه حيد الـ coupling. إلا كانت الـ `ProcurementService` ديالك كاتطلب `SqlDatabase` محددة فـ constructor، راك باقي مربوط بتكنولوجيا وحدة. SoC الحقيقية هي ملي الـ service كايعتمد على abstraction ماشي على implementation محددة.

## تمرين تطبيقي
عندك classe سميتها `OrderManager` كادير حساب الضرائب، كاتشوف واش المستخدم عندو الحق (permissions)، وكاتكتب logs فـ fichier. كيفاش تطبق SoC هنا؟

**الجواب:** خاصك تقسمها لـ 3 ديال classes: `TaxCalculator` (للحساب)، `PermissionChecker` (للأمن)، و `Logger` (للتسجيل). و `OrderManager` تولي غير كاتنسق بيناتهم.
