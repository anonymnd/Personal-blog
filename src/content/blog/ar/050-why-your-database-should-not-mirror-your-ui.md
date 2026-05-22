---
title: "تصميم الـ DTOs والـ Mappings على حساب الـ API Contract"
description: "تعلم كيفاش تعزل الـ entities ديال base de données على الـ API contracts باستعمال Java Records و strategies ديال mapping باش تحكم فشنو كيبان وشنو كيتقاد."
pubDate: 2026-10-07T01:48:00.000Z
translationKey: 050-why-your-database-should-not-mirror-your-ui
seriesOrder: 10
locale: ar
tags: ["database-design","learning-series"]
draft: false
---

## مشكل الـ Boundary

واحد الغلط شائع فـ design ديال الـ API هو ملي كنعتبرو الـ database entity هي نيتها الـ communication contract. ملي كنرجعو entity ديال JPA نيشان للـ client، الـ API كتسرب معلومات داخلية (internal implementation). والأخطر من هادشي، هو ملي كنخليو الـ client يصيفط entity نيشان للسيرفر، هنا كنفتحو باب ديال security vulnerability: إذا كانت الـ entity فيها شي field بحال `loyaltyLevel` أو `accountBalance` ، يقدر شي user خبيث يزيدهم فـ JSON request باش يطلع الـ privileges ديالو، وخا الـ UI ما كيبينش هادوك الـ fields.

باش نحلّو هاد المشكل، كنستعملو الـ Data Transfer Objects (DTOs). الـ DTO هو عبارة عن projection ديال البيانات اللي محتاجينها لواحد الـ use case محدد. ماشي ضروري يكون مراية ديال base de données، وماشي ضروري يكون مراية ديال الـ UI. هو عبارة عن contract. وخا يكون الـ Request DTO والـ Response DTO عندهم نفس الـ fields، خاصهم يبقاو مفرقين حيت كل واحد وكيفاش كيتطور: واحد كيحدد شنو السيرفر كيقبل، ولاخر كيحدد شنو السيرفر كيواعد باش يعطي.

## السيناريو: تسيير كليان ديال أوطيل (Hotel Guest)

تخيل عندنا سيستيم فين الـ `Guest` entity فيها معلومات حساسة ديال الهوية و status ديال loyalty كيسيرو السيرفر. القواعد ديال business هي:
1. الكليان يقدر يبدل معلومات الاتصال ديالو (email, phone).
2. الكليان ما عندوش الحق يبدل الـ `loyaltyLevel` ديالو.
3. الـ responses ديال الـ API اللي كيشوفو العموم خاص يحيدو منهم `identityDocumentNumber` على قبل الخصوصية.

### الـ Entity Model

```java
@Entity
public class Guest {
    @Id @GeneratedValue
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String identityDocumentNumber;
    private String loyaltyLevel; // كيسيرو السيرفر
    // Getters, setters, etc.
}
```

### تصميم الـ Contract

كنستعملو Java Records للـ DTOs حيت immuables، قصار، ومناسبين بزاف باش يهزو data. كنصاوبو تلاتة ديال الـ shapes:

1. **GuestUpdateRequest**: فيه غير الـ fields اللي مسموح لليوزر يبدلهم.
2. **GuestResponse**: فيه المعلومات اللي مسموح تبان، بلا `identityDocumentNumber`.
3. **GuestInternalResponse**: (اختياري) للـ admin، فيه كاع المعلومات بما فيها الحساسة.

```java
// غير الـ fields اللي كيتقادو
public record GuestUpdateRequest(
    String email,
    String phone
) {}

// الـ fields اللي كيبانو للعموم
public record GuestResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String loyaltyLevel
) {}
```

## تطبيق الـ Mapping Logic

الـ mapping هو العملية ديال تحويل entity لـ DTO (والعكس). وخا كاينين libraries كيديرو هادشي، الـ explicit mapping كيعطيك تحكم كبر فـ business rules.

### مثال تطبيقي: الـ Mapping Service

```java
@Service
public class GuestMapper {

    public GuestResponse toResponse(Guest guest) {
        return new GuestResponse(
            guest.getId(),
            guest.getFullName(),
            guest.getEmail(),
            guest.getPhone(),
            guest.getLoyaltyLevel()
        );
    }

    public void updateEntityFromDto(GuestUpdateRequest dto, Guest guest) {
        // هنا كنطفيو الـ loyaltyLevel وما كنقيسوهش
        if (dto.email() != null) guest.setEmail(dto.email());
        if (dto.phone() != null) guest.setPhone(dto.phone());
    }
}
```

### تتبع الطلب (Trace of a Request)

1. **Request**: الكليان كيصيفط `PUT /guests/1` مع body فيه `{"email": "new@email.com", "loyaltyLevel": "PLATINUM"}`.
2. **Binding**: Spring كيربط الـ JSON بـ `GuestUpdateRequest`. حيت الـ record ما فيهش `loyaltyLevel` ، هاد الـ field الزايد كيتجاهلو الـ message converter.
3. **Processing**: السيرفر كيجيب الـ `Guest` entity باستعمال `findById`. الـ `GuestMapper` كيبدل غير الـ email والـ phone.
4. **Persistence**: الـ entity اللي تعدلات كتسيفا فـ base de données.
5. **Response**: السيرفر كيحول الـ entity لـ `GuestResponse`. الـ `identityDocumentNumber` ما كيدخلش فـ constructor ديال الـ record، إذن عمره ما يخرج من السيرفر.

## حالات الفشل والنتائج (Failure Cases)

*   **فشل الـ "Pass-Through"**: إذا استعملتي نفس الـ DTO للـ request والـ response، تقدر بلا ما تحس تخلي الـ `id` يتقاد، أو تفرض على الكليان يصيفط الـ `loyaltyLevel` غير باش يبدل نمرة التليفون.
*   **فشل الـ "Entity Leak"**: ملي كترجع الـ `Guest` entity نيشان. إذا زدتي field جديد سميتو `internalNotes` فـ base de données باش يشوفوه غير الموظفين، غادي يتسرب أوتوماتيكيا للـ API response إلا إذا درتي ليه `@JsonIgnore`. باستعمال DTO، هاد التسريب مستحيل حيت الـ record كيحدد بالضبط شنو كيخرج.
*   **فشل الـ "Null Overwrite"**: فـ method ديال `updateEntityFromDto` ، إذا درتي `guest.setEmail(dto.email())` بلا ما تشيك واش `null` ، الكليان اللي ما صيفطش الـ email فـ partial update غادي يمسح الـ email اللي كاين فـ base de données ويردو `null`.

## تمرين

**السيناريو**: بغيتي تزيد `GuestRegistrationRequest` DTO. التسجيل كيطلب `fullName`, `email`, و `identityDocumentNumber`. ولكن الـ `GuestResponse` خاصو يبقى ديما حابس الـ `identityDocumentNumber`.

**المطلوب**: صاوب الـ record ديال `GuestRegistrationRequest` وشرح علاش ما يمكنش نستعملوه هو نيت كـ `GuestResponse`.

**الجواب**:
```java
public record GuestRegistrationRequest(
    String fullName,
    String email,
    String identityDocumentNumber
) {}
```
ما يمكنش نستعملوه كـ `GuestResponse` حيت الـ registration request محتاج `identityDocumentNumber` باش يكريي الكليان، ولكن الـ response خاصو يحيدو على قبل security و privacy. إذا استعملنا نفس الـ record، يا إما الـ API غادي تسرب رقم الهوية، يا إما الكليان ما غاديش يقدر يتسجل.

## باش تزيد تفهم

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
