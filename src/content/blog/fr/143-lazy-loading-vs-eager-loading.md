---
title: "Lazy Loading vs Eager Loading"
description: "Apprenez à optimiser vos requêtes PostgreSQL avec JPA et Hibernate en choisissant la bonne stratégie de chargement."
pubDate: 2026-10-12T14:48:00.000Z
translationKey: 143-lazy-loading-vs-eager-loading
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Lorsqu'un manager ouvre une "Demande d'Achat" pour vérifier le montant total, l'application ralentit brusquement car elle charge chaque article, chaque commentaire et le profil complet du demandeur, alors que le manager n'a besoin que de l'en-tête de la demande. C'est le dilemme classique entre le chargement Lazy et Eager.

## Le Mécanisme de Récupération
Dans JPA, les stratégies de récupération déterminent quand les entités liées sont extraites de PostgreSQL. Le chargement Eager (`FetchType.EAGER`) indique à Hibernate de récupérer les données associées immédiatement via une jointure ou une requête séparée. Le chargement Lazy (`FetchType.LAZY`) crée un objet proxy ; les données réelles ne sont récupérées que lorsque vous appelez une méthode getter sur cette collection ou entité.

## Comportements par Défaut
Il est essentiel de savoir que JPA a des règles par défaut. Les relations `@ManyToOne` et `@OneToOne` sont EAGER par défaut. À l'inverse, `@OneToMany` et `@ManyToMany` sont LAZY. Si vous avez une `PurchaseRequest` avec plusieurs `RequestItems`, Hibernate ne chargera pas les articles tant que vous ne le demanderez pas explicitement.

## Exemple Concret : Flux d'Achats
Considérons une entité `PurchaseRequest` et sa collection `RequestItem` :

```java
@Entity
public class PurchaseRequest {
    @Id @GeneratedValue
    private Long id;
    
    // Par défaut c'est LAZY
    @OneToMany(mappedBy = "request", fetch = FetchType.LAZY)
    private List<RequestItem> items;
}
```

Si vous appelez `repository.findById(1L)`, Hibernate exécute une requête pour la demande. Si vous appelez ensuite `request.getItems().size()`, Hibernate déclenche une seconde requête pour récupérer les articles. Si vous passiez en `EAGER`, une seule requête avec une jointure récupérerait tout d'un coup.

## Le Problème N+1 et Erreurs Courantes
Une erreur fréquente consiste à tout passer en `EAGER` pour éviter la `LazyInitializationException`. Cela mène souvent au problème N+1 : charger 10 demandes (1 requête) puis déclencher 10 requêtes séparées pour les articles de chaque demande. La solution est de garder les relations en `LAZY` et d'utiliser un "JOIN FETCH" dans votre repository quand les données sont nécessaires.

## Exercice Pratique
**Scénario :** Vous avez une relation `@ManyToOne` entre `RequestItem` et `PurchaseRequest`. Par défaut, est-ce Eager ou Lazy ? Si vous voulez éviter de charger la demande complète à chaque fois que vous listez les articles, que devez-vous modifier ?

**Réponse :** C'est EAGER par défaut. Vous devez explicitement configurer `fetch = FetchType.LAZY` dans l'annotation `@ManyToOne`.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
