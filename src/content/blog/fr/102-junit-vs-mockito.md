---
title: "Utiliser Mockito sans confondre interactions et résultats"
description: "Apprenez à isoler la logique avec Mockito en distinguant le stubbing des résultats et la vérification des interactions via un dispatcher de notifications."
pubDate: 2026-10-07T13:48:00.000Z
translationKey: 102-junit-vs-mockito
seriesOrder: 22
locale: fr
tags: ["backend-testing","learning-series"]
draft: false
---

## JUnit vs Mockito : Le Framework et l'Outil

Une confusion courante consiste à traiter JUnit et Mockito comme une seule et même chose. JUnit est le framework d'exécution et d'assertion ; il fournit l'annotation `@Test` et les méthodes comme `assertEquals` ou `assertThrows`. Mockito est une bibliothèque de simulation (mocking) qui crée des objets « factices » pour isoler la classe testée de ses dépendances. Si vous utilisez JUnit pour vérifier qu'une valeur est correcte, vous utilisez Mockito pour simuler l'environnement qui produit cette valeur.

## Injection de Mocks sans Spring

Lors de l'utilisation de `@Mock` et `@InjectMocks`, il est essentiel de se rappeler qu'il ne s'agit pas de l'injection de dépendances de Spring. Aucun `ApplicationContext` n'est démarré et aucun bean n'est scanné. Mockito utilise simplement la réflexion pour instancier la classe marquée avec `@InjectMocks` et tente d'y injecter tous les champs marqués avec `@Mock` dont les types correspondent. Cela permet des tests unitaires extrêmement rapides qui ne nécessitent pas le démarrage d'un framework lourd.

## Stubbing vs Vérification

La confusion survient souvent entre `when(...).thenReturn(...)` et `verify(...)`.

1. **Le Stubbing (Résultats) :** `when()` configure une réponse simulée. Il dit au mock : « Quand cette méthode est appelée avec ces arguments, retourne cette valeur spécifique ». Il s'agit de fournir les entrées nécessaires pour que la logique testée puisse progresser.
2. **La Vérification (Interactions) :** `verify()` vérifie si une méthode a été réellement appelée. Cela ne prouve pas que les données ont été sauvegardées dans une base de données ou qu'un fichier a été écrit ; cela prouve seulement que la méthode Java a été invoquée.

Crucialement, vérifier un appel à `repository.save(entity)` ne prouve pas que l'entité est persistée dans une vraie DB. Cela prouve seulement que le code a tenté d'appeler la méthode de sauvegarde. Les mappings ORM, les contraintes SQL et les frontières de transaction ne sont testés que lors des tests d'intégration.

## Exemple concret : Dispatcher de Notifications

Imaginons un `NotificationDispatcher` qui envoie un message via un `PrimaryProvider`. Si le fournisseur primaire lance une `TemporaryFailureException`, il doit essayer un `FallbackProvider`. Quel que soit le résultat, il doit enregistrer une demande d'audit via un `AuditService`.

### L'Implémentation

```java
public record Message(String recipient, String content) {}

public class NotificationDispatcher {
    private final PrimaryProvider primary;
    private final FallbackProvider fallback;
    private final AuditService audit;

    public NotificationDispatcher(PrimaryProvider primary, FallbackProvider fallback, AuditService audit) {
        this.primary = primary;
        this.fallback = fallback;
        this.audit = audit;
    }

    public void dispatch(Message msg) {
        try {
            try {
                primary.send(msg);
            } catch (TemporaryFailureException e) {
                fallback.send(msg);
            }
        } catch (TemporaryFailureException e) {
            throw new CriticalNotificationException("Both providers failed", e);
        } finally {
            audit.recordRequest(msg.recipient());
        }
    }
}
```

### La Suite de Tests

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationDispatcherTest {

    @Mock PrimaryProvider primary;
    @Mock FallbackProvider fallback;
    @Mock AuditService audit;

    @InjectMocks NotificationDispatcher dispatcher;

    @Test
    void shouldUseFallbackOnTemporaryFailureAndAudit() {
        // Arrange
        Message msg = new Message("user@test.com", "Hello");
        // Stubbing : Définir le résultat du fournisseur primaire
        doThrow(new TemporaryFailureException()).when(primary).send(msg);

        // Act
        dispatcher.dispatch(msg);

        // Assert/Verify
        // 1. Vérifier l'interaction : a-t-il essayé le primaire ?
        verify(primary, times(1)).send(msg);
        // 2. Vérifier l'interaction : a-t-il basculé vers le fallback ?
        verify(fallback, times(1)).send(msg);
        // 3. Vérifier l'interaction : l'audit a-t-il été enregistré ?
        verify(audit, times(1)).recordRequest("user@test.com");
    }

    @Test
    void shouldNotUseFallbackOnSuccess() {
        Message msg = new Message("user@test.com", "Hello");

        dispatcher.dispatch(msg);

        verify(primary).send(msg);
        verifyNoInteractions(fallback);
        verify(audit).recordRequest(anyString());
    }

    @Test
    void shouldCaptureAuditRecipient() {
        Message msg = new Message("target@domain.com", "Alert");
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);

        dispatcher.dispatch(msg);

        verify(audit).recordRequest(captor.capture());
        // On vérifie maintenant la valeur réelle capturée
        org.junit.jupiter.api.Assertions.assertEquals("target@domain.com", captor.getValue());
    }
}
```

### Analyse de l'artefact
- **`doThrow().when()`** : Utilisé à la place de `when().thenThrow()` car `send()` retourne void. C'est une distinction syntaxique cruciale de Mockito.
- **`verifyNoInteractions(fallback)`** : Cela prouve que la logique a correctement ignoré le fallback quand le primaire a réussi. Tester l'absence d'appel est aussi important que d'en tester la présence.
- **`ArgumentCaptor`** : Au lieu de simplement vérifier qu'une chaîne a été passée, le capturer permet d'inspecter l'argument exact envoyé au service d'audit.

## Exercice

**Scénario :** Modifiez le `NotificationDispatcher` pour que si le `FallbackProvider` échoue également, une `CriticalNotificationException` soit lancée.

**Tâche :** Écrivez un cas de test qui simule l'échec du `primary` et du `fallback` (via `TemporaryFailureException`) et affirme que la `CriticalNotificationException` est lancée, tout en vérifiant que `audit.recordRequest()` a bien été appelé.

**Réponse :**
```java
@Test
void shouldThrowCriticalExceptionWhenBothFailButStillAudit() {
    Message msg = new Message("user@test.com", "Hello");
    doThrow(new TemporaryFailureException()).when(primary).send(msg);
    doThrow(new TemporaryFailureException()).when(fallback).send(msg);

    org.junit.jupiter.api.Assertions.assertThrows(CriticalNotificationException.class, () -> {
        dispatcher.dispatch(msg);
    });

    verify(audit).recordRequest("user@test.com");
}
```

## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
