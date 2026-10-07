---
title: "Utiliser Optional comme Contrat d'Absence Clair"
description: "Apprenez à utiliser Optional pour signaler l'absence potentielle de valeur et gérer les replis coûteux via l'évaluation paresseuse."
pubDate: 2026-10-07T19:48:00.000Z
translationKey: 128-optional-explained-without-overcomplicating-it
seriesOrder: 28
locale: fr
tags: ["java-fundamentals","learning-series"]
draft: false
---

## Le Contrat d'Absence

En Java, retourner `null` est un signal ambigu. Cela force l'appelant à deviner si la valeur nulle est un résultat légitime, une erreur ou un état non initialisé. `java.util.Optional<T>` transforme cette ambiguïté en un contrat au niveau du type. Lorsqu'une méthode retourne un `Optional`, elle indique explicitement au développeur : "Cette valeur peut être absente ; vous devez décider comment gérer cette absence avant d'accéder aux données."

## Le Danger de l'Accès Aveugle

L'utilisation de `Optional.get()` sans vérification préalable via `isPresent()` revient pratiquement à déréférencer un pointeur nul, mais avec une exception différente (`NoSuchElementException`). Cela annule l'intérêt du type. L'objectif est de passer d'une "vérification de nullité" à la "définition d'un pipeline pour la valeur".

## Replis : Eager vs Lazy

L'une des distinctions les plus critiques de l'API `Optional` se trouve entre `orElse()` et `orElseGet()`.

- `orElse(T other)` : L'argument est évalué de manière **impatiente (eager)**. Même si l'Optional contient une valeur, l'expression à l'intérieur de `orElse()` est exécutée.
- `orElseGet(Supplier<? extends T> other)` : L'argument est évalué de manière **paresseuse (lazy)**. La fonction supplier n'est invoquée que si l'Optional est vide.

Dans les scénarios impliquant des opérations coûteuses — comme une recherche en base de données ou un appel API distant — l'utilisation de `orElse()` peut entraîner une dégradation significative des performances car le repli est calculé à chaque fois.

## Exemple Concret : Recherche d'Édition de Catalogue

Imaginons un catalogue de livres où nous cherchons d'abord une "Édition Préférée" (ex: version numérique). Si elle est absente, nous effectuons une recherche coûteuse pour toute édition physique disponible.

```java
import java.util.Optional;
import java.util.logging.Logger;

public class CatalogService {
    private static final Logger logger = Logger.getLogger(CatalogService.class.getName());

    public record BookEdition(String isbn, String format) {}

    // Simulation d'un findById qui retourne un Optional
    public Optional<BookEdition> findPreferredEdition(String bookId) {
        return Optional.empty(); 
    }

    public BookEdition findAnyEditionExpensive(String bookId) {
        logger.info("Exécution de la recherche coûteuse pour : " + bookId);
        return new BookEdition("123-456", "Relié");
    }

    public BookEdition getEdition(String bookId) {
        return findPreferredEdition(bookId)
            // Transformer la valeur si présente
            .map(edition -> {
                logger.info("Édition préférée trouvée !");
                return edition;
            })
            // Repli paresseux : findAnyEditionExpensive n'est appelé QUE si preferred est vide
            .orElseGet(() -> findAnyEditionExpensive(bookId));
    }

    public void processEdition(String bookId) {
        // Utilisation de orElseThrow pour signaler un échec métier
        BookEdition edition = findPreferredEdition(bookId)
            .orElseThrow(() -> new RuntimeException("Aucune édition disponible pour " + bookId));
    }
}
```

### Analyse de l'Exécution
1. **Le Pipeline** : `findPreferredEdition` retourne un `Optional.empty()`.
2. **Le Map** : Le bloc `.map()` est totalement ignoré car l'Optional est vide.
3. **Le Repli** : `orElseGet()` déclenche le `Supplier`. Le log "Exécution de la recherche coûteuse" apparaît exactement une fois.
4. **Cas d'Échec** : Si nous avions utilisé `.orElse(findAnyEditionExpensive(bookId))`, la méthode coûteuse s'exécuterait à chaque fois, peu importe l'existence d'une édition préférée.

## Chaînage Fonctionnel avec flatMap

Alors que `map` transforme la valeur à l'intérieur de l'Optional, `flatMap` est utilisé lorsque la fonction de transformation retourne elle-même un `Optional`. Cela évite la création d'un `Optional<Optional<T>>` imbriqué.

## Exercice

**Scénario** : Vous avez un record `User`. Un `User` peut avoir un `Optional<Profile>`, et un `Profile` peut avoir un `Optional<Address>`. Écrivez une méthode qui récupère l' `Address` d'un `User`, en retournant un Optional vide si une étape de la chaîne est manquante, et en levant une `CustomException` si le résultat final est vide.

**Réponse**:
```java
public Optional<Address> getAddress(User user) {
    return user.getProfile() // retourne Optional<Profile>
              .flatMap(Profile::getAddress); // retourne Optional<Address>
}

// Utilisation
Address addr = getAddress(user)
    .orElseThrow(CustomException::new);
```

## Pour approfondir

- [Java records](https://dev.java/learn/records/)
