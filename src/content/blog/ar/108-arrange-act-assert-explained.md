---
title: "تست ديال CUD كـ Observable Behaviors"
description: "شرح مفصل ديال Arrange-Act-Assert باش تستي الـ Create, Update, و Delete باستعمال scenario ديال reading-list service."
pubDate: 2026-10-07T14:48:00.000Z
translationKey: 108-arrange-act-assert-explained
seriesOrder: 23
locale: ar
tags: ["backend-testing","learning-series"]
draft: false
---

## كيفاش نشوفو CUD كـ Behaviors ماشي غير كود

بزاف ديال المطورين كيوقعو فغلط فاش كيسيتييو الـ Create, Update, و Delete (CUD)، كيديرو غير « mirror testing »: يعني كيعيطو للميثود وكيتأكدو بلي الـ mock تعيط ليه. ولكن باش التست يكون عندو قيمة، خاصنا نشوفو هاد العمليات كـ observable behaviors: يعني يلا كانت عندنا حالة معينة، واش السيستيم كيعطي النتيجة اللي بغينا ولا كيمنع شي حاجة غلط؟

فهاد الـ scenario، عندنا `ReadingListService` كيسير لستات ديال الكتوبة. وعندو 3 ديال القواعد:
1. الكتوبة خاص يكونو unique فكل لستة.
2. اللستات اللي archived (مؤرشفة) ممنوع تتبدل.
3. يلا بغيتي تمسح كتاب ما كاينش، خاص السيستيم يتعامل مع هاد الحالة بشكل صريح.

## القاعدة ديال Arrange-Act-Assert (AAA)

أي تست خاصو يتبع هاد الترتيب باش يكون واضح وسهل فالتعديل:
- **Arrange**: كتوجد فيه الـ objects، كتحدد شنو غادي يرجع الـ mock، وكتصاوب الحالة الأولية.
- **Act**: كتنفذ الميثود اللي بغيتي تستي.
- **Assert**: كتأكد من النتيجة، واش الحالة تبدلات، ولا واش تلوحات (thrown) شي exception.

## مثال تطبيقي: ReadingListService

هاد الـ test suite كاملة. كنفرضوا بلي `ReadingListRepository` مخدوم بـ Mockito. رد البال بلي `@InjectMocks` غير كتصاوب الـ service وكتدخل فيه الـ mocks، ولكن ما كتشعلش Spring context.

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReadingListServiceTest {

    @Mock
    private ReadingListRepository repository;

    @InjectMocks
    private ReadingListService service;

    // --- CREATE BEHAVIOR ---

    @Test
    void createList_ShouldReturnSavedList_WhenValid() {
        // Arrange
        ReadingList input = new ReadingList("Java Mastery", false);
        ReadingList saved = new ReadingList(1L, "Java Mastery", false);
        when(repository.save(any(ReadingList.class))).thenReturn(saved);

        // Act
        ReadingList result = service.createList(input);

        // Assert
        assertNotNull(result.id());
        assertEquals("Java Mastery", result.name());
        verify(repository).save(input);
    }

    @Test
    void createList_ShouldThrowException_WhenBookAlreadyExists() {
        // Arrange
        ReadingList list = new ReadingList(1L, "Java Mastery", false);
        when(repository.findById(1L)).thenReturn(Optional.of(list));
        // كنقولو بلي الكتاب ديجا كاين فـ اللستة
        when(repository.containsBook(1L, "Effective Java")).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateBookException.class, () -> {
            service.addBookToList(1L, "Effective Java");
        });
    }

    // --- UPDATE BEHAVIOR ---

    @Test
    void updateList_ShouldUpdateName_WhenNotArchived() {
        // Arrange
        ReadingList existing = new ReadingList(1L, "Old Name", false);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Act
        ReadingList updated = service.updateListName(1L, "New Name");

        // Assert
        assertEquals("New Name", updated.name());
    }

    @Test
    void updateList_ShouldThrowException_WhenArchived() {
        // Arrange
        ReadingList archived = new ReadingList(1L, "Old Name", true);
        when(repository.findById(1L)).thenReturn(Optional.of(archived));

        // Act & Assert
        assertThrows(ArchivedListException.class, () -> {
            service.updateListName(1L, "New Name");
        });
        verify(repository, never()).save(any());
    }

    // --- DELETE BEHAVIOR ---

    @Test
    void deleteList_ShouldCallRepository_WhenPresent() {
        // Arrange
        when(repository.existsById(1L)).thenReturn(true);

        // Act
        service.deleteList(1L);

        // Assert
        verify(repository).deleteById(1L);
    }

    @Test
    void deleteList_ShouldThrowException_WhenAbsent() {
        // Arrange
        when(repository.existsById(1L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            service.deleteList(1L);
        });
        verify(repository, never()).deleteById(anyLong());
    }
}
```

## تحليل النتائج ديال التستات

Create test بـ mock كتثبت أن service رجعات id وname اللي عطا stub ديال repository؛ ما كتثبتش persistence حقيقية. Test ديال archived list كتثبت أن هاد branch كترمي exception قبل save؛ ما كتجربش dirty checking ولا كاع paths ديال persistence.

زيد tests كيخلقو ويرجعو يقراو ويبدلو ويحيدو من DB حقيقية إلا هادا هو risk. حذف book ما كايناش ماشي هو حذف list ما كايناش. Test ديال mocks خاصها تبين بالضبط value ولا rule ولا interaction اللي كتراقب.
## تمرين

**Scenario**: زيد ميزة بلي اللستة ما يمكنش تمسح يلا كان فيها كتر من 100 كتاب (باش ما يتمسحوش لستات كبار بالغلط).

**المطلوب**: كتب خطوات Arrange, Act, و Assert لتست كيتأكد بلي `MassDeletionException` كتلوح فاش كنبغيو نمسحو لستة فيها 101 كتاب.

**الجواب**:
- **Arrange**: دير mock لـ `repository.findById(id)` يرجع `ReadingList` فيها 101 كتاب، و `repository.existsById(id)` يرجع `true`.
- **Act**: عيط لـ `service.deleteList(id)` وسط `assertThrows(MassDeletionException.class, ...)`.
- **Assert**: تأكد بلي `repository.deleteById(id)` ما تعيطش ليه نهائياً (`never()`).

## باش تزيد تفهم

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
