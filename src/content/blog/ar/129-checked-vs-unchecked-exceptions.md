---
title: "Checked and Unchecked Exceptions: كيفاش تحدد عقد التعامل مع الأخطاء"
description: "شرح مفصل على الفرق بين Exception و RuntimeException في Java باستعمال مثال ديال أداة import ديال البيانات."
pubDate: 2026-10-07T20:48:00.000Z
translationKey: 129-checked-vs-unchecked-exceptions
seriesOrder: 29
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## التسلسل الهرمي ديال Exceptions كـ "عقد" (Contract)

RuntimeException كتورث من Exception. Checked exceptions ما كيدخلوش فيهم RuntimeException ولا subclasses ديالها؛ compiler كيطلب catch ولا throws للـ checked exceptions اللي يقدرو يخرجو من method. RuntimeException وsubclasses ديال Error unchecked.

الفرق كيحدد واجب compilation، ماشي واش نقدر نصلحو المشكل. Business failure تقدر تكون unchecked وchecked failure تقدر ما عندهاش حل محلي. اختار API contract وحدود recovery بوضوح. Error غالبا مشكل كبير، ما تخبيهاش عشوائيا.
## السيناريو: أداة Import ديال البيانات

تخيل عندنا أداة كدير import لبيانات من واحد الملف. عندنا تلاتة ديال الأنواع ديال الفشل:
1. **الملف ما كاينش**: الملف ما لقيتوهش في المسار. هادشي مشكل خارجي يقدر المستخدم يصلحو (مثلاً يعطي المسار الصحيح). هادي **Checked Exception**.
2. **سطور ديال البيانات غالطة (Malformed)**: الملف كاين، ولكن واحد السطر فيه نص في بلاصة رقم. هادا فشل في الـ business validation. هادي **Checked Exception**.
3. **Null Pointer في الـ Parser**: المبرمج نسا ما دارش initialization لشي object. هادا bug. هادي **Unchecked Exception**.

## تطبيق عملي (Worked Example)

ها كيفاش كنصاوبو هاد العقود باش اللي كيستعمل الكود يعرف بالضبط شنو خاصو يـ handle.

```java
import java.io.*;
import java.util.*;

// Checked: اللي كيستعمل الميثود خاصو يقرر كيفاش يخبر المستخدم بلي الملف ما كاينش
class ImportFileNotFoundException extends Exception {
    public ImportFileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Checked: اللي كيستعمل الميثود خاصو يقرر واش يتجاوز السطر الغالط أو يوقف الـ import كامل
class MalformedRowException extends Exception {
    private final int rowNumber;
    public MalformedRowException(String message, int rowNumber) {
        super(message);
        this.rowNumber = rowNumber;
    }
    public int getRowNumber() { return rowNumber; }
}

class DataImporter {
    public void importData(String path) throws ImportFileNotFoundException, MalformedRowException {
        File file = new File(path);
        if (!file.exists()) {
            // كنحافظو على السبب (cause) باش نعرفو أصل المشكل
            throw new ImportFileNotFoundException("الملف ما كاينش: " + path, null);
        }

        // مثال بسيط ديال parsing
        List<String> rows = List.of("ValidRow", "BadRow", "ValidRow");
        for (int i = 0; i < rows.size(); i++) {
            String row = rows.get(i);
            if ("BadRow".equals(row)) {
                throw new MalformedRowException("فورما ديال البيانات غلط", i + 1);
            }
            // هنا يقدر يوقع RuntimeException إلا كان شي helper null
            // helper.process(row);
        }
    }
}

public class ImportRunner {
    public static void main(String[] args) {
        DataImporter importer = new DataImporter();
        try {
            importer.importData("data.csv");
        } catch (ImportFileNotFoundException e) {
            System.err.println("عفاك تأكد من المسار ديال الملف: " + e.getMessage());
        } catch (MalformedRowException e) {
            System.err.println("خطأ في السطر " + e.getRowNumber() + ": " + e.getMessage());
        }
        // الـ RuntimeExceptions (بحال NullPointerException) ما كنـ catch-وهومش هنا
        // حيت خاصهم يتصلحو في الكود ديال DataImporter ماشي في الـ runner.
    }
}
```

## تحليل الميكانيزم

### الحفاظ على الأسباب (Preserving Causes)
في الـ constructor ديال `ImportFileNotFoundException` زدنا `Throwable cause`. هادي مهمة بزاف. إلا كانت `java.io.IOException` هي اللي سببات الـ exception ديالنا، فاش كنصيفطوها لـ `super(message, cause)` كنحافظو على الـ stack trace الأصلي. بلا بيها، غادي يضيع لينا "علاش" وقع المشكل.

### وهم القدرة على الإصلاح (Recovery Fallacy)
واحد الغلط شائع هو أن الناس كيسحاب ليهم بلي الـ checked exceptions كـ "تضمن" بلي نقدروا نصلحو المشكل. لا، هي فقط كتضمن "الرؤية" (visibility). مثلاً `MalformedRowException` هي checked، ولكن الحل الوحيد يقدر يكون هو غير نسجلو الخطأ ونحبسو البرنامج. الفرق كاين في **عقد الـ API**، ماشي في واش المشكل ممكن يتصلح تقنياً.

### حالات الفشل في التصميم
- **كثرة الـ Checked Exceptions**: إلا كانت كل ميثود كترمي 5 ديال الـ checked exceptions، الكود كيولي عامر بـ `try-catch` بزاف، وهادشي كيخلي المبرمجين يديرو `catch (Exception e) {}` (كيبلعو الخطأ)، وهادا خطير بزاف.
- **استعمال Unchecked في الـ Business Logic**: إلا كانت `MalformedRowException` عبارة عن `RuntimeException` ، الـ `ImportRunner` يقدر ينسى يتعامل معاها، وهادشي غادي يخلي التطبيق يـ crash فجأة غير حيت لقى سطر واحد غلط.

## تمرين

إلا DB طافية، تبع contract ديال library: JDBC كتستعمل checked SQLException لبزاف errors، وSpring غالبا كتحول persistence failures لـ unchecked exceptions. Panne مؤقتة تقدر تقبل retry وخا exception RuntimeException. Syntax error تقدر تجي checked SQLException ولكن developer خاصو يصلح code.

قرر retryability حسب failure الحقيقية وواش تكرار operation آمن والسياسة، ماشي حسب checked ولا unchecked. حافظ على cause وحدد retries؛ ما تعاودش syntax error ثابتة بلا نهاية.

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
