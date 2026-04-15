---
title: "شنو هي System Calls و دورها فـ تنفيذ البرامج (Python و C)"
description: "شرح عملي وتقني لـ System Calls: شنو كيديرو، علاش مهمين، وكيفاش Python و C كيوصلو للـ kernel."
pubDate: 2026-04-15
translationKey: system-calls-role-in-program-execution
locale: ar
tags:
  - os
  - system-calls
  - python
  - c
---

# مقدمة

فاش كنشغلو شي program سواء بـ C ولا Python، غالباً كنظنو باللي البرنامج هو اللي كيدير كلشي.  
ولكن فالحقيقة، أي program ماعندوش الحق يتعامل مباشرة مع hardware (disk, screen, network...).

الحل هو: **System Calls**.

---

# شنو هي System Calls

## التعريف

System Call هي:

> طريقة رسمية باش program يطلب service من Operating System (kernel).

---

# علاش كنحتاجو System Calls؟

البرامج العادية (بحال Python ولا C) خدامين فـ:

```text
User Mode
```

وما عندهمش صلاحيات يديرو مباشرة:

- كتابة فـ disk
- قراءة file
- طباعة فـ الشاشة
- network access

هاد الشي كامل خاصو يتم فـ:

```text
Kernel Mode
```

---

# الحل

System Call كتدير transition:

```text
User Mode
  ↓
System Call
  ↓
Kernel Mode
```

---

# Workflow عام

```text
Program (Python / C)
   ↓
C function (library/runtime)
   ↓
System Call
   ↓
Operating System (Kernel)
   ↓
Hardware
   ↓
CPU executes instructions
```

---

# مثال 1: `print` فـ Python

```python
print("hello")
```

شنو كيوقع تحت:

```text
Python code
   ↓
Interpreter (CPython)
   ↓
C function (print implementation)
   ↓
System Call (write)
   ↓
OS (kernel)
   ↓
Screen output
```

---

# مثال 2: فتح file

```python
f = open("test.txt")
```

شنو كيوقع:

```text
Python code
   ↓
Interpreter
   ↓
C function (open wrapper)
   ↓
System Call (open/openat)
   ↓
OS
   ↓
Disk access
```

---

# أمثلة ديال System Calls (Linux)

- `open()` -> فتح file
- `read()` -> قراءة data
- `write()` -> كتابة data
- `close()` -> تسكير file
- `fork()` -> إنشاء process

---

# فين كاين System Call تقنياً؟

System Call كيدير switch مهم:

`User Mode -> Kernel Mode`

كيفاش؟

- instruction خاصة فالـ CPU (بحال `syscall`)
- كتبدل context execution وتدخل للـ kernel

---

# علاش ما نخليوش البرامج يديرو كلشي مباشرة؟

لو البرنامج كان يقدر يتعامل مباشرة مع hardware، غادي تكون مشاكل كبيرة:

- security risks
- programs يقدرو يخربو النظام
- access غير مراقب للموارد

الحل:

- OS كيتحكم فكلشي
- البرامج خاصها تطلب permission عبر system calls

---

# العلاقة مع Python execution

فـ Python:

```text
Python code
   ↓
Bytecode
   ↓
PVM
   ↓
C functions
   ↓
System Calls
   ↓
OS
   ↓
CPU
```

مهم:

- Python ماكيتعاملش مباشرة مع OS
- كيستعمل C functions
- وهاد functions هما اللي كيديرو system calls

---

# الفرق مع C

## C

```text
C program
   ↓
System Calls (via libc)
   ↓
OS
```

## Python

```text
Python program
   ↓
Interpreter (C)
   ↓
C runtime functions
   ↓
System Calls
```

---

# مفاهيم مهمة

## User Mode

- البرامج العادية
- صلاحيات محدودة

## Kernel Mode

- OS kernel
- صلاحيات كاملة

## System Call

- bridge بين User Mode و Kernel Mode

---

# أخطاء شائعة

- Python كيتعامل مباشرة مع hardware: غلط
- CPU كينفذ Python source مباشرة: غلط
- System Calls غير فـ C: غلط (حتى Python كيستعملهم عبر C runtime)

---

# الفهم الصحيح

- أي program خاصو OS باش يتعامل مع hardware
- System Calls هما الطريقة الرسمية
- Python كيوصل لها عبر interpreter مكتوب بـ C

---

# الخلاصة

`Program -> System Call -> OS -> CPU`
