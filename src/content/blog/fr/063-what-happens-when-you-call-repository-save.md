---
title: "Que se passe-t-il quand on appelle repository.save() ?"
description: "Une analyse approfondie de la logique interne utilisée par Spring Data JPA pour choisir entre l'insertion et la mise à jour."
pubDate: 2026-10-09T06:48:00.000Z
translationKey: 063-what-happens-when-you-call-repository-save
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une requête et vous appelez `repository.save(request)`. On pourrait penser que cela envoie immédiatement une instruction `INSERT` à la base de données, mais le mécanisme est plus complexe. La méthode `save()` est une abstraction qui masque un processus de décision basé sur l'état de l'entité.

## Comment Spring Data choisit persist ou merge
La détection par défaut examine d'abord une propriété de version non primitive lorsqu'elle existe : une version nulle indique une entité nouvelle. Sinon, elle vérifie si l'identifiant est nul. Une classe implémentant `Persistable` peut fournir sa propre décision avec `isNew()`. Une entité nouvelle est passée à `EntityManager.persist()`, les autres à `merge()`. Ce mécanisme ne vérifie pas directement l'existence d'une ligne ; un merge peut provoquer une insertion ou une mise à jour. Pour un objet détaché, il copie l'état vers une instance gérée sans rattacher l'objet original.
## Valeur de retour et durée de la transaction
Pour une entité détachée, utilisez l'instance retournée par `save()` sans supposer que l'objet original devient géré. Si l'entrée est déjà gérée, merge peut retourner cette même instance. Vérifiez aussi la limite transactionnelle : lorsque seule la transaction du repository est utilisée, elle peut être terminée avant le retour à l'appelant ; même l'objet retourné n'est alors plus géré à cet endroit. Dans une transaction de service englobante, les modifications gérées peuvent être détectées jusqu'à la fermeture du contexte. Le résultat de save ne garantit pas une sauvegarde automatique illimitée.
## Le timing de l'exécution SQL
L'appel à `save()` ne déclenche pas toujours un SQL immédiat. JPA utilise une stratégie de 'write-behind'. Il met les changements en file d'attente dans le contexte de persistance et ne les 'flush' vers la base de données que lorsque c'est nécessaire (par exemple, avant une requête ou lors du commit de la transaction). Cependant, si vous utilisez `@GeneratedValue(strategy = GenerationType.IDENTITY)`, Hibernate doit exécuter l' `INSERT` immédiatement pour récupérer l'ID généré par la base.

## Exemple concret : Requête d'achat
```java
// Création d'une nouvelle requête
PurchaseRequest req = new PurchaseRequest("Laptop", 1200.00);
PurchaseRequest savedReq = repository.save(req); 
// Résultat : persist() appelé -> INSERT exécuté (si IDENTITY)

// Mise à jour de la requête
savedReq.setStatus("APPROVED");
PurchaseRequest updatedReq = repository.save(savedReq);
// Résultat : merge() appelé -> UPDATE exécuté lors du flush
```

## Erreur courante : L'entité détachée
**Erreur :** Appeler `repository.save(entity)` puis continuer à modifier l'objet `entity` au lieu du résultat retourné.
**Correction :** Affectez toujours le résultat : `entity = repository.save(entity);`.

## Exercice pratique
Une entité a un identifiant assigné non nul, aucune propriété de version nullable et aucune implémentation personnalisée de `Persistable.isNew()`. Selon la détection par défaut, save appelle-t-il persist ou merge ?

**Réponse :** Merge. Ce choix ne suffit pas à déterminer si le SQL final sera un INSERT ou un UPDATE : l'état de l'entité et le contenu de la base comptent aussi.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
