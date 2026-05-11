---
title: "Qu'est-ce qu'un Test Unitaire ?"
description: "Un guide pour débutants pour comprendre la plus petite unité de test logiciel avec JUnit et Mockito."
pubDate: 2026-10-10T22:48:00.000Z
translationKey: 103-what-is-a-unit-test
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez construit un système d'achat complexe où un demandeur soumet une demande d'achat. Vous voulez vous assurer que la logique qui calcule le coût total est correcte, mais vous ne voulez pas démarrer toute la base de données, la couche de sécurité ou le serveur web juste pour vérifier une simple addition. C'est là que le test unitaire devient essentiel.

## Le Concept Fondamental
Un test unitaire se concentre sur la plus petite pièce testable d'un logiciel, généralement une seule méthode dans une classe. L'objectif est d'isoler cette "unité" de ses dépendances. Si votre service dépend d'un dépôt de base de données, vous n'utilisez pas de vraie base de données ; vous utilisez un "mock" pour simuler le comportement du dépôt. Cela garantit que si le test échoue, le bug se trouve dans votre logique, et non dans le réseau ou la configuration de la base de données.

## La Boîte à Outils : JUnit et Mockito
Dans l'écosystème Java, JUnit est le framework qui exécute les tests et vérifie les résultats. Mockito est une bibliothèque utilisée pour créer des mocks. Bien que `@InjectMocks` aide à instancier votre service et à injecter ces mocks, il est important de se rappeler qu'il ne s'agit pas de l'injection de dépendances Spring ; il ne démarre pas le contexte Spring, ce qui rend les tests extrêmement rapides.

## Exemple Concret : Approbation de Demande
Considérons un `RequestService` qui approuve une demande uniquement si le montant est inférieur à 1000 $.

```java
@ExtendWith(MockitoExtension.class)
class RequestServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private RequestService service;

    @Test
    void testApproveRequest_UnderLimit_ReturnsTrue() {
        Request req = new Request(100, "Souris Laptop");
        // Configuration de la réponse simulée
        when(repository.findById(1L)).thenReturn(Optional.of(req));

        boolean result = service.approve(1L);

        assertTrue(result);
        verify(repository).save(any());
    }
}
```
Dans cet exemple, `when(...).thenReturn(...)` indique à Mockito comment se comporter. La méthode `verify` vérifie si la méthode save du dépôt a été appelée, confirmant l'interaction sans écrire réellement sur le disque.

## Erreur Courante : Tester les Méthodes Privées
Les débutants essaient souvent d'utiliser la réflexion pour tester des méthodes privées. C'est une erreur car cela lie vos tests à l'implémentation interne. Testez plutôt la méthode publique qui appelle la méthode privée. Si le comportement public est correct, la logique privée est implicitement validée.

## Exercice Pratique
**Scénario :** Écrivez un cas de test pour une méthode `rejectRequest(Long id)` qui doit lancer une `RequestNotFoundException` si le dépôt retourne un Optional vide.

**Vérification :** Vous devriez utiliser `when(repository.findById(id)).thenReturn(Optional.empty())` et entourer l'appel du service avec `assertThrows(RequestNotFoundException.class, () -> ...)`.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
