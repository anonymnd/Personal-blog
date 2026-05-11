---
title: "Qu'est-ce qu'un Monolithe Modulaire ?"
description: "Une exploration de l'organisation d'une unité de déploiement unique en modules de domaine indépendants pour éviter le 'gros plat de spaghettis'."
pubDate: 2026-10-17T06:48:00.000Z
translationKey: 255-what-is-a-modular-monolith
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement. Au début, tout est simple. Mais en ajoutant des fonctionnalités pour les demandeurs, les gestionnaires et les acheteurs, votre code devient un réseau emmêlé. Modifier la logique d'approbation casse accidentellement le processus de commande. C'est ce qu'on appelle le 'Big Ball of Mud'—un échec monolithique classique où chaque partie du système dépend de toutes les autres.

## Le Concept de Monolithe Modulaire
Un monolithe modulaire est un modèle architectural où l'application est déployée comme une seule unité (un seul JAR ou un seul processus), mais où le code interne est strictement partitionné en modules indépendants. Contrairement à un monolithe traditionnel, où le code est organisé par couches techniques (contrôleurs, services, dépôts), le monolithe modulaire organise le code par capacités de domaine.

## Frontières et Cohésion
L'objectif est d'avoir une forte cohésion à l'intérieur d'un module et un couplage faible entre eux. Une frontière n'est pas seulement un dossier ; c'est une règle. Par exemple, le module `Achats` ne doit pas accéder directement aux tables de base de données internes du module `Inventaire`. Il appelle plutôt une API publique fournie par le module `Inventaire`.

## Exemple Concret : Flux d'Approvisionnement
Considérons trois modules : `Demande`, `Approbation` et `Commande`.

```java
// Dans le module Approbation
public class ApprovalService {
    public void approveRequest(Long requestId) {
        // Logique pour marquer la demande comme approuvée
        // Ensuite, notifier le module Commande via un événement interne
        orderingClient.createPurchaseOrder(requestId);
    }
}
```
Dans cette configuration, le module `Approbation` n'a pas besoin de savoir comment une `Commande` est créée ; il sait seulement que le module `Commande` propose une méthode pour le faire. Le résultat est un système facile à naviguer et à tester.

## Erreur Courante : L'Illusion de l'Interface
Une erreur fréquente consiste à penser que placer une interface entre deux modules élimine automatiquement le couplage. Si l'interface du module `Demande` nécessite un objet complexe appartenant au module `Commande`, ils restent fortement couplés. Pour corriger cela, utilisez des objets de transfert de données (DTO) simples ou des identifiants primitifs.

## Exercice Pratique
**Scénario :** Vous avez un module `Utilisateur` et un module `Notification`. Le module `Utilisateur` doit envoyer un e-mail de bienvenue lors de l'inscription.
**Question :** Le module `Utilisateur` doit-il consulter la base de données interne du module `Notification` pour trouver le modèle d'e-mail, ou appeler une méthode publique `sendEmail()` ?
**Réponse :** Il doit appeler la méthode publique `sendEmail()` pour respecter la frontière et éviter le couplage.
