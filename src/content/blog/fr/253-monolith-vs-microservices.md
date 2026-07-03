---
title: "Définir les Limites de Modules Avant le Déploiement Distribué"
description: "Analyse approfondie de la cohésion, du couplage et de la transition du monolithe modulaire vers les microservices via un scénario de réservation de voyage."
pubDate: 2026-10-09T00:48:00.000Z
translationKey: 253-monolith-vs-microservices
seriesOrder: 57
locale: fr
tags: ["architecture-boundaries","learning-series"]
draft: false
---

## L'illusion du 'Microservice d'abord'

Beaucoup d'équipes confondent les microservices avec un modèle organisationnel plutôt qu'avec une stratégie de déploiement. Le défi principal du génie logiciel n'est pas de décider s'il faut utiliser un appel réseau ou un appel de méthode, mais de définir où une capacité s'arrête et où une autre commence. Lorsque les limites sont mal tracées, on obtient un monolithe distribué : un système avec la complexité des microservices mais le couplage serré d'un monolithe, où une modification du service 'Paiement' nécessite un déploiement simultané du service 'Itinéraire'.

## Cohésion et Couplage comme Métriques de Limite

Pour déterminer une limite, nous évaluons deux métriques :

1. **Cohésion** : À quel point les responsabilités au sein d'un module sont-elles liées ? Une cohésion élevée signifie que tout dans le module soutient une capacité unique et bien définie. Si le module 'Paiement' commence à gérer les 'Points de Fidélité', la cohésion chute car la logique de fidélité est une capacité de domaine distincte.
2. **Couplage** : À quel point un module dépend-il des détails internes d'un autre ? Un couplage faible signifie que les modules interagissent via des contrats stables. Si le module 'Itinéraire' interroge directement les tables de la base de données 'Paiement', ils sont étroitement couplés, qu'ils soient dans la même JVM ou sur des serveurs différents.

## Scénario : Système de Réservation de Voyage

Considérons un système avec trois capacités principales : **Itinéraire**, **Paiement** et **Support Client**.

### Phase du Monolithe Modulaire
Initialement, nous organisons ces capacités comme des packages distincts dans une seule application Spring Boot. La clé est d'éviter l'organisation par couches (ex: `com.app.service`, `com.app.repository`) au profit d'une organisation par fonctionnalités :

- `com.travel.itinerary`
- `com.travel.payment`
- `com.travel.support`

À ce stade, nous imposons les limites via les modificateurs de visibilité Java et des tests architecturaux (comme ArchUnit). Le module `Paiement` ne doit pas accéder directement au repository de l'Itinéraire ; il doit passer par une interface de service définie.

### Évaluer le Besoin d'un Déploiement Distribué
Maintenant, nous nous demandons : le module `Paiement` doit-il réellement être un microservice indépendant ?

**Raisons de le garder dans le monolithe :**
- **Intégrité Transactionnelle** : Si la réservation d'un itinéraire et le traitement du paiement doivent se produire dans une seule transaction atomique pour éviter les réservations orphelines, le garder dans un seul déploiement simplifie la cohérence.
- **Surcharge Opérationnelle** : Un service séparé nécessite son propre pipeline CI/CD, sa propre surveillance et ses propres correctifs de sécurité.

**Raisons de passer à un microservice :**
- **Besoins de Mise à l'Échelle** : Le traitement des paiements peut nécessiter un chiffrement gourmand en ressources ou gérer des pics massifs lors de promotions qui feraient planter le module Itinéraire.
- **Isolation de la Sécurité** : Le module Paiement manipule des données sensibles PCI-DSS. L'isoler dans un déploiement séparé permet d'appliquer des pare-feu réseau plus stricts.
- **Évolution Indépendante** : L'équipe Paiement doit déployer des mises à jour cinq fois par jour sans risquer la stabilité du système d'Itinéraire.

## Artefact Travaillé : Plan d'Application des Limites

Voici un plan pour passer d'un monolithe à base de données partagée à une structure modulaire permettant une extraction future.

### 1. Schéma de Propriété des Données
Au lieu d'un schéma partagé géant, nous partitionnons logiquement les données. Même dans une seule base de données, nous utilisons des schémas séparés ou des préfixes de nommage.

| Module | Tables Propriétaires | Règle d'Accès |
| :--- | :--- | :--- |
| Itinerary | `itinerary`, `flight_segment` | Seul `com.travel.itinerary` peut lire/écrire |
| Payment | `transaction`, `payment_method` | Seul `com.travel.payment` peut lire/écrire |
| Support | `ticket`, `case_log` | Seul `com.travel.support` peut lire/écrire |

### 2. Interaction Basée sur des Contrats (Illustratif)
Pour éviter le couplage serré, nous utilisons des records pour les objets de transfert de données (DTO) et évitons de partager les entités JPA entre les limites.

```java
// Situé dans com.travel.payment.api
public record PaymentRequest(String bookingId, BigDecimal amount, String currency) {}
public record PaymentResponse(String transactionId, PaymentStatus status) {}

// com.travel.payment.api
public interface PaymentService {
    // Le seul point d'entrée pour les autres modules
    PaymentResponse processPayment(PaymentRequest request);
}
```

### 3. Trace de Panne : Le Piège Distribué
Si nous déplaçons `Payment` vers un microservice sans corriger les limites, nous rencontrons cette trace d'erreur :
1. `ItineraryService` appelle `PaymentClient.process()`.
2. `PaymentService` rencontre un timeout dû à la latence réseau.
3. `ItineraryService` renvoie une erreur 500, mais le paiement a réussi en arrière-plan.
4. Résultat : Le client est débité, mais l'itinéraire n'est pas confirmé.

**Solution** : Implémenter un modèle asynchrone (pattern Outbox) ou une Saga pour gérer la cohérence éventuelle, ce qui est le prix à payer pour choisir le déploiement distribué.

## Exercice

**Scénario** : Vous avez un module `CustomerSupport` qui doit afficher les trois derniers paiements d'un utilisateur. Actuellement, il appelle `PaymentRepository.findByUserId()`.

**Question** : Pourquoi s'agit-il d'une violation de limite, et comment cela devrait-il être corrigé pour permettre au module `Payment` d'être déplacé sur un serveur séparé plus tard ?

**Réponse** : C'est une violation car `CustomerSupport` dépend de la structure de données interne (le Repository) du module `Payment`. Si le schéma de la base de données `Payment` change, `CustomerSupport` plante. Pour corriger cela, le module `Payment` doit exposer une méthode publique (ex: `PaymentService.getRecentPayments(userId)`) qui retourne un DTO. Le module `CustomerSupport` appelle cette méthode, restant ignorant de la manière dont les données sont stockées.

Une frontière est une règle d’accès voulue, pas une protection créée par un préfixe de table. Placez PaymentService public dans payment.api et gardez l’implémentation interne ; utilisez visibilité, tests d’architecture et permissions DB adaptées. Les microservices touchent aussi équipes et exploitation. Même un monolithe ne peut inclure atomiquement un prestataire de paiement externe dans sa transaction SQL ordinaire. Un timeout signifie résultat incertain : clés d’idempotence stables, rapprochement et états pending/confirmed explicites. Outbox/saga n’annulent pas seuls une charge externe. L’isolation par déploiement ne prouve pas la conformité à une norme.
