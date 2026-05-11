---
title: "Checked vs Unchecked Exceptions"
description: "Apprenez à choisir entre les exceptions vérifiées et non vérifiées pour créer des applications Java plus robustes."
pubDate: 2026-10-12T00:48:00.000Z
translationKey: 129-checked-vs-unchecked-exceptions
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête. Vous écrivez une méthode pour sauvegarder cette requête dans un fichier. Soudain, le compilateur vous oblige à entourer votre code d'un bloc try-catch ou à ajouter une clause 'throws', même si vous savez que le fichier existe. C'est là tout l'enjeu entre les exceptions checked et unchecked.

## Ce que signifie checked
Une exception checked appartient à la branche Exception sans être une RuntimeException. Lors d'un appel susceptible de la lever, Java exige de la capturer ou de la déclarer dans throws. Cette vérification concerne une obligation d'API à la compilation, pas la probabilité de l'échec ni sa possibilité de récupération. IOException en est un exemple. Déclarer throws propage l'obligation : cela ne traite pas l'échec et ne décide pas du message à afficher.
## Unchecked ne signifie pas irrécupérable
Les sous-types de RuntimeException et d'Error sont unchecked : le compilateur n'impose ni catch ni throws. NullPointerException signale souvent un défaut de programmation, mais un refus métier ou un échec temporaire d'infrastructure peut aussi être représenté par une RuntimeException. L'application peut les traiter à une frontière adaptée. Error représente généralement des problèmes graves du runtime que le code métier ne doit pas tenter de masquer globalement. Récupération et classification sont des questions de conception distinctes.
## Exemple : un choix explicite d'API
Ce service illustratif choisit une exception checked pour une infrastructure indisponible et une exception unchecked pour un argument invalide. D'autres API peuvent utiliser des exceptions unchecked pour l'infrastructure : Java n'impose pas la signification métier.

```java
class ServiceUnavailableException extends Exception {
    ServiceUnavailableException(String message) { super(message); }
}

class ApprovalService {
    void approve(long requestId, boolean available)
            throws ServiceUnavailableException {
        if (!available) {
            throw new ServiceUnavailableException("Service unavailable");
        }
        if (requestId <= 0) {
            throw new IllegalArgumentException("Invalid request ID");
        }
    }
}
```

L'appelant doit capturer ou déclarer ServiceUnavailableException. Un contrôleur ou une autre frontière applicative peut ensuite produire une réponse adaptée. Cette décision est distincte de la hiérarchie d'exceptions.
## Erreur courante : Le sur-capturage
Une erreur fréquente est de capturer `Exception` (la classe parente) pour faire taire les erreurs. Cela masque les exceptions non vérifiées comme `NullPointerException`, rendant le débogage presque impossible car l'application échoue silencieusement.

**Correction :** Capturez toujours l'exception la plus spécifique possible. Au lieu de `catch (Exception e)`, utilisez `catch (IOException e)`.

## Exercice pratique
Un refus d'autorisation prévisible doit-il forcément être une exception checked ?

**Réponse :** Non. Choisissez une politique cohérente pour les exceptions métier et traitez-les à la bonne frontière. Une authentification manquante peut produire 401 ; un accès sans permission après authentification peut produire 403. Aucun de ces statuts n'impose le caractère checked ou unchecked de l'exception Java.


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
