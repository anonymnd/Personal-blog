---
title: "Pourquoi connaître Java et Spring Boot ne suffit pas pour créer une application réelle"
description: "Découvrez pourquoi la maîtrise de la syntaxe et des frameworks n'est que la première étape vers l'ingénierie d'un système métier fonctionnel."
pubDate: 2026-10-06T18:48:00.000Z
translationKey: 003-why-knowing-java-and-spring-boot-is-not-enough-to-build-a-real-application
locale: fr
tags: ["software-engineering","engineering-foundations","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous ayez passé des mois à maîtriser la syntaxe Java et les annotations Spring Boot. Vous pouvez créer un contrôleur REST et connecter une base de données en quelques minutes. Pourtant, lorsqu'on vous demande de créer un système d'achat où un demandeur soumet une requête, un manager l'approuve et un acheteur commande, vous vous sentez bloqué. Vous savez *comment* coder, mais vous ne savez pas *quoi* coder en premier.

## L'écart entre le codage et l'ingénierie
Connaître un framework, c'est comme savoir utiliser un marteau et une scie ; cela ne signifie pas que vous savez concevoir une maison. Les applications réelles sont guidées par des règles métier, pas par des fonctionnalités techniques. Une erreur courante est de commencer par le schéma de la base de données. Au lieu de cela, commencez par le résultat utilisateur : "Le demandeur doit faire approuver son équipement."

## Commencer par une tranche verticale (Vertical Slice)
Plutôt que de construire tout le système de gestion des utilisateurs, concentrez-vous sur une tranche verticale. Cela signifie implémenter une seule petite fonctionnalité de bout en bout. Pour notre application d'achat, la tranche est : "Soumettre une demande".

Les critères d'acceptation définissent la fin de la tâche :
1. Le demandeur remplit un formulaire avec l'article et la quantité.
2. Le système enregistre la demande avec le statut 'PENDING'.
3. Le manager peut voir la demande sur son tableau de bord.

## L'architecture itérative
Vous n'avez pas besoin d'une architecture parfaite avant d'écrire la première ligne de code. L'architecture doit évoluer. Commencez par une couche de service simple qui gère la règle métier : "Une demande ne peut pas être soumise si la quantité est nulle."

```java
// Exemple illustratif : le champ repository est omis
@Service
public class ProcurementService {
    public Request submitRequest(RequestDTO dto) {
        if (dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("La quantité doit être positive");
        }
        // Logique pour sauvegarder la demande avec le statut PENDING
        return requestRepository.save(new Request(dto, Status.PENDING));
    }
}
```

## Erreur courante : La sur-ingénierie
Beaucoup de débutants créent dix interfaces et des fabriques abstraites pour une simple fonctionnalité, pensant que c'est ainsi que travaillent les professionnels. Cela mène à une fatigue liée au code répétitif. La correction est de rester simple jusqu'à ce que la complexité soit réellement requise.

## Exercice pratique
**Scénario :** Ajoutez une règle où un manager ne peut pas approuver sa propre demande.
**Tâche :** Dans quelle couche cette logique doit-elle se trouver et quel est le test à effectuer ?

**Réponse :** Elle appartient au `ProcurementService`. Le test doit comparer le `request.getRequesterId()` avec le `currentUserId` avant de passer le statut à 'APPROVED'.
