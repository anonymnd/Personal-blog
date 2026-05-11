---
title: "JUnit vs Mockito"
description: "Comprendre la différence fondamentale entre un framework de test et une bibliothèque de simulation pour créer des tests unitaires isolés."
pubDate: 2026-10-10T21:48:00.000Z
translationKey: 102-junit-vs-mockito
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous testez un service d'achat où un demandeur soumet une requête. Pour vérifier la logique, votre service a besoin d'un `RequestRepository` pour sauvegarder les données et d'un `EmailService` pour notifier le manager. Si vous utilisez une vraie base de données et un vrai serveur d'email, votre test devient lent et instable. C'est là que commence souvent la confusion entre JUnit et Mockito.

## Framework vs Bibliothèque
JUnit est la fondation ; c'est un framework de test qui fournit l'exécuteur, les assertions (comme `assertEquals`) et les annotations de cycle de vie (`@BeforeEach`, `@Test`). Il décide si un test a réussi ou échoué. Mockito, en revanche, est une bibliothèque de simulation (mocking). Il ne lance pas les tests ; il crée des versions "factices" d'objets complexes pour isoler la classe spécifique que vous testez.

## Le Mécanisme d'Isolation
Mockito vous permet de simuler le comportement des dépendances. Avec `@Mock`, vous créez un objet fictif. Avec `@InjectMocks`, Mockito tente d'injecter ces mocks dans votre service. Il est important de noter que `@InjectMocks` n'est pas l'injection de dépendances de Spring ; il ne démarre pas le contexte Spring. Il utilise simplement la réflexion pour insérer les mocks dans l'instance cible.

## Exemple Concret : Approbation d'Achat
Considérons un `ProcurementService` qui approuve une demande si le montant est inférieur à 1000$.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    
    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        Request req = new Request(100, "Laptop");
        // Configuration de la réponse simulée
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        
        service.approve(1L);
        
        // Vérification de l'interaction
        verify(repository).save(any(Request.class));
    }
}
```
Ici, `when()` définit le comportement, et `verify()` s'assure que la méthode save du repository a été appelée. On ne vérifie pas si la donnée est réellement en base, mais que le service a *tenté* de la sauvegarder.

## Erreur Courante : Tester le Mock
Une erreur fréquente consiste à utiliser `verify()` pour vérifier si une valeur a été modifiée à l'intérieur d'un mock. Les mocks sont des coquilles vides ; ils n'ont pas d'état interne comme une vraie base de données. Si vous voulez vérifier si un champ a été mis à jour, capturez l'argument passé au mock.

## Exercice Pratique
Si vous voulez tester comment votre service gère une `UserNotFoundException` quand un repository retourne un `Optional` vide, quelle méthode Mockito devez-vous utiliser pour simuler cela ?

**Réponse :** Utilisez `when(repository.findById(id)).thenReturn(Optional.empty());` puis utilisez `assertThrows()` de JUnit pour vérifier l'exception.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
