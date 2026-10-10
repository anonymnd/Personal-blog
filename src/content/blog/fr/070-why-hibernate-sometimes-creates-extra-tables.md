---
title: "Pourquoi les collections de valeurs et les associations nécessitent des tables supplémentaires"
description: "Analyse approfondie de @ElementCollection, des embeddables et de la différence structurelle entre types de valeurs et entités dans JPA."
pubDate: 2026-10-07T06:48:00.000Z
translationKey: 070-why-hibernate-sometimes-creates-extra-tables
seriesOrder: 15
locale: fr
tags: ["spring-architecture","learning-series"]
draft: false
---

## Types de Valeurs vs Entités

Dans JPA, il existe une distinction fondamentale entre une **Entité** et un **Type de Valeur**. Une entité possède une identité persistante (une clé primaire) qui permet de la suivre, de la mettre à jour et de s'y référer indépendamment dans tout le système. Un type de valeur, en revanche, est défini par ses attributs. Si deux types de valeurs ont les mêmes données, ils sont considérés comme la même valeur.

Prenons un `Produit`. Un `Fournisseur` est une entité car un fournisseur existe indépendamment de n'importe quel produit ; il a son propre cycle de vie et son propre ID. À l'inverse, les `Dimensions` d'un produit (hauteur, largeur, profondeur) ou une liste de `Couleurs` (Rouge, Bleu) sont des types de valeurs. Elles n'ont aucun sens en dehors du contexte du produit qu'elles décrivent.

## Le rôle de @ElementCollection

Le mapping relationnel standard @ElementCollection stocke des valeurs simples ou embarquées dans une table reliée à l’entité propriétaire. C’est un choix de mapping : une base peut aussi stocker des tableaux ou du JSON dans une colonne, avec d’autres mappings et compromis de requête.

Une association vise des entités identifiables indépendamment. Une collection de valeurs ne donne pas d’identité d’entité séparée à ses éléments ; ils appartiennent au propriétaire. Sa table peut toutefois posséder clé primaire, contraintes uniques et index. La suppression du parent via son cycle de vie supprime les valeurs dépendantes ; les suppressions bulk ou natives demandent de vérifier contraintes et nettoyage.
## Exemple concret : Dimensions et Couleurs du Produit

Voici comment modéliser un produit avec un ensemble de chaînes simples (couleurs) et un ensemble de valeurs complexes (dimensions).

```java
import jakarta.persistence.*;
import java.util.*;

@Embeddable
public record Dimensions(double height, double width, double depth) {}

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ElementCollection
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private Set<String> colors = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_dimensions", joinColumns = @JoinColumn(name = "product_id"))
    private Set<Dimensions> dimensions = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Supplier supplier;

    // Getters, Constructeur
}

@Entity
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyName;
    // Getters, Constructeur
}
```

### Trace du schéma de base de données

Si nous persistons un produit avec l'ID `101`, les couleurs `{"Rouge", "Bleu"}` et une `Dimensions(10, 20, 30)`, la base de données ressemble à ceci :

**Table : `product`**
| id | name | supplier_id |
| :--- | :--- | :--- |
| 101 | Bureau | 50 |

**Table : `product_colors`**
| product_id | color |
| :--- | :--- |
| 101 | Rouge |
| 101 | Bleu |

**Table : `product_dimensions`**
| product_id | height | width | depth |
| :--- | :--- | :--- |
| 101 | 10.0 | 20.0 | 30.0 |

**Table : `supplier`**
| id | company_name |
| :--- | :--- |
| 50 | OfficeCorp |

### Ce que signifient les tables

Ces lignes décrivent des valeurs appartenant au produit, pas des entités avec des identifiants indépendants. Copier une couleur vers un autre produit crée une autre occurrence de la valeur ; cela ne transfère pas une identité d’entité. Le SQL précis et les contraintes physiques dépendent du mapping.

## Cas d'échec et pièges

Si les catégories ont des identifiants partagés, une modification indépendante et des références depuis plusieurs produits, modélisez Category comme entité. Selon le domaine, la relation sera many-to-one, many-to-many ou une entité de liaison. Une simple étiquette répétée n’impose pas automatiquement une entité.

Modifiez soigneusement la collection gérée existante plutôt que de remplacer sans précaution le wrapper Hibernate. Le coût SQL dépend du type de collection, de l’égalité des valeurs, du mapping et de la version du fournisseur. clear/addAll n’est pas intrinsèquement plus efficace ; retirer une valeur Java ne garantit pas toujours un seul DELETE. Observez les requêtes de modifications représentatives avant d’optimiser.
## Exercice

Un produit stocke des descriptions de garantie : 12 mois pour les pièces, 36 pour la main-d’œuvre. Ici, ce sont des valeurs sans identifiant de contrat ni cycle de vie indépendant. Choisissez un WarrantyPeriod embarqué avec durationMonths et coverageType dans une @ElementCollection.

Retirer une période de la collection gérée dans une transaction doit rendre la collection persistée conforme aux valeurs restantes après flush et commit. Les suppressions ou réinsertions exactes dépendent du mapping ; vérifiez le SQL sans promettre une instruction précise. Si la garantie devient un contrat client géré indépendamment, réexaminez son identité.

L’exemple emploie un record embarqué pris en charge par Hibernate 6.6 ; vérifiez votre fournisseur et la spécification avant réutilisation. Les extraits correspondent à des fichiers séparés et omettent accesseurs et aides de construction. Dans PostgreSQL, une clé étrangère ne crée pas elle-même d’index sur ses colonnes référençantes. Examinez les clés existantes et les plans avant d’ajouter un index product_id ; un scan peut rester efficace sur une petite table.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
