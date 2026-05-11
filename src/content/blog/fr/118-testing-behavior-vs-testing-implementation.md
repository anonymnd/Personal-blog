---
title: "Tester le Comportement vs Tester l'Implémentation"
description: "Apprenez à écrire des tests résilients en vous concentrant sur le résultat plutôt que sur la méthode interne."
pubDate: 2026-10-11T13:48:00.000Z
translationKey: 118-testing-behavior-vs-testing-implementation
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez passé des heures à écrire un test parfait pour un service d'achat. Une semaine plus tard, vous modifiez une méthode privée pour améliorer les performances sans changer le résultat final, mais soudainement, dix tests échouent. C'est le piège du "test fragile", causé par le test des détails d'implémentation au lieu du comportement observable.

## La Distinction Fondamentale
Tester l'implémentation consiste à vérifier *comment* un résultat est obtenu—par exemple, vérifier si une méthode privée spécifique a été appelée. Tester le comportement consiste à vérifier *ce que* le résultat est—comme confirmer qu'une demande d'achat a bien été soumise au manager, peu importe la logique interne utilisée pour l'acheminer.

## Exemple Orienté Comportement
Considérons un `ProcurementService` où un demandeur soumet une requête. Nous voulons nous assurer que la requête est enregistrée et que le manager est notifié.

```java
@ExtendWith(MockitoExtension.class)
class ProcurementServiceTest {
    @Mock
    private RequestRepository repository;
    @Mock
    private NotificationService notificationService;
    @InjectMocks
    private ProcurementService service;

    @Test
    void shouldSubmitRequestForApproval() {
        Request req = new Request("Laptop", 1200.0);
        when(repository.save(any())).thenReturn(req);

        service.submitRequest(req);

        // Test du comportement : Le résultat attendu a-t-il eu lieu ?
        verify(repository).save(req);
        verify(notificationService).notifyManager(any());
    }
}
```
Ici, nous ne nous soucions pas de savoir si le service utilise une boucle `for` ou un `stream` ; nous vérifions seulement que le repository a sauvegardé les données et que le manager a été prévenu.

## L'Erreur Courante : Le Sur-Mocking Interne
Une erreur fréquente est d'utiliser Mockito pour vérifier des appels à des méthodes d'aide internes ou de tenter de tester des méthodes privées via la réflexion. Si vous changez le nom d'une méthode privée, votre test échoue même si la logique métier est toujours correcte.

**Correction :** Vérifiez uniquement les interactions avec les dépendances externes (comme `RequestRepository`) ou contrôlez la valeur de retour finale de la méthode publique.

## Tableau Comparatif
| Aspect | Test d'Implémentation | Test de Comportement |
| :--- | :--- | :--- |
| Focus | Logique interne/Méthodes privées | API Publique/Résultats |
| Refactorisation | Les tests cassent souvent | Les tests restent stables |
| Objectif | "A-t-il appelé la méthode X ?" | "L'utilisateur a-t-il le résultat ?" |

## Exercice Pratique
Vous avez une méthode `calculateTotal()` qui additionne des articles et applique une remise. Vous avez écrit un test qui vérifie si une méthode privée `applyTax()` a été appelée exactement une fois. S'agit-il d'un test de comportement ou d'implémentation ?

**Réponse :** C'est un test d'implémentation. Pour tester le comportement, vous devriez simplement affirmer que le total final retourné est la valeur numérique correcte.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
