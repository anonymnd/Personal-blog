---
title: "Class vs Record in Java"
description: "Apprenez quand utiliser une classe Java traditionnelle par rapport à un Record pour gérer des objets centrés sur les données."
pubDate: 2026-10-11T16:48:00.000Z
translationKey: 121-class-vs-record-in-java
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achat où un demandeur soumet une `PurchaseRequest`. Vous devez transporter ces données vers le manager. Si vous utilisez une classe standard, vous passez la moitié de votre temps à écrire des getters, `equals()`, `hashCode()` et `toString()` simplement pour que la logique d'approbation compare correctement les demandes. Ce code répétitif masque la logique métier.

## La différence fondamentale
Une classe ordinaire peut être mutable ou immuable : vous choisissez ses champs, constructeurs et comportements. Un record est une classe restreinte destinée aux porteurs de données transparents. Les records sont apparus en preview dans Java 14 et ont été finalisés dans Java 16. Le compilateur fournit les composants, le constructeur canonique, les accesseurs, equals, hashCode et toString. Un record peut déclarer une validation et des méthodes, mais ne peut pas étendre une autre classe ni ajouter des champs d'instance arbitraires.
## Mécanisme des Records
Les records sont immuables superficiellement (shallowly immutable). Cela signifie que les références qu'ils détiennent ne peuvent pas être modifiées après l'assignation, mais si un record contient une `List`, le contenu de cette liste peut toujours être modifié. Ils sont `final` par défaut.

## Exemple concret : Demande d'achat
Voici comment modéliser une demande avec les deux approches. Remarquez comment le record élimine le bruit.

```java
// Approche Classe Traditionnelle
public class RequestDTO {
    private final String item;
    private final int quantity;

    public RequestDTO(String item, int quantity) {
        this.item = item;
        this.quantity = quantity;
    }
    public String getItem() { return item; }
    public int getQuantity() { return quantity; }
    // equals(), hashCode(), et toString() seraient ici
}

// Approche Record
public record RequestRecord(String item, int quantity) {}
```

Résultat : `RequestRecord` offre la même fonctionnalité que `RequestDTO` en une seule ligne. Si vous comparez deux objets `RequestRecord` avec les mêmes valeurs, `equals()` renvoie `true` automatiquement.

## Erreur courante : immuabilité superficielle ou profonde
Un composant de record ne peut plus être réaffecté après construction, mais l'objet référencé peut rester mutable. Dans un constructeur compact, `List.copyOf(items)` protège la liste contre des modifications structurelles effectuées via la référence d'origine. La copie est non modifiable, pas profondément immuable : ses éléments mutables peuvent encore changer. Utilisez des types d'éléments immuables ou des copies défensives si le domaine exige cette garantie.
## Exercice pratique
Créez un record nommé `Order` avec un `String orderId` et un `double totalAmount`. Comment accédez-vous à l' `orderId` d'une instance nommée `myOrder` ?

**Réponse :** On utilise la méthode d'accès `myOrder.orderId()` (notez que les records n'utilisent pas le préfixe `get`).


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
