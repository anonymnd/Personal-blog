---
title: "Qu'est-ce qu'une Vertical Slice en développement logiciel ?"
description: "Découvrez comment livrer de la valeur rapidement en implémentant une fonctionnalité complète à travers toutes les couches architecturales."
pubDate: 2026-10-06T23:48:00.000Z
translationKey: 008-what-is-a-vertical-slice-in-software-development
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Votre manager vous demande où vous en êtes, et vous lui montrez un schéma de base de données complexe et des points de terminaison API qui renvoient du JSON vide. Le manager est frustré car il ne peut rien *faire* avec l'application. C'est le piège du 'découpage horizontal', où l'on construit toute la couche de données, puis toute la couche service, avant même de toucher à l'interface utilisateur.

## Le concept de la Vertical Slice

Une "vertical slice" (tranche verticale) est une approche où l'on implémente une seule petite fonctionnalité de bout en bout. Au lieu de construire toute la fondation d'abord, on coupe une fine tranche à travers chaque couche : l'UI, la logique métier et le stockage. L'objectif est de produire une fonctionnalité opérationnelle qui apporte une valeur métier réelle, permettant de valider vos choix architecturaux dès le début.

## Application à une application d'achats

Plutôt que de créer tout le système de 'Gestion des Utilisateurs', commencez par un résultat précis : "Un demandeur peut soumettre une demande d'achat".

**Règles métier :**
- La demande doit contenir un nom d'article et une quantité.
- Le statut initial de la demande est 'En attente'.

**Critères d'acceptation :**
- L'utilisateur remplit un formulaire et clique sur 'Envoyer'.
- Les données sont enregistrées en base de données.
- Un message de succès s'affiche à l'écran.

## Exemple concret : La soumission de demande

Dans un contexte Jakarta EE, une tranche verticale pour cette fonctionnalité ressemblerait à cet extrait illustratif :

```java
@Path("/requests")
public class RequestResource {
    @Inject RequestService service;

    @POST
    public Response submitRequest(PurchaseRequest req) {
        service.save(req); // Logique pour fixer le statut à 'Pending'
        return Response.ok("Demande soumise").build();
    }
}
```

Résultat : Le demandeur peut désormais envoyer une requête. Vous avez prouvé que votre API, votre service et votre base de données communiquent correctement.

## Erreur courante : Le piège de l'infrastructure d'abord

Une erreur fréquente est de passer deux semaines à perfectionner un pattern de dépôt générique ou un gestionnaire d'erreurs global avant d'implémenter la première fonctionnalité.

**Correction :** Construisez le chemin le plus simple possible pour la première tranche. Si vous avez besoin d'un dépôt, créez-en un basique. Ne le transformez en pattern générique qu'après avoir réalisé trois ou quatre tranches qui révèlent un motif commun.

## Exercice pratique

**Scénario :** Vous devez ajouter une fonctionnalité d' 'Approbation Manager' à l'application. Définissez à quoi ressemblerait une vertical slice pour cela.

**Vérification :** Votre réponse doit inclure une action UI spécifique (ex: cliquer sur 'Approuver'), une règle métier (ex: le statut passe de 'En attente' à 'Approuvé') et un changement de donnée (mise à jour de l'enregistrement en BDD).
