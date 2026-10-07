---
title: "Déboguer les pannes Java par la preuve, pas par essais-erreurs"
description: "Une approche systématique pour tracer les exceptions Java depuis les logs jusqu'à la cause racine via un échec d'importation de factures lié au fuseau horaire."
pubDate: 2026-10-08T08:48:00.000Z
translationKey: 182-how-to-read-a-maven-error
seriesOrder: 41
locale: fr
tags: ["maven-debugging","learning-series"]
draft: false
---

## La Hiérarchie des Échecs

Avant d'analyser les logs, il faut distinguer où l'échec se produit. Une erreur de classification conduit à perdre des heures à chercher au mauvais endroit.

*   **Erreurs de Compilation :** Elles surviennent lors de la phase `mvn compile`. Le compilateur Java (javac) ne peut pas traduire le code source en bytecode. Ce sont des problèmes structurels (syntaxe, imports manquants, types incompatibles). Elles empêchent l'application de démarrer.
*   **Erreurs d'Exécution (Runtime) :** Elles surviennent pendant que la JVM exécute le bytecode. Elles se manifestent par des `Exceptions` ou des `Errors`. Le code est syntaxiquement correct, mais la logique rencontre un état impossible (ex: `NullPointerException`).
*   **Échecs de Tests :** Ce sont des divergences logiques. Le code s'exécute sans planter, mais une assertion échoue (ex: `assertEquals(expected, actual)`). Le système "fonctionne" pour la JVM, mais est "faux" pour le métier.

## Anatomie d'une Stack Trace Java

Lors d'un échec runtime, la JVM produit une stack trace. La lire linéairement du haut vers le bas est souvent trompeur car les wrappers de frameworks (Spring, Hibernate) cachent la cause réelle.

### La Chaîne "Caused By"
Les frameworks Java encapsulent les exceptions. Vous verrez une `ServletException` causée par une `RuntimeException`, elle-même causée par une `DataAccessException`, et enfin par une `SQLException`.

**La Règle d'Or :** Descendez jusqu'à la *dernière* section `Caused by`. C'est généralement la cause racine. Une fois l'exception racine trouvée, cherchez la première ligne qui référence votre propre package (ex: `com.myapp.service`). C'est la ligne exacte qui a déclenché la panne.

## Scénario Pratique : Le Bug du Fuseau Horaire

Prenez un importateur de factures hypothétique dont le contrat exige un timestamp non ambigu. Le 2023-10-29 à 02:30 Europe/Brussels possède deux offsets valides. N’inventez pas une erreur de parsing : LocalDateTime n’a pas de zone et atZone choisit normalement un offset lors d’un chevauchement. Une panne réelle exige des preuves sur la validation ou conversion de l’application.

Ce reproducer rend la politique explicite : il accepte seulement une heure locale avec exactement un offset valide, rejetant trous et chevauchements :

```java
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class TimezoneReproducer {
    static Instant requireUnambiguous(String input, ZoneId zone) {
        LocalDateTime local = LocalDateTime.parse(input,
            DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm"));
        List<ZoneOffset> offsets = zone.getRules().getValidOffsets(local);
        if (offsets.size() != 1) {
            throw new IllegalArgumentException("Explicit offset required");
        }
        return local.toInstant(offsets.get(0));
    }
    public static void main(String[] args) {
        ZoneId zone = ZoneId.of("Europe/Brussels");
        System.out.println(requireUnambiguous("2023-10-28 02:30", zone));
        System.out.println(requireUnambiguous("2023-10-29 02:30", zone));
    }
}
```

Le premier appel réussit ; le second lève notre IllegalArgumentException parce que la liste a deux offsets. Inspectez-les au debugger et comparez la même date en UTC. L’expérience teste notre politique, pas un prétendu bug du parseur Java.

Clarifiez l’exigence avant de corriger : offset explicite ou choix documenté du premier/dernier offset. Conservez le contexte utile sans données sensibles. Le test corrigé doit vérifier l’instant choisi et les dates ordinaires, pas simplement l’absence d’exception.
## Bonnes Pratiques de Diagnostic

1.  **Pas de Modifs Aléatoires :** Ne changez jamais une ligne de code parce que "ça pourrait marcher". Si vous ne pouvez pas expliquer *pourquoi* le changement fonctionne via la stack trace, vous créez de la dette technique.
2.  **Sanitisation des Logs :** Lors du partage de logs, supprimez les secrets (clés API, mots de passe, données personnelles). Une stack trace est une carte de votre code ; elle n'a pas besoin du mot de passe DB pour être utile.
3.  **Réduction (Narrowing) :** Si un processus échoue pour 1 000 enregistrements, trouvez le *premier* qui échoue. Isolez cette donnée. Si un seul échoue, c'est un problème de donnée/logique ; si tous échouent, c'est un problème de config/infrastructure.

## Exercice

**Scénario :** Vous voyez ceci dans vos logs :
`Caused by: java.lang.NullPointerException: Cannot invoke "com.myapp.User.getName()" for null`
`at com.myapp.InvoiceService.generateInvoice(InvoiceService.java:115)`

**Question :**
1. Est-ce une erreur de compilation ou d'exécution ?
2. Quelle est la cause la plus probable à la ligne 115 ?
3. Quelle est la première étape pour déboguer sans changer le code ?

**Réponse :**
1. Erreur d'exécution (NPE survient pendant l'exécution).
2. L'objet `User` appelé est null. Le code ressemble probablement à `user.getName()`, mais `user` n'a pas été trouvé en base ou a été passé comme null.
3. Identifier l'ID de la facture traitée au moment du crash et vérifier en base de données si l'utilisateur associé existe.

## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
