---
title: "Que signifie réellement when(...).thenReturn(...) ?"
description: "Une analyse approfondie de la manière dont Mockito simule le comportement des méthodes pour isoler le code lors des tests."
pubDate: 2026-10-11T01:48:00.000Z
translationKey: 106-what-does-when-thenreturn-actually-mean
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous testiez un service d'approvisionnement où un manager approuve une demande. Pour tester la logique d'approbation, vous ne voulez pas vous connecter réellement à une base de données pour vérifier si la demande existe ; vous voulez simplement supposer qu'elle existe. C'est là qu'intervient `when(...).thenReturn(...)`.

## Le mécanisme du Stubbing
Dans Mockito, cette syntaxe est appelée 'stubbing' (bouchonnage). Lorsque vous créez un objet mock, c'est essentiellement une coquille vide. Par défaut, toute méthode appelée sur un mock retourne `null`, `0` ou `false`. La méthode `when()` indique à Mockito : "Écoute cet appel spécifique avec ces arguments précis." La partie `thenReturn()` définit la réponse préprogrammée. Elle intercepte l'appel réel et retourne immédiatement votre valeur spécifiée, contournant la logique réelle de la classe.

## Exemple concret : Approbation d'achat
Considérons un `ProcurementService` qui dépend d'un `RequestRepository`. Nous voulons tester si le service marque correctement une demande comme 'APPROUVÉE' lorsque le repository la trouve.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    RequestRepository repository;

    @InjectMocks
    ProcurementService service;

    @Test
    void testApproveRequest() {
        Request mockRequest = new Request(1L, "Laptop");
        // Stubbing : Quand repository.findById(1L) est appelé, retourner mockRequest
        when(repository.findById(1L)).thenReturn(Optional.of(mockRequest));

        service.approve(1L);
        
        assertEquals("APPROVED", mockRequest.getStatus());
    }
}
```
Ici, `thenReturn` garantit que le service reçoit un objet valide, nous permettant de tester la logique d'approbation sans base de données réelle.

## Erreur courante : Mauvais argument de stubbing
Une erreur fréquente consiste à programmer un stub avec une valeur, mais à appeler la méthode avec une autre. Par exemple, si vous écrivez `when(repository.findById(1L)).thenReturn(...)` mais que le service appelle `repository.findById(2L)`, Mockito retournera `null` car les arguments ne correspondent pas. Pour corriger cela, utilisez `anyLong()` ou `any()` si l'ID spécifique n'est pas crucial pour le test.

## Exercice pratique
Comment programmeriez-vous une méthode `checkBudget(Long id)` pour qu'elle retourne `false` afin de tester un refus de demande d'achat ?

**Réponse :** `when(budgetService.checkBudget(anyLong())).thenReturn(false);`


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
