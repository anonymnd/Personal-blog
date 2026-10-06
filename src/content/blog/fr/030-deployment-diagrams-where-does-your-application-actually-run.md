---
title: "Diagrammes de Déploiement : Où Votre Application S'exécute-t-elle Réellement ?"
description: "Apprenez à visualiser la distribution matérielle et logicielle de votre système grâce aux diagrammes de déploiement UML."
pubDate: 2026-10-07T21:48:00.000Z
translationKey: 030-deployment-diagrams-where-does-your-application-actually-run
locale: fr
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

Vous avez terminé vos diagrammes de classes et de séquence, mais il manque un élément : vous savez comment le code fonctionne, mais pas où il réside. Quand un développeur demande : « Le générateur de PDF s'exécute-t-il sur le serveur web ou sur un nœud de travail séparé ? », le diagramme de déploiement apporte la réponse.

## Le Concept Fondamental du Déploiement
Contrairement aux autres diagrammes UML axés sur la logique, le diagramme de déploiement se concentre sur l'architecture physique. Il mappe les artefacts logiciels (comme des fichiers JAR ou des images Docker) sur des nœuds. Un nœud représente une ressource informatique, telle qu'un serveur physique, une machine virtuelle ou une instance cloud. La connexion entre les nœuds représente le chemin de communication, souvent étiqueté avec le protocole utilisé, comme HTTPS ou TCP/IP.

## Nœuds et Artefacts
En UML, un nœud est généralement représenté par un cube 3D. À l'intérieur de ces cubes, nous plaçons des artefacts. Un artefact est la manifestation physique de votre logiciel. Par exemple, pour une application d'achats, votre fichier `procurement-api.war` est l'artefact, et le `Serveur d'Application` est le nœud. Cette distinction est cruciale car un seul serveur physique peut héberger plusieurs nœuds virtuels ou conteneurs.

## Exemple Concret : Système d'Achats
Imaginons une application d'achats où un demandeur soumet une requête et un manager l'approuve. Le déploiement serait le suivant :
1. **Nœud Client (Navigateur) :** Exécute l'interface `Procurement-UI` (JavaScript/HTML).
2. **Nœud Serveur Web :** Héberge le `Procurement-Backend` (application Jakarta EE).
3. **Nœud Base de Données :** Un serveur dédié exécutant `PostgreSQL`.

Le flux de communication va du Navigateur vers le Serveur Web via HTTPS, et du Serveur Web vers la Base de Données via JDBC. Cela indique précisément à l'équipe réseau quels ports ouvrir dans le pare-feu.

## Erreur Courante : Confondre Logique et Physique
Une erreur fréquente consiste à placer un « Utilisateur » ou un « Manager » dans un diagramme de déploiement. Les utilisateurs sont des acteurs (issus des cas d'utilisation), pas du matériel. Vous devez modéliser l'« Ordinateur » ou l'« Appareil Mobile » que l'utilisateur utilise. Si vous tracez une ligne entre un « Manager » et un « Serveur », vous dessinez un flux métier, pas un chemin de déploiement.

## Exercice Pratique
**Scénario :** Votre application a besoin d'un nœud « Service d'Email » séparé pour envoyer des notifications lorsqu'un acheteur commande un produit. Où placez-vous le `Email-Service.jar` et comment se connecte-t-il au `Serveur Web` ?

**Réponse :** Le `Email-Service.jar` est placé dans un nouveau nœud « Serveur Mail ». La connexion est une ligne reliant le nœud « Serveur Web » au nœud « Serveur Mail », étiquetée avec un protocole comme SMTP.


## Pour approfondir

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
