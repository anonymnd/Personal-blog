---
title: "فهمت أخيراً علاش الـ Backends فيهم Controllers و Services و Repositories"
description: "شرح مبسط ديال كيفاش كنقسمو الخدمة في الـ backend باش يكون الكود منظم وسهل في التعديل."
pubDate: 2026-10-17T15:48:00.000Z
translationKey: 264-i-finally-understand-why-backends-have-controllers-services-and-repositories
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

فاش بديت كنتعلم Spring Boot، كنت كندير كاع الـ logic في الـ Controller. كنت كنقول بلي هكا أسرع، نكتب الـ query ديال database في البلاصة فين كتوصل الـ request. ولكن مع الوقت، الـ controllers ولاو كبار بزاف ومعقدين، وأي تغيير بسيط كان كيخسر ليا كولشي. تما فهمت بلي هاد التقسيم ديال Controller-Service-Repository ماشي غير باش نزيدو الملفات، ولكن باش كل طرف يكون عندو خدمة وحدة محددة.

## الـ Controller: هو العساس
الخدمة ديال الـ Controller هي غير يتعامل مع الـ HTTP. كيتسنى الـ request، كيشوف واش المعلومات اللي صيفط المستخدم صحيحة، وكيرجع الـ status code المناسب. الـ Controller ما خاصوش يعرف كيفاش كتحسب الخصومات أو كيفاش كيتسيفا الداتا في الـ database. هو غير كيعطي الخدمة للـ Service.

## الـ Service: هو العقل
هنا فين كيكون الـ business logic. الـ Service ما كيهمش منين جات الـ request، واش من API REST أو من شي حاجة أخرى. هو اللي كينظم كيفاش الداتا كتمشى وكيطبق القواعد ديال الخدمة (Business Rules).

## الـ Repository: هو المكتباتي
الـ Repository هو الوحيد اللي كيهضر مع الـ database. خدمتو هي غير الـ CRUD (قراءة، كتابة، تعديل، ومسح). فاش كنعزلو هاد الطبقة، كنقدرو نبدلو الـ database أو نحسنو شي query بلا ما نقيسو الـ logic ديال الخدمة.

## مثال تطبيقي: تطبيق ديال طلبات الشراء (Procurement)
تخيل تطبيق فين الموظف كيصيفط طلب شراء. (ملاحظة: هاد الكود هو مثال توضيحي، وكنفترضو بلي Request هي JPA entity عادية).

```java
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<Request> create(@RequestBody Request req) {
        return ResponseEntity.ok(service.processRequest(req));
    }
}

@Service
public class ProcurementService {
    @Autowired private ProcurementRepository repo;

    public Request processRequest(Request req) {
        if (req.getAmount() > 1000) {
            req.setStatus("PENDING_MANAGER_APPROVAL");
        } else {
            req.setStatus("APPROVED");
        }
        return repo.save(req);
    }
}

@Repository
public interface ProcurementRepository extends JpaRepository<Request, Long> {}
```
في هاد المثال، الـ Controller كيتكلف بالـ JSON، الـ Service كيقرر واش الطلب مقبول على حساب الثمن، والـ Repository كيسيفيه في الـ database.

## غلط شائع: تخلط الـ Logic
بزاف ديال الناس كيديرو الـ business logic في الـ Repository (مثلاً SQL معقد كيحسب المجموع) أو في الـ Controller.
**التصحيح:** أي 'if/else' عندها علاقة بقواعد الخدمة خاصها تكون في الـ Service. الـ Repository خاصو يبقى غير كيجيب ويسيف الداتا.

## تمرين تطبيقي
إلا بغيتي تصيفط email للمستخدم فاش كيتقبل طلب الشراء، شكون هي الطبقة (layer) اللي خاصها تعيط على الـ email service؟

**الجواب:** الـ Service layer، حيت إرسال الإيميل هو جزء من عملية البيزنس (business process)، ماشي خدمة ديال الـ database أو الـ HTTP.
