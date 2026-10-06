---
title: "Pourquoi les mots de passe ne doivent jamais être stockés en texte clair"
description: "Une analyse approfondie des dangers du stockage en texte clair et du mécanisme de hachage salé pour sécuriser les identifiants."
pubDate: 2026-10-15T08:48:00.000Z
translationKey: 209-why-passwords-should-never-be-stored-as-plain-text
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez un développeur créant une application d'achats où les employés soumettent des demandes. Pour simplifier, il stocke les mots de passe dans une colonne `password` sous forme de chaînes simples. Si un acteur malveillant accède à la base de données via une injection SQL ou une sauvegarde fuitée, chaque compte est instantanément compromis. L'attaquant n'a pas besoin de deviner ; il lit simplement la liste.

## Le danger du texte clair
Stocker des mots de passe en texte clair est une faille critique car cela crée un point de défaillance unique. Une fois les données fuitées, il n'y a plus de seconde ligne de défense. De plus, comme les utilisateurs réutilisent souvent leurs mots de passe sur plusieurs plateformes, une fuite dans votre application pourrait donner accès aux e-mails professionnels ou aux comptes bancaires des utilisateurs.

## Hachage vs Chiffrement
Une erreur courante est de penser que les mots de passe doivent être « chiffrés ». Le chiffrement est bidirectionnel ; avec la clé, on peut retrouver le texte clair. Les mots de passe doivent être hachés. Le hachage est une fonction cryptographique à sens unique. On transforme le mot de passe en empreinte (hash), mais on ne peut pas inverser mathématiquement l'opération.

## Le rôle du sel (Salting)
Le hachage simple est vulnérable aux « Rainbow Tables », des listes précalculées de hashs pour les mots de passe courants. Pour éviter cela, on utilise un « sel » : une chaîne aléatoire et unique ajoutée au mot de passe avant le hachage. Ainsi, deux utilisateurs ayant le même mot de passe auront des hashs totalement différents.

## Exemple d'implémentation
Dans une application Spring moderne, `BCryptPasswordEncoder` est un choix standard car il gère le sel automatiquement.

```java
// Extrait illustratif avec Spring Security
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String rawPassword = "SecurePass123!";

// Stocker ce résultat en BDD
String hashedPassword = encoder.encode(rawPassword);

// Pour vérifier lors de la connexion :
boolean isMatch = encoder.matches(rawPassword, hashedPassword);
```

## Erreur courante : Utiliser des hashs rapides
Certains utilisent MD5 ou SHA-256 car ils sont rapides. Or, la vitesse est ici une faiblesse. Un attaquant peut tester des milliards de hashs MD5 par seconde. Les standards comme Argon2id ou BCrypt sont intentionnellement lents pour rendre les attaques par force brute coûteuses.

## Exercice pratique
**Scénario :** Vous voyez une table BDD où deux utilisateurs ont exactement le même hash `5e884898da28...` pour des comptes différents. Que manque-t-il à l'implémentation ?

**Réponse :** Le sel (salting). Comme les hashs sont identiques pour le même mot de passe, aucun sel unique par utilisateur n'a été utilisé.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
