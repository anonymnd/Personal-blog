---
title: "Diagrammes de Séquence : Que se passe-t-il après le clic sur un bouton ?"
description: "Apprenez à visualiser le flux chronologique des messages entre les objets lorsqu'un utilisateur déclenche une action."
pubDate: 2026-10-07T18:48:00.000Z
translationKey: 027-sequence-diagrams-what-happens-after-the-user-clicks-a-button
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous expliquez une fonctionnalité à un nouveau développeur. Vous dites : « L'utilisateur clique sur acheter, le système vérifie le stock, puis envoie un e-mail ». Bien que cela semble simple, dans un système complexe, on oublie souvent quel objet précis est responsable de quelle action. C'est là que les diagrammes de séquence interviennent pour cartographier les interactions sur une ligne temporelle.

## La Logique des Lignes de Vie et des Messages
Dans un diagramme de séquence, nous utilisons des lignes de vie (lignes verticales pointillées) pour représenter différents objets ou composants. Les flèches horizontales représentent les messages envoyés entre eux. Contrairement à un organigramme qui montre des décisions, le diagramme de séquence se concentre sur l'ordre de la communication. Si l'Objet A appelle une méthode de l'Objet B, la flèche va de A vers B, et la ligne de vie de B affiche une "barre d'activation" pour indiquer qu'il traite la requête.

## Exemple : Flux de Demande d'Achat
Considérons une application d'achats où un demandeur soumet une requête. L'interaction suit cette séquence :
1. **Demandeur** → **RequestController** : `submitRequest(data)`
2. **RequestController** → **RequestService** : `validateAndSave(request)`
3. **RequestService** → **RequestRepository** : `save(entity)`
4. **RequestRepository** → **RequestService** : `Confirmation`
5. **RequestService** → **RequestController** : `Success Response`
6. **RequestController** → **Demandeur** : `Afficher "Demande Soumise"`

## Extrait de Code Illustratif
Voici comment le `RequestController` pourrait être implémenté dans un environnement Jakarta EE pour déclencher cette séquence :

```java
@Path("/requests")
public class RequestController {
    @Inject
    private RequestService requestService;

    @POST
    public Response submitRequest(PurchaseRequest request) {
        // Cet appel déclenche la flèche suivante dans le diagramme
        boolean result = requestService.validateAndSave(request);
        return result ? Response.ok().build() : Response.status(400).build();
    }
}
```

## Erreur courante : confondre notation et possibilités
Un diagramme de séquence ne se limite pas à un chemin linéaire. Utilisez un fragment `alt` pour approbation ou refus, `opt` pour une interaction facultative, `loop` pour une répétition et `par` pour des interactions parallèles. Ces fragments ont un sens UML précis ; les losanges d'un organigramme ne sont pas la notation adaptée. Choisissez un diagramme d'activité pour le flux métier global et un diagramme de séquence pour les lignes de vie et leurs messages ordonnés.
## Exercice Pratique
**Scénario :** Un Manager clique sur "Approuver" une demande. Le système doit mettre à jour le statut en 'Approuvé' et notifier l'Acheteur.
**Tâche :** Listez la séquence des messages.
**Vérification :** Manager → ApprovalController → RequestService → RequestRepository (Update) → NotificationService (Notify Buyer) → Manager (Success).


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
