---
title: "Comment fonctionne le hachage de mots de passe"
description: "Une exploration du processus unidirectionnel de sécurisation des identifiants utilisateur via le sel et les algorithmes de hachage lents."
pubDate: 2026-10-15T09:48:00.000Z
translationKey: 210-how-password-hashing-works
locale: fr
tags: ["software-engineering","security","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats où un manager approuve des commandes. Si vous stockez les mots de passe en texte clair et que votre base de données est compromise, tous les comptes sont exposés. Beaucoup de débutants confondent le hachage avec le chiffrement, mais le chiffrement est bidirectionnel, alors que le hachage est une voie à sens unique conçue pour être irréversible.

## Le mécanisme de hachage
Une fonction de hachage prend une entrée et produit une chaîne de caractères de longueur fixe. Peu importe la longueur du mot de passe, le résultat (le condensat) a toujours la même taille. Crucialement, la même entrée produit toujours la même sortie. Cependant, si vous changez une seule lettre, le hachage change complètement : c'est l'effet d'avalanche.

## Le rôle du Sel (Salt)
Si deux utilisateurs utilisent le mot de passe "123456", leurs hachages seraient identiques. Les pirates utilisent des "Rainbow Tables" (listes pré-calculées de mots de passe courants et leurs hachages) pour les casser instantanément. Pour éviter cela, on utilise un **Sel** : une chaîne aléatoire ajoutée au mot de passe avant le hachage. Ainsi, même avec le même mot de passe, les sels différents produisent des hachages uniques.

## Choisir le bon algorithme
La sécurité moderne évite les hachages rapides comme MD5 ou SHA-256 car les GPU peuvent tester des millions de combinaisons par seconde. On utilise donc des algorithmes "lents". BCrypt est courant dans les applications Spring, bien que l'OWASP recommande désormais Argon2id pour les nouveaux systèmes car il résiste mieux aux attaques par GPU.

## Exemple concret : L'application d'achats
Lorsqu'un demandeur crée un compte avec le mot de passe `SecurePass123` :
1. **Inscription** : Le système génère un sel `xYz789`. Il hache `SecurePass123 + xYz789` via BCrypt. La base de données stocke le hachage résultant : `$2a$10$R9h...` (qui inclut le sel).
2. **Connexion** : L'utilisateur saisit `SecurePass123`. Le système récupère le hachage stocké, en extrait le sel, hache la saisie et compare les résultats. Si ça correspond, l'accès est accordé.

## Erreur courante : Utiliser le chiffrement
Une erreur fréquente est d'utiliser AES ou un autre chiffrement symétrique. Si le développeur stocke la clé de chiffrement sur le serveur, un attaquant ayant accès au serveur peut déchiffrer tous les mots de passe. Le hachage élimine totalement le besoin d'une clé de déchiffrement.

## Exercice pratique
**Question** : Pourquoi ajouter un sel est-il nécessaire si l'algorithme de hachage est déjà complexe ?
**Réponse** : Pour empêcher les attaques par Rainbow Tables et garantir que des mots de passe identiques produisent des hachages différents.

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
