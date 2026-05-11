---
title: "Pourquoi faut-il tester la couche Service ?"
description: "Comprendre le rôle critique des tests de la couche service pour isoler la logique métier des dépendances d'infrastructure."
pubDate: 2026-10-10T20:48:00.000Z
translationKey: 101-why-should-you-test-the-service-layer
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête. La logique est complexe : le système doit vérifier le budget, s'assurer que l'article n'est pas restreint, puis notifier le manager. Si vous testez uniquement le Contrôleur (API) ou le Repository (Base de données), vous créez un 'vide de test' où les règles métier—le cœur de votre application—ne sont jamais vérifiées.

## Le rôle de la couche Service
La couche service agit comme un orchestrateur. Alors que le Contrôleur gère les requêtes HTTP et le Repository gère le SQL, la couche Service décide de *ce qui* se passe. Tester cette couche permet de vérifier les règles métier sans avoir besoin d'une base de données active ou d'un serveur web, rendant les tests beaucoup plus rapides.

## Isoler la logique avec Mockito
Pour tester le service de manière isolée, on utilise Mockito. Au lieu de se connecter à une vraie base de données, on 'moque' le repository. Cela garantit qu'un échec du test est causé par un bug dans la logique métier, et non par un problème de connexion ou une table manquante.

## Exemple concret : Approbation de demande
Voici comment tester la logique qui rejette une demande si le budget est dépassé :

```java
@ExtendWith(MockitoExtension.class)
public class ProcurementServiceTest {
    @Mock
    private BudgetRepository budgetRepo;
    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldRejectRequestWhenBudgetExceeded() {
        // Arrange
        when(budgetRepo.getBalance(101)).thenReturn(50.0);
        
        // Act & Assert
        assertThrows(InsufficientFundsException.class, () -> {
            service.submitRequest(101, 100.0);
        });
    }
}
```
Ici, `when(...).thenReturn(...)` simule la réponse de la base de données. Le test confirme que le service lève bien une exception quand le coût (100) dépasse le solde (50).

## Erreur courante : confondre interaction et résultat complet
Une vérification d'interaction peut être une assertion de comportement valide lorsqu'un effet attendu est un appel à un collaborateur, comme l'envoi d'une notification. Vérifier un appel à save ne prouve cependant ni la justesse des données ni leur commit en base. Vérifiez l'état retourné ou les exceptions lorsque cela convient, et capturez les arguments pour examiner les effets attendus. Utilisez un test d'intégration si le résultat à vérifier est la persistance réelle.
## Exercice pratique
**Scénario :** Une méthode `approveRequest(Long id)` doit appeler `repo.findById(id)` puis `repo.save(request)`. Si la demande est déjà approuvée, elle doit lancer une `IllegalStateException`.

**Question :** Comment testeriez-vous le scénario 'déjà approuvé' ?

**Réponse :** Moquer le repository pour qu'il retourne un objet demande où `isApproved()` est vrai, puis utiliser `assertThrows(IllegalStateException.class, ...)` lors de l'appel au service.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
