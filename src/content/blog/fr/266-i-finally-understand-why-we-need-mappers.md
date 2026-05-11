---
title: "J'ai enfin compris pourquoi nous avons besoin de Mappers"
description: "Une analyse approfondie de la séparation conceptuelle entre les entités de base de données et les objets de transfert de données pour éviter les fuites architecturales."
pubDate: 2026-10-17T17:48:00.000Z
translationKey: 266-i-finally-understand-why-we-need-mappers
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Vous avez une entité `PurchaseRequest` qui correspond exactement à votre table de base de données, contenant des champs sensibles comme `internalAuditCode` et `databaseVersion`. Si vous retournez cette entité directement via votre contrôleur REST, vous exposez accidentellement des détails internes du système au frontend. C'est précisément là que l'utilité des Mappers devient évidente.

## Le conflit entre Entité et DTO

Une Entité représente la donnée telle qu'elle existe en base de données. Un Objet de Transfert de Données (DTO) représente la donnée telle que le client a besoin de la voir. En utilisant le même objet pour les deux, on crée un couplage fort. Si vous modifiez le nom d'une colonne en base de données, le contrat de votre API est rompu pour tous les clients. Les Mappers servent de couche de traduction pour découpler ces deux mondes.

## Fonctionnement du mécanisme de Mapping

Un Mapper est un composant dédié dont le seul rôle est de copier des données d'un objet à un autre. Au lieu de polluer votre logique métier avec des appels `dto.setName(entity.getName())`, vous encapsulez cette logique. Cela garantit que votre couche service gère les règles métier, tandis que le mapper gère la transformation structurelle.

## Exemple concret : Demande d'achat

Considérons un scénario où un demandeur soumet une requête. L'entité contient tout, mais le DTO ne nécessite que l'essentiel.

```java
// Entité : Représentation base de données
public class PurchaseRequest {
    private Long id;
    private String item;
    private Double price;
    private String internalAuditCode; // Secret !
}

// DTO : Représentation API
public class PurchaseRequestDTO {
    private String item;
    private Double price;
}

// Mapper
public class PurchaseMapper {
    public PurchaseRequestDTO toDto(PurchaseRequest entity) {
        PurchaseRequestDTO dto = new PurchaseRequestDTO();
        dto.setItem(entity.getItem());
        dto.setPrice(entity.getPrice());
        return dto;
    }
}
```

**Résultat :** Le client de l'API ne reçoit que l'article et le prix, gardant l' `internalAuditCode` sécurisé sur le serveur.

## Erreur courante : Mapper dans le Contrôleur

Une erreur fréquente consiste à placer la logique de mapping à l'intérieur du `@RestController`. Cela surcharge le contrôleur et empêche la réutilisation de la logique de mapping dans d'autres services.

**Correction :** Créez une classe Mapper distincte ou utilisez une bibliothèque comme MapStruct. Injectez le mapper dans votre service pour garder les contrôleurs légers.

## Exercice pratique

**Tâche :** Vous avez une entité `Manager` avec `id`, `name` et `salary`. Vous avez besoin d'un `ManagerDTO` qui n'affiche que le `name`. Écrivez la logique de la méthode `toDto`.

**Vérification :** La méthode doit instancier `ManagerDTO` et appeler `dto.setName(entity.getName())`, en ignorant les champs `id` et `salary`.
