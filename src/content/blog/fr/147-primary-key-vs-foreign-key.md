---
title: "Clés Primaires, Clés Étrangères et Contraintes d'Unicité : Protéger des Faits Différents"
description: "Distinction entre l'identité d'une ligne, l'intégrité référentielle et les clés candidates dans PostgreSQL et JPA."
pubDate: 2026-10-08T00:48:00.000Z
translationKey: 147-primary-key-vs-foreign-key
seriesOrder: 33
locale: fr
tags: ["persistence","learning-series"]
draft: false
---

## Distinction entre Identité et Unicité

En conception de base de données, on confond souvent la Clé Primaire (PK) avec une Contrainte d'Unicité (Unique Constraint). Bien que les deux imposent l'unicité, elles protègent des faits logiques différents. Une Clé Primaire définit l'identité immuable d'une ligne. Une Contrainte d'Unicité protège une "clé candidate"—une règle métier stipulant qu'une combinaison spécifique de données ne doit pas être dupliquée.

Prenons l'exemple d'un système de vols. Un vol n'est pas identifié uniquement par son numéro, car ce numéro est réutilisé quotidiennement. Le fait métier est que pour un transporteur donné, à une date précise, il n'existe qu'un seul vol avec un numéro spécifique. Cependant, utiliser ces trois colonnes comme PK composite rendrait les références de clés étrangères lourdes et fragiles. On utilise donc une PK surrogate (UUID ou BigInt) pour l'identité et une contrainte d'unicité pour la règle métier.

## Intégrité Référentielle et Clé Étrangère

Une Clé Étrangère (FK) ne sert pas à identifier une ligne, mais à garantir une relation. Elle assure qu'un enregistrement enfant (comme un Billet) ne peut pas pointer vers un parent inexistant (un Vol).

Point crucial : dans PostgreSQL, la création d'une contrainte de Clé Étrangère ne crée pas automatiquement d'index sur la colonne référente. Si la PK du parent est indexée, la FK de l'enfant ne l'est pas. Cela signifie que si l'insertion d'un billet est rapide, la suppression d'un vol ou la recherche de billets pour un vol spécifique déclenchera un scan complet de la table (Sequential Scan) à moins d'ajouter manuellement un index sur la colonne FK.

## Exemple concret : Schéma Vol et Billet

Voici l'implémentation utilisant Jakarta Persistence (JPA) et la logique PostgreSQL. Nous séparons l'identité technique de l'unicité métier.

```java
@Entity
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Clé Primaire : Identité de la ligne

    private String carrier;
    private String flightNumber;
    private LocalDate departureDate;

    // Règle métier : Pas deux vols pour le même transporteur/numéro/date
    // Défini via @Table(uniqueConstraints = ...) ou DDL SQL
}

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Identité propre du billet

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight; // Clé Étrangère : Intégrité référentielle

    private String passengerName;

    @Column(unique = true)
    private String ticketNumber; // Contrainte d'Unicité : Clé candidate
}
```

### Trace de la base de données et conséquences

1. **Insertion Vol** : `INSERT INTO flight (carrier, flight_number, departure_date) VALUES ('LH', '400', '2023-12-01');` → Succès. PK `1` attribuée.
2. **Vol Dupliqué** : `INSERT INTO flight (carrier, flight_number, departure_date) VALUES ('LH', '400', '2023-12-01');` → **ÉCHEC** : Violation de contrainte d'unicité. Le fait métier est protégé.
3. **Insertion Billet** : `INSERT INTO ticket (flight_id, passenger_name) VALUES (1, 'Alice');` → Succès. La FK vérifie si le Vol `1` existe.
4. **Billet Orphelin** : `INSERT INTO ticket (flight_id, passenger_name) VALUES (999, 'Bob');` → **ÉCHEC** : Violation de clé étrangère. L'intégrité référentielle est protégée.
5. **Performance Requête** : `SELECT * FROM ticket WHERE flight_id = 1;` → **LENT**. PostgreSQL effectue un Sequential Scan car la FK `flight_id` n'est pas indexée par défaut.

## Nullabilité et Contraintes d'Unicité

Une clé primaire combine unicité et NOT NULL ; l’application conserve normalement son identité stable, mais déclarer une PK ne rend pas les updates impossibles. Une contrainte unique peut autoriser null. PostgreSQL considère par défaut les nulls comme distincts pour l’unicité ; NULL = NULL et NULL <> NULL donnent tous deux unknown, pas true. NULLS NOT DISTINCT propose une autre politique explicite. Combinez UNIQUE et NOT NULL si l’identifiant métier doit exister.
## Exercice

Un numéro de siège n’est pas unique globalement : il ne peut identifier seul un ticket. Un ID de ticket surrogate est utile ; une clé composite reste valide si ses compromis conviennent. Imposez UNIQUE(flight_id, seat_number) et exigez les deux valeurs si chaque siège attribué doit être connu.

PostgreSQL crée un index unique B-tree. Il convient aux recherches flight_id plus seat_number, sans garantir une recherche rapide sur seat_number seul. Ordre, version et planificateur comptent. Une FK ne crée pas automatiquement d’index côté enfant, mais un index existant peut la couvrir ; un scan de petite table n’est pas forcément lent.

Pour la trace de vol en doublon, installez réellement la contrainte et les colonnes métier NOT NULL par migration. Un commentaire Java ne protège rien. L’unicité transporteur/numéro/date est une hypothèse simplifiée : vérifiez si le domaine autorise plusieurs tronçons ou départs le même jour.

## Pour approfondir

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
