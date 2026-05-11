---
title: "Règles Métier vs Règles Techniques"
description: "Apprenez à séparer les politiques organisationnelles de haut niveau des contraintes d'implémentation technique de votre logiciel."
pubDate: 2026-10-07T09:48:00.000Z
translationKey: 018-business-rules-vs-technical-rules
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Votre responsable vous dit : « Seul un chef de département peut approuver des demandes de plus de 5 000 €. » Vous commencez immédiatement à écrire un bloc `if` dans votre contrôleur Java. Mais attendez : que se passe-t-il si l'entreprise change la limite à 7 000 € le mois prochain ? Si vous mélangez le « pourquoi » (politique métier) et le « comment » (contrainte technique), votre code devient rigide.

## Définir les Règles Métier
Les règles métier sont des politiques qui définissent le fonctionnement d'une entreprise, peu importe l'outil utilisé. Elles décrivent la logique du domaine. Dans notre application, une règle telle que « Un demandeur ne peut pas approuver sa propre demande » est une règle métier. C'est une politique de prévention de la fraude. Ces règles sont définies par les acteurs et les parties prenantes.

## Définir les Règles Techniques
Les règles techniques sont des contraintes imposées par la pile technologique ou l'architecture. Elles ne concernent pas l'objectif commercial, mais la stabilité du système. Par exemple, « La description de la demande doit être une chaîne UTF-8 de moins de 2000 caractères » ou « L'API doit répondre en moins de 200ms ». Ce sont des contraintes non fonctionnelles.

## Exemple concret : Le flux d'approbation
Considérons une entité de demande.

**Règle Métier :** Une demande doit être approuvée par un Manager si le total est > 1 000 €.
**Règle Technique :** Le champ `approvalDate` doit être stocké au format ISO-8601 dans la base de données.

```java
// Extrait illustratif : Séparation de la logique
public class ProcurementService {
    public void processRequest(Request req, User user) {
        // Règle Métier : Vérification d'autorisation
        if (req.getAmount() > 1000 && !user.hasRole("MANAGER")) {
            throw new UnauthorizedException("Approbation manager requise");
        }
        // Règle Technique : Validation
        if (req.getDescription() == null) {
            throw new ValidationException("La description est obligatoire");
        }
    }
}
```

## Erreur courante : Le codage en dur des politiques
Une erreur fréquente est d'enfouir les règles métier dans des triggers de base de données ou dans la validation de l'interface utilisateur. Si vous placez la limite de « 1 000 € » uniquement dans le JavaScript du frontend, un utilisateur pourrait la contourner via l'API. Correction : Les règles métier doivent résider dans la couche Domaine, tandis que les règles techniques résident dans les couches Infrastructure ou Validation.

## Exercice pratique
Identifiez s'il s'agit d'une règle métier ou technique :
1. « Le système doit supporter 500 utilisateurs simultanés. »
2. « Un acheteur ne peut pas commander d'articles auprès d'un fournisseur blacklisté. »

**Réponse :** 1 est Technique (Performance) ; 2 est Métier (Politique d'achat).
