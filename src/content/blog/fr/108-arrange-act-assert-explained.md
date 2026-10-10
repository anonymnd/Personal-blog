---
title: "Tester les opérations CUD comme comportements observables"
description: "Analyse approfondie du schéma Arrange-Act-Assert pour les opérations de création, mise à jour et suppression via un service de liste de lecture."
pubDate: 2026-10-07T14:48:00.000Z
translationKey: 108-arrange-act-assert-explained
seriesOrder: 23
locale: fr
tags: ["backend-testing","learning-series"]
draft: false
---

## L'approche comportementale des tests CUD

Le test des opérations de Création, Mise à jour et Suppression (CUD) tombe souvent dans le piège du « test miroir » : appeler une méthode et vérifier simplement que le mock a été sollicité. Pour apporter une valeur réelle, les tests doivent traiter ces opérations comme des comportements observables : étant donné un état spécifique, le système produit-il le résultat attendu ou empêche-t-il une action invalide ?

Dans ce scénario, nous avons un `ReadingListService` qui gère des listes de livres. Il impose trois règles métier :
1. Les livres doivent être uniques au sein d'une liste.
2. Les listes archivées ne peuvent pas être modifiées.
3. La suppression d'un livre inexistant doit être traitée explicitement.

## Le modèle Arrange-Act-Assert (AAA)

Chaque test doit suivre la structure AAA pour garantir la clarté et la maintenabilité :
- **Arrange (Préparer)** : Configuration des objets, des réponses des mocks et de l'état initial.
- **Act (Agir)** : Exécution de la méthode spécifique testée.
- **Assert (Vérifier)** : Validation du résultat, du changement d'état ou de l'exception levée.

## Exemple concret : ReadingListService

Voici une suite de tests complète. Nous supposons que `ReadingListRepository` est mocké avec Mockito. Notez que `@InjectMocks` gère l'instanciation du service, mais ne démarre pas de contexte Spring.

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

    // --- COMPORTEMENT DE CRÉATION ---

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
        // Simulation : le livre est déjà présent dans la liste
        when(repository.containsBook(1L, "Effective Java")).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateBookException.class, () -> {
            service.addBookToList(1L, "Effective Java");
        });
    }

    // --- COMPORTEMENT DE MISE À JOUR ---

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

    // --- COMPORTEMENT DE SUPPRESSION ---

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

## Analyse des résultats des tests

Le test de création avec mock prouve que le service renvoie l’identifiant et le nom fournis par le stub repository ; il ne démontre pas une persistance réelle. Le test de liste archivée prouve que cette branche lève une exception avant save ; il ne vérifie ni dirty checking ni tous les chemins de persistance.

Ajoutez des tests qui créent, rechargent, modifient et suppriment avec une base réelle lorsque ce comportement présente un risque. Retirer un livre absent et supprimer une liste absente sont deux opérations distinctes. Un test avec mocks doit annoncer précisément la valeur, règle ou interaction qu’il observe.
## Exercice

**Scénario** : Ajoutez une fonctionnalité où une liste de lecture ne peut pas être supprimée si elle contient plus de 100 livres (pour éviter la suppression accidentelle de listes curatées).

**Tâche** : Écrivez les étapes Arrange, Act et Assert pour un test qui garantit qu'une `MassDeletionException` est levée lorsqu'une liste de 101 livres est supprimée.

**Réponse** :
- **Arrange** : Moquer `repository.findById(id)` pour retourner une `ReadingList` contenant 101 livres. Moquer `repository.existsById(id)` pour retourner `true`.
- **Act** : Appeler `service.deleteList(id)` à l'intérieur d'un bloc `assertThrows(MassDeletionException.class, ...)`.
- **Assert** : Vérifier que `repository.deleteById(id)` n'a `never()` été appelé.

## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
