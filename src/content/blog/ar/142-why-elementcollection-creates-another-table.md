---
title: "علاش @ElementCollection كتدير جدول آخر"
description: "فهم كيفاش JPA كتعامل مع collections ديال types basiques وعلاش خاصها جدول بوحدها فـ database."
pubDate: 2026-10-12T13:48:00.000Z
translationKey: 142-why-elementcollection-creates-another-table
locale: ar
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك خدام على application ديال procurement (المشتريات) فين كل `PurchaseRequest` تقدر تكون عندها بزاف ديال tags (مثلا 'Urgent', 'IT-Hardware'). تقدر تظن بلي تقدر تحط هاد tags كاملين فـ colonne وحدة، ولكن ملي كتخدم بـ `@ElementCollection` فـ JPA، غتلاحظ بلي Hibernate كيكريي جدول ثاني فـ PostgreSQL. هادشي كيحيّر بزاف ديال المبتدئين اللي كيسحاب ليهم كلشي غيكون فـ جدول واحد.

## كيفاش خدامة Element Collections
فـ JPA، كنستعملو `@ElementCollection` ملي كتكون عندنا collection ديال types basiques (بحال String ولا Integer) أو `@Embeddable`. الفرق بينها وبين `@OneToMany` هو أن هاد العناصر ما عندهمش identity ديالهم (ما كاينش primary key خاص بيهم)، كيكونوا تابعين تماماً للـ entity الرئيسية. وبما أن PostgreSQL (والمؤديات relational) ما كيقبلوش list ديال القيم فـ colonne وحدة عادية، Hibernate كيصاوب 'collection table' باش يحافظ على normalisation ديال data.

## مثال تطبيقي: Tags ديال الطلبات
نشوفو مثال ديال `PurchaseRequest` فين بغينا نخزنو list ديال tags.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;
    
    private String description;

    @ElementCollection
    @CollectionTable(name = "request_tags", joinColumns = @JoinColumn(name = "request_id"))
    private List<String> tags = new ArrayList<>();
}
```

**النتيجة:** Hibernate غيكريي جوج جداول: `purchase_request` (id, description) و `request_tags` (request_id, tags). إلا كانت الطلبية رقم 1 عندها tags 'Urgent' و 'IT'، جدول `request_tags` غيكون فيه جوج سطور: `(1, 'Urgent')` و `(1, 'IT')`.

## غلط شائع: تعامل مع العناصر كأنهم Entities
بزاف ديال الناس كيغلطو وكيبغيو يبدلو element واحد فـ collection عن طريق setter. حيت هادو types basiques، ما عندهمش ID. باش تبدل شي tag، خاصك تحيد القديم من الـ list وتزيد الجديد.

**التصحيح:** بلا ما تقلب على object باش تبدلو، استعمل `request.getTags().remove(oldTag);` ومن بعد `request.getTags().add(newTag);`.

## تمرين تطبيقي
إلا كانت عندك entity سميتها `User` فيها `@ElementCollection` ديال `phoneNumbers` وزدتي 3 ديال النوامر لواحد user عندو ID هو 5، شحال من سطر غيتزاد فـ جدول النوامر؟

**الجواب:** غيتزادو 3 ديال السطور، وكلهم عندهم نفس الـ foreign key (user_id = 5).

## باش تزيد تفهم

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
