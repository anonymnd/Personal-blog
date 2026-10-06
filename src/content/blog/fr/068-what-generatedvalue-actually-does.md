---
title: "Ce que fait réellement @GeneratedValue"
description: "Une exploration de la gestion des clés primaires par JPA et des différences subtiles entre ses stratégies."
pubDate: 2026-10-09T11:48:00.000Z
translationKey: 068-what-generatedvalue-actually-does
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs pensent qu'ajouter `@GeneratedValue` se contente de dire à la base de données de « créer un numéro », mais cela ignore la coordination complexe entre l'application Java et le moteur de base de données. La difficulté commence quand on réalise que l'application peut envoyer une instruction `INSERT` beaucoup plus tôt ou plus tard que prévu.

## Le mécanisme central
`@GeneratedValue` est une annotation JPA qui délègue la responsabilité de l'attribution d'une clé primaire au fournisseur de persistance (comme Hibernate). Au lieu d'appeler manuellement `setId()`, le fournisseur détermine la valeur selon un `GenerationType` spécifique. Cela garantit l'unicité dans la table sans que le développeur ait à suivre le dernier identifiant utilisé.

## Comparaison des stratégies

| Stratégie | Mécanisme | Impact Performance |
| :--- | :--- | :--- |
| IDENTITY | Colonne auto-incrément DB | Désactive les inserts groupés |
| SEQUENCE | Objet séquence DB | Efficace, supporte le batching |
| TABLE | Table d'ID séparée | Le plus lent, coût élevé |
| AUTO | Le fournisseur choisit | Imprévisible selon la DB |

## Exemple concret : Application d'achats
Imaginons une entité `PurchaseRequest` où chaque demande a besoin d'un ID unique. L'utilisation de `SEQUENCE` permet à Hibernate de « réserver » des IDs avant que la transaction ne soit réellement envoyée à la base de données.

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "proc_seq")
    @SequenceGenerator(name = "proc_seq", sequenceName = "purchase_request_seq", allocationSize = 50)
    private Long id;
    
    private String itemDescription;
    // Getters et setters
}
```
Ici, si vous enregistrez 10 demandes, Hibernate peut n'appeler la base de données qu'une seule fois pour récupérer un bloc de 50 IDs, réduisant ainsi les allers-retours réseau.

## Erreur courante : Le piège de l'Identity
Une erreur fréquente est d'utiliser `GenerationType.IDENTITY` et de se demander pourquoi `saveAll()` est lent. Comme `IDENTITY` nécessite que la base de données génère l'ID pendant l' `INSERT`, Hibernate ne peut pas retarder l'exécution SQL jusqu'à la phase de flush. Il doit exécuter l' `INSERT` immédiatement pour récupérer l'ID.

**Correction :** Passez à `SEQUENCE` si votre base de données le supporte (comme PostgreSQL ou Oracle) pour activer le regroupement des écritures.

## Exercice pratique
Si vous utilisez `GenerationType.AUTO` et que vous passez d'une base H2 à MySQL, pourquoi le comportement de génération d'ID pourrait-il changer ?

**Réponse :** Parce qu'avec `AUTO`, c'est le fournisseur qui décide. H2 pourrait utiliser une séquence, alors que MySQL pourrait basculer vers une stratégie de table ou d'identité, modifiant ainsi la façon dont les IDs sont alloués.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
