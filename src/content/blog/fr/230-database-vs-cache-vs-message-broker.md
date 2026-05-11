---
title: "Database vs Cache vs Message Broker"
description: "Un guide pour comprendre quand stocker des données, quand accélérer l'accès et quand découpler la communication en conception de système."
pubDate: 2026-10-16T05:48:00.000Z
translationKey: 230-database-vs-cache-vs-message-broker
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Une application d’achats doit enregistrer une demande, afficher son statut et notifier un manager. Base de données, cache et broker ont des rôles différents. Commencez par une architecture simple qui répond aux besoins mesurés, puis ajoutez des composants lorsque leur bénéfice justifie leur coût d’exploitation.
## La Source de Vérité : Database
La base de données est la source durable des demandes d’achat. PostgreSQL peut imposer des contraintes et valider des transactions pour conserver une approbation après un redémarrage. Les performances dépendent des requêtes, des index, de la charge et de la configuration ; écrire sur disque ne rend pas automatiquement chaque opération lente.
## La Couche de Vitesse : Cache
Un cache conserve des résultats réutilisables pour éviter du travail répété. Avec cache-aside, l’application vérifie le cache, charge une valeur absente depuis la base puis la met en cache. Un statut d’approbation peut devenir périmé : invalidez ou actualisez le cache quand la valeur de référence change, avec un TTL adapté. Redis peut persister les données via RDB ou AOF ; un redémarrage ne les efface donc pas systématiquement. Ici, les valeurs en cache restent reconstructibles.
## Le Hub de Communication : Message Broker
Un broker découple producteurs et consommateurs. Après une approbation, un worker peut traiter un événement sans faire attendre le demandeur pendant l’envoi du mail. La durabilité dépend de la configuration, des acquittements et de la rétention. Le consommateur doit gérer les livraisons répétées sans envoyer deux mails ; un outbox peut coordonner la modification en base avec la publication éventuelle.
## Résumé Comparatif

| Caractéristique | Database | Cache | Message Broker |
| :--- | :--- | :--- | :--- |
| Objectif Principal | Persistance | Latence | Découplage |
| Support | Disque | RAM | File/Log |
| Durée de vie | Données durables | Valeurs reconstructibles | Rétention configurée |

## Erreur Courante : Utiliser Redis comme DB
Ne supposez pas que Redis est une source durable simplement parce qu’il est rapide. Redis propose la persistance, mais les réglages, les règles d’éviction et la restauration doivent répondre aux besoins. Pour cet exemple, gardez l’historique dans PostgreSQL et ne mettez en cache que des valeurs reconstructibles.
## Exercice Pratique
Quel composant utiliseriez-vous pour gérer un pic de 10 000 emails de "Confirmation de Commande" sans faire planter le serveur de mail ?

**Réponse :** Un Message Broker. Il tamponne les requêtes dans une file, permettant au serveur de mail de les traiter à son propre rythme.
