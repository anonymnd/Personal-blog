---
title: "Comment tester une méthode UPDATE"
description: "Apprenez à vérifier que votre couche service gère correctement les mises à jour de données avec JUnit et Mockito sans base de données réelle."
pubDate: 2026-10-11T05:48:00.000Z
translationKey: 110-how-to-test-an-update-method
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Vous avez une méthode pour modifier le statut d'une demande d'achat de 'PENDING' à 'APPROVED'. Le problème est que vous ne voulez pas vous connecter à une vraie base de données à chaque test, car cela serait lent et instable. Vous devez plutôt vérifier que votre logique métier appelle correctement le repository.

## La logique du test de mise à jour
Tester une méthode de mise à jour ne consiste pas à vérifier si une ligne a changé en SQL, mais à valider l'interaction entre le service et le repository. Il faut s'assurer que le service trouve l'entité existante, modifie les champs spécifiques, puis l'enregistre.

## Configuration de l'environnement de Mock
Avec JUnit et Mockito, on utilise `@InjectMocks` pour créer le service et `@Mock` pour le repository. Attention, `@InjectMocks` n'est pas l'injection de dépendances de Spring ; il injecte simplement les mocks manuellement dans l'objet.

## Exemple concret : Approbation d'une demande
Voici un exemple illustrant le test d'un `PurchaseRequestService` :

```java
@ExtendWith(MockitoExtension.class)
class PurchaseRequestServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private PurchaseRequestService service;

    @Test
    void testApproveRequest_Success() {
        // Arrange
        Long id = 1L;
        PurchaseRequest request = new PurchaseRequest(id, "Laptop", "PENDING");
        when(repository.findById(id)).thenReturn(Optional.of(request));

        // Act
        service.approveRequest(id);

        // Assert
        assertEquals("APPROVED", request.getStatus());
        verify(repository).save(request);
    }
}
```
Ici, `when` simule la récupération de la demande, et `verify` confirme que la méthode `save` a bien été exécutée.

## Erreur courante : Tester le Mock
Une erreur fréquente est d'utiliser `verify` pour vérifier si les données ont été réellement persistées. Mockito suit uniquement les appels de méthodes. Pour tester le SQL réel ou les mappings ORM, il faudrait utiliser `@DataJpaTest` avec une base H2.

## Exercice pratique
**Scénario :** Écrivez un cas de test pour une méthode `updateQuantity(Long id, int newQty)` qui doit lever une `ResourceNotFoundException` si l'ID n'existe pas.

**Vérification :** Votre test doit utiliser `when(repository.findById(id)).thenReturn(Optional.empty())` et entourer l'appel du service par `assertThrows(ResourceNotFoundException.class, () -> ...)`.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
