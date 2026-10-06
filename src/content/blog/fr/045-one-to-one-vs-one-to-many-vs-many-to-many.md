---
title: "One-to-One vs One-to-Many vs Many-to-Many"
description: "Un guide pour choisir la bonne cardinalité de relation dans la conception de base de données pour garantir l'intégrité des données."
pubDate: 2026-10-08T12:48:00.000Z
translationKey: 045-one-to-one-vs-one-to-many-vs-many-to-many
locale: fr
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous construisiez un système d'achats. Vous avez des utilisateurs, des demandes d'achat et des fournisseurs. Si vous liez accidentellement une demande à plusieurs managers pour une seule étape d'approbation, vos données deviennent incohérentes. La difficulté n'est pas d'écrire le SQL, mais de décider comment les entités sont liées selon les règles métier.

## One-to-One (1:1)
Ceci se produit lorsqu'un enregistrement de la Table A est lié à exactement un enregistrement de la Table B. On l'utilise souvent pour des raisons de sécurité ou pour diviser une table trop large. Dans notre application, un `User` peut avoir une seule `UserConfiguration` (préférences d'interface).

## One-to-Many (1:N)
C'est la relation la plus courante. Un enregistrement de la Table A peut être lié à plusieurs enregistrements de la Table B, mais la Table B n'est liée qu'à un seul enregistrement de la Table A. Par exemple, un `Manager` peut approuver plusieurs `PurchaseRequests`, mais chaque demande est assignée à un seul `Manager`.

## Many-to-Many (M:N)
Cela arrive quand plusieurs enregistrements de la Table A sont liés à plusieurs enregistrements de la Table B. On ne peut pas l'implémenter avec une simple clé étrangère ; il faut une 'Table de Jointure'. Par exemple, une `PurchaseRequest` peut contenir plusieurs `Products`, et un `Product` peut figurer dans plusieurs demandes.

## Exemple concret : Logique d'achat

| Relation | Entités | Cardinalité | Implémentation |
| :--- | :--- | :--- | :--- |
| User → Profile | 1:1 | One-to-One | FK dans la table Profile |
| Manager → Request | 1:N | One-to-Many | FK dans la table Request |
| Request → Product | M:N | Many-to-Many | Table de jointure `request_items` |

```sql
-- Exemple de table de jointure Many-to-Many
CREATE TABLE request_items (
    request_id INT REFERENCES purchase_requests(id),
    product_id INT REFERENCES products(id),
    quantity INT,
    PRIMARY KEY (request_id, product_id)
);
```

## Erreur courante : Oublier la table de jointure
Une erreur fréquente est d'essayer de placer une colonne `product_id` directement dans la table `purchase_requests` pour une relation plusieurs-à-plusieurs. Cela limite la demande à un seul produit. La correction consiste à déplacer cette relation vers une entité de jointure séparée.

## Exercice pratique
Scénario : Un `Buyer` peut gérer plusieurs `Suppliers`, mais chaque `Supplier` est assigné à un seul `Buyer`. Quelle est la cardinalité ?

**Réponse :** One-to-Many (1:N) de Buyer vers Supplier.
