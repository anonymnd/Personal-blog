---
title: "J'ai enfin compris Mockito"
description: "Une exploration conceptuelle de l'isolation du code en remplaçant les dépendances réelles par des doubles contrôlés."
pubDate: 2026-10-17T19:48:00.000Z
translationKey: 268-i-finally-understand-mockito
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Pendant longtemps, j'ai eu du mal à saisir la différence entre un objet réel et un mock. Je pensais que le mocking servait uniquement à éviter les connexions aux bases de données, mais le déclic est venu quand j'ai compris que Mockito sert à contrôler l'environnement pour tester un seul chemin logique en isolation.

## Le mécanisme central
Mockito crée un 'proxy' d'une classe. Au lieu d'exécuter la logique réelle à l'intérieur d'une méthode, le proxy intercepte l'appel. Vous indiquez ensuite à ce proxy exactement quoi retourner via `when(...).thenReturn(...)`. Cela élimine l'imprévisibilité des services externes, comme une API indisponible ou une base de données nécessitant une configuration complexe.

## Exemple hypothétique d'approvisionnement
Imaginons un `ProcurementService` où un demandeur soumet une requête. Le service doit vérifier si le demandeur a assez de budget via un `BudgetService` avant d'enregistrer la demande.

```java
// Extrait illustratif
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock BudgetService budgetService;
    @InjectMocks ProcurementService procurementService;

    @Test
    void testRequestApproval() {
        Request req = new Request("Laptop", 1200);
        // On force le mock à retourner true sans exécuter la logique réelle
        when(budgetService.hasEnoughFunds(req)).thenReturn(true);

        boolean result = procurementService.submitRequest(req);
        assertTrue(result);
        verify(budgetService).hasEnoughFunds(req);
    }
}
```
Ici, on ne teste pas si le `BudgetService` fonctionne, mais si le `ProcurementService` réagit correctement quand le budget est suffisant.

## Erreur courante : Moquer la classe testée
Une erreur fréquente consiste à appliquer `@Mock` à la classe que l'on teste. Si vous moquez le `ProcurementService` lui-même, vous appelez une méthode proxy qui ne fait rien, et votre test réussira toujours ou retournera null sans exécuter votre logique métier. Utilisez toujours `@InjectMocks` pour la classe cible et `@Mock` pour ses dépendances.

## Vérification vs Stubbing
Le stubbing (`when`) définit le comportement. La vérification (`verify`) vérifie si une méthode a bien été appelée. Utilisez la vérification quand la méthode retourne `void` ou quand l'effet secondaire (comme l'envoi d'un email) est l'objectif principal du test.

## Exercice pratique
Comment testeriez-vous un scénario où le `BudgetService` lève une `BudgetExceededException` ?

**Réponse :** Utilisez `when(budgetService.hasEnoughFunds(req)).thenThrow(new BudgetExceededException());` puis utilisez `assertThrows` pour vérifier que le `ProcurementService` gère l'erreur correctement.
