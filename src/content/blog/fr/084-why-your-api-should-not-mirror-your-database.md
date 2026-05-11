---
title: "Pourquoi votre API ne doit pas être le miroir de votre base de données"
description: "Apprenez à découpler la représentation de votre API de votre schéma de base de données pour garantir la maintenabilité et la sécurité."
pubDate: 2026-10-10T03:48:00.000Z
translationKey: 084-why-your-api-should-not-mirror-your-database
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez une application d'achats. Votre base de données possède une table `purchase_requests` avec des colonnes comme `req_id`, `user_id`, `status_code` et `internal_audit_flag`. Si vous retournez simplement cette table sous forme d'objet JSON, tout changement de schéma—comme renommer `req_id` en `request_id`—cassera instantanément toutes les applications mobiles et frontends qui utilisent votre service. Ce couplage fort est un piège classique.

## Le danger de l'exposition du schéma
Quand votre API reflète votre base de données, vous exposez des détails d'implémentation internes. Si un client voit `status_code: 4`, il ne sait pas ce que cela signifie sans une documentation interne. Plus grave encore, en retournant la ligne entière, vous pourriez accidentellement exposer des champs sensibles comme `internal_audit_flag` à un utilisateur qui ne devrait voir que le statut de sa demande.

## Le pattern DTO
Pour résoudre cela, utilisez des Data Transfer Objects (DTO). Un DTO est une classe simple qui définit exactement ce que l'API doit envoyer ou recevoir, peu importe le stockage. Dans un environnement Jakarta EE, votre entité peut être complexe, mais votre DTO reste épuré.

```java
// Entité Base de données
public class PurchaseRequestEntity {
    private Long reqId;
    private Integer statusCode;
    private Boolean internalAuditFlag;
}

// DTO API
public class PurchaseRequestDTO {
    private String requestId;
    private String statusLabel; // "En attente", "Approuvé"
}
```

## Exemple concret : Approbation d'achat
Considérons un manager qui approuve une demande. La base de données a besoin d'un timestamp `updated_by` et d'une colonne `version`. Cependant, le client de l'API a seulement besoin d'envoyer la décision d'approbation.

**Requête :** `PATCH /requests/123` 
`{ "status": "APPROVED" }` 

**Résultat :** Le serveur reçoit le DTO, récupère l'entité, met à jour le `statusCode` avec la valeur interne (ex: `2`), définit le timestamp en interne, et retourne un `200 OK` avec le `PurchaseRequestDTO` mis à jour.

## Erreur courante : Le contrôleur "Pass-Through"
Beaucoup de développeurs écrivent des contrôleurs qui retournent l'entité directement : `return repository.findById(id);`.
**Correction :** Mappez toujours l'entité vers un DTO via une méthode de conversion. Cela garantit que l'ajout d'une colonne en base de données ne modifie pas le contrat de l'API.

## Exercice pratique
Votre base de données a une table `User` avec `password_hash` et `email`. Vous devez créer un point de terminaison `GET /profile`.

**Question :** Devez-vous retourner l'entité `User` directement ?
**Réponse :** Non. Créez un `UserProfileDTO` contenant uniquement l' `email` (et d'autres champs publics), en omettant totalement le `password_hash` pour éviter les failles de sécurité.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
