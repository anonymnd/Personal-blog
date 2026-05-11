---
title: "Que fait réellement mvn spring-boot:run ?"
description: "Une analyse approfondie du fonctionnement du plugin Maven Spring Boot et sa différence avec les phases de cycle de vie standards."
pubDate: 2026-10-14T02:48:00.000Z
translationKey: 179-what-does-mvn-spring-boot-run-actually-do
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Vous venez de cloner un projet, vous avez tapé `mvn spring-boot:run` dans votre terminal, et l'application démarre. Mais en regardant les logs, vous vous demandez : Maven a-t-il simplement compilé le code ? A-t-il créé un fichier JAR ? Pourquoi est-ce différent de `java -jar` ?

## Objectif de Plugin vs Phase de Cycle de Vie
Contrairement à `mvn clean` ou `mvn install`, `spring-boot:run` n'est pas une phase native du cycle de vie Maven. C'est un objectif spécifique fourni par le `spring-boot-maven-plugin`. Lorsque vous exécutez cette commande, Maven ne suit pas la séquence standard validate -> compile -> test -> package. Il déclenche un processus spécialisé conçu pour le développement rapide.

## Le Mécanisme d'Exécution
Lorsque cet objectif est lancé, le plugin s'assure d'abord que votre code source est compilé. Cependant, il ne package pas l'application dans une archive exécutable (JAR/WAR) dans le dossier `target`. Au lieu de cela, il crée un classpath temporaire contenant vos classes compilées et toutes les dépendances du projet. Il lance ensuite l'application via un processus JVM distinct. Cela évite la lourdeur de créer une archive physique à chaque modification.

## Exemple concret : Application d'achats
Imaginez un système d'achats où un `Requester` soumet une demande. Vous avez ajouté une nouvelle règle de validation dans la classe `RequestService`.

```java
// Extrait illustratif d'un service
@Service
public class RequestService {
    public void submitRequest(PurchaseRequest req) {
        if (req.getAmount() <= 0) throw new IllegalArgumentException("Le montant doit être positif");
        // logique pour sauvegarder la demande
    }
}
```

L'exécution de `mvn spring-boot:run` compilera ce changement et lancera l'application immédiatement. En cas de plantage, la console affichera une trace d'erreur. Pour déboguer, cherchez la première frame de la trace mentionnant votre package (ex: `com.procurement.RequestService`) plutôt que les frames génériques du framework Spring.

## Erreur Courante : La confusion du Package
Certains développeurs pensent que `mvn spring-boot:run` met à jour le fichier JAR dans le répertoire `target`. C'est faux. Si vous tentez de déployer le JAR depuis `target/myapp-0.0.1-SNAPSHOT.jar` après avoir utilisé le goal run, vous déploierez une ancienne version car la phase de packaging a été sautée.

**Correction :** Utilisez `mvn package` ou `mvn install` si vous avez besoin d'un artefact physique pour le déploiement.

## Exercice Pratique
Question : Si vous lancez `mvn spring-boot:run` et que vous supprimez le dossier `target/classes` pendant que l'app tourne, l'application va-t-elle planter immédiatement ?

Réponse : Non. La JVM a déjà chargé les classes nécessaires en mémoire depuis le classpath lors du démarrage.


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
