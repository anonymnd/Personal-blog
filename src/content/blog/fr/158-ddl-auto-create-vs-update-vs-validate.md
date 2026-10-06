---
title: "ddl-auto=create vs update vs validate"
description: "Comprendre comment la propriété ddl-auto de Spring Boot gère le schéma de votre base de données lors du développement et du déploiement."
pubDate: 2026-10-13T05:48:00.000Z
translationKey: 158-ddl-auto-create-vs-update-vs-validate
locale: fr
tags: ["software-engineering","schema-migrations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez ajouté un champ 'approvalDate' à votre entité ProcurementRequest, mais au démarrage de l'application, vous obtenez une `SQLGrammarException` car la colonne n'existe pas dans la base de données. Cela arrive quand votre code Java et votre schéma SQL ne sont plus synchronisés.

## Le rôle de ddl-auto
Dans Spring Boot, la propriété `spring.jpa.hibernate.ddl-auto` indique à Hibernate comment gérer le schéma de la base de données au démarrage. Elle sert de pont entre vos entités Java et les tables SQL réelles.

## Comparaison des stratégies

| Valeur | Comportement | Cas d'utilisation |
| :--- | :--- | :--- |
| `create` | Supprime et recrée toutes les tables | Prototypage initial |
| `update` | Ajoute colonnes/tables manquantes ; ne supprime jamais | Développement local rapide |
| `validate` | Vérifie la compatibilité ; échoue si différence | Production/Staging |

## Exemple concret : App de Procurement
Considérons un flux d'achat où un `Requester` soumet une demande. Si vous utilisez `ddl-auto=update` et ajoutez un champ `status` à votre entité `ProcurementRequest` :

```java
@Entity
public class ProcurementRequest {
    @Id @GeneratedValue
    private Long id;
    private String itemName;
    private String status; // Nouveau champ ajouté
}
```

Au redémarrage, Hibernate exécute : `ALTER TABLE procurement_request ADD COLUMN status VARCHAR(255);`. L'application démarre avec succès et les données existantes sont conservées.

## Erreur courante : Utiliser update en Production
Certains développeurs utilisent `update` en production pour éviter les scripts manuels. Cependant, `update` ne peut pas renommer de colonnes ou changer des types de données. Si vous renommez `itemName` en `productName`, Hibernate créera simplement une nouvelle colonne `productName`, laissant l'ancienne colonne `itemName` avec des données orphelines.

**Correction :** Utilisez `validate` en production. Cela garantit que l'application ne démarrera pas si le schéma est incorrect, vous obligeant à utiliser un outil de migration comme Flyway pour gérer le renommage proprement.

## Exercice pratique
Votre application est configurée avec `ddl-auto=validate`. Vous ajoutez un booléen `managerApproval` à votre entité mais oubliez d'exécuter le script SQL sur la base. Que se passe-t-il au démarrage ?

**Réponse :** L'application refusera de démarrer et lancera une `SchemaManagementException` car le schéma de la base ne correspond pas à la définition de l'entité.
