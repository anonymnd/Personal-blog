---
title: "Unique Constraint vs Primary Key"
description: "Comprendre les différences fondamentales entre les clés primaires et les contraintes d'unicité pour garantir l'intégrité des données."
pubDate: 2026-10-12T19:48:00.000Z
translationKey: 148-unique-constraint-vs-primary-key
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Vous avez une table `PurchaseRequest`. Vous pourriez vous dire : 'J'ai déjà un ID pour chaque demande, alors pourquoi ajouter une autre contrainte sur le numéro de requête ?' Cette confusion mène souvent à des bases de données qui acceptent des doublons d'identifiants métier, créant ainsi des erreurs de reporting.

## La Distinction Fondamentale
Une Clé Primaire (PK) est l'identifiant unique d'un enregistrement. C'est la 'source de vérité' permettant à la base de données de localiser une ligne précise. Une Contrainte d'Unicité (UC), en revanche, garantit simplement qu'aucune deux lignes n'ont la même valeur dans une colonne spécifique, sans pour autant définir l'identité de la ligne.

## Différences Techniques Clés
Bien que les deux empêchent les doublons, elles diffèrent sur la gestion des valeurs nulles et la quantité. Une table ne peut avoir qu'une seule Clé Primaire, mais elle peut posséder plusieurs Contraintes d'Unicité. Surtout, une Clé Primaire interdit strictement les valeurs NULL, alors qu'une Contrainte d'Unicité les autorise généralement (selon le dialecte SQL), car NULL est considéré comme une valeur inconnue.

## Exemple Concret : App d'Achats
Considérons une entité `Request`. Nous utilisons un ID technique comme PK, mais le `request_code` (ex: 'REQ-2023-001') doit aussi être unique pour les utilisateurs.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Clé Primaire

    @Column(unique = true, nullable = false)
    private String requestCode; // Contrainte d'Unicité
    
    private String itemDescription;
}
```
Dans PostgreSQL, cela crée un index B-tree pour les deux. Si vous tentez d'insérer deux requêtes avec le même `requestCode`, la base de données lèvera une `ConstraintViolationException`, même si leurs `id` sont différents.

## Erreur Courante : Utiliser des Clés Métier comme PK
Une erreur fréquente consiste à utiliser un email ou un code requête comme Clé Primaire. Si la logique métier change (ex: changement d'email), vous devez mettre à jour la PK et toutes les clés étrangères qui y font référence. La correction est d'utiliser une clé surrogate (comme un Long ID) en PK et une Contrainte d'Unicité pour la clé métier.

## Exercice Pratique
Quelle contrainte utiliseriez-vous pour une colonne `numéro_sécurité_sociale` si la table possède déjà une colonne `id` ?

**Réponse :** Une Contrainte d'Unicité. Elle garantit que deux personnes n'ont pas le même numéro tout en gardant l' `id` comme référence interne stable.

## Pour approfondir

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
