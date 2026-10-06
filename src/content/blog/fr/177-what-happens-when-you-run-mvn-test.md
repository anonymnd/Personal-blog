---
title: "Que se passe-t-il quand on lance mvn test ?"
description: "Une analyse détaillée des phases du cycle de vie Maven et du mécanisme du plugin Surefire lors de l'exécution des tests."
pubDate: 2026-10-14T00:48:00.000Z
translationKey: 177-what-happens-when-you-run-mvn-test
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous venez de terminer une nouvelle fonctionnalité pour une application d'achats où un manager approuve une demande. Vous êtes confiant, mais vous ignorez si vos modifications ont cassé la logique de soumission du demandeur. Vous tapez `mvn test` dans votre terminal, sans savoir exactement ce que Maven fait en arrière-plan pour valider votre travail.

## La Séquence du Cycle de Vie
Lorsque vous exécutez `mvn test`, Maven ne saute pas directement aux classes de test. Il suit un cycle de vie strict. Avant la phase `test`, Maven exécute automatiquement les phases `validate`, `compile` et `process-test-resources`. Cela garantit que votre code source est converti en bytecode et que vos fichiers de configuration de test sont bien positionnés avant toute exécution.

## Le Rôle du Plugin Surefire
Maven ne sait pas nativement comment exécuter un test Java ; il délègue cette tâche au plugin Maven Surefire. Surefire scanne le répertoire `src/test/java` pour trouver des classes respectant des conventions de nommage, comme `*Test.java` ou `**Tests.java`. Il lance ensuite une JVM séparée pour exécuter ces tests, isolant ainsi l'environnement de test du processus de construction.

## Exemple Concret : Approbation d'Achat
Considérons une classe `RequestServiceTest` qui vérifie si un manager peut approuver une demande.

```java
@Test
void testApproveRequest() {
    Request req = new Request("Laptop", 1200);
    boolean result = service.approve(req, "Manager_1");
    assertTrue(result);
}
```

En lançant `mvn test`, Surefire exécute cette méthode. En cas de succès, un message de confirmation s'affiche. En cas d'échec, Maven génère des rapports XML et texte dans `target/surefire-reports`. Ces rapports contiennent la trace de la pile (stack trace), indispensable pour déboguer la ligne exacte de l'erreur.

## Erreur Courante : Confondre Test et Package
Une erreur fréquente consiste à croire que `mvn test` crée un fichier JAR. Ce n'est pas le cas. Pour obtenir un artefact déployable, vous devez utiliser `mvn package`. Bien que `mvn package` exécute également les tests (car `test` est un prérequis de `package`), `mvn test` s'arrête juste après la phase de test.

## Exercice Pratique
Question : Si vous voulez lancer vos tests tout en vous assurant que les anciennes classes compilées d'un build précédent sont supprimées, quelle commande devez-vous utiliser ?

Réponse : `mvn clean test`. L'objectif `clean` supprime le dossier `target`, forçant Maven à tout recompiler.


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
