---
title: "Conception des DTO et Mappages selon le Contrat API"
description: "Apprenez à découpler les entités de base de données des contrats API via les Java Records et des stratégies de mappage pour contrôler la visibilité et l'édition des données."
pubDate: 2026-10-07T01:48:00.000Z
translationKey: 050-why-your-database-should-not-mirror-your-ui
seriesOrder: 10
locale: fr
tags: ["database-design","learning-series"]
draft: false
---

## Le Problème de la Frontière

Une erreur courante dans la conception d'API consiste à traiter l'entité de base de données comme le contrat de communication. Lorsqu'une entité JPA est retournée directement au client, l'API expose des détails d'implémentation internes. Plus grave encore, permettre à un client d'envoyer une entité directement au serveur crée une vulnérabilité : si l'entité contient un champ comme `loyaltyLevel` ou `accountBalance`, un utilisateur malveillant pourrait inclure ces champs dans une requête JSON pour augmenter ses privilèges, même si l'interface utilisateur ne les affiche pas.

Pour résoudre cela, on utilise des Objets de Transfert de Données (DTO). Un DTO est une projection des données nécessaires pour un cas d'utilisation spécifique. Ce n'est pas un miroir de la base de données, ni nécessairement un miroir de l'UI. C'est un contrat. Même si un DTO de requête (Request) et un DTO de réponse (Response) partagent les mêmes champs, ils doivent rester distincts car leur évolution diffère : l'un définit ce que le serveur accepte, l'autre ce que le serveur promet de fournir.

## Scénario : Gestion des Clients d'Hôtel

Imaginons un système où l'entité `Guest` contient des données d'identité sensibles et un statut de fidélité géré par le serveur. Les règles métier sont :
1. Les clients peuvent modifier leurs coordonnées (email, téléphone).
2. Les clients ne peuvent pas modifier leur propre `loyaltyLevel`.
3. Les réponses API publiques doivent exclure le `identityDocumentNumber` pour des raisons de confidentialité.

### Le Modèle d'Entité

```java
@Entity
public class Guest {
    @Id @GeneratedValue
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String identityDocumentNumber;
    private String loyaltyLevel; // Géré par le serveur
    // Getters, setters, etc.
}
```

### Conception du Contrat

Nous utilisons les Java Records pour les DTO car ils sont immuables, concis et parfaitement adaptés au transport de données. Nous définissons trois formes distinctes :

1. **GuestUpdateRequest**: Contient uniquement les champs que l'utilisateur est autorisé à modifier.
2. **GuestResponse**: Contient les informations publiques, excluant le document d'identité.
3. **GuestInternalResponse**: (Optionnel) Pour les vues administrateur, incluant les données sensibles.

```java
// Champs modifiables uniquement
public record GuestUpdateRequest(
    String email,
    String phone
) {}

// Champs visibles publiquement
public record GuestResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String loyaltyLevel
) {}
```

## Implémentation de la Logique de Mappage

Le mappage est le processus de transformation d'une entité en DTO (et vice versa). Bien que des bibliothèques existent, un mappage explicite offre le meilleur contrôle sur les règles métier.

### Exemple concret : Le Service de Mappage

```java
@Service
public class GuestMapper {

    public GuestResponse toResponse(Guest guest) {
        return new GuestResponse(
            guest.getId(),
            guest.getFullName(),
            guest.getEmail(),
            guest.getPhone(),
            guest.getLoyaltyLevel()
        );
    }

    public void updateEntityFromDto(GuestUpdateRequest dto, Guest guest) {
        // On ignore explicitement loyaltyLevel ici
        if (dto.email() != null) guest.setEmail(dto.email());
        if (dto.phone() != null) guest.setPhone(dto.phone());
    }
}
```

### Trace d'une Requête

1. **Requête**: Le client envoie `PUT /guests/1` avec le corps `{"email": "new@email.com", "loyaltyLevel": "PLATINUM"}`.
2. **Liaison**: Spring lie le JSON au `GuestUpdateRequest`. Comme le record n'a pas de composant `loyaltyLevel`, le champ JSON supplémentaire est ignoré par le convertisseur de messages.
3. **Traitement**: Le service récupère l'entité `Guest` via `findById`. Le `GuestMapper` met à jour uniquement l'email et le téléphone.
4. **Persistance**: L'entité mise à jour est sauvegardée.
5. **Réponse**: Le service mappe l'entité vers `GuestResponse`. Le `identityDocumentNumber` n'est jamais inclus dans le constructeur du record, garantissant qu'il ne quitte jamais le serveur.

## Cas d'Échec et Conséquences

*   **L'échec du "Pass-Through"**: Si vous utilisez le même DTO pour la requête et la réponse, vous pourriez accidentellement rendre l' `id` modifiable ou obliger le client à renvoyer le `loyaltyLevel` juste pour modifier un numéro de téléphone.
*   **L'échec de la "Fuite d'Entité"**: Retourner l'entité `Guest` directement. Si un nouveau champ `internalNotes` est ajouté à la base de données pour le personnel, il est automatiquement exposé dans la réponse API, sauf s'il est marqué explicitement avec `@JsonIgnore`. L'utilisation d'un DTO rend cette fuite impossible par conception.
*   **L'échec de l'"Écrasement par Null"**: Dans la méthode `updateEntityFromDto`, si vous appelez simplement `guest.setEmail(dto.email())` sans vérification de nullité, un client omettant le champ email lors d'une mise à jour partielle écraserait un email valide par `null` en base de données.

## Exercice

**Scénario**: Vous ajoutez un DTO `GuestRegistrationRequest`. L'inscription nécessite `fullName`, `email` et `identityDocumentNumber`. Cependant, le `GuestResponse` doit toujours exclure le `identityDocumentNumber`.

**Tâche**: Définissez le record `GuestRegistrationRequest` et expliquez pourquoi il ne peut pas être réutilisé comme `GuestResponse`.

**Réponse**:
```java
public record GuestRegistrationRequest(
    String fullName,
    String email,
    String identityDocumentNumber
) {}
```
Il ne peut pas être réutilisé comme `GuestResponse` car la requête d'inscription nécessite le `identityDocumentNumber` pour la création, mais la réponse doit l'exclure pour des raisons de sécurité/confidentialité. Réutiliser le record forcerait soit l'API à divulguer le numéro de document, soit empêcherait l'utilisateur de s'inscrire.

## Pour approfondir

- [Spring Data JPA: Persisting Entities](https://docs.spring.io/spring-data/jpa/reference/jpa/entity-persistence.html)
- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
