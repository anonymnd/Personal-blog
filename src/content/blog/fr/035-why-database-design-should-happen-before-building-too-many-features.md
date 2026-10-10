---
title: "Des Règles Métier au Modèle de Base de Données Relationnelle"
description: "Guide pour transformer des règles de location d'équipement en schéma conceptuel, logique et physique via les cardinalités Merise."
pubDate: 2026-10-06T21:48:00.000Z
translationKey: 035-why-database-design-should-happen-before-building-too-many-features
seriesOrder: 6
locale: fr
tags: ["database-design","learning-series"]
draft: false
---

## Traduire les Règles Métier en Entités

La conception de base de données échoue souvent lorsque les développeurs créent des tables sans analyser les règles métier. L'objectif est de passer d'une description en langage naturel à un modèle structuré. Pour notre scénario de location :
1. Un client signe un contrat de location.
2. Une location contient un ou plusieurs articles (lignes de location).
3. Chaque ligne est liée à un équipement spécifique.
4. Chaque ligne enregistre le prix convenu et le statut du retour.
5. Un équipement peut apparaître dans plusieurs locations historiques.

Pour identifier les entités, on cherche les 'noms' qui ont une existence indépendante et des propriétés descriptives.
- **Client** : Existe indépendamment de toute location en cours.
- **Location** : Un événement contractuel spécifique.
- **Équipement** : L'actif physique loué.

Les attributs sont les propriétés de ces entités. Une erreur classique est de traiter une relation comme un attribut. Par exemple, la 'Date de location' est un attribut de la Location, mais le 'Prix convenu' n'est ni un attribut de l'Équipement (le prix varie selon la location), ni de la Location (une location a plusieurs articles à des prix différents). Il appartient à l'interaction entre les deux.

## Le Modèle Conceptuel (MCD) et les Cardinalités

Selon la méthode Merise, on définit le Modèle Conceptuel des Données (MCD) en se concentrant sur les entités et leurs associations avec des cardinalités (min, max).

- **Client <-> Location** :
  - Un Client peut signer 0 ou plusieurs locations (0,N).
  - Une Location est signée par exactement 1 client (1,1).
- **Location <-> Équipement** :
  - Une Location contient 1 ou plusieurs équipements (1,N).
  - Un Équipement peut faire partie de 0 ou plusieurs locations au fil du temps (0,N).

Comme la relation entre Location et Équipement est Many-to-Many (N:M) et transporte ses propres données (prix, statut), elle devient une **Entité Associative**. C'est ici que réside la logique de la 'Ligne de location'.

## Passage du Logique au Physique

Pour passer du MCD au Modèle Physique (SQL), on applique des règles de transformation :
1. **Relations 1:N** : Le côté 'Plusieurs' reçoit une Clé Étrangère (FK) pointant vers le côté 'Un'. (La table `rentals` reçoit `customer_id`).
2. **Relations N:M** : Une nouvelle table est créée. Sa clé primaire est généralement composée des deux clés étrangères qu'elle relie. (La table `rental_line_items` reçoit `rental_id` et `equipment_id`).

### Schéma Physique Appliqué

Voici le schéma résultant. Notez l'utilisation de `DECIMAL` pour la monnaie afin d'éviter les erreurs de virgule flottante.

```sql
-- Schéma Physique Illustratif
CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE rentals (
    id BIGINT PRIMARY KEY,
    rental_date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE equipment (
    id BIGINT PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model_name VARCHAR(255) NOT NULL
);

CREATE TABLE rental_line_items (
    rental_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    agreed_price DECIMAL(10, 2) NOT NULL,
    is_returned BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (rental_id, equipment_id),
    CONSTRAINT fk_line_rental FOREIGN KEY (rental_id) REFERENCES rentals(id),
    CONSTRAINT fk_line_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);
```

## Analyse du Modèle

Cette structure préserve les faits historiques. Si nous avions simplement mis un `current_rental_id` dans la table `equipment`, nous aurions perdu l'historique de toutes les personnes ayant loué cet objet. En utilisant `rental_line_items`, on crée un registre de chaque transaction.

**Cas d'échec : Le piège du 'Prix Actuel'**
Si nous stockions le prix uniquement dans la table `equipment`, modifier le prix aujourd'hui modifierait rétroactivement le prix des locations d'il y a trois ans dans nos rapports. En plaçant `agreed_price` dans la table de jointure, on prend un 'instantané' du prix au moment de la signature.

## Exercice

**Scénario** : L'entreprise décide que chaque équipement doit être affecté à un 'Entrepôt' spécifique avant d'être loué. Un entrepôt peut contenir plusieurs articles, mais un article appartient à un seul entrepôt à la fois.

**Question** :
1. Quelle est la cardinalité entre Entrepôt et Équipement ?
2. Comment le schéma physique change-t-il ?

**Réponse** :
1. Entrepôt (0,N) <-> Équipement (1,1). Un entrepôt a zéro ou plusieurs articles ; un article doit appartenir à exactement un entrepôt.
2. La table `equipment` doit être mise à jour pour inclure une colonne `warehouse_id` comme Clé Étrangère référençant la nouvelle table `warehouses`.

Les clés étrangères de cet extrait ne garantissent pas à elles seules le minimum conceptuel d’une ligne par location. Vérifiez des lignes non vides lors de la confirmation, dans une transaction ou règle en base adaptée. La clé composée suppose aussi qu’un équipement physique apparaît au plus une fois par location.
