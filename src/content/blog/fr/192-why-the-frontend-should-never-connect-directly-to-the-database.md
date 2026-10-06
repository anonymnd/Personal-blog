---
title: "Pourquoi le Frontend ne doit jamais se connecter directement à la Base de Données"
description: "Une analyse des risques critiques de sécurité et d'architecture liés au contournement de la couche backend."
pubDate: 2026-10-14T15:48:00.000Z
translationKey: 192-why-the-frontend-should-never-connect-directly-to-the-database
locale: fr
tags: ["software-engineering","web-communication","learning-series"]
draft: false
---

Imaginez que vous développiez une application d'achats où un demandeur soumet une requête. Si votre frontend en React ou Vue se connecte directement à votre base de données PostgreSQL via une chaîne de connexion, vous venez de donner les clés de votre entrepôt à tous les visiteurs d'Internet. Comme le code frontend est exécuté dans le navigateur, tout secret y est public.

## L'exposition des identifiants
Pour qu'un navigateur se connecte à une base de données, il lui faut un nom d'utilisateur et un mot de passe. L'utilisateur peut simplement ouvrir les 'Outils de développement' et trouver ces identifiants dans le code source. Une fois en possession de ceux-ci, un attaquant peut ignorer votre interface et exécuter des commandes comme `DROP TABLE users;` via un client SQL standard.

## L'absence de logique métier
Une connexion directe signifie que la base de données traite la requête sans 'gardien'. Dans notre application d'achats, un demandeur peut créer une requête, mais ne doit pas pouvoir l'approuver. Si le frontend parle à la DB, la seule chose qui empêche un utilisateur d'approuver sa propre demande est un bouton caché. Un utilisateur malveillant peut envoyer une mise à jour SQL directe pour changer le statut en 'Approuvé' car aucun code serveur ne vérifie le rôle 'Manager'.

## CORS et contraintes réseau
Les navigateurs appliquent la politique CORS (Cross-Origin Resource Sharing). Bien que le CORS soit un mécanisme de sécurité du navigateur pour empêcher la lecture non autorisée de réponses cross-origin, la plupart des bases de données ne sont pas conçues pour gérer les requêtes de pré-vérification HTTP. Tenter de contourner cela pousse souvent les développeurs à désactiver des paramètres de sécurité, exposant davantage le système.

## Exemple concret : Mauvaise vs Bonne approche
**Mauvaise approche (Directe) :**
`Frontend` $ightarrow$ `SQL: UPDATE requests SET status='Approved' WHERE id=101` $ightarrow$ `Base de données` (Aucun contrôle de rôle).

**Bonne approche (Via Backend) :**
`Frontend` $ightarrow$ `POST /api/approve/101` $ightarrow$ `Backend (Jakarta EE/Spring)` $ightarrow$ `Base de données`.

Ici, le backend effectue une vérification : `if (!user.hasRole("MANAGER")) throw new UnauthorizedException();`. L'ordre SQL n'est exécuté qu'après validation.

## Erreur courante : Se fier à la validation frontend
Certains pensent que masquer un champ ou utiliser l'attribut `disabled` sur un bouton suffit pour la sécurité.
**Correction :** Partez du principe que le frontend est compromis. Chaque requête atteignant la base de données doit être validée et autorisée par un service backend.

## Exercice pratique
Si une application d'achats permet à un utilisateur de modifier le prix d'un article via une connexion directe à la DB, quel est le moyen le plus efficace d'empêcher cela ?

**Réponse :** Implémenter une couche API backend qui vérifie les permissions de l'utilisateur et s'assure que seuls les 'Acheteurs' autorisés peuvent modifier les prix avant l'envoi à la base de données.


## Pour approfondir

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
