---
title: "Transformer les Exceptions Domaine en un Contrat d'Erreur API Stable"
description: "Mise en œuvre d'une frontière entre les échecs du domaine et une réponse API cohérente via ProblemDetail et RestControllerAdvice."
pubDate: 2026-10-07T11:48:00.000Z
translationKey: 094-why-you-should-create-custom-exceptions
seriesOrder: 20
locale: fr
tags: ["validation-errors","learning-series"]
draft: false
---

## Le Problème de la Frontière

Dans un système complexe, la couche domaine ne doit pas connaître le protocole HTTP. Si un service de suivi de livraison échoue parce qu'un colis est manquant, le domaine doit lever une `ParcelNotFoundException`, et non une `ResponseStatusException` avec un code 404. Mélanger ces préoccupations expose des détails d'infrastructure dans votre logique métier, rendant le domaine impossible à réutiliser dans un CLI ou un consommateur de file de messages.

Pour résoudre cela, on établit une frontière. Le domaine lève des exceptions typées. Un intercepteur global les capture et les traduit en un contrat API stable. Cela garantit que les traces de pile (stack traces) et les détails de la base de données ne parviennent jamais au client, tout en offrant une structure prévisible.

## Conception des Échecs du Domaine

Pour un scénario de suivi de livraison, nous distinguons une ressource inexistante d'une dépendance défaillante.

1. **ParcelNotFoundException** : Un échec métier indiquant que l'identifiant est valide syntaxiquement mais absent du système.
2. **CarrierIntegrationException** : Un échec lorsque l'API du transporteur externe est indisponible ou expire (timeout).

```java
// Illustratif : Exceptions du Domaine
public class ParcelNotFoundException extends RuntimeException {
    private final String trackingNumber;
    public ParcelNotFoundException(String trackingNumber) {
        super("Colis " + trackingNumber + " non trouvé");
        this.trackingNumber = trackingNumber;
    }
    public String getTrackingNumber() { return trackingNumber; }
}

public class CarrierIntegrationException extends RuntimeException {
    private final String carrierCode;
    public CarrierIntegrationException(String carrierCode, Throwable cause) {
        super("Le transporteur " + carrierCode + " est actuellement indisponible", cause);
        this.carrierCode = carrierCode;
    }
    public String getCarrierCode() { return carrierCode; }
}
```

## Implémentation de la Couche de Traduction
Traduisez les erreurs du domaine à la frontière HTTP avec @RestControllerAdvice et ProblemDetail de Spring Framework. Les extraits montrent quelques mappings, pas tous les échecs de sécurité ou d’infrastructure.

### Le Gestionnaire Global d'Exceptions

```java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalErrorHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);

    @ExceptionHandler(ParcelNotFoundException.class)
    public ProblemDetail handleParcelNotFound(ParcelNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Colis Non Trouvé");
        problem.setProperty("trackingNumber", ex.getTrackingNumber());
        problem.setProperty("errorCode", "ERR_PARCEL_001");
        return problem;
    }

    @ExceptionHandler(CarrierIntegrationException.class)
    public ProblemDetail handleCarrierFailure(CarrierIntegrationException ex) {
        // Log de la cause réelle (stack trace) en interne, mais masquée pour le client
        log.error("Échec du transporteur externe : {}", ex.getCarrierCode(), ex);
        
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.SERVICE_UNAVAILABLE, "Le transporteur de livraison est temporairement indisponible");
        problem.setTitle("Erreur d'Intégration Transporteur");
        problem.setProperty("carrier", ex.getCarrierCode());
        problem.setProperty("errorCode", "ERR_CARRIER_503");
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericError(Exception ex) {
        log.error("Erreur système non gérée", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "Une erreur inattendue est survenue");
        problem.setTitle("Erreur Interne du Serveur");
        return problem;
    }
}
```

## Analyse du Mécanisme

### Journalisation Sécurisée vs Exposition
Dans le gestionnaire `CarrierIntegrationException`, on observe un motif critique : `log.error(..., ex)` capture la trace complète pour les développeurs, mais le `ProblemDetail` renvoyé à l'utilisateur contient un message assaini. Exposer la cause brute `Throwable` dans une réponse API peut révéler des versions de bibliothèques, des adresses IP internes ou des noms de schémas de base de données.

### Le Contrat ProblemDetail
En retournant `ProblemDetail`, la sortie de l'API devient cohérente :
- **Type** : Un URI identifiant le type d'erreur.
- **Title** : Un résumé court et lisible.
- **Status** : Le code de statut HTTP.
- **Detail** : Une explication spécifique de l'occurrence.
- **Propriétés Personnalisées** : Des champs comme `errorCode` permettent aux applications frontend de déclencher une logique UI spécifique (ex: bouton "Réessayer" pour les erreurs transporteur, mais "Rechercher à nouveau" pour les colis manquants).

## Cas d'Échec et Cas Limites

Dans un même controller advice, l’ordre de déclaration ne fait pas masquer un handler spécifique par un handler générique. Plusieurs advice demandent de vérifier leur ordre et la correspondance entre exception racine et cause. ResponseEntityExceptionHandler couvre les exceptions MVC standard ; les erreurs des filtres de sécurité peuvent nécessiter des entry points ou handlers de refus distincts.

ProblemDetail appartient à Spring Framework, pas à Jakarta EE. La documentation actuelle suit RFC 9457, qui remplace RFC 7807. Utilisez un URI de type stable et un code machine si utile ; exposez uniquement les champs adaptés au demandeur autorisé.
## Exercice Ciblé

**Scénario** : Vous devez ajouter une `DeliveryDateInvalidException` pour les cas où un utilisateur demande un suivi pour une date future. C'est une violation de règle métier.

**Tâche** :
1. Créer l'exception.
2. Ajouter un gestionnaire dans `GlobalErrorHandler` qui retourne un statut `422 Unprocessable Entity`.
3. Inclure une propriété personnalisée `requestedDate` dans la réponse.

**Réponse** :
```java
public class DeliveryDateInvalidException extends RuntimeException {
    private final String requestedDate;
    public DeliveryDateInvalidException(String date) {
        super("La date de livraison ne peut pas être dans le futur : " + date);
        this.requestedDate = date;
    }
    public String getRequestedDate() { return requestedDate; }
}

// Dans GlobalErrorHandler
@ExceptionHandler(DeliveryDateInvalidException.class)
public ProblemDetail handleInvalidDate(DeliveryDateInvalidException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    problem.setTitle("Date de Livraison Invalide");
    problem.setProperty("requestedDate", ex.getRequestedDate());
    problem.setProperty("errorCode", "ERR_DATE_422");
    return problem;
}
```

## Pour approfondir

- [Spring Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)
