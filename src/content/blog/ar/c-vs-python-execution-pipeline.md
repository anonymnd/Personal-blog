---
title: "فهم تقني لكيفاش كيتنفذ الكود فـ C و Python (من الكود حتى CPU)"
description: "شرح تقني لمسار التنفيذ في C و Python: compiler، bytecode، PVM، system calls، ودور CPU الحقيقي."
pubDate: 2026-04-15
translationKey: c-vs-python-execution-pipeline
locale: ar
tags:
  - c
  - python
  - execution
  - systems
---

# مقدمة

فهاد المقال غادي نشرح بشكل تقني ودقيق كيفاش الكود كيتنفذ فـ جوج لغات مهمين: C و Python، وشنو الفرق الحقيقي بيناتهم من ناحية execution، CPU، وsystem.

الهدف هو نفهم شكون فعلاً كينفذ الكود، وشكون غير كيساعد فالتنفيذ.

---

# Pipeline ديال C

## الفكرة

C لغة compiled، يعني الكود كيتحوّل كامل قبل ما يتشغل.

## Workflow

```text
C code (.c)
  ↓
Compiler (gcc/clang)
  ↓
Executable (machine code)
  ↓
OS loads program
  ↓
CPU executes instructions
```

## التفاصيل

### 1) كتابة الكود

```c
int a = 2 + 3;
```

### 2) Compilation

الـcompiler كيدير:

- parsing
- code generation
- linking مع libraries

النتيجة: ملف executable فيه instructions ديال CPU (machine code).

### 3) Execution

```bash
./program
```

كيوقع:

- OS كيدير load للبرنامج فـmemory
- CPU كيبدا ينفذ instructions مباشرة

الخلاصة هنا: ماكاين حتى وسيط وقت التشغيل. CPU كينفذ machine code جاهز.

---

# Pipeline ديال Python (CPython)

## الفكرة

Python لغة interpreted/runtime-driven، يعني التنفيذ كيكون عبر برنامج آخر (interpreter).

## Workflow

```text
Python code (.py)
   ↓
CPython Interpreter (C program)
   ↓
Bytecode
   ↓
Python Virtual Machine (PVM)
   ↓
C functions (built-ins/runtime)
   ↓
OS system calls
   ↓
CPU executes machine code
```

## التفاصيل

### 1) تشغيل البرنامج

```bash
python script.py
```

الـOS كيدير load لـ`python` executable (برنامج مكتوب بـC).

### 2) قراءة الكود

الـinterpreter كيقرا ملف `.py` وكيحضرو فـmemory.

### 3) Compilation الداخلي

Python فيه compiler داخلي:

`Python source -> Bytecode`

مهم: bytecode ماشي machine code.

مثال:

```python
a = 2 + 3
```

كيولي تقريباً:

```text
LOAD_CONST 2
LOAD_CONST 3
BINARY_ADD
STORE_NAME a
```

### 4) Python Virtual Machine (PVM)

كاين loop داخل interpreter:

```python
while running:
    instruction = next_bytecode()
    execute(instruction)
```

PVM كيقرا bytecode وكيخدم instruction بوحدة.

### 5) التنفيذ الحقيقي

مثلاً فـ`BINARY_ADD`، الـPVM غالباً كينادي C runtime functions مطبوخين من قبل.

ماكيوقعش تحويل مباشر ديال كل bytecode instruction إلى machine code فـCPython التقليدي.

### 6) C Functions

هاد functions:

- مكتوبة بـC
- compiled مسبقاً
- فيها machine code جاهز

مثال: `print`, memory allocation, object operations.

### 7) OS + CPU

- OS: system calls, process/memory management
- CPU: كينفذ machine code فقط

---

# مقارنة مباشرة

## C

```text
C code
  ↓
Compiler
  ↓
Machine Code
  ↓
CPU
```

## Python (CPython)

```text
Python code
  ↓
Bytecode
  ↓
PVM
  ↓
C functions/runtime
  ↓
CPU
```

---

# الفرق التقني

## C

- compilation قبل execution
- machine code مباشر
- execution سريع وقريب للهاردوير

## Python

- interpretation/runtime dispatch وقت execution
- layers أكثر (bytecode + PVM + runtime)
- كيعتمد على interpreter

---

# مفاهيم مهمة

## Machine Code

- 0 و1
- CPU كيفهمها مباشرة

## Bytecode

- لغة داخلية ديال Python
- PVM هي اللي كتفهمها

## Interpreter

- برنامج (CPython) مكتوب بـC
- هو اللي كيشغل Python code

## PVM

- loop كتنفذ bytecode instruction by instruction
- ماكتولدش machine code مباشر فالسياق العادي ديال CPython

---

# أخطاء شائعة

- Python كيتحول لـC: غلط
- Python كيتحول مباشرة لـmachine code: غلط (فـCPython القياسي)
- CPU كيفهم bytecode مباشرة: غلط

---

# الفهم الصحيح

- Python كيتشغل داخل program مكتوب بـC
- bytecode كيتنفذ عبر PVM
- التنفيذ الحقيقي كيديروه C runtime functions
- CPU كيشوف غير machine code

---

# الخلاصة

**C:** build -> machine code -> direct execution  
**Python (CPython):** run -> bytecode + PVM -> C runtime -> CPU
