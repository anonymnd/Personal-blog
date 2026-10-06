---
title: "Qu'est-ce qu'un Mock ?"
description: "Apprenez à isoler votre code lors des tests en simulant des dépendances complexes avec Mockito."
pubDate: 2026-10-10T23:48:00.000Z
translationKey: 104-what-is-a-mock
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous testiez un service d'achat où un demandeur soumet une requête. Pour vérifier la logique, votre code doit appeler un dépôt de base de données et une API d'email externe. Si le serveur d'email est en panne ou que la base de données est vide, votre test échoue—non pas parce que votre logique est fausse, mais parce que les systèmes externes sont instables. C'est là qu'intervient le mock.

## Le Concept du Mocking
Un mock est un objet simulé qui imite le comportement d'une dépendance réelle. Au lieu d'utiliser un `OrderRepository` réel connecté à une base SQL, vous créez une version 'factice'. Vous indiquez à cet objet exactement quoi retourner lorsqu'une méthode spécifique est appelée. Cela isole l'unité de test, garantissant que vous testez votre logique métier et non le réseau.

## Implémentation avec Mockito
En Java, Mockito est la bibliothèque de référence. On utilise `@Mock` pour créer la dépendance simulée et `@InjectMocks` pour injecter ces mocks dans le service testé. Attention, `@InjectMocks` est une fonctionnalité de Mockito et non l'injection de dépendances de Spring ; elle ne démarre pas le contexte de l'application, ce qui rend les tests très rapides.

## Exemple Concret : Approbation d'Achat
Voici comment mocker un dépôt pour tester si un manager peut approuver une demande :

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        Request mockReq = new Request(1L, "Laptop");
        // Configuration de la réponse simulée
        when(repository.findById(1L)).thenReturn(Optional.of(mockReq));

        service.approve(1L);

        // Vérification de l'interaction
        verify(repository).save(any(Request.class));
    }
}
```
Ici, `when(...).thenReturn(...)` définit le comportement, et `verify(...)` s'assure que le service a bien tenté de sauvegarder la requête approuvée.

## Erreur Courante : Tester le Mock
Une erreur fréquente consiste à écrire des tests qui vérifient uniquement la configuration du mock. Par exemple, tester que `repository.findById` retourne une valeur revient à tester Mockito, pas votre code. Concentrez-vous sur le comportement observable du service—comme le changement de statut de 'PENDING' à 'APPROVED'.

## Exercice Pratique
Si vous voulez tester une méthode qui lance une `UserNotFoundException` quand l'ID d'un demandeur n'existe pas, comment devez-vous configurer le mock du dépôt ?

**Réponse :** Utilisez `when(repository.findById(id)).thenThrow(new UserNotFoundException());` pour simuler le chemin d'exception.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
