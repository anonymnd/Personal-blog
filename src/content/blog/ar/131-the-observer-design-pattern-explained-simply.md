---
title: "شرح بسيط لـ Observer Design Pattern"
description: "تعلم كيفاش دير علاقة بين object واحد وبزاف ديال objects خرين، باش ملي يتبدل الحالة ديال الأول، كاع لخرين يتعلمو أوتوماتيكيا."
pubDate: 2026-10-12T02:48:00.000Z
translationKey: 131-the-observer-design-pattern-explained-simply
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال الشراء (procurement). ملي manager كيوافق على طلب شراء، خاص بزاف ديال الحوايج يوقعو: buyer خاصو يتعلم باش يشري، والناس لي طلبو السلعة يوصلهم email، و حتى budget tracker خاصو يتحدث. إلا كتبتي هادشي كامل وسط `ApprovalService` مباشرة، الكود غادي يولي مرون وصعيب تبدلو إلا بغيتي تزيد شي حاجة جديدة.

## كيفاش خدام هاد الـ Pattern
الـ Observer pattern كيحل هاد المشكل حيت كيفصل بين الـ 'Subject' (الشيء لي كنراقبو) والـ 'Observers' (الناس لي كيتسناو التحديث). الـ Subject كيكون عندو واحد la liste ديال observers، وفيه طرق باش تزيد (attach) أو تحيد (detach) شي observer. ملي كيوقع شي تغيير، الـ Subject كيدوز على كاع دوك observers وكيعيط لواحد la méthode محددة فيهم.

## مثال تطبيقي
في application ديال الشراء، `PurchaseRequest` هو الـ Subject. غانديرو interface سميتها `RequestObserver` باش كاع listeners يكون عندهم نفس la méthode `update`.

```java
interface RequestObserver {
    void update(String status);
}

class PurchaseRequest {
    private List<RequestObserver> observers = new ArrayList<>();
    private String status;

    public void attach(RequestObserver observer) { observers.add(observer); }
    
    public void setStatus(String status) {
        this.status = status;
        notifyObservers();
    }

    private void notifyObservers() {
        for (RequestObserver obs : observers) {
            obs.update(status);
        }
    }
}

class BuyerNotification implements RequestObserver {
    public void update(String status) {
        if ("APPROVED".equals(status)) {
            System.out.println("Buyer: غانشري السلعة دابا!");
        }
    }
}
```
ملي كنعيطو لـ `request.setStatus("APPROVED")` الـ `BuyerNotification` كيخدم أوتوماتيكيا بلا ما يكون `PurchaseRequest` عارف التفاصيل ديال الخدمة ديال الـ buyer.

## غلط شائع: Memory Leaks
واحد الغلط كيديروه بزاف هو كينساو يحيدو (detach) الـ observers. إلا كان observer مابقاش محتاجين ليه ولكن باقي لاصق في Subject كيبقى خدام مدة طويلة، الـ Garbage Collector ما غاديش يقدر يمسحو من الذاكرة، وهذا كيدير memory leak. ديما دير méthode ديال `detach` وعيط ليها ملي تسالي من الـ observer.

## تمرين تطبيقي
صاوب classe سميتها `BudgetTracker` كتـ implement `RequestObserver`. خاصها تطبع "Budget Updated" غير ملي يكون الـ status هو "APPROVED".

**التأكد:** الـ classe ديالك خاصها تـ implement الـ interface وتستعمل `if` وسط la méthode `update` باش تشيك واش status هو "APPROVED".


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
