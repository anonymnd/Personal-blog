---
title: "فهمت أخيراً علاش تطبيق واحد يقدر يكون عنده بزاف ديال Instances"
description: "شرح مبسط للمفهوم ديال horizontal scaling والفرق بين الكود اللي مكتوب والبروسيسات اللي خدامين."
pubDate: 2026-10-18T04:48:00.000Z
translationKey: 277-i-finally-understand-why-one-application-can-have-multiple-instances
locale: ar
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال الوقت كنت كنلقى صعوبة باش نتخيل كيفاش تطبيق واحد يقدر يكون فيه 'بزاف ديال instances'. كنت كنصحاب بلي يلا ديماريت التطبيق، راه هو هذاك التطبيق وصافي. ولكن الفكرة كتوضح ملي كتخيل بلي جاوك آلاف ديال المستخدمين فدقة وحدة: سيرفر واحد ما يقدرش يهز 10,000 طلب فدقة بلا ما يتبلوكا حيت RAM ولا CPU كيتقاضاو.

## شنو هو الـ Horizontal Scaling
باش تخدم بزاف ديال instances، كتاخد نفس الكود اللي مكومبيلي (artifact) وكتلونصيه كـ processes مستقلة، إما فماشين وحدة قوية ولا فبزاف ديال السيرفرات. هادشي كيتسمى horizontal scaling. بلاصت ما تكبر السيرفر (vertical scaling)، كتزيد نسخ (clones) بحال بحال. وكييكون واحد الـ Load Balancer هو اللي كيفرق traffic باش حتى شي instance ما ترهق.

## مثال ديال تطبيق ديال الشراء (Procurement)
تخيل تطبيق ديال الشركة فين الموظفين كيصيفطو طلبات شراء. يلا كانت instance وحدة خدامة، و 500 موظف صيفطو طلبات مع 9 ديال الصباح، السيرفر غادي يتقال.

يلا خدمنا بـ 3 ديال instances (A, B, C):
1. الطلب الأول كيمشي لـ Instance A.
2. الطلب الثاني كيمشي لـ Instance B.
3. الطلب الثالث كيمشي لـ Instance C.

كل وحدة كتهز شوية ديال الخدمة. وإلا طاحت Instance B، الـ Load Balancer كيدوز traffic لـ A و C، وهكدا الخدمة ما كتحبسش.

## ضرورة الـ Stateless
باش هاد السيستيم يخدم، خاص التطبيق يكون stateless. يعني يلا Instance A سجلات session ديال مستخدم فالميموار ديالها، والطلب اللي موراه مشا لـ Instance B، هادي الأخيرة ما غتعرفش شكون هاد المستخدم. داكشي علاش كنستعملو Redis ولا database مشتركة باش نخزنو الـ sessions.

```java
// مثال بسيط: تجنب تخزين البيانات محلياً
public class RequestService {
    // غلط: private Map<Long, Request> localCache = new HashMap<>();
    // صحيح: استعمال database مشتركة
    @Autowired
    private RequestRepository repository;

    public void processRequest(Long id) {
        var request = repository.findById(id).orElseThrow();
        // logic هنا
    }
}
```

## غلط شائع: تخزين الملفات Local
واحد الغلط كيديروه بزاف هو كيخزنو الفاكتورات (invoices) فدوسي محلي بحال `/uploads/`. فاش كيكون عندك بزاف ديال instances، الملف اللي طلع لـ Instance A ما غاديش يبان لـ Instance B. الحل هو تخدم بـ shared storage بحال S3.

## تمرين تطبيقي
يلا عندك 4 ديال instances و Load Balancer خدام بـ 'Round Robin'، شكون هي الـ instance اللي غتاخد الطلب رقم 5؟

**الجواب:** Instance 1 (حيت الدورة كتعاود من الأول مورا الـ instance الرابعة).
