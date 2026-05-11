---
title: "Comment Concevoir des Objets de Requête et de Réponse"
description: "Apprenez à structurer les objets de transfert de données pour les API REST afin d'assurer une communication claire entre le client et le serveur."
pubDate: 2026-10-10T04:48:00.000Z
translationKey: 085-how-to-design-request-and-response-objects
locale: fr
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez un système d'approvisionnement où un demandeur soumet une demande d'achat. Une difficulté courante pour les débutants est de décider s'il faut envoyer l'entité de base de données entière ou un objet sur mesure. L'envoi d'entités brutes expose souvent des identifiants internes ou des champs sensibles, tandis que des objets trop génériques rendent l'API ambiguë.

## Séparer les Entités des DTO
Pour éviter de divulguer la logique interne, utilisez des Data Transfer Objects (DTO). Un objet de requête définit exactement ce que le client doit fournir, tandis qu'un objet de réponse définit ce que le serveur s'engage à renvoyer. Pour une demande d'achat, le `PurchaseRequestRequest` peut ne contenir que `itemName` et `quantity`, alors que le `PurchaseRequestResponse` inclut le `requestId` et le `status` générés par le serveur.

## Structurer l'Objet de Requête
Les objets de requête doivent être concis. Évitez d'inclure des champs que le serveur doit déterminer, comme les horodatages ou les clés primaires lors de la création. Si un manager approuve une demande, l'objet de requête doit se concentrer sur l'action (ex: `approvalStatus` et `comments`) plutôt que de répéter tous les détails de la commande.

## Concevoir l'Objet de Réponse
Les réponses doivent être prévisibles. Au lieu de renvoyer une simple chaîne de caractères, utilisez un objet structuré. Cela permet d'ajouter des métadonnées plus tard sans casser le client. Pour une création réussie, renvoyez l'objet créé avec un statut `201 Created` et un en-tête `Location`.

## Exemple Concret : Soumission d'Approvisionnement
Voici un extrait illustratif de l'apparence de ces objets dans une API basée sur Jakarta :

```java
// Objet de Requête
public class ProcurementRequestDTO {
    private String itemDescription;
    private Integer quantity;
    // Getters et Setters
}

// Objet de Réponse
public class ProcurementResponseDTO {
    private Long requestId;
    private String status;
    private LocalDateTime createdAt;
    // Getters et Setters
}
```
Si un utilisateur soumet une demande, le serveur traite le `ProcurementRequestDTO` et renvoie un `ProcurementResponseDTO` avec un statut `201`, confirmant que l'ID est `101` et le statut est `PENDING`.

## Erreur Courante : L'Objet Universel
Les développeurs créent souvent un seul `ProcurementDTO` pour la création et la mise à jour. C'est une erreur car l' `id` est requis pour la mise à jour mais interdit pour la création.
**Correction :** Créez des `CreateRequestDTO` et `UpdateRequestDTO` distincts pour imposer une validation stricte.

## Exercice Pratique
Concevez un objet de réponse pour un 'Acheteur' qui vient de commander un article. Quels champs sont essentiels ?

**Vérification :** Il doit inclure `orderId`, `trackingNumber` et `orderDate`. Il ne doit pas inclure le hachage du mot de passe interne de l'acheteur.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
