---
title: "Comment Identifier les Entités dans une Application"
description: "Un guide pour distinguer les objets métier fondamentaux des attributs afin de construire un modèle de données conceptuel solide."
pubDate: 2026-10-08T03:48:00.000Z
translationKey: 036-how-to-identify-entities-in-an-application
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Imaginez que vous développiez un système d'achats. Vous commencez par lister des éléments comme 'Date de demande', 'Nom du produit' et 'Nom du manager'. Soudain, vous ne savez plus si le 'Manager' est juste un texte ou un objet distinct nécessitant son propre profil. Cette confusion mène souvent à des données redondantes et des bases de données rigides.

## Distinction entre Entité et Attribut
Une entité est un objet distinct—personne, lieu, chose ou événement—qui a une existence indépendante et plusieurs caractéristiques. Un attribut est une propriété unique qui décrit une entité. Si vous réalisez que vous devez stocker plusieurs informations sur un élément spécifique (par exemple, l'email, le téléphone et le département d'un manager), cet élément est une entité, pas un attribut.

## Application à la Logique d'Achats
Dans une application d'achats, nous identifions les entités en cherchant les 'noms' dans les règles métier.
- **Demandeur** : La personne qui demande un article.
- **DemandeAchat** : L'événement de la demande.
- **Produit** : L'article demandé.
- **Manager** : La personne qui approuve la demande.

Si nous traitions le 'Manager' comme un simple attribut (une chaîne de caractères) dans l'entité `DemandeAchat`, nous ne pourrions pas suivre facilement combien de demandes un manager spécifique a approuvées sans risquer des fautes de frappe.

## Exemple Concret : Le Flux de Demande
Considérons ce mappage conceptuel :
- **Entité : DemandeAchat** (Attributs : ID_Demande, Date, MontantTotal)
- **Entité : Produit** (Attributs : ID_Produit, SKU, PrixUnitaire)
- **Relation** : Une `DemandeAchat` contient un ou plusieurs `Produits`.

Comme la relation 'contient' possède ses propres données (la quantité de chaque produit), nous créons une **Entité d'Association** appelée `LigneDemande` pour stocker l'attribut `Quantité`. Cela évite que la base de données ne devienne une liste de valeurs séparées par des virgules.

## Erreur Courante : La Sur-Entitisation
Les débutants créent souvent des entités pour des choses qui sont en réalité des valeurs statiques. Par exemple, créer une entité `Devise` pour une simple chaîne 'USD' ou 'EUR' alors que l'application n'utilise qu'une seule monnaie.
**Correction** : Si l'objet n'a aucune propriété autre que son nom et ne change pas, gardez-le comme attribut (Enum ou String) pour éviter des jointures inutiles.

## Exercice Pratique
Scénario : Vous ajoutez une fonctionnalité 'Fournisseur'. Vous devez stocker le Nom de l'entreprise, l'ID Fiscal et la Personne de contact. Le 'Fournisseur' est-il une entité ou un attribut ?

**Réponse** : C'est une entité car il possède plusieurs propriétés distinctes (ID Fiscal, Contact) qui le décrivent indépendamment de toute commande spécifique.
