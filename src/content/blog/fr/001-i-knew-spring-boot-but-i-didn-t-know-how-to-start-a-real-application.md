---
title: "Du projet vide à une première fonctionnalité utilisable"
description: "Construisez un plan de livraison à partir de preuves, d’hypothèses explicites et d’une première fonctionnalité démontrable."
pubDate: 2026-10-06T16:48:00.000Z
translationKey: 001-i-knew-spring-boot-but-i-didn-t-know-how-to-start-a-real-application
seriesOrder: 1
locale: fr
tags: ["engineering-foundations","learning-series"]
draft: false
---

Savoir démarrer Spring Boot répond à une question technique : comment exécuter ce framework ? Commencer une application demande autre chose : quel résultat utile faut-il démontrer, et que faut-il apprendre avant de s'engager dans une conception ? Un projet vide devient plus simple quand ces décisions sont explicites.

## Définir un résultat assez petit pour être démontré

Un atelier associatif souhaite gérer des rendez-vous de réparation. La première description évoque calendrier, comptes clients, rappels, paiements et planning des bénévoles. Ce sont des possibilités, pas une première livraison.

Choisissons un résultat : un visiteur propose un rendez-vous et reçoit une référence ; un bénévole peut consulter cette demande. La référence accuse réception sans garantir le créneau. Les bénévoles confirment encore les rendez-vous manuellement. Cette distinction évite qu'un petit prototype promette un système de planification qu'il ne possède pas.

Les paiements, l'attribution automatique des créneaux et la récupération des comptes sont exclus de cette première tranche. Écrivez-le : c'est un choix pour cette itération, pas une affirmation selon laquelle ces fonctionnalités ne seront jamais importantes.

## Séparer faits, hypothèses et inconnues

Avant de concevoir des tables, préparez une courte note de découverte :

| Nature | Affirmation | Action suivante |
| --- | --- | --- |
| Confirmé | Les bénévoles ont besoin de la description et des coordonnées | Les inclure dans la démonstration |
| Hypothèse | Les visiteurs acceptent une confirmation manuelle | Interroger le responsable et un visiteur potentiel |
| Inconnue | Plusieurs bénévoles pourraient accepter la même demande | Observer le passage de relais avant de concevoir l'affectation |
| Contrainte | Les coordonnées réelles ne doivent pas apparaître dans la démo publique | Employer des données fictives |

Une hypothèse n'est pas automatiquement une exigence. Si le responsable demande des créneaux immédiatement confirmés, il faut revoir la tranche proposée. Mieux vaut le découvrir avant de passer une semaine sur un écran inadapté.

## Rendre la réussite observable

Utilisez des exemples d'acceptation vérifiables :

* Une demande avec coordonnées, description de l'objet et date proposée future reçoit une référence et apparaît dans la vue du bénévole.
* Une description absente produit un message compréhensible sans ajouter de demande incomplète.
* L'accusé de réception précise qu'une confirmation reste nécessaire.
* Après redémarrage de l'application de démonstration, la demande reste consultable.

Ces exemples décrivent un comportement observable. Ils n'imposent ni framework, ni structure de tables, ni statut HTTP. Ces décisions viennent ensuite. Réussir les exemples ne prouve pas non plus que le système est prêt pour une exploitation publique.

## Explorer l'incertitude qui pourrait changer le plan

Un spike est une petite expérience avec une question et une condition d'arrêt. Ici, l'incertitude principale porte sur l'adéquation de la confirmation manuelle au travail de l'atelier. Montrez un accusé de réception et une liste sur papier avant de les développer. Si cette interaction convient, une autre expérience technique courte peut vérifier que l'hébergement choisi conserve une demande après redémarrage.

Plusieurs jours d'exploration générale d'un framework ne constituent pas nécessairement un spike. Décidez quelle preuve vous cherchez, recueillez-la et notez le résultat. Abandonnez le code du prototype si sa réutilisation complique inutilement l'implémentation réelle.

## Livrer une tranche complète et recueillir les retours

La première tranche traverse tout le parcours : saisie du visiteur, décision applicative, stockage durable, accusé de réception et consultation par un bénévole. Une couche de persistance complète sans parcours utilisable ne livre pas ce résultat. Un formulaire élégant sans résultat durable ne satisfait pas davantage l'exemple de redémarrage.

Le plan tient donc en une page : confirmer le fonctionnement manuel, vérifier l'hypothèse technique risquée, réaliser la soumission minimale, démontrer les exemples d'acceptation et recueillir les retours. Demandez si la référence et la liste facilitent réellement le travail. Notez les changements plutôt que de défendre la première conception.

Les décisions d'architecture doivent correspondre aux risques connus. Une application unique peut suffire au départ ; une frontière de confidentialité obligatoire ou une capacité d'hébergement absente peut demander une décision structurelle plus tôt. Ni la conception exhaustive ni le codage immédiat ne répondent à tous les cas.

## Exercice : choisir la suite à partir d'un besoin observé

Le responsable constate que les visiteurs appellent régulièrement pour savoir si leur rendez-vous est confirmé. Faut-il ajouter des paiements en ligne, un moteur de planning automatique ou une consultation de la confirmation ?

**Vérification :** Commencez par étudier le problème de confirmation. Une consultation du statut peut suffire, mais vérifiez qui peut y accéder et quelles informations peuvent être révélées. Écrivez un exemple d'acceptation pour le passage d'une demande reçue à une demande confirmée avant de choisir l'implémentation. Le besoin observé guide la suite, pas la technologie la plus attirante.
