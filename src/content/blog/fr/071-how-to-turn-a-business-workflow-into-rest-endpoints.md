---
title: "Conception de Contrats REST : Ressources et Transitions Métier"
description: "Guide pour séparer la gestion des ressources des transitions d'état métier dans un flux de signature de documents."
pubDate: 2026-10-07T07:48:00.000Z
translationKey: 071-how-to-turn-a-business-workflow-into-rest-endpoints
seriesOrder: 16
locale: fr
tags: ["rest-api","learning-series"]
draft: false
---

## Ressources vs Actions

Une erreur courante dans la conception d'API consiste à traiter les points de terminaison comme des appels de procédure distante (RPC), où l'URI représente un « bouton » (ex: `/envelopes/sign-document`). Dans un contrat REST véritable, les URI identifient des ressources, et les méthodes HTTP définissent l'opération.

Dans un système de signature de documents, nous avons deux types de modifications distincts : les **mises à jour de métadonnées** (changer une description) et les **transitions métier** (marquer un document comme signé). Bien que les deux modifient la base de données, elles ont des significations sémantiques et des exigences d'autorisation différentes. Les mises à jour de métadonnées sont des opérations CRUD classiques, tandis que les transitions métier sont des mouvements d'état qui déclenchent souvent des effets secondaires comme des notifications par email ou des horodatages légaux.

## La Hiérarchie des Ressources

Pour maintenir un contrat propre, nous définissons les ressources en fonction de leur cycle de vie. Une `Envelope` est l'agrégat racine. Les `Signers` sont des ressources dépendantes.

### Points de terminaison de collection et de détail
- `GET /envelopes` : Retourne une liste paginée d'enveloppes. Le filtrage (ex: `?status=pending`) s'effectue via des paramètres de requête, pas via des endpoints séparés.
- `GET /envelopes/{id}` : Retourne l'état actuel d'une enveloppe spécifique.
- `POST /envelopes` : Crée une nouvelle enveloppe. Le serveur attribue l'ID et retourne un `201 Created` avec l'en-tête `Location`.

### Imbrication et sous-ressources
L'imbrication doit représenter une relation de propriété forte. Puisqu'un signataire ne peut exister sans enveloppe, ils sont imbriqués :
- `GET /envelopes/{id}/signers` : Liste tous les signataires d'une enveloppe spécifique.
- `POST /envelopes/{id}/signers` : Ajoute un signataire à l'enveloppe.

Évitez l'imbrication profonde (plus de deux niveaux). Si vous devez modifier un signataire spécifique, utilisez `/signers/{signerId}` plutôt que `/envelopes/{id}/signers/{signerId}` pour garder des URI concises.

## Modélisation des Transitions Métier

Lorsqu'un utilisateur « signe » un document, il ne se contente pas de mettre à jour un champ booléen ; il effectue un acte légal. Utiliser `PATCH /envelopes/{id}` pour changer le `status` en `SIGNED` est techniquement possible mais architecturalement faible, car cela mélange l'édition administrative avec la logique métier.

Au lieu de cela, traitez la transition comme une sous-ressource ou une commande spécifique. Il existe deux modèles principaux :

1. **La Ressource d'État** : `PUT /envelopes/{id}/status` (Remplacement de la valeur du statut).
2. **La Ressource d'Action** : `POST /envelopes/{id}/signatures` (Création d'un enregistrement de signature qui déclenche le changement d'état).

Pour un flux de signature, la seconde approche est supérieure car elle permet à l'API de capturer le « qui » et le « quand » de la transition en tant que ressource à part entière.

## Exemple concret : Le Contrat de Signature

Voici le contrat convenu pour le flux de signature. Cela garantit que le frontend sait exactement quel endpoint appeler pour un changement de métadonnées par rapport à une transition légale.

### Spécification du Contrat

| Intention | Méthode | Endpoint | Payload | Résultat attendu |
| :--- | :--- | :--- | :--- | :--- |
| Créer Enveloppe | `POST` | `/envelopes` | `{ "title": "NDA" }` | `201 Created` + Location |
| Modifier Titre | `PATCH` | `/envelopes/{id}` | `{ "title": "New NDA" }` | `200 OK` (Ressource mise à jour) |
| Assigner Signataire | `POST` | `/envelopes/{id}/signers` | `{ "email": "a@b.com" }` | `201 Created` |
| Signer Document | `POST` | `/envelopes/{id}/signatures` | `{ "signerId": "s1" }` | `202 Accepted` ou `201` |
| Annuler Enveloppe | `DELETE` | `/envelopes/{id}` | N/A | `204 No Content` |

### Représentation Java illustrative

```java
// Utilisation de records pour une représentation immuable
public record EnvelopeResponse(UUID id, String title, String status, LocalDateTime createdAt) {}
public record SignerRequest(String email, String role) {}
public record SignatureRequest(UUID signerId, String digitalFingerprint) {}

// Le contrôleur sépare les métadonnées des transitions
@RestController
@RequestMapping("/envelopes")
public class EnvelopeController {

    // Mise à jour de métadonnées : modification partielle
    @PatchMapping("/{id}")
    public ResponseEntity<EnvelopeResponse> updateMetadata(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        // Logique pour mettre à jour uniquement les champs fournis
        return ResponseEntity.ok(updatedEnvelope);
    }

    // Transition métier : la création d'une signature déclenche l'état 'Signed'
    @PostMapping("/{id}/signatures")
    public ResponseEntity<Void> signDocument(@PathVariable UUID id, @RequestBody SignatureRequest request) {
        // Logique métier : vérifier le signataire, appliquer l'horodatage, changer le statut
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
```

### Cas d'échec et conséquences
- **Ressource Non Trouvée (404)** : Si un utilisateur tente de faire un `POST /envelopes/{id}/signatures` sur une enveloppe déjà supprimée via `DELETE`, le serveur doit retourner `404 Not Found`.
- **Incohérence de Représentation** : Si le frontend s'attend à ce que le `status` change immédiatement mais que le backend traite la signature de manière asynchrone, le `POST` doit retourner `202 Accepted`. Le frontend doit alors interroger `GET /envelopes/{id}` pour voir la transition terminée.

## Exercice

**Scénario** : Vous devez ajouter une phase de « Révision » au flux. Un manager doit approuver l'enveloppe avant qu'elle ne soit envoyée aux signataires.

1. Quel endpoint utiliseriez-vous pour modifier la description de l'enveloppe pendant la révision ?
2. Quel endpoint créeriez-vous pour gérer la transition d'approbation du manager ?
3. Pourquoi ne pas utiliser `PATCH /envelopes/{id}` pour l'approbation ?

**Réponse** :
1. `PATCH /envelopes/{id}` avec le champ description.
2. `POST /envelopes/{id}/approvals` (création d'un enregistrement d'approbation) ou `PUT /envelopes/{id}/status` (si simple).
3. Parce que l'approbation est une transition métier avec des exigences d'autorisation et d'audit spécifiques, alors que `PATCH` sert à la modification générale d'attributs. Les mélanger rendrait plus difficile le déclenchement d'événements spécifiques (comme l'envoi d'emails) sans polluer la logique de mise à jour générale.

## Pour approfondir

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
