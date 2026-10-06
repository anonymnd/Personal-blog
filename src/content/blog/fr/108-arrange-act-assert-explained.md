---
title: "Arrange, Act, Assert Explained"
description: "Un guide sur la structuration des tests unitaires via le modèle AAA pour améliorer la lisibilité et la maintenance."
pubDate: 2026-10-11T03:48:00.000Z
translationKey: 108-arrange-act-assert-explained
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs commencent à écrire des tests en mélangeant la logique de configuration et les assertions, ce qui crée des 'tests spaghetti' où l'on ne sait plus exactement ce qui est vérifié. Lorsqu'un test échoue, on passe plus de temps à déchiffrer le code du test qu'à corriger le bug. Le modèle Arrange, Act, Assert (AAA) résout ce problème en imposant une structure linéaire claire.

## Les trois piliers du AAA

**Arrange** (Organiser) est la première phase. Ici, vous préparez les objets, les mocks et les données nécessaires. Cela inclut l'instanciation de la classe à tester et la configuration des réponses simulées avec `when()` de Mockito.

**Act** (Agir) est la phase d'exécution. Vous appelez la méthode spécifique que vous souhaitez tester. Cette section doit idéalement tenir sur une seule ligne de code pour garder un focus précis.

**Assert** (Vérifier) est la phase de validation. Vous vérifiez si le résultat obtenu correspond au résultat attendu via les assertions JUnit ou `verify()` de Mockito pour confirmer qu'une interaction a bien eu lieu.

## Exemple concret : Approbation d'achat

Imaginons une application de procurement où un manager approuve une demande. Nous voulons tester que le statut passe à 'APPROVED'.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private ProcurementService service;

    @Test
    void testApproveRequest() {
        // Arrange
        Request request = new Request(1L, "Laptop", "PENDING");
        when(repository.findById(1L)).thenReturn(Optional.of(request));

        // Act
        service.approve(1L);

        // Assert
        assertEquals("APPROVED", request.getStatus());
        verify(repository).save(request);
    }
}
```

## Erreur courante : La boucle mixte

Une erreur fréquente consiste à alterner 'Act' et 'Assert' plusieurs fois dans un seul test. Par exemple, appeler une méthode, vérifier, puis appeler une autre méthode sur le même objet et vérifier à nouveau. Cela rend l'isolation des pannes difficile. La correction consiste à diviser ces étapes en plusieurs méthodes de test distinctes.

## Exercice pratique

**Scénario :** Écrivez un test pour une méthode `reject()` qui doit changer le statut en 'REJECTED'.

**Vérification :** Avez-vous placé l'appel `when()` dans Arrange, l'appel `service.reject()` dans Act, et le `assertEquals` dans Assert ? Si oui, votre structure est correcte.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
