---
title: "شرح مبسط لـ Controller و Service و Repository"
description: "شرح بسيط ديال كيفاش نقسمو الكود ف Spring Boot لـ 3 ديال الطبقات باش يكون منظم وسهل فالتعديل."
pubDate: 2026-10-08T19:48:00.000Z
translationKey: 052-controller-service-and-repository-explained-simply
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخايل راسك كتصاوب تطبيق ديال المشتريات (Procurement app). عندك طلب ديال بيسي جديد، ولكن يلا درتي التحقق (validation)، والبحث فـ database، والجواب ديال API كاملين فكلاص وحدة، الكود غادي يولي مرون بحال "السباغيتي". غادي يولي صعيب بزاف تيستيه ولا تبدل فيه شي حاجة بلا ما تخسر كلشي. داكشي علاش كنخدمو بـ Controller-Service-Repository.

## الـ Controller: هو السيكيريتي (الاستقبال)
الـ Controller هو الباب فين كيدخل أي request لـ application ديالك. الخدمة ديالو الوحيدة هي يستقبل HTTP requests ويرجع response. ما خاصوش يكون فيه logic ديال البيزنس. تخايلو بحال شي موظف فاستقبال: كياخد الطلب، كيدوزو للقسم المختص، ومن بعد كيعطيك الجواب.

## الـ Service: هو العقل
الـ Service layer هنا فين كاينين القواعد ديال الخدمة (business rules). هنا فين كنقررو واش الطلب مقبول ولا لا. مثلاً، فالتطبيق ديالنا، الـ Service كيشوف واش الموظف عندو ميزانية كافية قبل ما يخلي الطلب يدوز. هو اللي كينظم الطريق بين الـ Controller والـ Repository.

## الـ Repository: هو الأرشيف
الـ Repository هو اللي كيهضر نيشان مع الـ database باستعمال Spring Data JPA. ما كيهمش القواعد ديال البيزنس، كيهمو غير CRUD (يزيد، يقرأ، يبدل، أو يمسح بيانات). بحال شي خزانة ديال الأرشيف، كتعطيه السمية كيجيب ليك الورقة.

## مثال تطبيقي: طلب شراء
ها كيفاش كيدوز الطلب بين هاد الطبقات:

```java
// Controller
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<Request> create(@RequestBody Request req) {
        return ResponseEntity.ok(service.processRequest(req));
    }
}

// Service
@Service
public class ProcurementService {
    @Autowired private ProcurementRepository repo;

    public Request processRequest(Request req) {
        if (req.getAmount() > 5000) {
            req.setStatus("PENDING_MANAGER_APPROVAL");
        } else {
            req.setStatus("APPROVED");
        }
        return repo.save(req);
    }
}

// Repository
public interface ProcurementRepository extends JpaRepository<Request, Long> {}
```
**النتيجة:** الـ Controller كيستقبل JSON، الـ Service كيطبق قاعدة الميزانية، والـ Repository كيسجل الطلب فـ database.

## غلط شائع: الـ Logic فـ Repository
بزاف ديال الناس كيديرو قواعد البيزنس وسط الـ Repository ولا الـ Controller. مثلاً، كيشوف واش المستخدم Admin وسط الـ Repository.
**التصحيح:** أي قرار أو قاعدة ديال الخدمة خاصها تكون فـ Service layer. الـ Repository خاصو يدير غير queries.

## تمرين تطبيقي
يلا بغيتي تصيفط email فاش كيتقبل طلب الشراء، شكون هي الطبقة (layer) اللي خاصها تعيط على service ديال email؟

**الجواب:** الـ Service layer، حيت إرسال الإيميل هو جزء من قواعد الخدمة (business process).

## طبقات ماشي ثلاثة ديال السيرفرات
هادو مسؤوليات مختلفة داخل backend. يقدرو يخدمو كاملين فـ process وحدة ديال Spring Boot؛ ثلاثة layers ما كتعنيش خاصك ثلاثة سيرفرات. المثال كيركز غير على هاد الفصل. فـ API حقيقية، استعمل request وresponse DTOs مختلفين، تحقق من المعطيات ومن الصلاحيات قبل ما تسجل الطلب.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
