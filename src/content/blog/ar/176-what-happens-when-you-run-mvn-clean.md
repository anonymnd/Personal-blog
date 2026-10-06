---
title: "شنو كيوقع ملي كانديرو mvn clean؟"
description: "شرح مبسط على كيفاش Maven Clean plugin كيمسح الدوسي ديال build باش تبدا compilation من الزيرو."
pubDate: 2026-10-13T23:48:00.000Z
translationKey: 176-what-happens-when-you-run-mvn-clean
locale: ar
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

هاد الأمثلة غير باش نفهمو الفكرة؛ الإعدادات ديال التطبيق وبعض التعريفات المساعدة ممكن ما يكونوش مكتوبين.

تخيل راسك بدلتي شي حاجة مهمة في الـ configuration ديال application ديال الشرا (procurement app)، ولكن ملي كتخدمها، كتلقى الإعدادات القدام باقيين خدامين. كتحس بلي الكود مابغاش يتحدث وخا درتي save. هادشي كيوقع حيت Maven كيخزن لي كلاص (classes) لي تـcompilاو في واحد الدوسي خاص، وهاد الدوسي ماشي ديما كيتحدث بوحدو.

## الدور ديال الدوسي Target
ملي كانديرو build لشي مشروع Java، Maven مكيقيسش الكود لي كاين في `src/main/java`. بلاصتها، كيكريي واحد الدوسي سميتو `target`. هاد الدوسي هو فين كيتحولو ملفات `.java` لملفات `.class`. مع الوقت، هاد الدوسي كيعمر بملفات قديمة (stale artifacts) ديال نسخ سابقة من الكود، لي مابقاوش صالحين ولكن باقيين محطوطين تما.

## كيفاش خدام mvn clean
ملي كتكتب `mvn clean` في terminal، Maven كيخدم واحد الـ plugin سميتو Maven Clean Plugin. الخدمة ديالو ساهلة: كيمسح الدوسي `target` كامل. ملي كيمسح هاد الدوسي، كيضمن لينا بلي حتى شي حاجة قديمة ماغاديش تبرزط النسخة الجديدة ديال الكود. خاصك تعرف بلي `mvn clean` كيمسح غير داكشي لي تـcompila، ومكيقيسش الكود ديالك (source code) ولا الـ `pom.xml` نهائيا.

## مثال تطبيقي
تخيل في application ديال الشرا، كان عندك واحد الـ object سميتو `Request` فيه variable سميتها `requestDate`. بدلتيها ورديتيها `submissionDate`. إلا درتي `mvn compile` بلا ما دير clean، يقدر يبقى الملف القديم `Request.class` في الدوسي `target` وهادشي غادي يعطيك errors بحال `NoSuchFieldError` لي غاتدوخك.

```bash
# غلط: compile بوحدها تقدر تخلي كلاصات قدام
mvn compile

# صحيح: بدا من الزيرو
mvn clean compile
```
النتيجة: الدوسي `target` كيتمسح، و Maven كيعاود يـcompile كلشي من الأول، وهكا كتأكد بلي `submissionDate` هي لي كاينه.

## غلط شائع: كثرة استعمال Clean
بزاف ديال المطورين كيديرو `mvn clean install` في كل مرة كيبدلو سطر واحد. وخا هادشي ماشي خطر، ولكن راه كيضيع الوقت في المشاريع الكبيرة حيت Maven كيضطر يعاود يـcompile كلشي. خاصك دير `clean` غير ملي تبدل dependencies، ولا تبدل سمية ديال شي class، ولا ملي يوقع شي bug غريب في الـ build.

## تمرين صغير
إلا درتي `mvn clean` واش الملف `src/main/resources/application.properties` غادي يتمسح؟

**الجواب:** لا. `mvn clean` كيمسح غير الدوسي `target`. الملفات لي في `src` مكيقيسهمش.


## باش تزيد تفهم

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
