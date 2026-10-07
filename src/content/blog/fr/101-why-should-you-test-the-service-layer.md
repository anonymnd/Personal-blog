---
title: "Choisir ses tests selon le risque réel détectable"
description: "Guide stratégique pour mapper les modes de défaillance au bon niveau de test via un scénario de conversion monétaire."
pubDate: 2026-10-07T12:48:00.000Z
translationKey: 101-why-should-you-test-the-service-layer
seriesOrder: 21
locale: fr
tags: ["backend-testing","learning-series"]
draft: false
---

## Le sophisme de la suite "au vert"

Une prise de conscience courante pour les développeurs est qu'un projet peut avoir une couverture de tests de 100 % et tout de même planter en production. Cela arrive quand on teste l'implémentation (comment le code est écrit) plutôt que le risque (ce qui peut réellement casser). Si vous moquez votre repository de base de données dans un test unitaire, vous testez votre capacité à appeler une méthode, pas si votre requête SQL est valide ou si votre mapping ORM est correct.

## Mapper les risques aux niveaux de test

Pour construire un portfolio robuste, vous devez assigner chaque défaillance potentielle au niveau de test capable de la détecter. Prenons un exemple de fonctionnalité de conversion de devises : elle calcule une valeur basée sur un flux de taux distant, applique une logique d'arrondi et sauvegarde l'historique dans une base de données.

### 1. Tests Unitaires : Logique et Cas Limites
Les tests unitaires doivent cibler la logique "pure". Dans notre scénario, la logique d'arrondi est le risque principal. Arrondit-on au demi supérieur ? Comment sont gérés les montants négatifs ?

**Ce qu'ils détectent :** Erreurs algorithmiques, erreurs de décalage (off-by-one) et NullPointerException dans la logique métier.
**Ce qu'ils ignorent :** Violations de contraintes de base de données, timeouts réseau ou erreurs de parsing JSON de l'API.

### 2. Tests d'Intégration : Les Frontières
Les tests d'intégration valident le contrat entre votre code et un système externe (Base de données, API, Message Broker).

**Ce qu'ils détectent :** Syntaxe SQL incorrecte, colonnes manquantes en base, noms de champs JSON erronés provenant du flux de taux, ou échecs de rollback de transaction.
**Ce qu'ils ignorent :** Les permutations complexes de logique métier (qui rendraient la suite de tests trop lente si elles étaient testées ici).

### 3. Le dilemme des méthodes privées
Les développeurs hésitent souvent à tester les méthodes privées. Si une méthode privée contient une logique complexe (comme notre arrondi), la solution n'est pas de la rendre publique ou d'utiliser la réflexion. Il faut tester le comportement public qui dépend de cette méthode. Si la logique privée est si complexe qu'elle nécessite sa propre suite, c'est le signal que cette logique doit être déplacée dans une classe "Strategy" ou "Utility" injectable, où elle peut être testée publiquement comme une unité.

## Exemple concret : Plan de distribution des risques

Voici la répartition des modes de défaillance pour la fonctionnalité de conversion.

| Mode de défaillance | Niveau de risque | Niveau de test approprié | Pourquoi ? |
| :--- | :--- | :--- | :--- |
| L'arrondi de 1,005 à 1,01 échoue | Élevé | Test Unitaire | Logique pure ; exécution rapide de nombreuses permutations. |
| L'API distante retourne 404 ou un JSON malformé | Moyen | Test d'Intégration | Valide le client HTTP et le mapping DTO. |
| La colonne `amount` en DB est trop petite | Élevé | Test d'Intégration | Seule une vraie DB (ou Testcontainer) détecte les erreurs de schéma. |
| Le service n'appelle pas le Repository | Faible | Test Unitaire (Mock) | Vérifie le flux d'orchestration (interaction). |
| La transaction ne commit pas après conversion | Moyen | Test d'Intégration | Nécessite un gestionnaire de transactions réel pour être vérifié. |

## Trace d'implémentation : Logique vs Persistance

Considérez ce snippet illustratif d'un service de conversion :

```java
public record ConversionResult(BigDecimal amount, LocalDateTime timestamp) {}

public class CurrencyService {
    private final RateClient rateClient;
    private final HistoryRepository repository;

    public CurrencyService(RateClient rateClient, HistoryRepository repository) {
        this.rateClient = rateClient;
        this.repository = repository;
    }

    public ConversionResult convert(BigDecimal amount, String from, String to) {
        BigDecimal rate = rateClient.getRate(from, to);
        BigDecimal result = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        
        var entity = new ConversionEntity(result, from, to);
        repository.save(entity);
        
        return new ConversionResult(result, LocalDateTime.now());
    }
}
```

**Le cas d'échec :** Si `ConversionEntity` a une annotation `@Column(precision = 5, scale = 2)` mais que le résultat est `123456.78`, un test unitaire utilisant un `HistoryRepository` moqué **réussira** car `repository.save()` n'est qu'une interaction simulée. Seul un test d'intégration touchant une vraie base de données lèvera une `DataIntegrityViolationException`.

## Exercice ciblé

**Scénario :** Vous ajoutez une fonctionnalité qui calcule une remise basée sur les points de fidélité d'un utilisateur. Elle récupère les points depuis un cache Redis et sauvegarde l'application de la remise dans une DB PostgreSQL.

**Question :** Où placez-vous les tests suivants et pourquoi ?
1. Vérifier qu'un utilisateur avec 0 point a 0 % de remise.
2. Vérifier que le timeout de connexion Redis est géré.
3. Vérifier que la valeur de la remise est stockée en DB sans perte de précision.

**Réponse :**
1. **Test Unitaire :** Logique pure reliant les points au pourcentage.
2. **Test d'Intégration :** Valide la frontière réseau réelle et la configuration du timeout du client Redis.
3. **Test d'Intégration :** Valide le type de colonne DB (ex: `NUMERIC` vs `FLOAT`) et le mapping ORM.

Pour l’exemple de dépassement numérique, utilisez réellement NUMERIC(5,2) dans PostgreSQL et forcez flush/commit dans le test. L’annotation ne modifie pas seule un schéma existant ; la traduction d’exception dépend de la frontière de persistance. Un parsing JSON pur peut aussi être testé unitairement ; le test de frontière vérifie la configuration réelle du client.

## Pour approfondir

- [JUnit documentation](https://docs.junit.org/6.1.3/overview.html)
