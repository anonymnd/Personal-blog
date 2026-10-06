---
title: "Les Diagrammes d'Activités Expliqués avec des Flux Réels"
description: "Apprenez à modéliser des processus métier complexes et des chemins de décision à l'aide des diagrammes d'activités UML."
pubDate: 2026-10-07T17:48:00.000Z
translationKey: 026-activity-diagrams-explained-with-real-workflows
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Imaginez que vous deviez documenter un processus d'achat. Vous savez que le demandeur soumet une requête, qu'un manager l'approuve et qu'un acheteur passe la commande. Si vous essayez de décrire cela uniquement par texte, vous risquez d'oublier des cas particuliers, comme le refus d'une demande. C'est là que les diagrammes d'activités deviennent essentiels : ils servent de schéma visuel pour la logique de votre système.

## Le Mécanisme Fondamental
Un diagramme d'activités se concentre sur le flux de contrôle d'une activité à une autre. Contrairement aux diagrammes de séquence qui se focalisent sur les messages ordonnés dans le temps, le diagramme d'activités s'intéresse au 'travail' effectué. Les éléments clés incluent le Nœud Initial (début), les États d'Action (les tâches), les Losanges de Décision (logique de branchement), les barres de Synchronisation/Fourchement (tâches parallèles) et le Nœud Final (fin).

## Modélisation d'un Flux d'Achat
Dans une application d'achat, le flux n'est pas linéaire. Il nécessite une logique conditionnelle :
1. **Début** : Le demandeur remplit un formulaire d'achat.
2. **Décision** : Le montant est-il > 1 000 € ?
   - Si Oui : Routage vers le Manager Senior.
   - Si Non : Routage vers le Chef de Département.
3. **Approbation** : Le manager examine la demande.
4. **Décision** : Approuvé ou Refusé ?
   - Si Refusé : Retour au demandeur pour correction.
   - Si Approuvé : Passage à l'acheteur.
5. **Action** : L'acheteur passe la commande auprès du fournisseur.
6. **Fin** : Processus terminé.

## Erreur Courante : Confondre Cas d'Utilisation et Activités
Une erreur fréquente consiste à vouloir mettre chaque interaction utilisateur dans un diagramme d'activités. Un diagramme de Cas d'Utilisation indique *ce que* le système fait (ex: "Approuver une demande"), tandis que le diagramme d'activités indique *comment* le processus s'écoule. Si votre schéma ressemble à une liste de fonctionnalités plutôt qu'à un chemin d'exécution, vous dessinez probablement un diagramme de cas d'utilisation.

## Exercice Pratique
**Scénario** : Modélisez un flux simple de 'Connexion Utilisateur'. L'utilisateur saisit ses identifiants. S'ils sont corrects, il accède au Tableau de Bord. Sinon, il reçoit une erreur et revient à la page de connexion. Après trois tentatives infructueuses, le compte est verrouillé.

**Vérification** : Votre diagramme doit comporter un losange de décision pour 'Identifiants Corrects ?' et un compteur/décision pour 'Tentatives < 3 ?' menant à l'état final 'Verrouiller Compte'.


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
