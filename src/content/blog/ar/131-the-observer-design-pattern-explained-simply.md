---
title: "كيفاش تخدم بـ Observer Pattern باش تسير Notifications فـ وسط البروكرام"
description: "شرح مفصل على كيفاش تسير subscribers، وتفادى leaks ديال الميموار، وتعامل مع errors فـ scenario ديال music player."
pubDate: 2026-10-07T21:48:00.000Z
translationKey: 131-the-observer-design-pattern-explained-simply
seriesOrder: 30
locale: ar
tags: ["java-fundamentals","learning-series"]
draft: false
---

## علاش كنحتاجو هاد الـ Pattern؟

تخيل عندك music player، الموتور ديال الصوت (Subject) هو اللي عارف فين وصلات الأغنية (current position). ولكن كاينين بزاف ديال الحوايج فـ الـ UI خاصهم يعرفو هاد المعلومة: مثلاً barra ديال التقدم، و panel ديال lyrics، و icon ديال system tray. إلا خلينا الموتور ديال الصوت يهضر مباشرة مع كل panel، غادي يولي كولشي ملاصق (tightly coupled)، وإلا بغيتي تزيد panel جديدة غادي تضطر تبدل الكود ديال الموتور.

الـ Observer pattern كيحل هاد المشكل حيت كيخلي الموتور يشد غير list ديال subscribers اللي كيطبقو واحد الـ interface. الموتور ما كيهمش شكون هما هاد الناس، المهم هو أنه يقدر يصيفط ليهم notification.

## مثال تطبيقي: Music Player Synchronization

هنا غادي نخدمو بـ `Set` باش ما يتسجلش نفس الـ observer جوج مرات، حيت إلا تدارت هكا غادي يبقاو يوصلوه updates مكررين.

```java
import java.util.*;

// العقد اللي خاص أي component يتبعو باش يوصلوه updates
interface PlaybackObserver {
    void onProgressUpdate(long milliseconds);
}

// الـ Subject: هو اللي كيسير الحالة و الـ subscribers
class AudioEngine {
    private final Set<PlaybackObserver> observers = new HashSet<>();
    private long currentPosition = 0;

    public void subscribe(PlaybackObserver observer) {
        if (observer != null) {
            observers.add(observer);
        }
    }

    public void unsubscribe(PlaybackObserver observer) {
        observers.remove(observer);
    }

    public void updatePosition(long newPosition) {
        this.currentPosition = newPosition;
        notifyObservers();
    }

    private void notifyObservers() {
        // كنديرو snapshot باش ما يوقعش لينا ConcurrentModificationException
        // إلا شي observer بغا يدير unsubscribe وهو وسط الـ loop
        List<PlaybackObserver> snapshot = new ArrayList<>(observers);
        for (PlaybackObserver observer : snapshot) {
            try {
                observer.onProgressUpdate(currentPosition);
            } catch (Exception e) {
                // باش إلا شي observer طاح، ما يوقفش لينا الموتور كامل
                System.err.println("Error notifying observer: " + e.getMessage());
            }
        }
    }
}

// Observer 1: Barra ديال التقدم
class ProgressView implements PlaybackObserver {
    @Override
    public void onProgressUpdate(long ms) {
        System.out.println("ProgressView: Updating slider to " + ms + "ms");
    }
}

// Observer 2: Panel ديال lyrics
class LyricsPanel implements PlaybackObserver {
    @Override
    public void onProgressUpdate(long ms) {
        System.out.println("LyricsPanel: Syncing text for " + ms + "ms");
    }
}
```

## نقط مهمة ومشاكل ممكن يوقعو

### 1. خطر الـ Memory Leak
فـ apps ديال desktop، المستخدم كيسد ويحل panels بزاف. إلا سدينا `LyricsPanel` وما درناش ليه `unsubscribe()`، الموتور ديال الصوت غادي يبقى شاد reference ديالو فـ الـ `Set`. وبما أن الموتور كيبقى خدام ديما، الـ Garbage Collector ما غاديش يقدر يمسح داك الـ panel من الميموار. هادي هي الـ memory leak. باش نتفاداو هادشي، خاص فـ الميثود ديال `dispose()` أو `close()` ديال الـ panel نعيطو لـ `audioEngine.unsubscribe(this)`.

### 2. الترتيب ديال Notifications
حيت خدمنا بـ `HashSet` الترتيب ماشي مضمون. إلا كان ضروري `ProgressView` يتحدث قبل `LyricsPanel` خاصنا نخدمو بـ `LinkedHashSet` أو `ArrayList`. ولكن فـ الغالب، إلا كنتي محتاج ترتيب، فهذا كيعني أن الـ observers ولاو معتمدين على بعضياتهم، وهذا كيخالف الهدف ديال الـ pattern.

### 3. عزل الـ Exceptions
كيفما شفتو فـ `notifyObservers` درنا `try-catch` وسط الـ loop. هادشي ضروري حيت إلا `LyricsPanel` دار شي غلط (مثلا `NullPointerException`) وما كانتش عندنا هاد الـ protection، الـ `ProgressView` ما غاديش توصلو notification، والموتور ديال الصوت يقدر يوقف كامل وتكطع الموسيقى.

## الفرق بين Local Callbacks و Durable Event Architecture

خاصنا نفرقو بين هاد الـ pattern اللي خدام فـ وسط JVM وحدة، وبين Message Broker (بحال RabbitMQ أو Kafka):
- **Observer Pattern:** كيكون synchronous، خدام فـ نفس الميموار، و transient. إلا طفا البروكرام، كولشي كيمشي. كيصلح للحوايج ديال UI اللي خاصهم يتحدثو دابا.
- **Event Architecture:** كتكون asynchronous، موزعة على بزاف ديال services، و durable. الـ events كيتسجلو فـ disk. كتصلح لـ business workflows (مثلا "UserPurchasedSong").

## تمرين

**السيناريو:** بغيتي تزيد `VolumePanel` للموسيقى. هاد الـ panel خاصها تعرف غير ملي كيتبدل الـ volume، ماشي كل ملي كيتحرك الوقت ديال الأغنية. كيفاش تبدل الديزاين بلا ما تزيد كلاص `VolumeEngine` جديدة؟

**الجواب:**
نقسمو الـ interface ديال الـ observer لجوج: `PlaybackObserver` و `VolumeObserver`. الموتور ديال الصوت `AudioEngine` يولي عندو جوج ديال الـ sets: وحدة لـ `PlaybackObserver` ووحدة لـ `VolumeObserver`. الـ `VolumePanel` غادي يطبق غير `VolumeObserver` ويتسجل غير فـ الـ list ديال الـ volume. هكا كنقصو من الـ notifications اللي ما عندها معنى (over-notification).


Implementation synchronous وكتفترض access مسلسل فـ thread وحدة. Snapshot كتسمح removal وسط callback، ما كتصلحش concurrent mutations ولا كل reentrancy. Capture event value قبل notifications إلا callbacks يقدرو يعاودو updatePosition. Exception isolation policy ديال هاد app ماشي شرط عام Observer؛ callbacks قبل الفاشلة يقدرو دازو. Durability وasync كتعلق بـ broker وconfiguration ماشي غير اسم event architecture.

## باش تزيد تفهم

- [Java records](https://dev.java/learn/records/)
