---
title: "توزيع المسؤوليات: Controllers, Services, و Repositories"
description: "شرح مفصل كيفاش نقسمو الخدمة بين الطبقات باستعمال مثال ديال إرسال السلع (Warehouse Dispatch) باش نفرقو بين HTTP، منطق البيزنس، و تخزين البيانات."
pubDate: 2026-10-07T03:48:00.000Z
translationKey: 052-controller-service-and-repository-explained-simply
seriesOrder: 12
locale: ar
tags: ["spring-architecture","learning-series"]
draft: false
---

## المنطق ديال تقسيم الطبقات (Layering)

بزاف ديال الناس كيسحاب ليهم بلي Layered Architecture هي غير قواعد جامدة فين كانديرو 'if statements'. ولكن فالحقيقة، هي طريقة باش نتحكمو فـ "السلطة" (Authority) ديال كل جزء. كل طبقة خاصها تهتم غير باللي حداها مباشرة. يلا تخلطو هاد الحدود، السيستيم كيولي هشيش: مثلا يلا بدلتي شي حاجة فـ Database schema، كتلقى راسك مضطر تبدل حتى API contract، ولا يلا تبدلات قاعدة فـ البيزنس، خاصك تدور على 5 ديال controllers باش تبدلها.

## شكون كيدير شنو؟

### الـ Controller: المترجم ديال HTTP
الـ Controller هو الباب فين كيدخل الطلب. المسؤولية ديالو الوحيدة هي يترجم العالم الخارجي (HTTP) للعالم الداخلي (Java). هو اللي كيتكلف بـ request binding، والتحقق الأولي من البيانات (مثلا واش شي حقل خاوي)، وكيرجع النتيجة ديال العملية على شكل HTTP status code. الـ Controller ما خاصوش يعرف *كيفاش* السلعة كتصيفط، خاصو يعرف غير *أنا* service يعيط ليها و *شنو* يجاوب الكليان.

### الـ Service: المنسق (Orchestrator)
هنا فين كاين "العقل" ديال البيزنس. الـ Service هو اللي كينظم الطريق ديال البيانات بين الـ Controller والـ Repositories. هو اللي كيفرض القواعد اللي ما يمكنش نتجاوزوها (Domain Invariants). مثلا: "ما يمكنش نصيفطو السلعة يلا كان الستوك صفر" هادي قاعدة بيزنس. الـ Service كينسق المراحل: تشيك الستوك → تختار شركة النقل → تسجل الإرسالية.

### الـ Repository: بوابة البيانات (Persistence Gateway)
الـ Repository هو مجرد وسيط مع قاعدة البيانات. ما خاصوش يكون فيه حتى شي منطق ديال البيزنس. خدمتو هي يعطيك طريقة باش تجبد البيانات ولا تخزنها. يقدر يدير logic ديال query (مثلا يقلب على شركة نقل بـ status معين)، ولكن ما كيقررش *واش* ديك الشركة صالحة لهاد الطلب ولا لا؛ هاد القرار كيكون فـ الـ Service.

## مثال تطبيقي: إرسال السلع من المستودع

تخيل عندنا سيستيم خاص بصيفط السلع. العملية كتحتاج نتأكدو من الستوك، نختارو شركة نقل مناسبة، ونسجلو العملية.

### تطبيق الكود (Illustrative)

```java
// Illustrative: Domain Entity
public class Shipment {
    private Long id;
    private Long orderId;
    private String carrierName;
    // Getters, constructor
}

// Illustrative: Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    // هنا غير Persistance: ما كاين حتى شي business rule
}

// Illustrative: Service
@Service
public class DispatchService {
    private final ShipmentRepository shipmentRepo;
    private final StockRepository stockRepo;
    private final CarrierRepository carrierRepo;

    public DispatchService(ShipmentRepository sr, StockRepository str, CarrierRepository cr) {
        this.shipmentRepo = sr;
        this.stockRepo = str;
        this.carrierRepo = cr;
    }

    @Transactional
    public Shipment dispatchOrder(Long orderId) {
        // 1. Domain Invariant: خاص الستوك يكون موجود
        var stock = stockRepo.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalStateException("ما كاينش ستوك لهاد الطلب"));

        if (stock.getQuantity() <= 0) {
            throw new IllegalStateException("الستوك ما كافيش");
        }

        // 2. Business Decision: نختارو شركة نقل متاحة
        var carrier = carrierRepo.findFirstAvailable()
            .orElseThrow(() -> new IllegalStateException("ما كاين حتى شركة نقل متاحة"));

        // 3. Orchestration: نكرييو ونسجلو
        Shipment shipment = new Shipment(orderId, carrier.getName());
        return shipmentRepo.save(shipment);
    }
}

// Illustrative: Controller
@RestController
@RequestMapping("/dispatch")
public class DispatchController {
    private final DispatchService dispatchService;

    public DispatchController(DispatchService ds) {
        this.dispatchService = ds;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<ShipmentResponse> handleDispatch(@PathVariable Long orderId) {
        try {
            var shipment = dispatchService.dispatchOrder(orderId);
            return ResponseEntity.ok(new ShipmentResponse(shipment.getId(), "Dispatched"));
        } catch (IllegalStateException e) {
            // كنترجمو exception ديال البيزنس لـ HTTP 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### تحليل العملية
1. **الـ Controller**: كياخد `orderId` من الـ URL. ما عارفش بلي كاين `StockRepository`. يلا الـ service لحت `IllegalStateException` الـ controller كيقيدها بـ `400 Bad Request` للكليان.
2. **الـ Service**: هو "المخ". هو اللي كيضمن بلي الستوك تشيكا قبل ما نختارو شركة النقل. يلا درنا تشيك ديال الستوك فـ الـ repository، غادي يولي الـ repository عارف قواعد البيزنس، وهذا غلط. ويلا درناه فـ الـ controller، ما غاديش نقدروا نستعملو هاد الـ logic فـ بلاصة أخرى (مثلا Scheduled Task).
3. **الـ Repository**: كيدير غير `findByOrderId` ولا `save`. ما كيهمش علاش كنصيفطو السلعة، كيهمو غير واش الـ SQL صحيح.

## أخطاء شائعة (Failure Cases)

- **الـ "Fat Controller"**: ملي كدير `if (stock <= 0)` فـ الـ controller. النتيجة: يلا زدتي API أخرى ديال "إرسال جماعي"، خاصك تعاود تكتب نفس الـ check ديال الستوك.
- **الـ "Anemic Service"**: ملي الـ service كيكون غير وسيط كيعيط لـ `repository.save()`. النتيجة: الـ controller كيولي هو اللي هاز الـ business logic، ولا كيولي الـ logic مخبي فـ Database triggers، وهادشي كيصعب التيست.
- **الـ "Smart Repository"**: ملي كتزيد method بحال `saveIfStockAvailable()`. النتيجة: الـ repository كيولي مرتبط بـ `Stock` table وقواعد البيزنس، وهكا كنهرسو مبدأ الـ Single Responsibility.

## تمرين تطبيقي

**السيناريو**: بغينا نزيدو ميزة "الشحن السريع" (Priority Shipping). هاد الميزة مسموحة غير للطلبات اللي فايتة 100 دولار. فين خاص يكون هاد الـ check، وكيفاش غيأثر على الطبقات؟

**الجواب** :
1. **الـ Controller**: ما كيتبدل فيه والو، من غير أنه يقدر يستقبل flag سميتو `priority` فـ الـ request.
2. **الـ Service**: هنا فين خاص يكون الـ check: `if (order.getTotal() < 100 && priorityRequested) throw ...`. حيت هادي قاعدة بيزنس (Business Invariant).
3. **الـ Repository**: ما كيتبدل فيه والو. كيبقى غير كيجيب الطلب ولا كيسجل الإرسالية. الـ repository ما خاصوش يعرف بلي كاين شي حد ديال 100 دولار.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
