---
title: "شنو كيوقع بالضبط ملي كتخدم new فـ Java؟"
description: "شرح مفصل لعملية تخصيص الذاكرة وكيفاش كيتصاوب object فـ Java من لداخل."
pubDate: 2026-10-11T18:48:00.000Z
translationKey: 123-what-actually-happens-when-you-use-new-in-java
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

بزاف ديال المبتدئين كيسحاب ليهم بلي `new` غير « كتصاوب object »، ولكن فالحقيقة كاين واحد السلسلة ديال العمليات معقدة كيديرها الـ JVM، الـ heap، والـ class loader. إلا كنتي ديما كتساءل علاش الـ constructor كيتعيط ليه ولا فين كيتخزنو البيانات ديالك بالضبط، هنا غنفهمو كيفاش كتخدم l'instanciation.

## المرحلة ديال تحميل الكلاس (Class Loading)
قبل ما `new` تخصص الذاكرة، الـ JVM خاصها تأكد بلي التعريف ديال الكلاس موجود. إلا ما كانش محمل، الـ ClassLoader كيقلب على ملف `.class` وكيتحقق من الـ bytecode، ومن بعد كيصاوب object من نوع `java.lang.Class` فـ Metaspace. بلا هاد « البلان »، الـ JVM ما غتعرفش شحال ديال الـ bytes خاصها تخصص لهاد الـ object.

## تخصيص الذاكرة فـ الـ Heap
ملي كيوجد البلان، الـ JVM كتحسب شحال ديال المساحة محتاجة لجميع الـ instance variables. من بعد كتخصص واحد البلوك ديال الذاكرة متسلسل فـ الـ Heap. فهاد اللحظة، الـ object كيكون « خاوي »؛ كاع الأرقام كيكونوا 0، الـ booleans كيكونوا `false` والـ references كيكونوا `null`. هادشي علاش كنلقاو قيم افتراضية قبل ما يبدا الـ constructor.

## ترتيب عملية الـ Initialization
دابا، الـ JVM كتنفذ الكود ديال الـ initialization بواحد الترتيب: أولا، كيتعالجوا الـ instance initializers والـ field assignments، ومن بعد عاد كيتعيط للـ constructor. وإلا كانت الكلاس عندها superclass، الـ `super()` كيتعيط ليه أوتوماتيكيا هو الأول باش يتصاوب الـ state ديال الوالدين قبل ما تزيد الكلاس الحالية المنطق ديالها.

## مثال تطبيقي: طلب شراء (Procurement Request)
تخيل عندنا object ديال طلب شراء فـ application ديال procurement:

```java
public class PurchaseRequest {
    private double amount = 0.0;
    private String item;

    public PurchaseRequest(String item, double amount) {
        this.item = item;
        this.amount = amount;
    }
}

// Execution
PurchaseRequest req = new PurchaseRequest("Laptop", 1200.00);
```
**النتيجة:** الـ JVM كتخصص الذاكرة لـ `double` واحد و reference لـ `String`. كترد `amount` هي 0.0، ومن بعد الـ constructor كيغير `item` باش يشير لـ "Laptop" و `amount` لـ 1200.00. فالاخير، العنوان ديال هاد الذاكرة فـ الـ heap كيتعطى للمتغير `req` اللي كاين فـ الـ stack.

## غلط شائع: الخلط بين الـ Reference والـ Object
واحد الغلط كيديروه بزاف هو كيصحاب ليهم بلي `PurchaseRequest req;` كتصاوب object. لا، هادي غير كتصاوب reference variable فـ الـ stack. الـ object ما كيتصاوب حتى كنخدمو `new`. وإلا درنا `req = null` راه ما كنمسحوش الـ object، ولكن غير كنقطعو الصلة بيناتهم، والـ Garbage Collector هو اللي كيتكلف بيه من بعد.

## تمرين تطبيقي
شنو كتكون الحالة ديال الـ fields ديال object مباشرة مورا تخصيص الذاكرة وقبل ما يخدم الـ constructor؟

**الجواب:** كيكونوا فيهوم القيم الافتراضية (0، false، أو null).


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
