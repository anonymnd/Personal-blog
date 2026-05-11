---
title: "علاش الـ Microservices ماشي ديما هما الحل الأحسن"
description: "نظرة نقدية على الفرق بين الـ Monolith والـ Microservices باش تفادى تعقد المشروع بلا فايدة."
pubDate: 2026-10-17T05:48:00.000Z
translationKey: 254-why-microservices-are-not-automatically-better
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك كتصاوب تطبيق ديال المشتريات (procurement app) فين الموظف كيدير طلب، المدير كيوافق عليه، والمشتري كيكوماندي السلعة. تقدر تحس بلي خاصك دير 3 ديال الـ services مفرقين من الدقة الأولى حيت هادشي لي كيديرو دابا. ولكن، إلا فرقتي المشروع قبل ما يكون عندك حتى مستخدم واحد، غادي تزيد على راسك مشاكل كتر ملي غادي تحل.

## الغلط لي كيديرو الناس على الـ Monolith
بزاف كيصحاب ليهم بلي الـ Monolith هو غير كود مرون ومخلط. فالحقيقة، تقدر تصاوب Monolith منظم بزاف (Modular Monolith). تقدر دير packages مفرقين ديال `requester` و `manager` و `buyer` فـ deployment واحد. هكا كتكون عندك التنظيم ديال الـ microservices بلا ما تصدع راسك مع بزاف ديال السيرفورات و pipelines ديال الـ deployment.

## الثمن ديال التوزيع (Distribution)
الـ Microservices كيجيبو معاهم مشاكل ديال الـ distributed failure. فـ Monolith، ملي كتعيط لـ module ديال الموافقة، العملية كتكون سريعة ومضمونة. ولكن فـ Microservices، هاد العيطة كتولي HTTP request. إلا كان الـ Approval Service طايح أو الريزو تقيل، حتى الـ Request Service غادي يوقع ليه مشكل. هنا خاصك تولي تعامل مع الـ timeouts و circuit breakers، وهادشي ما كاينش فـ Monolith.

## مشكل تناسق البيانات (Data Consistency)
فـ Monolith، ملي كتبدل حالة الطلب وكتعلم المشتري، هادشي كيوقع فـ transaction وحدة فـ database. فـ Microservices، كل service عندو database ديالو. إلا الـ Approval Service بدل الحالة ولكن الـ Buyer Service ما وصلاتوش المعلومة، البيانات ديالك كتولي مخربقة. باش تحل هادشي خاصك patterns معقدين بحال Saga أو Outbox، لي كيكونوا بزاف على مشروع يلاه بادي.

## مثال: Modulaire مقابل Distributed
شوف هاد الكود البسيط ديال عملية الشراء:

```java
// Modular Monolith: عيطة بسيطة لـ method
public void approveRequest(Long id) {
    Request req = requestRepo.findById(id);
    approvalService.markAsApproved(req);
    buyerService.notifyBuyer(req);
}
```

فـ microservices، هاد `buyerService.notifyBuyer(req)` كتولي REST call. إلا طاح الريزو، الطلب كيتقبل ولكن المشتري ما كيعرف والو. خاصك تزيد message queue (بحال RabbitMQ) باش تضمن بلي المعلومة وصلات، وهادشي كيزيد التعقيد فـ infrastructure.

## غلط شائع: وهم الـ Interface
كاين لي كيصحاب ليه بلي غير حيت دار Interface نقية، راه حيد الـ coupling. الـ coupling كيكون فـ المنطق (logic) ماشي غير فـ الدوسيات. إلا بدلتي حاجة فـ `Request` ولقيتي راسك خاصك تبدل 5 ديال الـ microservices، راه عندك 'distributed monolith'، وهو أسوأ حاجة ممكن تكون.

## تمرين تطبيقي
**الحالة:** عندك فريق فيه 2 ديال المطورين وتطبيق بسيط فيه 3 ديال الـ modules. واش خاصك تحول لـ microservices باش 'توجد للمستقبل'؟

**الجواب:** لا. بدا بـ modular monolith. فرق الـ services غير ملي تولي عندك حاجة حقيقية (مثلا module واحد كيستهلك CPU كتر بـ 10 المرات من لخرين) أو ملي يكبر الفريق بزاف ويولي الكود الواحد عائق.
