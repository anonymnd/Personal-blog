---
title: "Comment le Mocking vous aide à isoler les bugs"
description: "Découvrez comment utiliser Mockito pour séparer votre logique métier des dépendances externes afin de localiser précisément l'origine d'un bug."
pubDate: 2026-10-11T12:48:00.000Z
translationKey: 117-how-mocking-helps-you-isolate-bugs
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous déboguez une application d'achats où une demande est rejetée. Vous avez un `ProcurementService` qui appelle un `BudgetRepository` pour vérifier les fonds et un `EmailService` pour notifier le demandeur. Quand le test échoue, vous ne savez pas si le bug provient du calcul, de la requête SQL ou de la connexion au serveur mail. Ce 'bruit' rend le débogage épuisant.

## Le mécanisme d'isolation
Le mocking consiste à remplacer une dépendance réelle par un double contrôlé. Au lieu de se connecter à une base de données, vous dites au mock exactement quoi répondre. Ainsi, vous isolez le 'Système Sous Test' (SUT). Si le test échoue avec des mocks, le bug se trouve forcément dans la logique du SUT, et non dans le système externe.

## Implémentation avec Mockito
Avec JUnit et Mockito, vous pouvez simuler des scénarios précis sans configurer d'environnement complexe. L'annotation `@InjectMocks` instancie le service et y injecte les mocks.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private BudgetRepository budgetRepo;
    
    @InjectMocks
    private ProcurementService service;

    @Test
    void testRequestApproval() {
        // Arrange: Simuler le solde budgétaire
        when(budgetRepo.getBalance("DEPT_01")).thenReturn(1000.0);
        
        // Act
        boolean result = service.approveRequest("REQ_123", 500.0);
        
        // Assert
        assertTrue(result);
    }
}
```

## Exemple concret : Le bug du solde nul
Supposons que votre code accepte les approbations même si le solde est exactement à zéro. En configurant `budgetRepo.getBalance` pour retourner `0.0`, vous pouvez vérifier si `approveRequest` retourne `false`. S'il retourne `true`, vous avez isolé le bug dans un opérateur de comparaison (ex: `>` au lieu de `>=`) dans votre code Java.

## Erreur courante : Moquer le SUT
Une erreur fréquente est de créer un mock de la classe que l'on souhaite tester. Si vous moquez `ProcurementService` pour tester `ProcurementService`, vous testez le comportement du mock, pas votre code. Moquez toujours les *dépendances* et laissez le SUT réel.

## Exercice pratique
**Scénario :** Vous devez tester que l' `EmailService` est appelé uniquement quand une demande est approuvée. Quelle méthode Mockito utilisez-vous pour vérifier qu'une méthode a été exécutée ?

**Réponse :** Utilisez `verify(emailService).sendNotification(any());` pour confirmer l'interaction.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
