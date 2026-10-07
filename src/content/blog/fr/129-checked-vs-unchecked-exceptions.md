---
title: "Exceptions Vérifiées et Non Vérifiées : Exprimer les Contrats de Gestion"
description: "Analyse approfondie des hiérarchies d'exceptions Java pour distinguer les échecs métier récupérables des erreurs de programmation via un outil d'importation."
pubDate: 2026-10-07T20:48:00.000Z
translationKey: 129-checked-vs-unchecked-exceptions
seriesOrder: 29
locale: fr
tags: ["java-fundamentals","learning-series"]
draft: false
---

## La Hiérarchie des Exceptions comme Contrat

RuntimeException est une sous-classe d’Exception. Les exceptions vérifiées excluent RuntimeException et ses sous-classes ; le compilateur impose de capturer ou déclarer celles qui peuvent sortir d’une méthode. RuntimeException et les sous-classes d’Error sont non vérifiées.

Cette distinction définit une obligation du compilateur, pas la possibilité de récupération. Une erreur métier peut être non vérifiée ; une exception vérifiée peut être impossible à réparer localement. Choisissez explicitement contrat et frontière de récupération. Les Error indiquent généralement des situations graves ; évitez de les masquer.
## Scénario : L'Outil d'Importation de Données

Imaginons un outil qui importe des données métier depuis un fichier. Nous rencontrons trois types d'échecs :
1. **Fichier d'entrée manquant** : Le fichier n'est pas à l'endroit prévu. C'est un problème environnemental externe que l'utilisateur peut corriger. C'est une **Exception Vérifiée**.
2. **Lignes métier malformées** : Le fichier existe, mais une ligne contient du texte là où un nombre est attendu. C'est un échec de validation métier. C'est une **Exception Vérifiée**.
3. **Null Pointer dans le parseur** : Un développeur a oublié d'initialiser un objet utilitaire. C'est un bug. C'est une **Exception Non Vérifiée**.

## Implémentation Concrète

Voici comment modéliser ces contrats pour s'assurer que l'appelant sait exactement quoi gérer.

```java
import java.io.*;
import java.util.*;

// Vérifiée : L'appelant DOIT décider comment informer l'utilisateur que le fichier manque
class ImportFileNotFoundException extends Exception {
    public ImportFileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Vérifiée : L'appelant DOIT décider s'il ignore la ligne ou arrête tout l'import
class MalformedRowException extends Exception {
    private final int rowNumber;
    public MalformedRowException(String message, int rowNumber) {
        super(message);
        this.rowNumber = rowNumber;
    }
    public int getRowNumber() { return rowNumber; }
}

class DataImporter {
    public void importData(String path) throws ImportFileNotFoundException, MalformedRowException {
        File file = new File(path);
        if (!file.exists()) {
            // Préserver la cause en passant le contexte original
            throw new ImportFileNotFoundException("Fichier cible manquant : " + path, null);
        }

        // Logique de parsing illustrative
        List<String> rows = List.of("ValidRow", "BadRow", "ValidRow");
        for (int i = 0; i < rows.size(); i++) {
            String row = rows.get(i);
            if ("BadRow".equals(row)) {
                throw new MalformedRowException("Format de données invalide", i + 1);
            }
            // RuntimeException potentielle ici si un helper était null
            // helper.process(row); 
        }
    }
}

public class ImportRunner {
    public static void main(String[] args) {
        DataImporter importer = new DataImporter();
        try {
            importer.importData("data.csv");
        } catch (ImportFileNotFoundException e) {
            System.err.println("Veuillez vérifier le chemin du fichier : " + e.getMessage());
        } catch (MalformedRowException e) {
            System.err.println("Erreur à la ligne " + e.getRowNumber() + ": " + e.getMessage());
        } 
        // Les RuntimeExceptions (comme NullPointerException) ne sont pas capturées ici
        // car elles doivent être corrigées dans le code de DataImporter.
    }
}
```

## Analyse du Mécanisme

### Préservation des Causes
Dans le constructeur de `ImportFileNotFoundException`, nous acceptons un `Throwable cause`. C'est crucial. Si une `java.io.IOException` a déclenché notre exception personnalisée, passer cet argument à `super(message, cause)` garantit que la trace d'pile originale est préservée. Sans cela, on perd l'origine réelle de la panne.

### Le Sophisme de la Récupérabilité
Une erreur courante est de supposer que les exceptions vérifiées *garantissent* la possibilité de récupération. C'est faux. Elles garantissent seulement la *visibilité*. Une `MalformedRowException` est vérifiée, mais la seule "récupération" possible est peut-être de logger l'erreur et d'arrêter le programme. La distinction porte sur le **contrat de l'API**, pas sur la possibilité technique d'un correctif.

### Cas d'Échec
- **Abus d'Exceptions Vérifiées** : Si chaque méthode lance cinq exceptions vérifiées, le code devient saturé de blocs `try-catch`, poussant les développeurs vers le `catch (Exception e) {}` (absorption d'exception), un anti-pattern dangereux.
- **Utilisation du Non Vérifié pour le Métier** : Si `MalformedRowException` était une `RuntimeException`, l' `ImportRunner` pourrait oublier de la gérer, provoquant un crash inattendu de l'application dès l'apparition d'une ligne erronée.

## Exercice

Pour une base indisponible, suivez le contrat de la bibliothèque : JDBC utilise SQLException vérifiée pour de nombreux échecs, tandis que Spring traduit généralement les erreurs de persistance en exceptions non vérifiées. Une panne temporaire peut être réessayable même avec RuntimeException. Une erreur de syntaxe peut arriver sous forme de SQLException vérifiée tout en nécessitant une correction du code.

Décidez des retries d’après la panne réelle, la sécurité de l’opération et la politique, pas d’après l’héritage checked/unchecked. Conservez la cause et limitez les tentatives ; ne réessayez pas indéfiniment une erreur de syntaxe déterministe.

## Pour approfondir

- [Java records](https://dev.java/learn/records/)
