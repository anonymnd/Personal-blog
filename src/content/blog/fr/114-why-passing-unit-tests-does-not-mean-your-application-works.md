---
title: "Pourquoi des tests unitaires réussis ne signifient pas que votre application fonctionne"
description: "Une analyse de l'écart entre le succès des tests isolés et la fiabilité réelle d'une application."
pubDate: 2026-10-11T09:48:00.000Z
translationKey: 114-why-passing-unit-tests-does-not-mean-your-application-works
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez développé un système d'achat où un manager approuve une demande. Vous avez écrit un test unitaire pour l' `ApprovalService`, et il affiche un voyant vert. Pourtant, dès le déploiement, l'application plante car le nom d'une colonne en base de données ne correspond pas à l'entité. C'est le « paradoxe du test vert » : votre logique est correcte isolément, mais le système échoue lors de l'intégration.

## L'illusion du Mock
Les tests unitaires s'appuient souvent sur Mockito pour simuler des dépendances. Avec `@InjectMocks`, Mockito crée une version fictive de votre repository. Vous configurez la réponse via `when(...).thenReturn(...)`. Cela prouve que votre code Java gère correctement une valeur donnée, mais cela ne prouve pas que la requête SQL réelle fonctionnera. Vous testez vos suppositions, pas l'infrastructure.

## Comportement vs Interaction
Beaucoup de développeurs testent les interactions plutôt que les résultats. Utiliser `verify(repository).save(request)` confirme seulement que la méthode `save` a été appelée. Cela ne confirme pas que la donnée a été persistée ou que le mapping ORM est correct. Un test peut réussir alors que la donnée disparaît à cause d'une annotation `@Transactional` manquante.

## Exemple concret : Le flux d'approbation
Voici un extrait illustrant le test d'une approbation :

```java
@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {
    @Mock
    private RequestRepository repository;
    @InjectMocks
    private ApprovalService service;

    @Test
    void testApproveRequest() {
        PurchaseRequest req = new PurchaseRequest(1L, "Laptop");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        
        service.approve(1L);
        
        verify(repository).save(any());
    }
}
```
Résultat : Le test passe. Mais si l'entité `PurchaseRequest` a une erreur de mapping `@Column`, l'application réelle lancera une `PersistenceException` que ce test ne détectera jamais.

## Erreur courante : Tester les méthodes privées
Certains tentent de tester des méthodes privées pour atteindre 100% de couverture. C'est une erreur. Cela rend les tests fragiles ; si vous renommez une méthode interne, vos tests échouent même si la fonctionnalité marche toujours. Testez plutôt le comportement observable de l'API publique.

## Exercice pratique
Scénario : Vous avez un test qui mock un `BuyerService` pour retourner un objet `Success`. Le test réussit, mais en production, le service retourne `null`, provoquant une `NullPointerException`.

Question : Que manque-t-il à la suite de tests ?
Réponse : Un cas de test pour le chemin exceptionnel (gestion du null) et un test d'intégration avec une instance réelle du service.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
