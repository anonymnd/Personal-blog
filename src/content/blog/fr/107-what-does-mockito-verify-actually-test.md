---
title: "Que teste réellement Mockito verify() ?"
description: "Une analyse approfondie pour comprendre la différence entre la vérification d'état et la vérification d'interaction avec Mockito."
pubDate: 2026-10-11T02:48:00.000Z
translationKey: 107-what-does-mockito-verify-actually-test
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez écrit un test pour un service d'achat. Votre test réussit, mais vous réalisez que vous ne vérifiez pas si le `PurchaseOrderRepository` a été appelé pour enregistrer la commande ; vous vérifiez seulement si la méthode du service retourne un booléen de succès. C'est là que réside la différence entre vérifier *ce qui* s'est passé (l'état) et *comment* cela s'est passé (l'interaction).

## Vérification d'État vs Interaction
Beaucoup de débutants confondent `when().thenReturn()` et `verify()`. Alors que `when()` configure une précondition (le stubbing), `verify()` est une assertion. Il ne vérifie pas la valeur d'une variable ou un enregistrement en base de données. Il demande plutôt à Mockito : « Est-ce que cette méthode spécifique sur cet objet simulé a été appelée avec ces arguments précis ? »

## Le mécanisme de verify()
Lorsque vous appelez `verify(mock).method()`, Mockito inspecte son historique d'appels interne. Il cherche une correspondance entre la signature de la méthode et les arguments passés lors de l'exécution du code testé. Si la méthode n'a jamais été appelée, ou appelée avec des arguments différents, Mockito lève une erreur `ArgumentsAreDifferent` ou `WantedButNotInvoked`.

## Exemple concret : Approbation d'achat
Considérons un service où un manager approuve une demande. Nous devons nous assurer que le `NotificationService` est déclenché après l'approbation.

```java
// Extrait illustratif
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock NotificationService notificationService;
    @InjectMocks ProcurementService service;

    @Test
    void testApproveRequest() {
        Request request = new Request("Laptop", 1200);
        service.approve(request);
        
        // On vérifie que l'interaction a eu lieu
        verify(notificationService).sendEmail(eq("manager@company.com"), anyString());
    }
}
```
Ici, le test échoue si `sendEmail` n'est pas appelé, même si la méthode `approve` retourne `true`.

## Erreur courante : Vérifier les stubs
Une erreur fréquente consiste à tenter de `verify()` une méthode qui a servi au stubbing pour « confirmer » que le stub a fonctionné. Par exemple, appeler `verify(repo).findById(1)` simplement parce que vous avez utilisé `when(repo.findById(1)).thenReturn(opt)` est redondant. Utilisez `verify()` pour les effets de bord (comme l'envoi d'emails), pas pour la récupération de données.

## Exercice pratique
Si vous avez une méthode `processOrder()` qui doit appeler `repository.save()` exactement une fois, quelle ligne Mockito garantit qu'elle n'a pas été appelée deux fois ?

**Réponse :** `verify(repository, times(1)).save(any());`


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
