---
title: "Que faut-il tester dans une fonctionnalité CRUD ?"
description: "Un guide pour identifier les cas de test critiques pour les opérations de création, lecture, mise à jour et suppression avec JUnit et Mockito."
pubDate: 2026-10-11T10:48:00.000Z
translationKey: 115-what-should-you-test-in-a-crud-feature
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs commencent par vérifier simplement si un enregistrement est sauvegardé, mais ils oublient souvent les points de défaillance invisibles. Par exemple, que se passe-t-il si un utilisateur tente de modifier une demande d'achat inexistante ou soumet un prix négatif ? Tester uniquement le 'chemin heureux' expose l'application à des plantages en production.

## La Matrice de Test CRUD
Pour tester un CRUD, il faut valider le résultat positif et les modes d'échec. Dans une application d'achats, cela signifie tester la capacité du demandeur à soumettre une requête et celle du manager à l'approuver.

| Opération | Chemin Heureux | Cas Limite / Échec |
| :--- | :--- | :--- |
| Créer | Données valides sauvegardées | Doublon ou champs nulls |
| Lire | Enregistrement trouvé par ID | ID inexistant (scénario 404) |
| Modifier | Champs modifiés correctement | Modification d'un statut lecture seule |
| Supprimer | Enregistrement supprimé | Suppression d'un élément déjà absent |

## Implémentation des Tests de Service avec Mockito
Pour tester la logique métier sans lancer une base de données lourde, on utilise Mockito. L'annotation `@InjectMocks` instancie le service et y injecte le repository simulé.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;

    @InjectMocks
    private ProcurementService service;

    @Test
    void testCreateRequest_Success() {
        Request req = new Request("Laptop", 1200.0);
        when(repository.save(any())).thenReturn(req);
        
        Request result = service.createRequest(req);
        
        assertNotNull(result);
        verify(repository).save(req);
    }
}
```

## Gérer le Scénario 'Non Trouvé'
Une erreur fréquente est d'oublier de tester le chemin d'exception. Si `repository.findById()` retourne un Optional vide, votre service doit lever une exception personnalisée et non une `NullPointerException`.

**Erreur :** Tester `findById` uniquement avec un ID valide.
**Correction :** Utiliser `when(repository.findById(id)).thenReturn(Optional.empty())` et vérifier que le service lève une `ResourceNotFoundException`.

## Tester les Transitions d'État
Dans un flux d'achat, une demande ne peut pas passer de 'Brouillon' à 'Commandé' sans être 'Approuvée'. Vos tests doivent vérifier que le service rejette les transitions d'état invalides, garantissant que les règles métier sont appliquées avant l'écriture en base.

## Exercice Pratique
**Scénario :** Écrivez un cas de test pour la méthode `deleteRequest`. Que doit-il se passer si l'ID fourni n'existe pas dans la base de données ?

**Réponse :** Vous devez simuler le repository pour qu'il retourne un Optional vide pour cet ID, puis utiliser `assertThrows` pour vérifier que le service lève une exception spécifique (ex: `RequestNotFoundException`) au lieu de terminer sans erreur.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
