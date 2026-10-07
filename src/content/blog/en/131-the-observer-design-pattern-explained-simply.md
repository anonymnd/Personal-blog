---
title: "Use the Observer Pattern When Notifications Need Subscribers"
description: "A deep dive into managing local subscribers, lifecycle leaks, and failure handling in a desktop music player scenario."
pubDate: 2026-10-07T21:48:00.000Z
translationKey: 131-the-observer-design-pattern-explained-simply
seriesOrder: 30
locale: en
tags: ["java-fundamentals","learning-series"]
draft: false
---

## The Core Pressure: Decoupling State from View

In a desktop music player, the core audio engine (the Subject) manages the current playback position. However, multiple UI components—such as a progress bar, a lyrics panel, and a system tray icon—all need to react to this change. If the audio engine held direct references to every UI panel, it would become tightly coupled to the view layer, making it impossible to add new panels without modifying the engine.

The Observer pattern solves this by allowing the Subject to maintain a list of subscribers who implement a common interface. The Subject doesn't know who the observers are; it only knows they can be notified.

## Worked Example: Music Player Synchronization

Below is a concrete implementation. We use a `Set` to store observers to prevent the same component from being registered twice, which would cause duplicate updates.

```java
import java.util.*;

// The contract for any component wanting playback updates
interface PlaybackObserver {
    void onProgressUpdate(long milliseconds);
}

// The Subject: Manages the state and the subscribers
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
        // Create a snapshot to avoid ConcurrentModificationException
        // if an observer unsubscribes during the notification loop
        List<PlaybackObserver> snapshot = new ArrayList<>(observers);
        for (PlaybackObserver observer : snapshot) {
            try {
                observer.onProgressUpdate(currentPosition);
            } catch (Exception e) {
                // Prevent one failing observer from crashing the entire engine
                System.err.println("Error notifying observer: " + e.getMessage());
            }
        }
    }
}

// Concrete Observer 1: Progress Bar
class ProgressView implements PlaybackObserver {
    @Override
    public void onProgressUpdate(long ms) {
        System.out.println("ProgressView: Updating slider to " + ms + "ms");
    }
}

// Concrete Observer 2: Lyrics Panel
class LyricsPanel implements PlaybackObserver {
    @Override
    public void onProgressUpdate(long ms) {
        System.out.println("LyricsPanel: Syncing text for " + ms + "ms");
    }
}
```

## Critical Mechanics and Failure Cases

### 1. The Memory Leak Risk
In the scenario of a desktop app, users often open and close panels. If a `LyricsPanel` is closed but not explicitly removed via `unsubscribe()`, the `AudioEngine` still holds a reference to it in its `Set`. Because the Subject is typically long-lived, the closed panel cannot be garbage collected. This is a classic memory leak. To prevent this, the panel's `dispose()` or `close()` method must call `audioEngine.unsubscribe(this)`.

### 2. Notification Ordering
Using a `HashSet` means the order of notifications is non-deterministic. If the `ProgressView` must update before the `LyricsPanel`, a `LinkedHashSet` or `ArrayList` should be used instead. However, relying on ordering often suggests that the observers are too dependent on each other, which violates the pattern's intent.

### 3. Exception Isolation
As shown in the `notifyObservers` method, wrapping the callback in a `try-catch` block is mandatory. If `LyricsPanel` throws a `RuntimeException` (e.g., a `NullPointerException` during a UI render), and the loop is not protected, the `ProgressView` will never receive the update, and the `AudioEngine` might crash, stopping the music.

## Local Callbacks vs. Durable Event Architecture

It is vital to distinguish this in-process pattern from a Message Broker (like RabbitMQ or Kafka).
- **Observer Pattern:** Synchronous, happens in the same JVM memory space, and is transient. If the app crashes, the subscription list is gone. It is used for immediate UI synchronization.
- **Event Architecture:** Asynchronous, often distributed across different services, and durable. Events are persisted to a disk/log. It is used for business workflows (e.g., "UserPurchasedSong").

## Exercise

**Scenario:** You add a `VolumePanel` to the music player. This panel should only be notified when the volume changes, not every millisecond when the progress updates. How do you modify the current design without creating a separate `VolumeEngine` class?

**Answer:**
Split the observer interface into two specialized interfaces: `PlaybackObserver` and `VolumeObserver`. The `AudioEngine` should maintain two separate sets: `Set<PlaybackObserver>` and `Set<VolumeObserver>`. The `VolumePanel` would implement only `VolumeObserver` and subscribe to the volume list. This prevents "over-notification," where components are woken up for events they don't care about.


This callback implementation is synchronous and assumes serialized access on one thread. Its snapshot handles callback-time removal, not concurrent mutation during snapshot creation or every reentrant update. Capture the event value before notifying if callbacks may reenter updatePosition. Exception isolation is this application’s policy, not a universal requirement of Observer; callbacks before the failing one may already have run. Durable/asynchronous delivery likewise depends on a chosen broker and configuration, not merely calling an architecture event-based.

## Further reading

- [Java records](https://dev.java/learn/records/)
