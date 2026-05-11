---
title: "الفرق بين Class Diagrams و Database Diagrams"
description: "فهم الفرق بين موديلينغ ديال الكود (Object-Oriented) وموديلينغ ديال الداتا (Relational) باش ما تخلطش بيناتهم فالتصميم."
pubDate: 2026-10-07T19:48:00.000Z
translationKey: 028-class-diagrams-vs-database-diagrams
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال الشراء (Procurement). بديتي كترسم مربعات ديال 'PurchaseRequest' و 'Approval'. غادي تلاحظ بلي بجوجهم كيشبهو للجداول، ولكن واحد كيشرح كيفاش الكود كيخدم (Behavior) والآخر كيشرح كيفاش الداتا كتبقى مسجلة فالسيرفر (Storage). إلا خلطتي بيناتهم، غادي تطيح فمشكل 'Anemic Domain Model'، يعني كتولي اللوجيك ديال البيزنس مشتتة فـ SQL queries بلاصة ما تكون مجموعة وسط الـ Objects.

## الفرق فالفكرة
الـ Class Diagram هو بحال بلان ديال كيفاش البرنامج كيتصرف. كيركز على الـ encapsulation، الـ inheritance، والـ methods. كيقول ليك هاد الـ object شنو *كيدير*. أما الـ Database Diagram (ERD) فهو بلان ديال التخزين. كيركز على الـ normalization، الـ foreign keys، وسلامة البيانات. كيقول ليك شنو السيستيم *عاقل عليه*.

## الفرق فالبنية
فالـ Class Diagram، كنستعملو composition و aggregation باش نبينو شكون كيملك شكون. مثلاً، كلاس `Request` تقدر تكون فيها list ديال الـ `Item`. ولكن فـ Database Diagram، هاد العلاقة كتولي غير column ديال foreign key فجدول `Items`. وكاين فرق كبير فـ inheritance؛ الكلاس تقدر تورث من كلاس أخرى (مثلاً `Manager` كيورث من `Employee`)، ولكن الداتابيز ما فيهاش الوراثة بشكل طبيعي، خاصك تخدم بطرق بحال Single Table Inheritance.

## مثال تطبيقي: عملية الشراء
فكر فاش شي حد كيصيفط طلب شراء. فالـ Class Diagram، الكلاس `PurchaseRequest` عندها method سميتها `calculateTotal()` هي اللي كتحسب المجموع ديال الثمن. اللوجيك هنا كاين وسط الـ object.

```java
// مثال من Class Diagram (مقتطف)
public class PurchaseRequest {
    private List<Item> items;
    public double calculateTotal() {
        return items.stream().mapToDouble(Item::getPrice).sum();
    }
}
```

فالـ Database Diagram، ما كايناش method ديال الحساب. كاين غير جدول `purchase_requests` وجدول `items` مربوطين بـ `request_id`. باش تجيب المجموع، خاصك تكتب SQL query فيها `SUM()`.

## غلط شائع: فخ المرايا
بزاف ديال الناس كيحاولوا يردوا الـ Class Diagram نسخة طبق الأصل من الـ Database Diagram. إلا درتي هكا، الكلاسات ديالك كيوليو غير صناديق ديال الداتا (POJOs) فيهم غير getters و setters، واللوجيك كامل كيهرب لـ SQL أو service classes.

**التصحيح:** صمم الكلاسات ديالك على حساب شنو خاصهم *يديروا*، وصمم الجداول على حساب كيفاش خاص الداتا *تتخزن* وتجبد بسرعة.

## تمرين تطبيقي
إلا كانت عندك كلاس `User` وكلاس `Role` وبيناتهم علاقة many-to-many، كيفاش غادي يكون الفرق فالرسم بين الـ Class Diagram والـ Database Diagram؟

**الجواب:** فالـ Class Diagram، الـ `User` كيكون عندها `List<Role>` والـ `Role` عندها `List<User>`. ولكن فالـ Database Diagram، ضروري تزيد جدول ثالث ديال الربط (join table) سميتو مثلاً `user_roles` باش تربط بين الـ primary keys ديالهم.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
