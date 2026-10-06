---
title: "Token Bucket vs Leaky Bucket"
description: "Un guide comparatif pour comprendre les algorithmes de limitation de débit afin de gérer les pics de trafic et de lisser le flux."
pubDate: 2026-10-15T22:48:00.000Z
translationKey: 223-token-bucket-vs-leaky-bucket
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développiez un système d'approvisionnement où les employés soumettent des demandes d'achat. Soudain, à la fin du trimestre, des centaines d'utilisateurs soumettent des demandes simultanément. Si votre serveur traite chaque requête instantanément, la base de données risque de planter. Vous devez contrôler ce flux, mais devez-vous autoriser de courts pics d'activité ou imposer un flux parfaitement régulier ?

## Le mécanisme Token Bucket
Dans un Token Bucket (seau à jetons), un seau contient un nombre maximum de jetons. Les jetons sont ajoutés à un rythme constant. Lorsqu'une requête arrive, elle doit 'dépenser' un jeton pour être traitée. Si le seau est vide, la requête est rejetée ou retardée. L'avantage principal est que si le seau est plein, un pic soudain de requêtes peut être traité immédiatement jusqu'à épuisement des jetons.

## Le mécanisme Leaky Bucket
Considérez le Leaky Bucket (seau percé) comme un entonnoir. Les requêtes entrent dans le seau à n'importe quelle vitesse, mais elles 'fuient' par le bas à un rythme fixe et constant. Si le seau se remplit parce que les requêtes arrivent plus vite qu'elles ne fuient, les nouvelles requêtes débordent et sont supprimées. Contrairement au Token Bucket, cet algorithme lisse complètement les pics.

## Exemple concret : Application d'approvisionnement
Considérons un `PurchaseRequestController` utilisant ces stratégies :

| Caractéristique | Token Bucket | Leaky Bucket |
| :--- | :--- | :--- |
| **Gestion des pics** | Autorise les pics selon la taille du seau | Aucun pic autorisé |
| **Débit de sortie** | Variable (par pics) | Constant (lissé) |
| **Cas d'usage** | API avec pics occasionnels | Tâches de traitement en arrière-plan |

```java
// Extrait illustratif d'une vérification Token Bucket
public boolean allowRequest() {
    long now = System.currentTimeMillis();
    refillTokens(now);
    if (currentTokens > 0) {
        currentTokens--;
        return true;
    } 
    return false;
}
```

## Erreur courante : Confondre les deux
Les développeurs pensent souvent que le Leaky Bucket autorise les pics parce que le 'seau' stocke les requêtes. En réalité, bien qu'il *tamponne* les requêtes, le rythme de *traitement* reste rigide. Si vous devez supporter un utilisateur qui envoie occasionnellement 10 requêtes en une seconde mais en moyenne 1 par seconde, le Leaky Bucket le bloquera, alors que le Token Bucket le laissera passer.

## Exercice pratique
Scénario : Vous avez un système qui envoie des notifications par email. Vous voulez vous assurer que le fournisseur d'emails ne vous bannisse pas en limitant la sortie à exactement 5 emails par seconde, peu importe le nombre de déclenchements. Quel algorithme utiliser ?

**Réponse :** Leaky Bucket, car il impose un débit de sortie strict et constant.
