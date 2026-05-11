---
title: "علاش محتاجين لـ Mapper Classes؟"
description: "تعلم كيفاش تفصل بين الـ Entities ديال لاباز دو دوني والـ API responses باش تحمي البيانات ديالك وتخلي الكود مرن."
pubDate: 2026-10-09T03:48:00.000Z
translationKey: 060-why-do-we-need-mapper-classes
locale: ar
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). عندك واحد الـ Entity سميتها `PurchaseRequest` فيها `requesterId` و `totalAmount` وواحد `secretInternalNote` اللي خاص غير الإدارة تشوفها. إلا رجعتي هاد الـ Entity نيشان من الـ Controller، ديك الملحوظة السرية غادي تخرج فـ JSON ويشوفها أي واحد. هاد المشكل كيوقع حيت ربطنا شكل لاباز دو دوني مع داكشي اللي كيشوف المستخدم.

## علاش خاصنا نفصلو بيناتهم؟
الـ Mapper classes كيكونوا بحال واحد المترجم بين الـ Domain Entities (اللي كيمثلوا الجداول فـ DB) والـ DTOs (اللي كيمثلوا البيانات اللي كتخرج فـ API). هاد الفصل كيخليك تبدل فـ لاباز دو دوني بلا ما تخسر الـ Frontend. الـ DTOs كيخليوك تختار غير المعلومات اللي محتاجها، وتجمع بيانات من بزاف ديال الجداول فـ Response وحدة.

## كيفاش كيخدم الـ Mapper فـ الواقع
عوض ما نديرو التحويل وسط الـ Controller، كنديرو كلاس خاصة بالـ Mapper. هادشي كيخلي الكود منظم وسهل فـ الصيانة.

```java
// DTO اللي كيرجع للـ API
public record RequestResponse(Long id, String item, double amount) {}

// Mapper Class
@Component
public class PurchaseMapper {
    public RequestResponse toResponse(PurchaseRequest entity) {
        return new RequestResponse(
            entity.getId(), 
            entity.getItemName(), 
            entity.getTotalAmount()
        );
    }
}
```
فـ هاد المثال، حبسنا `secretInternalNote` باش ما تخرجش للـ API.

## غلط شائع: المابينغ وسط الـ Entity
بزاف ديال الناس كيزيدو ميثود `toDto()` وسط الـ JPA Entity. هادشي غلط حيت كيخلي الـ Persistence layer مرتبطة بـ Presentation layer. إلا بغيتي تبدل النسخة ديال الـ API من بعد، غادي تلقى الـ Entity ديالك عمرات بميثودات ديال المابينغ بزاف.

## النتيجة
ملي كتخدم بـ Mapper، الـ Controller كيعيط غير لـ `mapper.toResponse(entity)`. النتيجة هي API نقية، نتا اللي كتحكم فـ شنو كيخرج، والـ Entity كتبقى غير ديال لاباز دو دوني.

## تمرين تطبيقي
السيناريو: عندك Entity سميتها `Manager` فيها `id`, `name`, و `salary`. بغيتي `ManagerDTO` اللي فيه غير `id` و `name`.

**المطلوب:** كتب الكود ديال المابينغ فـ الميثود `toDto`.

**التأكد:** الميثود ديالك خاصها تصاوب `ManagerDTO` وتستعمل غير الـ getters ديال `id` و `name` من الـ entity، وتخلي `salary` بعيدة.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
