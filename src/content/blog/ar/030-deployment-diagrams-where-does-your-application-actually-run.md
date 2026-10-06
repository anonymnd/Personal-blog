---
title: "Deployment Diagrams: فين كايتستالا l'Application ديالك بالضبط؟"
description: "تعلم كيفاش ترسم التوزيع ديال السيرفورات واللوجيسيال فالسستيم ديالك باستعمال UML Deployment Diagrams."
pubDate: 2026-10-07T21:48:00.000Z
translationKey: 030-deployment-diagrams-where-does-your-application-actually-run
locale: ar
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

سالينا لي ديغرام ديال classes و sequence، ولكن بقات واحد الحاجة: كنعرفو كيفاش الكود خدام، ولكن ماعارفينش فين محطوط. ملي شي ديفلوبور كيسول: « واش هاد الـ PDF generator خدام فالسيرفور ديال الويب ولا فشي worker node بوحدو؟ »، هنا كيجي الدور ديال Deployment Diagram باش يعطينا الجواب الصحيح.

## الفكرة الأساسية ديال Deployment
على عكس لي ديغرام لخرين لي كيركزو على المنطق (logic)، هاد الدياغرام كيركز على architecture physique. هنا كنربطو لي artefact (بحال ملفات JAR ولا Docker images) مع لي nodes. الـ node هو أي حاجة كتحسب (computational resource)، بحال سيرفور حقيقي، machine virtuelle، ولا cloud instance. والخط لي كيربط بين جوج nodes هو الطريق باش كيهضرو، وكنكتبو فوق منو البروتوكول لي مستعملين، بحال HTTPS ولا TCP/IP.

## Nodes و Artifacts
فـ UML، الـ node كيكون مرسوم بحال مكعب 3D. وسط هاد المكعبات، كنحطو لي artefacts. الـ artefact هو داك الشي لي كنقيسوه فالحقيقة من اللوجيسيال. مثلا، إلا كنتي خدام على application ديال procurement (المشتريات)، الملف `procurement-api.war` هو الـ artefact، و `Application Server` هو الـ node. هاد الفرق مهم حيت سيرفور واحد يقدر يهز بزاف ديال nodes virtuels ولا containers.

## مثال تطبيقي: Procurement System
تخيل application ديال المشتريات فين requester كيصيفط demande و manager كيوافق عليها. الـ deployment غيكون بحال هكا:
1. **Client Node (Browser):** هنا فين خدامة `Procurement-UI` (JavaScript/HTML).
2. **Web Server Node:** هنا محطوط `Procurement-Backend` (application Jakarta EE).
3. **Database Node:** سيرفور بوحدو فيه `PostgreSQL`.

الكونيكسيون كتمشي من Browser للسيرفور ديال الويب بـ HTTPS، ومن السيرفور للقاعدة ديال البيانات بـ JDBC. هادشي كيخلي لي équipe réseau يعرفو بالضبط أشمن ports يحلوا فـ firewall.

## غلط شائع: تخلط بين المنطق والواقع الفيزيائي
بزاف ديال الناس كيغلطو وكيحطو « User » ولا « Manager » وسط Deployment diagram. المستخدمين راهم actors (ديال Use Case diagrams)، ماشي matériel. خاصك ترسم « Laptop » ولا « Mobile » لي هاز المستخدم. إلا رسمتي خط من « Manager » لـ « Server »، راك رسمتي business flow ماشي deployment path.

## تمرين تطبيقي
**السيناريو:** l'app ديالك محتاجة node ديال « Email Service » بوحدو باش يصيفط notifications ملي buyer يشري شي حاجة. فين غتحط `Email-Service.jar` وكيفاش غيتكونيكطا مع `Web Server`؟

**الجواب:** الـ `Email-Service.jar` كيتحط وسط node جديد سميتو « Mail Server ». والكونيكسيون هي خط من « Web Server » لـ « Mail Server »، ومكتوب فيه البروتوكول SMTP.


## باش تزيد تفهم

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
