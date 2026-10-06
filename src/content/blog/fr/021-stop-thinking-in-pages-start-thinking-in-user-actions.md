---
title: "Arrêtez de penser en pages : commencez à penser en actions utilisateur"
description: "Apprenez à passer d'une conception visuelle basée sur les pages à un modèle fonctionnel basé sur les actions pour créer une logique métier plus robuste."
pubDate: 2026-10-07T12:48:00.000Z
translationKey: 021-stop-thinking-in-pages-start-thinking-in-user-actions
locale: fr
tags: ["software-engineering","business-workflows","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs débutants commencent par dessiner des écrans. Ils se disent : « J'ai besoin d'une page de connexion, d'une page de tableau de bord et d'une page de demande ». C'est un piège. En concevant par pages, on oublie souvent les règles métier complexes qui se produisent *entre* ces écrans, ce qui fragmente la logique.

## L'Acteur vs La Page
Au lieu d'une page, concentrez-vous sur l'**Acteur**. Un acteur est un rôle (comme un Demandeur ou un Manager) qui interagit avec le système. Une seule action peut traverser plusieurs pages ou se produire en arrière-plan. En vous concentrant sur l'action (ex: « Soumettre une demande d'achat »), vous définissez ce que le système *fait*, peu importe l'interface.

## Cartographier le flux d'action
Prenons une application d'achats. Au lieu d'une « Page Formulaire », définissons l'action : **Soumettre Demande**.
- **Acteur** : Demandeur
- **Entité Domaine** : ProcurementRequest
- **Chemin nominal** : Le demandeur remplit les détails → Le système valide le budget → Le statut devient 'En attente'.
- **Chemin d'erreur** : Le demandeur soumet un montant vide → Le système renvoie une erreur de validation.
- **Autorisation** : Seuls les utilisateurs avec le rôle 'Employé' peuvent déclencher cette action.

## Exemple concret : Le processus d'approbation
Si on pense en pages, on crée juste une « Page d'approbation » avec un bouton. Si on pense en actions, on modélise **Approuver Demande** :

```java
// Extrait illustratif de la couche Service
public class ProcurementService {
    public void approveRequest(Long requestId, User manager) {
        // 1. Vérification d'autorisation
        if (!manager.hasRole("MANAGER")) throw new UnauthorizedException();
        
        // 2. Logique métier
        ProcurementRequest request = repository.findById(requestId);
        if (request.getStatus() != Status.PENDING) throw new IllegalStateException("Demande non en attente");
        
        request.setStatus(Status.APPROVED);
        repository.save(request);
    }
}
```
Résultat : La logique est découplée de l'UI. Si vous ajoutez plus tard une « Auto-approbation », vous réutilisez cette action sans avoir besoin d'une page.

## Erreur courante : La logique pilotée par l'UI
Une erreur classique est de placer les règles métier dans le gestionnaire de clic du bouton côté frontend.
**Faux** : `if (amount > 1000) { showManagerAlert(); }` 
**Correction** : Déplacez cela dans l'action backend. L'UI ne fait que déclencher l'action ; le système décide du résultat.

## Exercice pratique
Définissez l'action **Commander Article** pour un Acheteur. Listez un chemin nominal et une contrainte d'autorisation.

**Vérification** : Chemin nominal : L'acheteur sélectionne une demande approuvée → crée un Bon de Commande. Contrainte : Seuls les utilisateurs avec le rôle 'Acheteur' peuvent exécuter cette action.
