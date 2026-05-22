---
title: "Test Create, Update and Delete as Observable Behaviors"
description: "A deep dive into Arrange-Act-Assert for Create, Update, and Delete operations using a reading-list service scenario."
pubDate: 2026-10-07T14:48:00.000Z
translationKey: 108-arrange-act-assert-explained
seriesOrder: 23
locale: en
tags: ["backend-testing","learning-series"]
draft: false
---

## The Behavioral Approach to CUD Testing

Testing Create, Update, and Delete (CUD) operations often falls into the trap of 'mirror testing'—simply calling a method and asserting that the mock was called. To provide actual value, tests must treat these operations as observable behaviors: given a specific state, does the system produce the expected outcome or prevent an invalid one?

In this scenario, we have a `ReadingListService` that manages lists of books. It enforces three business rules:
1. Books must be unique within a list.
2. Archived lists cannot be edited.
3. Removing a non-existent book must be handled explicitly.

## The Arrange-Act-Assert (AAA) Pattern

Every test should follow the AAA structure to ensure clarity and maintainability:
- **Arrange**: Set up the necessary objects, mock responses, and the initial state.
- **Act**: Execute the specific method under test.
- **Assert**: Verify the result, the state change, or the exception thrown.

## Worked Example: ReadingListService

Below is a comprehensive test suite. We assume `ReadingListRepository` is mocked using Mockito. Note that `@InjectMocks` handles the instantiation of the service, but it does not start a Spring context.

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
        // Simulate that the book is already present in the list
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

## Analysis of the Test Outcomes

The mocked create test proves that the service returns the identifier and name supplied by the repository stub. It does not demonstrate a transition to real persisted state. The archived-list test proves that this tested branch throws before calling save; it does not exercise database dirty checking or every possible persistence path.

Add boundary tests that create, reload, update and delete against a real database when persistence behavior is the risk. Test removal of a missing book separately from deletion of a missing list: those are different operations. A mock-only test should state exactly which returned value, domain rule or interaction it observes.
## Exercise

**Scenario**: Add a feature where a reading list cannot be deleted if it contains more than 100 books (to prevent accidental mass-deletion of curated lists).

**Task**: Write the Arrange, Act, and Assert steps for a test that ensures a `MassDeletionException` is thrown when a list with 101 books is deleted.

**Answer**:
- **Arrange**: Mock `repository.findById(id)` to return a `ReadingList` containing 101 books. Mock `repository.existsById(id)` to return `true`.
- **Act**: Call `service.deleteList(id)` inside an `assertThrows(MassDeletionException.class, ...)` block.
- **Assert**: Verify that `repository.deleteById(id)` was `never()` called.

## Further reading

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
