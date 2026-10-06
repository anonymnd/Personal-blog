---
title: "@Mock vs @InjectMocks"
description: "Apprenez à différencier la création de dépendances simulées et leur injection dans la classe testée avec Mockito."
pubDate: 2026-10-11T00:48:00.000Z
translationKey: 105-mock-vs-injectmocks
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous testez un `ProcurementService` qui dépend d'un `RequestRepository` et d'un `ApprovalClient`. Si vous essayez d'instancier le service manuellement, vous vous retrouvez avec un constructeur encombré et beaucoup de code répétitif juste pour démarrer le test. C'est là que les annotations de Mockito simplifient la configuration.

## Comprendre @Mock
L'annotation `@Mock` crée une instance simulée d'une classe ou d'une interface. Elle n'appelle pas les méthodes réelles de l'objet ; elle crée une 'coquille' qui retourne des valeurs par défaut (comme null ou 0), sauf si vous définissez un comportement spécifique avec `when().thenReturn()`.

## Comprendre @InjectMocks
Alors que `@Mock` crée les dépendances, `@InjectMocks` est utilisé sur la classe que vous souhaitez réellement tester. Mockito tente d'instancier cette classe et d'y injecter automatiquement tous les champs marqués avec `@Mock`. Attention : ce n'est pas l'injection de dépendances de Spring ; c'est un mécanisme interne à Mockito qui s'exécute sans démarrer le contexte Spring.

## Exemple concret : Demande d'achat
Voici comment ces deux annotations collaborent dans un scénario d'approvisionnement :

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    RequestRepository repository; // La dépendance

    @InjectMocks
    ProcurementService service; // La classe testée

    @Test
    void testSubmitRequest() {
        Request req = new Request("Laptop");
        when(repository.save(any())).thenReturn(req);

        service.submitRequest(req);

        verify(repository).save(req);
    }
}
```
Ici, `repository` est un mock. Mockito voit que `ProcurementService` a besoin d'un `RequestRepository` et injecte le mock dans l'instance `service`.

## Erreur courante : Inversion des annotations
Une erreur fréquente consiste à marquer le service testé avec `@Mock` et le repository avec `@InjectMocks`. Dans ce cas, votre service devient un mock, et l'appel de ses méthodes ne produira aucun effet, entraînant des tests qui réussissent sans exécuter la logique métier ou des NullPointerException.

## Exercice pratique
Si vous avez un `BuyerService` qui dépend d'un `VendorClient`, quelle annotation placez-vous sur `BuyerService` et laquelle sur `VendorClient` ?

**Réponse :** `@InjectMocks` pour `BuyerService` (la cible) et `@Mock` pour `VendorClient` (la dépendance).


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
