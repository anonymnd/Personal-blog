---
title: "Communication Synchrone vs Asynchrone"
description: "Un guide pour choisir entre le cycle requête-réponse immédiat et la communication découplée par messages."
pubDate: 2026-10-16T03:48:00.000Z
translationKey: 228-synchronous-vs-asynchronous-communication
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achats. Un demandeur soumet une demande, et le système doit notifier le manager. Si vous utilisez un appel synchrone, l'écran du demandeur se fige jusqu'à ce que le service de notification confirme la réception. Si ce service est indisponible, toute la demande échoue. C'est là tout l'enjeu entre les modèles synchrones et asynchrones.

## Communication Synchrone : La Ligne Directe
La communication synchrone suit un cycle requête-réponse. Le client envoie une requête et attend (est bloqué) que le serveur la traite et renvoie un résultat. Cela est généralement implémenté via HTTP/REST ou gRPC. C'est idéal pour les opérations où l'utilisateur a besoin d'une réponse immédiate, comme vérifier si un produit est en stock.

## Communication Asynchrone : La File de Messages
La communication asynchrone découple l'émetteur et le récepteur. L'émetteur envoie un message à un courtier (comme Kafka ou RabbitMQ) et continue son exécution. Le récepteur traite le message dès qu'il a de la capacité. C'est parfait pour les tâches longues, comme la génération d'un rapport PDF ou l'envoi d'un email après l'approbation d'un manager.

## Exemple Concret : Flux d'Achats
Dans un système d'achats, on combine les deux :
1. **Synchrone** : Demandeur $ightarrow$ API $ightarrow$ Base de données (Sauvegarde). L'utilisateur reçoit un `201 Created` immédiatement.
2. **Asynchrone** : API $ightarrow$ Message Broker $ightarrow$ Service de Notification. Le manager est notifié en arrière-plan.

```java
// Extrait illustratif : Producteur asynchrone
public void approveRequest(Long requestId) {
    requestRepo.updateStatus(requestId, "APPROVED");
    // Appel non-bloquant vers le broker
    messageBroker.send("notification-topic", new ApprovalEvent(requestId));
}
```
Résultat : L'approbation est enregistrée instantanément, et la notification arrive plus tard sans ralentir l'interface.

## Erreur Courante : La Chaîne Synchrone
Les développeurs créent souvent des "chaînes synchrones" où le Service A appelle B, B appelle C, et C appelle D. Si le Service D est lent, toute la chaîne freeze, entraînant une panne en cascade.
**Correction** : Remplacer les appels descendants non critiques par des événements asynchrones. Si B n'a pas besoin d'une réponse immédiate de C pour répondre à A, utilisez une file d'attente.

## Exercice Pratique
Scénario : Un utilisateur télécharge un gros fichier CSV de 10 000 articles à importer. Cela doit-il être Synchrone ou Asynchrone ?

**Réponse** : Asynchrone. Traiter 10 000 articles prend du temps ; une connexion HTTP synchrone expirerait probablement (timeout). Le système doit retourner un statut "En cours" et notifier l'utilisateur une fois terminé.
