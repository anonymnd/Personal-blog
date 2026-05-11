---
title: "Docker Container vs Virtual Machine"
description: "Une comparaison technique expliquant pourquoi les conteneurs partagent le noyau de l'hôte alors que les VM émulent des systèmes matériels complets."
pubDate: 2026-10-13T21:48:00.000Z
translationKey: 174-docker-container-vs-virtual-machine
locale: fr
tags: ["software-engineering","docker","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Imaginez que vous déployez une application d'achat où le portail du demandeur, le tableau de bord d'approbation du manager et le système de commande de l'acheteur nécessitent tous des versions différentes de Java et Python. Si vous utilisez des machines virtuelles (VM), votre serveur s'effondrera sous le poids de trois systèmes d'exploitation distincts. C'est là que la différence fondamentale entre les conteneurs et les VM devient cruciale.

## L'écart architectural
Une machine virtuelle est une abstraction complète du matériel. Elle comprend une copie complète d'un système d'exploitation (Guest OS), une copie virtuelle du matériel et l'application. L'hyperviseur gère ces VM, ce qui signifie que chacune consomme une part importante de RAM et de CPU juste pour maintenir l'OS actif.

À l'inverse, un conteneur Docker est une abstraction au niveau de la couche application. Au lieu de transporter un OS entier, il partage le noyau Linux de la machine hôte. Il ne package que le code de l'application et ses dépendances. Cela rend les conteneurs légers, démarrant en quelques secondes.

## Gestion des ressources
Comme les VM possèdent leur propre noyau, elles sont totalement isolées, ce qui est excellent pour la sécurité mais lourd en ressources. Les conteneurs utilisent les namespaces Linux et les cgroups pour isoler les processus tout en communiquant avec le même noyau.

| Caractéristique | Machine Virtuelle | Conteneur Docker |
| :--- | :--- | :--- |
| OS | OS Invité complet | Noyau Hôte partagé |
| Démarrage | Minutes | Secondes |
| Taille | Gigaoctets | Mégaoctets |
| Isolation | Niveau Matériel | Niveau Processus |

## Exemple concret : L'app d'achat
Si nous déployons notre application d'achat avec Docker, nous créons une image (le modèle) pour chaque service. Quand nous exécutons `docker run`, nous créons un conteneur (l'instance active).

```bash
# Lancement du service demandeur sur le port hôte 5332 vers le port conteneur 5432
docker run -p 5332:5432 procurement-requester:latest
```
Résultat : L'application démarre presque instantanément. L'OS hôte gère la mémoire efficacement car il n'a pas besoin de démarrer un second noyau pour le service.

## Erreur courante : Le piège du Localhost
Une erreur fréquente consiste à tenter de se connecter à un autre conteneur via `localhost`. Dans une VM, `localhost` est la VM. Dans Docker, `localhost` fait référence à l'espace réseau propre au conteneur. Pour que le service Manager communique avec le service Demandeur, vous devez utiliser le nom du service défini dans Docker Compose, et non `localhost`.

## Exercice pratique
Question : Si vous devez exécuter une application qui nécessite un noyau OS complètement différent (ex: un outil noyau Windows sur un serveur Linux), devez-vous utiliser un conteneur Docker ou une VM ?

Réponse : Une Machine Virtuelle, car les conteneurs partagent le noyau de l'hôte et ne peuvent pas exécuter un noyau différent de celui de l'hôte.

## Pour approfondir

- [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)
