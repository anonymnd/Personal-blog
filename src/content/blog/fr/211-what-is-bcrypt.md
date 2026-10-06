---
title: "Qu'est-ce que BCrypt ?"
description: "Une analyse approfondie du mécanisme de hachage unidirectionnel utilisé pour sécuriser les mots de passe."
pubDate: 2026-10-15T10:48:00.000Z
translationKey: 211-what-is-bcrypt
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où des employés soumettent des demandes de commande. Vous avez une base de données d'utilisateurs, mais si un pirate y accède, voir les mots de passe en texte clair serait catastrophique. Vous ne pouvez pas utiliser le chiffrement car celui-ci est bidirectionnel ; avec la clé, on peut retrouver le mot de passe original. C'est là qu'intervient BCrypt.

## Le mécanisme du hachage unidirectionnel
BCrypt n'est pas un chiffrement, mais une fonction de hachage. Contrairement au chiffrement, le hachage est à sens unique. Une fois haché, un mot de passe ne peut pas être « déchiffré ». BCrypt utilise un « sel » (salt)—une chaîne aléatoire ajoutée au mot de passe—pour garantir que deux utilisateurs ayant le même mot de passe obtiennent des hachages totalement différents. Cela empêche l'utilisation de tables de correspondance (Rainbow Tables).

## Le facteur de coût
Une caractéristique unique de BCrypt est son « facteur de coût ». Cela permet aux développeurs d'augmenter le temps nécessaire pour calculer un hachage. À mesure que le matériel devient plus rapide, vous pouvez augmenter ce coût pour rendre les attaques par force brute extrêmement lentes et coûteuses pour les pirates, tout en restant imperceptible pour l'utilisateur.

## Exemple concret : Vérification du mot de passe
Dans une application Spring utilisant `jakarta.*`, on n'utilise pas de comparaison de chaînes classique, mais un `BCryptPasswordEncoder`.

```java
// Extrait illustratif
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12); // Facteur de coût 12
String rawPassword = "buyer_secret_2024";
String encodedPassword = encoder.encode(rawPassword);

// Processus de vérification
boolean isMatch = encoder.matches(rawPassword, encodedPassword);
System.out.println("Correspondance : " + isMatch); // Résultat : true
```

## Erreur courante : Gestion manuelle du sel
Les débutants tentent souvent de générer leur propre sel et de le stocker dans une colonne séparée. C'est inutile et risqué. BCrypt intègre le sel directement dans la chaîne de hachage finale. La méthode `matches()` sait exactement comment extraire ce sel pour vérifier le mot de passe.

## Exercice pratique
Si un hachage BCrypt commence par `$2a$10$...`, que représente le chiffre `10` ?

**Réponse :** Il représente le facteur de coût (le nombre d'itérations 2^10) utilisé pour générer le hachage.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
