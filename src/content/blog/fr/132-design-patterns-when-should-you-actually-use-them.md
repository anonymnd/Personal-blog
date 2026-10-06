---
title: "Design Patterns : Quand faut-il vraiment les utiliser ?"
description: "Un guide pratique pour éviter la sur-ingénierie en identifiant le moment précis où un pattern de conception devient nécessaire."
pubDate: 2026-10-12T03:48:00.000Z
translationKey: 132-design-patterns-when-should-you-actually-use-them
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Beaucoup de développeurs tombent dans le piège de la « chasse aux patterns », essayant de forcer un Singleton ou une Factory dans un projet avant même que le problème ne se présente. Cela conduit à un code gonflé et à des couches d'abstraction inutiles qui compliquent le débogage.

## Le déclencheur d'un pattern
Un design pattern n'est pas un point de départ, mais une solution à un problème récurrent. Vous ne devriez en implémenter un que lorsque vous ressentez une « friction » spécifique dans votre code. Par exemple, si vous écrivez la même logique d'initialisation complexe dans cinq classes différentes, vous avez un problème de création.

## Exemple concret : Flux d'approvisionnement
Imaginez une application d'achat où une `PurchaseRequest` nécessite une validation différente selon le département. Au début, vous pourriez utiliser une longue chaîne de `if-else`. À mesure que vous ajoutez des départements (IT, RH, Marketing), le code devient ingérable.

C'est ici que le **Strategy Pattern** devient pertinent. Vous définissez une interface `ValidationStrategy` et créez des implémentations spécifiques pour chaque département.

```java
public interface ValidationStrategy {
    boolean validate(PurchaseRequest request);
}

public class ITValidation implements ValidationStrategy {
    public boolean validate(PurchaseRequest request) {
        // Vérifier si le matériel est dans la liste approuvée
        return request.getAmount() < 5000;
    }
}
```
En passant à ce pattern, vous pouvez ajouter un nouveau département sans modifier la logique de validation existante, respectant ainsi le principe Open/Closed.

## L'erreur courante : L'abstraction préemptive
Une erreur fréquente consiste à créer une `GenericManagerFactory` pour une classe qui n'aura jamais qu'une seule implémentation. Cela ajoute des fichiers et une interface sans aucune valeur ajoutée.

**Correction :** Commencez par une classe concrète simple. N'extrayez une interface ou n'implémentez une factory que lorsque vous avez réellement une seconde implémentation ou un besoin de mocker la classe pour des tests unitaires.

## Quand s'arrêter
Si un pattern rend le code plus difficile à lire pour un développeur junior sans apporter de gain réel en flexibilité ou en maintenance, supprimez-le. La simplicité est une fonctionnalité.

## Exercice pratique
Vous avez un `NotificationService` qui envoie des emails. Le client veut maintenant ajouter des SMS et des notifications Push. Devez-vous utiliser un pattern maintenant ou attendre ?

**Réponse :** C'est le moment idéal. Utilisez le pattern Strategy ou Observer pour découpler le déclencheur de la notification de sa méthode d'envoi.


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
