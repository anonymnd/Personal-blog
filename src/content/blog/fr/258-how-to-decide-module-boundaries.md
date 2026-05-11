---
title: "Comment Décider des Limites des Modules"
description: "Un guide pour organiser les capacités du domaine afin d'équilibrer la cohésion et le couplage dans l'architecture logicielle."
pubDate: 2026-10-17T09:48:00.000Z
translationKey: 258-how-to-decide-module-boundaries
locale: fr
tags: ["software-engineering","architecture-boundaries","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement. Au début, vous placez tout dans un seul package. Mais en ajoutant des fonctionnalités comme 'Approbation de la demande' et 'Commande fournisseur', votre code devient une 'boule de boue'. Modifier la logique d'approbation casse accidentellement le processus de commande car les classes sont trop entremêlées. C'est la lutte classique pour décider où un module s'arrête et un autre commence.

## Comprendre la Cohésion et le Couplage
Les limites des modules ne consistent pas seulement à créer des dossiers ; il s'agit de regrouper des comportements apparentés. Une cohésion élevée signifie que tout ce qui se trouve dans un module appartient ensemble pour atteindre un objectif unique. Un couplage faible signifie que les modules dépendent le moins possible les uns des autres. Si la modification d'un champ dans l'entité `Request` vous oblige à réécrire le service `Buyer`, vos limites sont probablement mal placées.

## Limites Basées sur le Domaine
Au lieu de couches techniques (comme 'services' ou 'repositories'), définissez les limites en fonction des capacités du domaine. Dans notre application d'approvisionnement, nous pouvons identifier trois modules distincts :
1. **Module de Demande** : Gère la soumission et la validation des demandes.
2. **Module d'Approbation** : Gère le flux de travail et les signatures des managers.
3. **Module de Commande** : Gère l'interaction avec les fournisseurs externes.

## Exemple Concret
Considérons la transition d'une demande vers une commande. Au lieu que le `RequestService` appelle directement `OrderService.create()`, nous utilisons un mécanisme de franchissement de limite.

```java
// Dans le Module de Demande
public class RequestService {
    public void finalizeRequest(Long requestId) {
        // Logique pour marquer la demande comme approuvée
        // Émettre l'événement : RequestApprovedEvent
    }
}

// Dans le Module de Commande
public class OrderListener {
    public void onRequestApproved(RequestApprovedEvent event) {
        // Logique pour créer un bon de commande
    }
}
```
En utilisant un événement, le module de Demande n'a pas besoin de savoir comment fonctionne le module de Commande. La limite est nette.

## Erreur Courante : L'Illusion de l'Interface
Beaucoup de développeurs pensent que placer une interface entre deux classes élimine le couplage. Ce n'est pas le cas. Si l'interface `ApprovalInterface` nécessite un objet `Request` qui est profondément lié aux détails internes du `RequestModule`, vous avez toujours un couplage fort. La limite n'est efficace que si les données échangées sont un contrat simple et stable.

## Exercice Pratique
**Scénario** : Vous avez un module qui gère à la fois les 'Profils Utilisateurs' et les 'Modes de Paiement'. Les utilisateurs changent souvent leur profil, mais les modes de paiement changent rarement et exigent une sécurité stricte. Doivent-ils rester dans un seul module ?

**Réponse** : Non. Ils doivent être séparés. Ils ont des rythmes de changement différents (volatilité) et des exigences de sécurité distinctes, ce qui signifie qu'ils manquent de cohésion.
