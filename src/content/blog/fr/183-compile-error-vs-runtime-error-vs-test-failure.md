---
title: "Compile Error vs Runtime Error vs Test Failure"
description: "Apprenez à différencier les erreurs de compilation, d'exécution et les échecs de tests pour déboguer vos applications Java plus rapidement."
pubDate: 2026-10-14T06:48:00.000Z
translationKey: 183-compile-error-vs-runtime-error-vs-test-failure
locale: fr
tags: ["software-engineering","maven-debugging","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achat où un demandeur soumet une requête. Vous lancez `mvn package` et soudain, tout s'arrête. Est-ce un point-virgule oublié, une base de données inaccessible ou une erreur dans la logique d'approbation du manager ? Distinguer ces trois types d'erreurs est essentiel pour gagner du temps.

## L'erreur de compilation : Le gardien
Une erreur de compilation survient lorsque le compilateur Java ne peut pas traduire votre code source en bytecode. Cela arrive durant la phase `compile` de Maven. Il s'agit d'une violation de syntaxe ou de type. Si vous avez une erreur de compilation, aucun fichier `.class` n'est généré et l'application ne peut même pas démarrer.

## L'erreur d'exécution (Runtime) : Le crash imprévu
Les erreurs d'exécution se produisent pendant que le programme tourne. Le code est syntaxiquement correct, mais une opération est impossible à réaliser. En Java, ce sont généralement des `Exceptions`. Par exemple, si votre application tente d'accéder à un objet `Request` qui est `null`, vous obtenez une `NullPointerException`. L'application plante et affiche une trace de pile (stack trace).

## L'échec de test : L'écart logique
L'échec de test est différent car le code compile et s'exécute sans planter. Cependant, le résultat n'est pas celui attendu. Lorsque vous lancez `mvn test`, le plugin Surefire exécute vos tests JUnit. Si vous avez vérifié que le statut d'une requête devait être "APPROUVÉ" mais qu'il est resté "EN ATTENTE", le test échoue. C'est un bug de logique métier.

## Exemple concret : Logique d'achat
Considérez cet extrait pour approuver une demande :

```java
public void approveRequest(Request req) {
    // Erreur de compilation : si vous écrivez 'req.status = "APPROVED"' mais que status est privé
    req.setStatus("APPROVED"); 
    
    // Erreur d'exécution : si 'req' est null, cela lance une NullPointerException
    System.out.println(req.getId()); 
}
```
- **Erreur de compilation** : Écrire `req.setStat("APPROVED")` (faute de frappe) bloque le build.
- **Erreur d'exécution** : Appeler `approveRequest(null)` fait planter l'app au runtime.
- **Échec de test** : Un test vérifie `assertEquals("APPROVED", req.getStatus())`, mais le corps de la méthode était vide.

## Erreur courante : Mauvaise lecture de la Stack Trace
On confond souvent une `RuntimeException` avec un échec de test. Si la console affiche `java.lang.NullPointerException`, c'est une erreur d'exécution qui a fait planter le test. Si elle affiche `AssertionFailedError`, le code a fonctionné, mais le résultat est faux.

## Exercice pratique
Dans quelle catégorie tombe ce scénario : Vous lancez `mvn package` et la console affiche `cannot find symbol: method calculateTotal() in class Order` ?

**Réponse** : Erreur de compilation. Le compilateur ne trouve pas la définition de la méthode.


## Pour approfondir

- [Maven build lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
