---
title: "Qu'est-ce que @ElementCollection ?"
description: "Découvrez comment mapper des collections de types simples ou d'objets embeddables avec JPA sans créer de relations d'entités complètes."
pubDate: 2026-10-12T12:48:00.000Z
translationKey: 141-what-is-elementcollection
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats où une `PurchaseRequest` (demande d'achat) nécessite une liste de tags (comme 'Urgent', 'Matériel-IT', 'Fournitures') pour aider le manager à filtrer les demandes. Vous ne voulez pas créer une entité `Tag` complète avec son propre ID et son propre cycle de vie juste pour stocker quelques chaînes de caractères. C'est là que `@ElementCollection` devient indispensable.

## Une collection de valeurs possédées
`@ElementCollection` mappe des valeurs simples comme String ou Integer, ou des objets valeur embeddable. Une valeur n'a pas d'identité d'entité ni de cycle de vie de repository indépendant : elle appartient à son propriétaire. Le mapping relationnel les stocke normalement dans une table de collection avec une clé étrangère vers celui-ci. Supprimer le propriétaire via JPA supprime aussi ses valeurs. Cela ne garantit pas une cascade automatique pour n'importe quel DELETE SQL : les contraintes de la base la déterminent.
## Exemple : les étiquettes d'une demande
Une demande possède un ensemble d'étiquettes. Le mapping nomme explicitement la table et la colonne du propriétaire :

```java
@Entity
public class PurchaseRequest {
    @Id
    @GeneratedValue
    private Long id;

    @ElementCollection
    @CollectionTable(name = "request_tags",
        joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "tag_name", nullable = false)
    private Set<String> tags = new HashSet<>();
}
```

Pour une nouvelle demande avec trois étiquettes distinctes, Hibernate peut écrire une ligne de demande et trois lignes de collection lors de la synchronisation. Il n'existe pas d'entité Tag gérée séparément. L'annotation seule ne garantit pas une disposition universelle de clé primaire : examinez le mapping et le schéma. Si une étiquette doit être unique par demande, ajoutez une contrainte telle que `UNIQUE (request_id, tag_name)` dans la migration.
## Modifier une valeur, pas une entité indépendante
String est immuable : changer une étiquette consiste à retirer l'ancienne valeur puis ajouter la nouvelle. Un embeddable peut avoir des propriétés mutables et leurs changements peuvent être synchronisés avec le propriétaire. Cela ne lui donne pas une identité d'entité indépendante. Attention aux objets placés dans un Set : modifier des champs utilisés par equals ou hashCode peut casser la collection. Remplacez les valeurs ou utilisez des objets valeur immuables lorsque cela convient.
## Exercice pratique
**Scénario :** Vous devez ajouter une liste de `PhoneNumber` (une classe `@Embeddable` avec `countryCode` et `number`) à une entité `Supplier`.

**Question :** Quelle annotation doit être placée sur le champ `List<PhoneNumber>` dans la classe `Supplier` ?

**Réponse :** `@ElementCollection`.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
