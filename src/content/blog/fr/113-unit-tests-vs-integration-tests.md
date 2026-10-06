---
title: "Unit Tests vs Integration Tests"
description: "Un guide clair pour distinguer la vérification de la logique isolée de l'interaction entre les composants du système."
pubDate: 2026-10-11T08:48:00.000Z
translationKey: 113-unit-tests-vs-integration-tests
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez construit un système d'approvisionnement où un manager doit approuver une demande avant qu'un acheteur ne puisse passer commande. Vous avez écrit la logique, mais maintenant vous hésitez : devez-vous tester la méthode d'approbation isolément, ou déclencher tout le flux, de la base de données à l'API ? Cette confusion mène souvent à des suites de tests lentes qui échouent pour les mauvaises raisons.

## Comprendre les Tests Unitaires
Les tests unitaires se concentrent sur la plus petite partie testable du logiciel, généralement une seule méthode. L'objectif est de valider la logique métier sans dépendances externes. Pour cela, on utilise Mockito pour simuler le comportement d'autres classes. Par exemple, si l' `ApprovalService` a besoin d'un `RequestRepository`, on simule le dépôt pour que le test ne touche pas réellement à une base de données.

## Le Rôle des Tests d'Intégration
Les tests d'intégration vérifient que différents modules fonctionnent ensemble. Contrairement aux tests unitaires, ceux-ci démarrent souvent un contexte d'application partiel ou complet (comme Spring Boot) et interagissent avec une base de données réelle H2 en mémoire. Ils garantissent que vos requêtes SQL sont correctes et que les mappages ORM fonctionnent, ce qu'un mock ne peut pas vérifier.

## Exemple Concret : Approbation d'Achat
Considérons un service qui approuve une demande. Voici la différence entre les deux approches :

**Test Unitaire (Isolé) :**
```java
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {
    @Mock RequestRepository repository;
    @InjectMocks ApprovalService service;

    @Test
    void testApproveRequest() {
        Request req = new Request(1L, "Laptop");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        service.approve(1L);
        verify(repository).save(any());
    }
}
```
*Résultat :* Exécution rapide. Valide que la méthode `approve` appelle bien la fonction de sauvegarde.

**Test d'Intégration (Connecté) :**
```java
@SpringBootTest
class ApprovalIntegrationTest {
    @Autowired ApprovalService service;
    @Autowired RequestRepository repository;

    @Test
    void testFullApprovalFlow() {
        repository.save(new Request(1L, "Laptop"));
        service.approve(1L);
        assertEquals("APPROVED", repository.findById(1L).get().getStatus());
    }
}
```
*Résultat :* Exécution plus lente. Valide que la donnée est réellement persistée en base de données.

## Erreur Courante : Tout Simuler
Une erreur fréquente consiste à utiliser `@InjectMocks` en pensant effectuer un test d'intégration. Simuler le repository signifie que vous ne testez pas votre SQL ni vos contraintes de base de données. Si votre syntaxe SQL est erronée, le test unitaire réussira quand même car le mock renvoie simplement ce que vous avez configuré.

## Exercice Pratique
Si vous voulez vérifier que le `BuyerService` calcule correctement la taxe totale d'une commande selon une formule complexe, quel type de test devez-vous utiliser ?

**Réponse :** Un Test Unitaire, car le calcul de la taxe est une logique pure qui ne nécessite ni base de données ni connexion réseau.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
