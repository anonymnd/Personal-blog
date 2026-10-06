---
title: "Qu'est-ce que l'Injection de Dépendances ?"
description: "Un guide pour débutants sur la manière dont l'Injection de Dépendances découple les composants dans les applications Spring Boot."
pubDate: 2026-10-08T22:48:00.000Z
translationKey: 055-what-is-dependency-injection
locale: fr
tags: ["software-engineering","spring-architecture","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achat. Vous avez un `PurchaseOrderService` qui a besoin d'un `NotificationService` pour envoyer des emails. Si vous écrivez `NotificationService service = new EmailNotificationService();` à l'intérieur de votre classe, vous avez codé la dépendance en dur. Si vous souhaitez passer aux notifications SMS plus tard, vous devrez modifier le code dans chaque service qui l'utilise. C'est ce qu'on appelle le couplage fort, et c'est un cauchemar pour les tests et la maintenance.

## Le Mécanisme Fondamental
L'Injection de Dépendances (DI) est un modèle de conception où un objet ne crée pas ses propres dépendances. Au lieu de cela, une entité externe (le conteneur IoC de Spring) "injecte" les objets requis au moment de l'exécution. Cela déplace la responsabilité de la création d'objets de la classe vers le framework, vous permettant de changer d'implémentation sans modifier la classe consommatrice.

## L'Injection par Constructeur en Pratique
Dans Spring Boot moderne, l'injection par constructeur est la norme. Elle garantit que la classe est initialisée avec toutes ses dépendances et permet l'utilisation de champs `final`, rendant le composant immuable.

```java
@Service
public class PurchaseOrderService {
    private final NotificationService notificationService;

    // Spring injecte l'implémentation ici
    public PurchaseOrderService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void completeOrder(Order order) {
        // Logique pour terminer la commande
        notificationService.send("Commande " + order.getId() + " prête !");
    }
}
```

## Résultats et Avantages
En utilisant l'interface `NotificationService` plutôt que la classe concrète `EmailNotificationService`, le `PurchaseOrderService` ne se soucie pas de la manière dont le message est envoyé. Le résultat est un système modulaire où vous pouvez injecter un `MockNotificationService` lors des tests unitaires pour éviter d'envoyer de vrais emails.

## Erreur Courante : L'Injection de Champ
Beaucoup de débutants utilisent `@Autowired` directement sur des champs privés. Bien que cela paraisse plus propre, cela rend la classe impossible à instancier manuellement dans un test sans utiliser la réflexion ou démarrer tout le contexte Spring.

**Correction :** Privilégiez toujours l'injection par constructeur. Elle rend les dépendances explicites et garantit que l'objet n'est jamais dans un état non initialisé.

## Exercice Pratique
Créez un `BuyerService` qui dépend d'un `VendorRepository`. Comment devez-vous définir le champ et le constructeur pour suivre les meilleures pratiques de la DI ?

**Réponse :** Définissez le `VendorRepository` comme un champ `private final` et créez un constructeur public qui assigne ce champ à partir d'un paramètre.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
