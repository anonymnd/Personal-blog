---
title: "Que fait réellement @Transactional ?"
description: "Une exploration de la gestion de la cohérence des données par @Transactional et les pièges liés à l'interception par proxy."
pubDate: 2026-10-12T21:48:00.000Z
translationKey: 150-what-does-transactional-actually-do
locale: fr
tags: ["software-engineering","persistence","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une requête, et le système doit simultanément passer le statut à 'SOUMIS' et déduire le coût estimé du budget du département. Si la mise à jour du budget échoue, mais que le statut reste 'SOUMIS', vos données sont incohérentes. C'est là que `@Transactional` intervient.

## Interception par proxy et propagation
Avec la configuration habituelle par proxy, un bean transactionnel est appelé via un proxy JDK ou CGLIB. Par défaut, la propagation REQUIRED rejoint une transaction existante ou en crée une s'il n'y en a pas. Le gestionnaire coordonne la fin à la frontière propriétaire ; chaque méthode participante ne commit pas séparément la transaction partagée. Un appel interne contourne le conseil du proxy de cette méthode, mais une transaction englobante déjà active peut rester en vigueur.
## Opérations atomiques en pratique
Voici un extrait simplifié d'un service d'achats :

```java
@Service
public class ProcurementService {
    @Transactional
    public void processRequest(Long requestId) {
        Request req = requestRepo.findById(requestId).orElseThrow();
        req.setStatus(Status.SUBMITTED);
        
        Budget budget = budgetRepo.findByDept(req.getDept());
        budget.setAmount(budget.getAmount() - req.getCost());
        // Le dirty checking de Hibernate sauvegarde les deux entités à la fin
    }
}
```
Ici, si `budgetRepo.findByDept` lève une exception, le changement de statut n'est jamais enregistré dans PostgreSQL. Les deux opérations réussissent ou échouent ensemble.

## Le piège de l'auto-invocation
Une erreur classique consiste à appeler une méthode `@Transactional` depuis une autre méthode de la même classe. Comme l'appel se fait à l'intérieur de l'objet cible et non via le proxy, l'interception est contournée. La transaction ne démarre jamais.

**Incorrect :**
```java
public void submit(Long id) { 
    this.processRequest(id); // Proxy contourné !
}
@Transactional
public void processRequest(Long id) { ... }
```
**Correction :** Déplacez la logique transactionnelle dans un service séparé ou appelez la méthode depuis un bean externe.

## Comportement du Rollback et limites
Par défaut, Spring effectue un rollback pour les `RuntimeException` et `Error`, mais pas pour les exceptions vérifiées (checked). Vous pouvez modifier cela avec `@Transactional(rollbackFor = Exception.class)`. Notez bien que les transactions n'affectent que la base de données. Si votre méthode envoie un email avant qu'une exception ne déclenche un rollback, cet email ne peut pas être 'annulé'.

## Exercice pratique
**Scénario :** Vous avez une méthode qui met à jour le profil d'un utilisateur et enregistre l'action dans une table d'historique. Vous voulez que le log soit sauvegardé même si la mise à jour du profil échoue.
**Question :** Les deux opérations doivent-elles être dans la même méthode `@Transactional` ?
**Réponse :** Non. Vous devez utiliser une transaction séparée (ex: `@Transactional(propagation = Propagation.REQUIRES_NEW)`) pour la méthode de log afin qu'elle soit validée indépendamment.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
