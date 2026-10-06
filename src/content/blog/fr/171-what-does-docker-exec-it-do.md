---
title: "Que fait exactement docker exec -it ?"
description: "Une analyse détaillée de l'accès au shell d'un conteneur en cours d'exécution pour le débogage."
pubDate: 2026-10-13T18:48:00.000Z
translationKey: 171-what-does-docker-exec-it-do
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous avez une application d'achat fonctionnant dans un conteneur. Le demandeur a soumis une requête, mais l'approbation du manager ne se déclenche pas. Vous consultez les logs, mais ils sont trop vagues. Vous devez entrer « à l'intérieur » du conteneur pour vérifier si un fichier de configuration spécifique existe ou tester une connexion à la base de données depuis la perspective du conteneur. C'est là que `docker exec -it` devient indispensable.

## Le mécanisme de exec
Contrairement à `docker run`, qui crée un tout nouveau conteneur à partir d'une image, `docker exec` vous permet d'exécuter une nouvelle commande à l'intérieur d'un conteneur déjà actif. Il utilise la capacité de l'hôte à entrer dans les espaces de noms (namespaces) isolés du conteneur (processus, réseau et montage).

## Explication des drapeaux -it
Le drapeau `-i` (interactif) maintient l'entrée standard (STDIN) ouverte même si elle n'est pas attachée. Le drapeau `-t` (tty) alloue un pseudo-terminal, ce qui fait que la session se comporte comme une véritable fenêtre de terminal, avec un invite de commande et une sortie colorée. Sans cela, vous pourriez lancer une commande, mais vous ne pourriez pas interagir avec un shell comme Bash ou Sh.

## Exemple concret : Débogage de l'app d'achat
Supposons que votre conteneur d'achat soit nommé `procurement-app`. Vous voulez vérifier les logs internes de l'application situés dans `/var/log/app.log`.

```bash
# Accéder au conteneur avec un shell bash
docker exec -it procurement-app /bin/bash

# Maintenant à l'intérieur du conteneur :
root@a1b2c3d4e5f6:/# cat /var/log/app.log
# [LOG]: Connection to DB failed at 10.0.0.5
exit
```
Résultat : Vous êtes entré dans l'environnement, avez identifié une panne réseau et êtes revenu sur votre machine hôte.

## Erreur courante : exec vs run
Une erreur fréquente consiste à utiliser `docker run -it image /bin/bash` alors que vous voulez déboguer un service actif. `docker run` démarre une *deuxième* instance de l'application, qui n'aura ni l'état actuel ni les logs du conteneur défaillant. Utilisez toujours `exec` pour les conteneurs existants.

## Exercice pratique
Comment exécuteriez-vous la commande `ls -la` dans un conteneur nommé `buyer-service` sans entrer dans une session shell interactive ?

**Réponse :** `docker exec buyer-service ls -la`. (Le `-it` n'est pas nécessaire pour une commande unique non interactive).

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
