---
title: "Comment Tester une Méthode CREATE"
description: "Apprenez à isoler et vérifier la logique d'une méthode de création au niveau service avec JUnit et Mockito."
pubDate: 2026-10-11T04:48:00.000Z
translationKey: 109-how-to-test-a-create-method
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs éprouvent des difficultés à tester une méthode 'create' car ils tentent de se connecter à une base de données réelle, ce qui rend les tests lents et instables. L'objectif est de vérifier que la logique de votre service traite correctement l'entrée et appelle le repository, indépendamment de l'état réel de la base de données.

## La Stratégie de Mocking
Pour tester une méthode de création en isolation, nous utilisons Mockito pour simuler la couche repository. Grâce à `@InjectMocks`, Mockito crée une instance du service et y injecte automatiquement les dépendances simulées. Cela évite de démarrer tout le contexte Spring, permettant au test de s'exécuter en quelques millisecondes.

## Implémentation du Test
Imaginons une application d'achats où un demandeur soumet une `PurchaseRequest`. Le service doit valider la demande avant de l'enregistrer.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldCreateRequestSuccessfully() {
        PurchaseRequest request = new PurchaseRequest("Laptop", 1200.0);
        // Définir le comportement : quand save est appelé, retourner l'objet
        when(repository.save(any(PurchaseRequest.class))).thenReturn(request);

        PurchaseRequest result = service.createRequest(request);

        assertNotNull(result);
        assertEquals("Laptop", result.getItem());
        verify(repository, times(1)).save(request);
    }
}
```

## Vérification du Résultat
Dans l'exemple ci-dessus, `when(...).thenReturn(...)` simule la réponse de la base de données. La méthode `verify` est essentielle ; elle garantit que la méthode `save` a bien été appelée. Sans elle, votre test pourrait réussir même si le service oublie d'appeler le repository, tant qu'il retourne un objet non nul.

## Erreur Courante : Tester le Mock
Une erreur fréquente consiste à affirmer que le repository a enregistré les données dans une base. Rappelez-vous : Mockito n'interagit pas avec une vraie DB. Si vous vérifiez l'existence d'un enregistrement en table, le test échouera ou nécessitera une configuration H2 complexe. Concentrez-vous sur les arguments passés au mock.

## Exercice Pratique
Comment testeriez-vous un scénario où la méthode `createRequest` doit lever une exception si le nom de l'article est nul ?

**Réponse :** Utilisez `assertThrows(IllegalArgumentException.class, () -> service.createRequest(nullRequest))` et vérifiez que `repository.save()` n'a jamais été appelé avec `verify(repository, never()).save(any())`.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
