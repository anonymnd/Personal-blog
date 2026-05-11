---
title: "علاش تعلم Java و Spring Boot بوحدهم ما كافيينش باش تصاوب تطبيق حقيقي"
description: "اكتشف علاش ضبط السنتكس والـ frameworks هي غير البداية باش تولي مهندس ديال أنظمة برمجية خدامة."
pubDate: 2026-10-06T18:48:00.000Z
translationKey: 003-why-knowing-java-and-spring-boot-is-not-enough-to-build-a-real-application
locale: ar
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك دوزتي شهور وأنت كتعلم Java و Spring Boot. وليتي كتعرف تصاوب REST controller وتكونيكطي base de données فدقيقة. ولكن، ملي كيطلبوا منك تصاوب تطبيق ديال المشتريات (procurement) فين الموظف كيدير طلب، المدير كيوافق عليه، والمشتري كيشري السلعة، هنا كتحس براسك تالف. راك عارف *كيفاش* تكودي، ولكن ما عارفش *شنو* تكودي الأول وكيفاش تسير القواعد ديال البيزنس.

## الفرق بين الكودينغ والهندسة (Engineering)
أنك تكون عارف framework بحال إلا عارف كيفاش تخدم بالمطرقة والمنشار؛ هادشي ما كيعنيش أنك كتعرف تصمم دار. التطبيقات الحقيقية كيمشيو بقواعد البيزنس (business rules) ماشي غير بـ technical features. غلط شائع هو أنك تبدا بـ database schema. خاصك تبدا بالنتيجة اللي بغا المستخدم: "الموظف خاصو يوصل للموافقة على الماتريال ديالو".

## نبداو بـ Vertical Slice
عوض ما تبني السيستيم ديال المستخدمين كامل، ركز على "طريف" صغير من التطبيق خدام من الأول للآخر. فالتطبيق ديالنا، هاد الطريف هو: "صيفط طلب".

شروط القبول (Acceptance criteria) هي اللي كتقول لينا واش سالينا:
1. الموظف كيعمر فورميلير فيه السلعة والكمية.
2. السيستيم كيسجل الطلب بـ status سميتو 'PENDING'.
3. المدير كيقدر يشوف هاد الطلب فـ dashboard ديالو.

## الهندسة المتطورة (Iterative Architecture)
ما محتاجش تكون عندك architecture مثالية قبل ما تكتب أول سطر ديال الكود. الـ architecture خاصها تطور مع الوقت. بدا بـ service layer بسيطة كطبق قاعدة بيزنس: "ممنوع تصيفط طلب والكمية فيه صفر".

```java
// مثال توضيحي: تم حذف تعريف الـ repository
@Service
public class ProcurementService {
    public Request submitRequest(RequestDTO dto) {
        if (dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("الكمية خاصها تكون كبر من صفر");
        }
        // كود باش نسجلو الطلب بـ status PENDING
        return requestRepository.save(new Request(dto, Status.PENDING));
    }
}
```

## غلط شائع: تعقيد الأمور (Over-Engineering)
بزاف ديال المبتدئين كيصاوبو بزاف ديال interfaces و abstract factories لشي حاجة بسيطة، كيسحاب ليهم هكا كيديرو المحترفين. هادشي غير كيضيع الوقت. الحل هو تخلي الكود بسيط حتى تولي البيزنس محتاجة فعلاً داك التعقيد.

## تمرين تطبيقي
**السيناريو:** زيد قاعدة كتقول بلي المدير ما يمكنش يوافق على طلب هو اللي صيفطو.
**المطلوب:** فين خاص هاد المنطق يكون، وشنو هو الشرط اللي غدير؟

**الجواب:** هاد المنطق خاصو يكون فـ `ProcurementService`. خاصك تقارن `request.getRequesterId()` مع `currentUserId` قبل ما ترد الـ status هي 'APPROVED'.
