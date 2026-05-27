---
title: "Stocker les mots de passe avec des hachages lents et salés"
description: "Mise en œuvre du stockage sécurisé des mots de passe avec BCrypt et Argon2id, focus sur la gestion du sel et les stratégies de migration."
pubDate: 2026-10-08T12:48:00.000Z
translationKey: 209-why-passwords-should-never-be-stored-as-plain-text
seriesOrder: 45
locale: fr
tags: ["security","learning-series"]
draft: false
---

## Le mécanisme du hachage à sens unique

Le stockage des mots de passe nécessite une transformation à sens unique. Contrairement au chiffrement, conçu pour être inversé avec une clé, le hachage est une « trappe » mathématique. Un hachage sécurisé doit être coûteux en calcul pour empêcher les attaques par force brute et unique par utilisateur pour contrer les tables arc-en-ciel (listes de hachages pré-calculés).

### Sels et facteurs de travail

La bibliothèque génère un sel aléatoire utilisé comme entrée distincte de l’algorithme. Les chaînes BCrypt et Argon2 encodées contiennent normalement sel et paramètres, sans colonne de sel séparée. Des sels différents donnent des hashes différents pour des mots de passe égaux avec une probabilité extrêmement élevée.

Le facteur de travail (ou coût) détermine le nombre d'itérations de l'algorithme. À mesure que le matériel devient plus rapide, on augmente ce facteur pour maintenir un temps de hachage constant (ex: ~100ms), forçant l'attaquant à passer plus de temps par tentative.

## Sélection d'algorithmes et contraintes

### BCrypt
La limite habituelle BCrypt est 72 octets : compter les caractères UTF-8 ne suffit pas. Selon l’implémentation, une entrée plus longue est rejetée ou tronquée. Suivez la bibliothèque et la politique documentées sans pré-hash improvisé.

### Argon2id
Pour les nouveaux systèmes, l'OWASP recommande Argon2id. Il est supérieur car il résiste aux attaques via GPU grâce à des fonctions gourmandes en mémoire. Alors que BCrypt ne scale qu'avec le temps CPU, Argon2id permet de configurer l'utilisation de la mémoire, le parallélisme et les itérations.

## Exemple concret : Migration lors de la connexion

Imaginons un forum migrant d'un coût BCrypt ancien (10) vers un coût plus fort (12), ou vers Argon2id. On ne peut pas migrer les hachages en masse car on ne possède pas le texte clair. On met donc à jour le hachage lors de l'événement d'authentification.

### Logique de comparaison

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

public record UserAccount(Long id, String username, String passwordHash, String algorithm) {}

public class PasswordMigrationService {
    private final PasswordEncoder bCrypt10 = new BCryptPasswordEncoder(10);
    private final PasswordEncoder bCrypt12 = new BCryptPasswordEncoder(12);

    public boolean authenticateAndUpgrade(UserAccount user, String rawPassword) {
        boolean matches = false;
        boolean needsUpgrade = false;

        // 1. Vérification basée sur l'algorithme stocké
        if ("BCRYPT_10".equals(user.algorithm())) {
            matches = bCrypt10.matches(rawPassword, user.passwordHash());
            needsUpgrade = true; // Migration vers le standard actuel (BCrypt 12)
        } else if ("BCRYPT_12".equals(user.algorithm())) {
            matches = bCrypt12.matches(rawPassword, user.passwordHash());
        }

        // 2. Si le mot de passe est correct et nécessite une mise à jour, on re-hache
        if (matches && needsUpgrade) {
            String newHash = bCrypt12.encode(rawPassword);
            updateUserHash(user.id(), newHash, "BCRYPT_12");
        }

        return matches;
    }

    private void updateUserHash(Long id, String hash, String alg) {
        // Illustratif : Mise à jour de l'enregistrement en base de données
        System.out.println("Mise à jour utilisateur " + id + " vers " + alg);
    }
}
```



Le hash BCrypt encodé contient sel et coût. BCryptPasswordEncoder.matches lit ces paramètres : un même encodeur peut vérifier plusieurs coûts stockés ; sa configuration détermine surtout les nouveaux hashes. Pour changer d’algorithme, utilisez une version explicite ou un préfixe et un encodeur déléguant maintenu. Authentifiez d’abord puis réencodez le mot de passe reçu lors de cette réussite. Protégez la mise à jour contre un reset concurrent.

La limite habituelle est de 72 octets, pas caractères ; une bibliothèque peut rejeter ou tronquer. Définissez une politique documentée plutôt qu’une troncature silencieuse ou un pré-hash SHA-256 improvisé. Le sel est une entrée de l’algorithme, pas universellement une concaténation applicative. Mesurez les paramètres et limitez les tentatives. Un hash reste vulnérable aux essais de mots de passe faibles.
## Cas d'échec
- **Sur-optimisation** : Un facteur de travail trop élevé peut mener à un déni de service (DoS). Si un hachage prend 2 secondes, un attaquant peut saturer le CPU du serveur avec quelques dizaines de requêtes par seconde.
- La limite habituelle BCrypt est 72 octets : compter les caractères UTF-8 ne suffit pas. Selon l’implémentation, une entrée plus longue est rejetée ou tronquée. Suivez la bibliothèque et la politique documentées sans pré-hash improvisé.

## Exercice

Pour un ancien compte en clair, ne devinez jamais le format parce que BCrypt a échoué : cela pourrait accepter le hash stocké comme mot de passe. Utilisez des métadonnées de format fiables et une migration strictement contrôlée. Si le clair existe réellement, un traitement sécurisé peut le hasher puis l’éliminer ; les comptes inactifs peuvent nécessiter un reset.

Pour BCrypt, utilisez le bon matcher. À la connexion réussie, encodez le mot de passe reçu avec l’algorithme choisi et mettez à jour atomiquement format et hash, en vérifiant l’ancienne version pour ne pas écraser un reset. Un échec ne change jamais le format et ne tente pas une comparaison en clair. Ne journalisez pas les mots de passe ; traitez les anciennes copies et testez les deux chemins.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
