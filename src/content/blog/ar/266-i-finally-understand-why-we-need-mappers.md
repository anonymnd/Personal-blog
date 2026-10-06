---
title: "فهمت دابا علاش خاصنا Mappers"
description: "شرح علاش خاصنا نفرقو بين الـ Entities ديال base de données و الـ DTOs باش نحميو المعمارية ديال التطبيق."
pubDate: 2026-10-17T17:48:00.000Z
translationKey: 266-i-finally-understand-why-we-need-mappers
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). عندك واحد الـ Entity سميتها `PurchaseRequest` اللي مرتبطة نيشان مع table في base de données، وفيها معلومات حساسة بحال `internalAuditCode`. إلا صيفطتي هاد الـ Entity نيشان للـ frontend عن طريق REST controller، غادي تولي معلومات داخلية ديال السيستيم باينة لأي واحد. هنا فين كنفهمو بلي الـ Mappers ضروريين.

## الفرق بين Entity و DTO

الـ Entity هي كيفاش دايرة الداتا في base de données. أما الـ DTO (Data Transfer Object) فهي كيفاش بغينا الداتا تبان للـ client. إلا خدمنا بنفس الـ object بجوج، غادي نوقعو في مشكل ديال couplage fort. يعني إلا بدلتي غير سمية ديال column في base de données، الـ API ديالك غادي تخسر عند كاع الناس اللي خدامين بيها. الـ Mapper هو اللي كيدير الترجمة بين هاد جوج عوالم.

## كيفاش كيخدم الـ Mapping

الـ Mapper هو واحد الـ component الخدمة ديالو الوحيدة هي ينقل الداتا من object لـ object آخر. بلا ما تعمر الـ business logic ديالك بـ `dto.setName(entity.getName())` في كل بلاصة، كتجمع هاد الشي كامل في Mapper واحد. هكا الـ service layer كيبقى مركز غير على القواعد ديال الخدمة، والـ mapper كيتكلف بالشكل ديال الداتا.

## مثال تطبيقي: طلب شراء

نشوفو مثال فين requester كيصيفط طلب. الـ entity فيها كلشي، ولكن الـ DTO خاص يكون فيه غير المهم.

```java
// Entity: ديال base de données
public class PurchaseRequest {
    private Long id;
    private String item;
    private Double price;
    private String internalAuditCode; // سرية!
}

// DTO: ديال الـ API
public class PurchaseRequestDTO {
    private String item;
    private Double price;
}

// Mapper
public class PurchaseMapper {
    public PurchaseRequestDTO toDto(PurchaseRequest entity) {
        PurchaseRequestDTO dto = new PurchaseRequestDTO();
        dto.setItem(entity.getItem());
        dto.setPrice(entity.getPrice());
        return dto;
    }
}
```

**النتيجة:** الـ client غادي يوصلو غير الـ item و الـ price، و `internalAuditCode` كتبقى مخبية في السيرفر.

## غلط شائع: الـ Mapping في الـ Controller

بزاف ديال الناس كيديرو الـ mapping logic وسط الـ `@RestController`. هادشي كيخلي الـ controller عامر بزاف وصعيب تعاود تستعمل داك الـ logic في بلاصة أخرى.

**التصحيح:** صاوب Classe ديال Mapper بوحدها ولا خدم بـ MapStruct. دير ليها injection في الـ service باش يبقى الـ controller خفيف.

## تمرين تطبيقي

**المهمة:** عندك Entity سميتها `Manager` فيها `id`, `name`, و `salary`. خاصك تصاوب `ManagerDTO` اللي كيبين غير الـ `name`. كتب لينا كيفاش غتكون الـ méthode `toDto`.

**الجواب:** خاص الـ méthode تكريي `ManagerDTO` وتعيط لـ `dto.setName(entity.getName())` وتجاهل الـ `id` و الـ `salary`.
