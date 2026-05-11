---
title: "شرح Method References ببساطة"
description: "تعلم كيفاش تعوض الـ lambda expressions الطويلة بـ method references باش يكون الكود ديالك نقي وسهل في القراية."
pubDate: 2026-10-11T22:48:00.000Z
translationKey: 127-method-references-explained-simply
locale: ar
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك كتبتي lambda expression بحال `(s) -> System.out.println(s)` وحسيتي بلي راك غير كتعاود نفس الحاجة. في الحقيقة، نتا غير كتقول لـ Java تاخد قيمة وتصيفطها نيشان لواحد الميثود بلا ما تبدل فيها والو. هنا فين كينفعونا الـ method references، حيت كيكونوا بحال اختصار للـ lambdas اللي كيعيطو لميثود ديجا كاينة.

## كيفاش كيخدمو الـ Method References
الـ method reference هي طريقة مختصرة باش تشير لميثود بلا ما تخدمها ديك الساعة. كنستعملو فيها هاد الرمز `::`. بلاصة ما تكتب المنطق (logic) وسط lambda، كتعطي لـ Java السمية ديال الميثود اللي فيها داك المنطق. هادشي كيخدم غير يلا كانت الميثود عندها نفس الـ signature اللي محتاجة الـ functional interface.

## أنواع الـ References
كاينين 4 ديال الأنواع أساسية: ميثود static (`ClassName::method`)، ميثود ديال شي object محدد (`obj::method`)، ميثود ديال أي object من واحد النوع (`ClassName::method`)، والـ constructors (`ClassName::new`).

## مثال تطبيقي: تطبيق ديال المشتريات (Procurement)
نفترضو عندنا سيستيم ديال المشتريات، وبغينا نخرجو الـ IDs ديال الطلبات اللي خاصهم موافقة.

```java
import java.util.*;
import java.util.stream.*;

public class ProcurementSystem {
    public static void main(String[] args) {
        List<Request> requests = List.of(new Request(101, "Laptop"), new Request(102, "Mouse"));
        
        // الطريقة ديال Lambda
        requests.forEach(r -> System.out.println(r.getId()));
        
        // الطريقة ديال Method Reference
        requests.stream()
                 .map(Request::getId)
                 .forEach(System.out::println);
    }
}

class Request {
    private int id; private String item; 
    public Request(int id, String item) { this.id = id; this.item = item; }
    public int getId() { return id; }
}
```
في هاد المثال، `Request::getId` عوضات `r -> r.getId()`. النتيجة هي هي: غادي يطبع لينا 101 و 102.

## غلط شائع: السياق الغلط
بزاف ديال المبرمجين كيحاولو يستعملو method references في ميثودات اللي كيحتاجو parameters زايدين. مثلا، `System.out::println` خدامة حيت `println` كتاخد argument واحد. ولكن يلا بغيتي تزيد شي كلمة بحال `r -> System.out.println("ID: " + r.getId())` هنا ما يمكنش تستعمل method reference، خاصك تبقى خدام بـ lambda.

## تمرين صغير
حول هاد الـ lambda لـ method reference: `list.stream().filter(s -> s.isEmpty()).collect(Collectors.toList());` 

**الجواب:** `list.stream().filter(String::isEmpty).collect(Collectors.toList());`


## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
