---
title: "Monolith vs Microservices"
description: "Un guide comparatif pour choisir entre un déploiement unique unifié et un système distribué de services indépendants."
pubDate: 2026-10-17T04:48:00.000Z
translationKey: 253-monolith-vs-microservices
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous construisez un système d'achats. Au début, vous avez un seul projet où la logique du demandeur, du manager et de l'acheteur cohabitent. À mesure que l'équipe s'agrandit, vous remarquez qu'une petite modification dans la logique d'approbation nécessite le redéploiement de toute l'application, provoquant une interruption du module de commande. C'est là que réside la tension classique entre Monolithe et Microservices.

## Comprendre le Monolithe
Une architecture monolithique est une unité de déploiement unique. Cela ne signifie pas que le code est désordonné ; un monolithe bien structuré utilise des modules séparés pour différents domaines. La caractéristique principale est que tous les composants partagent le même espace mémoire et la même connexion à la base de données. Cela simplifie le développement, mais crée un "rayon d'impact" où une fuite de mémoire dans un module peut faire planter tout le système.

## Le Passage aux Microservices
Les microservices décomposent l'application en services indépendants basés sur les capacités du domaine. Dans notre application d'achats, le Service de Demande, le Service d'Approbation et le Service de Commande seraient des processus distincts communiquant via des API. Cela permet de mettre à l'échelle le Service de Commande indépendamment si la charge de l'acheteur augmente.

## Tableau Comparatif
| Caractéristique | Monolithe | Microservices |
| :--- | :--- | :--- |
| Déploiement | Unité unique | Unités indépendantes multiples |
| Cohérence | Forte (ACID) | Éventuelle (Distribuée) |
| Complexité | Faible overhead opérationnel | Fort overhead opérationnel |
| Panne | Point de défaillance unique | Risques de pannes distribuées |

## Exemple Concret : Flux d'Achats
Dans un monolithe, le `RequestService` appelle `ApprovalService.approve(id)` directement en Java. En microservices, cela ressemble à ceci :

```java
// Extrait illustratif d'un appel Microservice
public void submitRequest(Request req) {
    requestRepo.save(req);
    restTemplate.postForEntity("http://approval-service/approve", req, Void.class);
}
```
Résultat : Si le Service d'Approbation est hors service, le Service de Demande peut toujours accepter des requêtes et les mettre en file d'attente.

## Erreur Courante : Le Monolithe Distribué
Une erreur fréquente consiste à diviser les services par couches techniques (ex: un 'Service Base de Données' et un 'Service UI') plutôt que par domaines métier. Cela crée un couplage fort. Correction : Définissez les limites selon les capacités métier (ex: 'Achats' vs 'Inventaire').

## Exercice Pratique
Scénario : Votre application a un module 'Reporting' qui consomme 90% du CPU chaque lundi, ralentissant le processus de 'Commande' pour tout le monde. Quelle architecture résout cela le plus efficacement ?

**Réponse :** Microservices. En isolant le 'Reporting' dans son propre service, vous pouvez augmenter ses ressources matérielles sans affecter le service de 'Commande'.
