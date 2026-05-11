---
title: "كنت عارف Spring Boot، ولكن ما كنتش عارف كيفاش نبدا تطبيق حقيقي"
description: "تعلم كيفاش تخرج من دوامة الدروس وتصاوب تطبيق حقيقي باستعمال طريقة الـ vertical slice."
pubDate: 2026-10-06T16:48:00.000Z
translationKey: 001-i-knew-spring-boot-but-i-didn-t-know-how-to-start-a-real-application
locale: ar
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المطورين كيوقعوا فواحد الفخ ديال 'التوتوريالز': كيكونوا عارفين يصاوبوا REST controller ويربطوه بـ database، ولكن غير كيتحطوا قدام مشروع حقيقي كيبقاو حايرين. الغلط اللي كيديروا هو أنهم كيبغيو يرسموا architecture كاملة ديال كاع الجداول والخدمات قبل ما يكتبوا سطر واحد ديال الكود. فالهندسة ديال البرمجيات، كنبداو بـ 'tranche verticale' (vertical slice).

## ركز على النتيجة اللي بغا المستخدم
بلا ما تفكر فـ 'الطبقة ديال الداتابيز'، فكر فشنو بغا المستخدم يدير. مثلاً فـ application ديال المشتريات، أول حاجة ماشي هي 'تسيير المستخدمين'، ولكن هي 'الموظف خاصو يقدر يصيفط طلب شراء'. هاد النتيجة هي اللي كتعطيك منين تبدا.

## حدد قواعد البيزنس (Business Rules) ومعايير القبول
قبل ما تبدا تكودي، قيد القواعد. بالنسبة لطلب الشراء:
1. الطلب خاص تكون فيه الوصف والثمن التقديري.
2. الثمن ما خاصوش يكون سالب.
3. الحالة (status) خاص تكون 'PENDING' فالبداية.

معايير القبول هي اللي كتقول ليك واش الخدمة خدامة: 'إلى صيفطنا طلب صحيح، السيستيم خاصو يرجع 201 Created والطلب يتسجل فالداتابيز'.

## تطبيق الـ Vertical Slice
بدا بأبسط حاجة ممكنة. صاوب `PurchaseRequest` entity، و `PurchaseRequestRepository` و `PurchaseRequestService`.

```java
@Service
public class PurchaseRequestService {
    @Autowired
    private PurchaseRequestRepository repository;

    public PurchaseRequest createRequest(RequestDTO dto) {
        if (dto.getAmount() < 0) throw new IllegalArgumentException("الثمن خاصو يكون موجب");
        PurchaseRequest request = new PurchaseRequest(dto.getDescription(), dto.getAmount(), "PENDING");
        return repository.save(request);
    }
}
```

## الـ Architecture كتبنى شوية بشوية
ملي كيولي الموظف قادر يصيفط الطلب، عاد زيد slice تانية: موافقة المدير (Manager approval). ما تصاوبش لوجيك ديال الموافقة حتى تخدم السوميسيون. الـ architecture كتطور مع كل slice كتزيدها.

## غلط شائع: تعقيد الأمور (Over-Engineering)
المبتدئين كيبداو يصاوبوا `BaseService` أو `AbstractEntity` قبل ما تكون عندهم حتى ميزة وحدة خدامة. هادشي غير كيصعب الكود. طبق 'قاعدة تلاتة': ما ديرش abstraction حتى تعاود نفس الحاجة تلاتة ديال المرات.

## تمرين تطبيقي
حدد الـ vertical slice ديال ميزة 'المشتري كيكوموندي السلعة'. شنو هي النتيجة اللي بغا المستخدم وشنو هي قاعدة بيزنس وحدة؟

**الجواب:** النتيجة: المشتري كيرد حالة الطلب 'ORDERED'. القاعدة: غير الطلبات اللي الحالة ديالهم 'APPROVED' هي اللي يمكن نكومونديوها.
