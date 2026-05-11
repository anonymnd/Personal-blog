---
title: "أينا Diagramme UML خاصك تستعمل؟"
description: "دليل عملي باش تعرف تختار الـ diagramme المناسب على حسب واش بغيتي ترسم الأهداف، المنطق، التفاعلات أو البنية ديال السيستيم."
pubDate: 2026-10-07T15:48:00.000Z
translationKey: 024-which-uml-diagram-should-you-use
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

تخايل راسك خدام على سيستيم ديال الشراء (procurement)، فين الموظف كيدير طلب (request)، الشيف كيوافق عليه، ومن بعد المشتري (buyer) كيكوماندي السلعة. غتبدا ترسم مربعات وأسهم، ولكن غتلاحظ باللي diagramme واحد ما يقدرش يشرح لينا كيفاش كيمشي البيزنس وفي نفس الوقت كيفاش مخدومة الكود. هنا فين كيغلطو بزاف ديال المبتدئين، كيحاولوا يديروا كلشي فـ schéma واحد.

## تحديد الأهداف بـ Use Case Diagram
ملي كتبغي تعرف *شكون* اللي كيخدم بالسيستيم و *شنو* بغا يدير، هنا كنستعملو Use Case Diagram. هاد الدياغرام كيركز على 'شنو' ماشي 'كيفاش'. فالمثال ديالنا، الـ actors هما Requester، Manager و Buyer. والـ use cases غيكونوا 'Submit Request' و 'Review Request' و 'Place Order'. هادشي كيخليك تفاهم مع الكليان على شنو خاص السيستيم يدير بالضبط.

## رسم المنطق بـ Activity Diagram
إلا كنتي محتاج ترسم workflow أو طريقة كيفاش كيدوز الطلب من مرحلة لمرحلة مع وجود قرارات (decisions)، استعمل Activity Diagram. هو بحال flowchart مطور. مثلاً، ملي manager كيشوف الطلب، كاين واحد الاختيار: إلا كان 'Approved'، الطلب كيمشي عند Buyer؛ وإلا كان 'Rejected'، كيرجع عند Requester باش يصححو.

## تفاصيل التفاعل بـ Sequence Diagram
ملي كنبغيو نعرفو كيفاش الـ objects أو services كيهضرو مع بعضياتهم وبالترتيب ديال الوقت، كنستعملو Sequence Diagram. كيبين لينا الميساجات شكون صيفط لشكون وبالترتيب.

مثال ديال التفاعل:
1. `Requester` -> `RequestService`: `createRequest(data)`
2. `RequestService` -> `Database`: `save(request)`
3. `RequestService` -> `NotificationService`: `notifyManager(requestId)`

## بناء الهيكل بـ Class Diagram
باش ترسم الخريطة الثابتة ديال السيستيم، كنستعملو Class Diagram. واحد الغلط شائع هو أن الناس كيسحاب ليهم Class UML هي نفسها Table SQL. الفرق هو أن الـ Class فيها حتى behaviors (méthodes)، ماشي غير data. مثلاً، Class `PurchaseRequest` غيكون فيها `totalAmount` وكيكون فيها method سميتها `calculateTax()`.

## غلط شائع: بغيتي رسمة وحدة تشرح كلشي
اختار الرسمة على حساب السؤال اللي بغيتي تجاوب عليه. Actor يقدر يبان كـ lifeline فـ sequence diagram، وتقدر تبين فيه حتى الاختيارات والـ loops والتفاعلات المتوازية. هاد الرسمة كتشرح ترتيب الرسائل؛ activity diagram غالبا كيوضح الـ workflow كامل أحسن. Class diagram كيهتم بالبنية، ماشي بتنفيذ method خطوة بخطوة. الرسومات كيكملو بعضياتهم، وما كايناش قاعدة فـ UML كتمنع actors يبانوا إلا فـ use cases.
## تمرين تطبيقي
سيناريو: بغيتي تبين الترتيب ديال الـ API calls بين Application Mobile، Serveur d'authentification و Base de données. أما diagramme غتستعمل؟
**الجواب:** Sequence Diagram، حيت هو اللي كيركز على التبادل ديال الميساجات بالترتيب الزمني.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
