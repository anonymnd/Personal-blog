---
title: "الفرق بين Feature-Based Packages و Layer-Based Packages"
description: "مقارنة بين تنظيم الكود على حساب الأدوار التقنية ولا على حساب الخدمات ديال البيزنس باش تسهل الصيانة."
pubDate: 2026-10-17T07:48:00.000Z
translationKey: 256-feature-based-packages-vs-layer-based-packages
locale: ar
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

تخايل راسك خدام على تطبيق ديال المشتريات (procurement app). بغيتي تزيد واحد الحقل (field) جديد فالفورم ديال 'طلب الشراء'. إلا كنتي خدام بـ layer-based structure، غادي تبقى تنقز بين package ديال `controller` و `service` و `repository` باش دير تغيير واحد كيتعلق بخدمة وحدة. هاد التمارة ديال 'طلوع وهبوط' كتخلي الخدمة تقيلة ملي كيولّي المشروع كبير.

## الطريقة ديال الطبقات (Layer-Based)
هاد الطريقة كتنظم الكود على حساب الدور التقني. كتلقى دوسيات بحال `com.app.controllers` و `com.app.services`. هادشي كيجيك ساهل فالبداية حيت كتفرق بين 'كيفاش' (التقنية) و 'شنو' (البيزنس). ولكن المشكل هو أن الملفات اللي خاصهم يتبدلو مجموعين كيكونوا مشتتين فكاع البلايص ديال المشروع.

## الطريقة ديال المميزات (Feature-Based)
هنا كنجمعو الكود على حساب الخدمة اللي كتقدمها (business capability). بلاصة ما يكون عندك دوسي `services` جامع كلشي، كدير package سميتو `com.app.procurement.request` وفيه الـ controller والـ service والـ repository ديالو. هادشي كيخلي الكود مجموع (cohesion)؛ حيت أي حاجة عندها علاقة بـ 'الطلبات' كتكون فبلاصا وحدة. إلا بغيتي تمسح ميزة 'الموافقة' (Approval)، كتمسح package واحد وصافي.

## مثال تطبيقي: تطبيق المشتريات
شوف الفرق كيفاش كنتعاملو مع ميزة 'المشتري' (Buyer):

| Layer-Based | Feature-Based |
| :--- | :--- |
| `src/controllers/BuyerController.java` | `src/buyer/BuyerController.java` |
| `src/services/BuyerService.java` | `src/buyer/BuyerService.java` |
| `src/repositories/BuyerRepository.java` | `src/buyer/BuyerRepository.java` |

فالـ feature-based، الـ package ديال `Buyer` كيولي بحال module بوحدو. المميزات الأخرى، بحال `Request` كيهضرو مع `Buyer` عن طريق interface، وهادشي كينقص التلف ملي كتبغي تفهم الكود.

## غلط شائع: الـ Feature 'العملاقة'
بزاف ديال الناس كيديرو package سميتو `com.app.core` وكيجمعو فيه كلشي. هادشي كيرجعنا لنفس المشكل ديال الطبقات ولكن بسمية أخرى. باش تصحح هادشي، قسم `core` لخدمات محددة بحال `inventory` (المخزون) ولا `billing` (الفواتير).

## تمرين تطبيقي
إلا عندك classe سميتها `ManagerApproval` و classe أخرى سميتها `ManagerRepository` فين خاصهم يكونو فـ feature-based structure؟

**الجواب:** بجوجهم خاصهم يكونو فـ package سميتو `com.app.approval` (أو أي سمية عندها علاقة بالميزة ديال الموافقة).
