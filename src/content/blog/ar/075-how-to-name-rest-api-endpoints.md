---
title: "كيفاش تسمي REST API Endpoints"
description: "دليل تطبيقي باش تصاوب URLs ساهلين ومنظمين للـ API ديالك على حساب المعايير ديال REST."
pubDate: 2026-10-09T18:48:00.000Z
translationKey: 075-how-to-name-rest-api-endpoints
locale: ar
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

بزاف ديال المطورين كيبداو يسميو الـ endpoints بحال `/getAllRequests` ولا `/updateOrder` وكيتعاملو مع الـ URL بحال إلا كيعيطو لشي function. هاد الطريقة كتخلي الـ API تولي مرونة وصعيبة في الصيانة حيت كل حركة جديدة خاصها سمية جديدة.

## ركز على الأسماء (Nouns) ماشي الأفعال (Verbs)
في REST، الـ URL خاصو يمثل 'الحاجة' (الـ resource)، والـ HTTP method هي اللي كتمثل 'الفعل'. بلاصة ما دير `/createRequest` دير `POST /requests`. الفعل راه مفهوم من الـ method. ديما استعمل الجمع في الأسماء باش تبقى الـ API ديالك متناسقة. مثلا `/users` أحسن من `/user` حيت كتبين بلي راك كتهضر على مجموعة.

## كيفاش تعامل مع العلاقات (Hierarchies)
ملي كتكون شي حاجة تابعة لحاجة أخرى، استعمل الترتيب المتداخل. مثلا في تطبيق ديال الشراء (procurement)، طلب واحد فيه بزاف ديال السلع. بلاصة ما دير `/getRequestItems?requestId=123` دير `/requests/123/items`. هكا كيكون المسار منطقي: مجموعة → ID → مجموعة فرعية.

## مثال تطبيقي: نظام طلبات الشراء
تخيل سيستيم فين الموظف كيدفع طلب شراء والمدير كيوافق عليه.

| الحركة | Endpoint | Method | Code النجاح |
| :--- | :--- | :--- | :--- |
| دفع طلب | `/requests` | `POST` | 201 Created |
| شوف طلب | `/requests/45` | `GET` | 200 OK |
| وافق على طلب | `/requests/45/status` | `PATCH` | 200 OK |
| مسح طلب | `/requests/45` | `DELETE` | 204 No Content |

مثال ديال request:
`PATCH /requests/45/status` 
`{ "status": "APPROVED" }` 
النتيجة: الحالة ديال الطلب تبدلات بلا ما نحتاجو نبدلو الطلب كامل.

## غلط شائع: التداخل بزاف (Over-nesting)
كاين اللي كيدير URLs طوال بزاف بحال `/departments/5/managers/2/requests/10/items/1`. هادشي كيخلي الـ API صعيبة. إلا كانت شي حاجة كنحتاجوها بزاف، ردها endpoint أساسي. مثلا استعمل `/request-items/1` مباشرة.

## تمرين تطبيقي
كيفاش تسمي الـ endpoint باش تجيب كاع الطلبيات (orders) ديال واحد المشتري (buyer) عندو ID رقم 99؟

**الجواب:** `GET /buyers/99/orders`

## باش تزيد تفهم

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
