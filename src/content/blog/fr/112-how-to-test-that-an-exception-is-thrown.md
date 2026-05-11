---
title: "Comment tester qu'une exception est levée"
description: "Apprenez à valider que votre application Java gère correctement les scénarios d'erreur avec assertThrows de JUnit 5."
pubDate: 2026-10-11T07:48:00.000Z
translationKey: 112-how-to-test-that-an-exception-is-thrown
locale: fr
tags: ["software-engineering","backend-testing","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez un système d'achat où un demandeur soumet une demande d'achat. Vous avez une règle métier : une demande ne peut pas être soumise si le montant est négatif. Vous écrivez la logique pour lever une `IllegalArgumentException`, mais comment prouver dans un test que cette exception est réellement déclenchée ? Beaucoup de débutants utilisent à tort des blocs try-catch dans leurs tests, ce qui rend le code verbeux et fragile.

## Le mécanisme assertThrows
JUnit 5 propose la méthode `assertThrows` précisément pour cela. Au lieu de laisser le test planter, `assertThrows` intercepte l'exception. Elle prend deux arguments : la classe de l'exception attendue et une expression lambda contenant le code qui doit provoquer l'erreur. Si le code lève l'exception spécifiée, le test réussit ; sinon, il échoue.

## Exemple concret : Validation d'achat
Considérons un `RequestService` qui valide le montant d'une demande d'achat avant de la traiter.

```java
public class RequestService {
    public void submitRequest(double amount) {
        if (amount < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        // Logique de soumission
    }
}
```

Pour tester cela, nous utilisons `assertThrows` pour s'assurer que le montant négatif déclenche l'exception :

```java
@Test
void shouldThrowExceptionWhenAmountIsNegative() {
    RequestService service = new RequestService();
    
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
        service.submitRequest(-100.0);
    });
    
    assertEquals("Amount cannot be negative", exception.getMessage());
}
```
Ici, le test confirme que la logique bloque les données invalides et renvoie le bon message d'erreur.

## Erreur courante : Le Catch générique
Une erreur fréquente consiste à entourer l'appel d'un try-catch et d'appeler `fail()` à la fin. C'est une approche obsolète qui rend le test difficile à lire.

**Incorrect :**
```java
try {
    service.submitRequest(-1);
    fail("Should have thrown exception");
} catch (IllegalArgumentException e) {
    // pass
}
```
**Correction :** Utilisez `assertThrows`. C'est plus concis et cela indique explicitement que l'exception est le résultat attendu.

## Exercice pratique
Créez une méthode `approveRequest(Request req)` qui lève une `NullPointerException` si l'objet request est null. Écrivez un test JUnit 5 pour vérifier ce comportement.

**Vérification :** Votre test doit utiliser `assertThrows(NullPointerException.class, () -> service.approveRequest(null));`.


## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
