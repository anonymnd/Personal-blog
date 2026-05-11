---
title: "Pourquoi deux classes Java avec le même nom peuvent être des types différents"
description: "Comprendre comment les packages et les chargeurs de classes empêchent les collisions de noms et créent des types distincts dans la JVM."
pubDate: 2026-10-11T14:48:00.000Z
translationKey: 119-why-two-java-classes-with-the-same-name-can-be-different-types
locale: fr
tags: ["software-engineering","java-fundamentals","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous développez une application d'achat. Vous avez une classe `Request` dans le package `com.app.requester` et une autre classe `Request` dans le package `com.app.manager`. Vous essayez de passer la demande d'un demandeur à une méthode du manager, mais le compilateur génère une erreur de type. Bien que les deux s'appellent `Request`, Java les considère comme des entités totalement différentes.

## Le rôle des noms pleinement qualifiés
En Java, le nom d'une classe n'est pas seulement l'identifiant que vous voyez dans le fichier. L'identité réelle est le Fully Qualified Name (FQN), qui combine le chemin du package et le nom de la classe. `com.app.requester.Request` et `com.app.manager.Request` sont aussi différents que `String` et `Integer`. Le package agit comme un espace de noms, permettant à différents modules d'utiliser des termes communs sans conflit.

## Class Loaders et identité au runtime
Au-delà des packages, la JVM utilise des Class Loaders pour charger le bytecode. Une classe est identifiée de manière unique par la combinaison de son FQN et du Class Loader qui l'a définie. Si deux chargeurs de classes différents chargent le même fichier `.class` depuis des emplacements différents, la JVM les voit comme deux types distincts. C'est courant dans les architectures de plugins ou les serveurs d'applications.

## Exemple concret : Le conflit d'approvisionnement
Voici un scénario où nous gérons une demande d'achat :

```java
package com.app.requester;
public class Request { public String item = "Laptop"; }

package com.app.manager;
public class Request { public boolean approved = false; }

public class ProcurementService {
    public void process(com.app.manager.Request mgrReq) {
        System.out.println("Traitement...");
    }

    public void run() {
        com.app.requester.Request req = new com.app.requester.Request();
        // process(req); // Cela causerait une erreur de compilation
    }
}
```
Résultat : La méthode `process` attend un `manager.Request`. Passer un `requester.Request` échoue car leurs FQN diffèrent, garantissant que la logique du manager n'opère pas accidentellement sur la structure de données du demandeur.

## Erreur courante : Ambiguïté d'importation
Les développeurs utilisent souvent `import com.app.requester.*;` et `import com.app.manager.*;` dans le même fichier. Si les deux packages contiennent une classe `Request`, l'utilisation du mot `Request` provoque une erreur d'ambiguïté.

**Correction :** Utilisez le FQN directement dans le code (ex: `com.app.requester.Request req = new ...`) ou importez-en un seul et utilisez le FQN pour l'autre.

## Exercice pratique
Si vous avez `package a.User` et `package b.User`, pouvez-vous caster une instance de `a.User` vers `b.User` via `(b.User) myUser` ?

**Réponse :** Non. Cela provoquera une `ClassCastException` à l'exécution car ce sont des types distincts malgré un nom simple identique.


## Pour approfondir

- [Java records](https://dev.java/learn/records/)
