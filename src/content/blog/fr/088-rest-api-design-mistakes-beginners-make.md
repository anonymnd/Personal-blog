---
title: "REST API Design Mistakes Beginners Make"
description: "Un guide pour éviter les pièges architecturaux courants lors de la conception d'interfaces RESTful pour des applications professionnelles."
pubDate: 2026-10-10T07:48:00.000Z
translationKey: 088-rest-api-design-mistakes-beginners-make
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imaginez que vous développez un système d'approvisionnement. Vous avez créé un point de terminaison appelé `/updateRequest` qui utilise la méthode POST pour modifier le statut d'une demande d'achat. Bien que cela fonctionne, vos collègues sont confus car ils s'attendent à des conventions REST standards. C'est là que beaucoup de débutants échouent : ils traitent les API comme des fonctions distantes plutôt que comme une architecture orientée ressources.

## Mauvaise utilisation des méthodes HTTP
Une erreur classique consiste à utiliser POST pour tout. Dans une application d'achat, si vous voulez remplacer tout l'objet d'une demande, vous devez utiliser PUT. Si vous voulez seulement changer le statut de 'En attente' à 'Approuvé', PATCH est le choix correct. N'oubliez pas que GET doit être sûr et idempotent, ce qui signifie qu'il ne doit jamais modifier l'état du serveur.

## Confusion entre les erreurs 401 et 403
Les débutants utilisent souvent 401 Unauthorized pour tout problème de permission. Pourtant, 401 signifie spécifiquement que l'utilisateur n'est pas authentifié. Si un demandeur tente d'approuver sa propre demande d'achat—ce que seul un manager peut faire—le serveur doit renvoyer 403 Forbidden. L'utilisateur est reconnu, mais il n'a pas les droits nécessaires.

## Ignorer les codes de statut appropriés
Renvoyer un 200 OK pour chaque succès est une occasion manquée. Lorsqu'un utilisateur soumet une nouvelle demande d'achat, l'API devrait renvoyer 201 Created avec un en-tête `Location`. Si la demande est acceptée pour traitement mais n'est pas encore terminée, 202 Accepted est la norme professionnelle.

## Le piège de l'idempotence
Beaucoup pensent qu'une méthode idempotente doit toujours renvoyer la même réponse. En réalité, l'idempotence signifie que l'état du serveur reste le même après plusieurs appels identiques. Par exemple, appeler DELETE sur un ID de demande deux fois laissera la ressource supprimée dans les deux cas, même si le premier appel renvoie 204 No Content et le second 404 Not Found.

## Exemple concret : Mise à jour d'achat
**Approche incorrecte :**
`POST /changeStatus?id=123&status=Approved` $ightarrow$ renvoie 200 OK

**Approche correcte :**
`PATCH /requests/123` avec le corps `{"status": "Approved"}` $ightarrow$ renvoie 200 OK avec l'objet mis à jour.

**Erreur courante :** Utiliser PUT pour mettre à jour un seul champ.
**Correction :** PUT remplace la ressource entière. Si vous envoyez seulement le statut via PUT, vous risquez d'effacer le nom du demandeur et la liste des articles.

## Exercice pratique
Quel code de statut devez-vous renvoyer si un utilisateur tente de créer une demande d'achat qui entre en conflit avec une existante (ex: même numéro de référence) ?

**Réponse :** 409 Conflict.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
