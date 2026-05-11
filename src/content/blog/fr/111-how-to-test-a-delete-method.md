---
title: "Comment Tester une Méthode DELETE"
description: "Apprenez à vérifier la logique de suppression d'un point de terminaison REST avec JUnit et Mockito sans base de données réelle."
pubDate: 2026-10-11T06:48:00.000Z
translationKey: 111-how-to-test-a-delete-method
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Vous avez une fonctionnalité permettant à un gestionnaire de supprimer une demande en attente. Le problème est que tester cela semble souvent risqué ; vous ne voulez pas effacer accidentellement votre base de données, et vous ne savez pas si le service a réellement appelé le repository.

## La Stratégie de Test
Pour tester une méthode DELETE, nous nous concentrons sur l'interaction entre le Contrôleur, le Service et le Repository. Pour obtenir un test unitaire rapide, nous utilisons Mockito pour simuler le Repository. Nous ne vérifions pas si une ligne a disparu d'un disque physique, mais plutôt si la méthode `deleteById` a été déclenchée avec le bon ID et si l'API a renvoyé le code de statut attendu.

## Exemple d'Implémentation
Voici un extrait ciblé d'un test pour un `ProcurementRequestService` utilisant Jakarta EE et Mockito.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testDeleteRequest_Success() {
        Long requestId = 101L;
        // Simuler que l'enregistrement existe
        when(repository.existsById(requestId)).thenReturn(true);

        service.deleteRequest(requestId);

        // Vérifier que la méthode delete du repository a bien été appelée
        verify(repository, times(1)).deleteById(requestId);
    }
}
```

## Gérer le Scénario 'Non Trouvé'
Une erreur courante est de ne tester que le chemin nominal. Dans une application réelle, tenter de supprimer un ID inexistant devrait lever une exception. Si votre test ne couvre pas cela, votre API pourrait renvoyer un code 200 OK même si rien n'a été supprimé.

**Correction :** Utilisez `when(...).thenReturn(false)` et enveloppez l'appel du service dans un bloc `assertThrows` pour garantir que votre `ResourceNotFoundException` est déclenchée.

## Vérification vs Persistance
Il est crucial de se rappeler que `verify(repository).deleteById(id)` ne vérifie pas la base de données. Cela vérifie seulement que la méthode Java a été appelée. Pour tester la suppression SQL réelle, il faudrait un test d'intégration avec une base H2, mais pour les tests unitaires, la vérification d'interaction est la norme.

## Exercice Pratique
**Tâche :** Comment modifieriez-vous le test pour s'assurer que la méthode `deleteById` n'est JAMAIS appelée si la vérification `existsById` renvoie faux ?

**Réponse :** Utilisez `verify(repository, never()).deleteById(anyLong());` après avoir appelé le service avec un ID inexistant.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
