---
title: "Transactions de Base de Données et Limites Transactionnelles Spring"
description: "Analyse approfondie d'ACID, du mécanisme de proxy @Transactional de Spring, de la propagation et des limites du rollback."
pubDate: 2026-10-08T01:48:00.000Z
translationKey: 149-what-is-a-database-transaction
seriesOrder: 34
locale: fr
tags: ["persistence","learning-series"]
draft: false
---

## La Promesse ACID et la Base de Données

Une transaction de base de données est une unité de travail logique qui garantit l'intégrité des données via les propriétés ACID. Dans un environnement PostgreSQL avec Hibernate, la transaction assure que lors d'un transfert de crédits de récompense du Compte A vers le Compte B, on ne se retrouve pas dans un état où les crédits sont déduits de A mais jamais ajoutés à B.

*   **Atomicité** : Toutes les opérations réussissent ou aucune ne le fait.
*   **Cohérence** : La base de données passe d'un état valide à un autre, respectant toutes les contraintes.
*   **Isolation** : Les transactions concurrentes ne voient pas les modifications partielles les unes des autres.
*   **Durabilité** : Une fois validée (commit), la donnée survit aux pannes du système.

## Le Mécanisme @Transactional de Spring

Spring implémente la gestion des transactions via des proxys AOP (Programmation Orientée Aspect). Lorsqu'une méthode est annotée `@Transactional`, Spring crée un wrapper proxy autour du bean. Le proxy intercepte l'appel, démarre une transaction via le `PlatformTransactionManager`, exécute la méthode, puis décide de valider (commit) ou d'annuler (rollback) selon le résultat.

### Le Piège de l'Auto-Invocation

Comme Spring utilise des proxys, l'interception ne se produit que lorsque l'appel provient de l' *extérieur* du bean. Si `methodeA()` appelle `methodeB()` au sein de la même classe, l'appel contourne le proxy et accède directement à la méthode locale. Par conséquent, les paramètres `@Transactional` de `methodeB()` sont ignorés.

### Propagation et Jonction

La propagation définit comment les transactions se comportent lorsqu'une méthode transactionnelle en appelle une autre. Le mode par défaut `REQUIRED` signifie : si une transaction existe déjà, joignez-la ; sinon, créez-en une nouvelle. Cela permet à plusieurs appels de service de participer à une seule unité atomique.

## Exemple Concret : Transfert de Crédits

Considérons un scénario où nous transférons des crédits et envoyons un reçu par email.

```java
@Service
public class RewardService {

    private final AccountRepository accountRepository;
    private final EmailService emailService;

    public RewardService(AccountRepository accountRepository, EmailService emailService) {
        this.accountRepository = accountRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void transferCredits(Long fromId, Long toId, Integer amount) {
        Account from = accountRepository.findById(fromId)
            .orElseThrow(() -> new IllegalArgumentException("Source non trouvée"));
        Account to = accountRepository.findById(toId)
            .orElseThrow(() -> new IllegalArgumentException("Cible non trouvée"));

        from.setCredits(from.getCredits() - amount);
        to.setCredits(to.getCredits() + amount);

        // Cet appel est interne (auto-invocation)
        this.sendNotification(fromId, toId, amount);

        if (amount > 1000) {
            throw new RuntimeException("Limite dépassée");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(Long from, Long to, Integer amount) {
        emailService.send("Crédits transférés : " + amount);
    }
}
```

### Analyse de la Trace d'Exécution

1.  **L'Appel Proxy** : Un contrôleur externe appelle `transferCredits()`. Le proxy démarre une transaction.
2.  **L'Auto-Invocation** : `transferCredits()` appelle `sendNotification()`. Comme c'est un appel local, l'instruction `REQUIRES_NEW` est **ignorée**. La notification s'exécute dans la transaction existante.
3.  **L'Effet de Bord** : `emailService.send()` est appelé. Il s'agit d'un appel API externe (SMTP/HTTP).
4.  **L'Échec** : Une `RuntimeException` est levée car le montant dépasse 1000.
5.  **Le Rollback** : Spring capture l'exception non vérifiée et demande à PostgreSQL d'annuler. Les soldes de crédits sont restaurés.
6.  **La Fuite** : L'email a déjà été envoyé. Les transactions de base de données **ne peuvent pas** annuler des effets de bord externes. L'utilisateur reçoit un reçu pour un transfert qui n'a techniquement jamais eu lieu.

## Défauts de Rollback

Par défaut, Spring effectue un rollback sur les `RuntimeException` et les `Error` (exceptions non vérifiées). Il ne le fait **pas** sur les exceptions vérifiées (ex: `IOException`, `SQLException`), sauf configuration explicite via `@Transactional(rollbackFor = Exception.class)`.

## Exercice

**Scénario** : Vous avez une méthode `processOrder()` marquée `@Transactional`. À l'intérieur, vous appelez `updateInventory()`, également marquée `@Transactional(propagation = Propagation.REQUIRED)`. `updateInventory()` lève une exception vérifiée `InsufficientStockException`.

1. La transaction est-elle annulée par défaut ?
2. Si `processOrder()` appelle `updateInventory()` via `this.updateInventory()`, le paramètre de propagation a-t-il une importance ?

**Réponse** :
1. Non. Les exceptions vérifiées ne déclenchent pas de rollback par défaut dans Spring.
2. Non. L'auto-invocation contourne le proxy ; la méthode est exécutée comme un simple appel Java dans la transaction existante lancée par `processOrder()`.

## Pour approfondir

- [Spring declarative transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
