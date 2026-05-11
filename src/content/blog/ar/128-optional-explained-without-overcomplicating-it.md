---
title: "شرح Optional بلا تعقيدات"
description: "تعلم كيفاش تخدم بـ Java Optional باش تهنى من مشاكل null وتخلي الكود ديالك نقي وواضح."
pubDate: 2026-10-11T23:48:00.000Z
translationKey: 128-optional-explained-without-overcomplicating-it
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على تطبيق ديال المشتريات (procurement app). واحد الموظف كيصيفط طلب، وأنت خاصك تقلب على manager ديال الديبارتمان ديالو. إلا كان الديبارتمان كاين ولكن مازال ما تعينش ليه manager، الكود ديالك غادي يرجع `null`. إلا جيتي تعيط لـ `.getName()` نيشان، التطبيق غادي يتبلوكا بـ `NullPointerException`. هاد المشكل هو اللي جا `Optional` باش يحلو.

## شنو هو Optional بالضبط؟
`Optional<T>` هو بحال واحد الصندوق (container) اللي يقدر يكون فيه قيمة أو يكون خاوي. ماشي الهدف منو تعوض كاع لي `null` اللي عندك في الكود، ولكن الهدف هو يكون إشارة (signal) في الـ return type ديال الميثود. كايقول للمبرمج: "رد بالك، هاد الميثود تقدر ما تلقى والو، خاصك ضروري تعامل مع الحالة اللي كيكون فيها الصندوق خاوي."

## الطريقة الصحيحة باش تخدم بيه
عوض ما ترجع `null` نيشان، رجع `Optional.ofNullable(value)`. اللي عيط للميثود غادي يخدم بميثودات funktionnels باش يقرر شنو يدير. أهم حاجة هي تبعد على `.get()` حيت إلا كان الصندوق خاوي غادي يوقع error، وهكا غادي نكونو ضيعنا الوقت.

## مثال تطبيقي: تقليب على Manager
ها كيفاش نطبقوها في السيستيم ديال المشتريات:

```java
public class ProcurementService {
    public Optional<Manager> findManagerByDept(String deptId) {
        Manager manager = database.lookup(deptId); 
        return Optional.ofNullable(manager);
    }
}

// كيفاش تخدم بيها
ProcurementService service = new ProcurementService();
service.findManagerByDept("IT_DEPT")
       .map(Manager::getName)
       .ifPresentOrElse(
           name -> System.out.println("Manager هو " + name),
           () -> System.out.println("ما كاين حتى manager في هاد الديبارتمان")
       );
```
في هاد المثال، `map` كتحول manager لـ name غير إلا كان موجود، و `ifPresentOrElse` كتعامل مع الحالتين (كاين أو ما كاينش) بلا ما نحتاجو نديرو `if (x == null)`.

## غلط شائع: استعمال get بلا تفكير
بزاف ديال الناس كيديرو `Optional` ولكن كيبقاو يعيطو لـ `.get()` بلا ما يتأكدو واش كاين شي حاجة بـ `.isPresent()`.

**غلط:** `Optional<Manager> opt = service.findManagerByDept("HR");
`String name = opt.get().getName(); // غادي يوقع crash إلا كان خاوي!`

**التصحيح:** خدم بـ `.orElse()` باش تعطي قيمة بديلة أو `.orElseThrow()` باش تلوح exception مفهومة.
`Manager m = opt.orElseThrow(() -> new NoSuchElementException("Manager ما لقيتوش"));`

## تمرين تطبيقي
كتب سطر ديال الكود كياخد `Optional<String> requestStatus` وكيرجع كلمة "PENDING" إلا كان الـ Optional خاوي.

**الجواب:** `String status = requestStatus.orElse("PENDING");`


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
