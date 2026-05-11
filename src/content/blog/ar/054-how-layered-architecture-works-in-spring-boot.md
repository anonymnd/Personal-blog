---
title: "كيفاش خدامة Layered Architecture في Spring Boot"
description: "دليل للمبتدئين باش تنظم التطبيق ديالك لـ Controller و Service و Repository باش يكون الكود نقي وسهل في التعديل."
pubDate: 2026-10-08T21:48:00.000Z
translationKey: 054-how-layered-architecture-works-in-spring-boot
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل معايا كتصاوب تطبيق ديال الشراء (procurement app) فين الموظف كيصيفط طلب شراء. إلا درتي التحقق (validation)، والخدمة ديال الداتابيز، والرد ديال API كاملين في كلاص وحدة، الكود غادي يولي مرون بزاف. إلا بغيتي تبدل غير قاعدة صغيرة في شكون يقبل الطلب، تقدر تخسر بلا ما تحس كيفاش الداتا كتسجل. هنا فين كنحتاجو Layered Architecture.

## الـ Controller Layer (الباب ديال التطبيق)
الـ Controller هو الواجهة. الخدمة ديالو هي يستقبل HTTP requests، يتأكد بلي الداتا اللي جاية عندها فورما صحيحة، ويرجع الرد. ما خاصوش يكون فيه حتى شي logic ديال البيزنيس. مثلا، هو ما كيقررش واش الطلب « غالي بزاف »، هو غير كياخد الطلب وكيصيفطو للـ service.

## الـ Service Layer (العقل)
هنا فين كيكون الـ business logic. في التطبيق ديالنا، الـ Service هو اللي كيشوف واش الموظف عندو الميزانية كافية ولا واش المدير عندو الحق يوافق على الطلب. هو اللي كينظم الطريق ديال الداتا بين الـ controller والـ repository.

## الـ Repository Layer (التعامل مع الداتابيز)
هاد الطبقة هي اللي كتهضر مع الداتابيز باستعمال Spring Data JPA. الخدمة ديالها هي CRUD (قراءة، كتابة، تعديل، مسح). ما كيهمش علاش هاد الداتا كتسجل، كيهمها غير كيفاش تسجلها بطريقة صحيحة.

## مثال تطبيقي: صيفط طلب شراء
ها كيفاش الطلب كيدوز بين الطبقات:

```java
// Controller
@RestController
@RequestMapping("/requests")
public class ProcurementController {
    @Autowired private ProcurementService service;

    @PostMapping
    public ResponseEntity<RequestDTO> create(@RequestBody RequestDTO dto) {
        return ResponseEntity.ok(service.processRequest(dto));
    }
}

// Service
@Service
public class ProcurementService {
    @Autowired private RequestRepository repository;

    public RequestDTO processRequest(RequestDTO dto) {
        // Business Rule: إلا كان الثمن قل من 1000 كيتقبل أوتوماتيكيا
        // Business Rule: إلا كان الثمن قل من 1000 كيتقبل أوتوماتيكيا
        String status = dto.amount() < 1000 ? "AUTO_APPROVED" : "PENDING";
        var entity = new RequestEntity(dto, status);
        entity = repository.save(entity);
        return new RequestDTO(entity);
    }
}

// Repository
public interface RequestRepository extends JpaRepository<RequestEntity, Long> {}
```

## غلط شائع: الـ Logic في الـ Repository
بزاف ديال المبتدئين كيديرو شروط ديال البيزنيس (بحال `if (amount > 1000)`) وسط الـ Repository ولا الـ Controller.
**التصحيح:** أي قرار أو قاعدة ديال البيزنيس خاصها تكون في الكلاص ديال `@Service`. الـ Repository خاصو يبقى غير للـ queries.

## تمرين تطبيقي
إلا بغيتي تزيد قاعدة كتقول بلي « المدير ما يمكنش يوافق على طلب ديالو هو براسو »، فينا Layer خاصك تكتب هاد الكود؟

**الجواب:** في الـ Service Layer، حيت هادي قاعدة ديال البيزنيس (business rule).

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
