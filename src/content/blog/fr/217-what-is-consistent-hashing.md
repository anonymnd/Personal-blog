---
title: "Utiliser le Hachage Cohérent pour Réduire le Déplacement des Partitions"
description: "Analyse approfondie des anneaux de hachage et des nœuds virtuels pour minimiser les échecs de cache lors de la mise à l'échelle."
pubDate: 2026-10-08T14:48:00.000Z
translationKey: 217-what-is-consistent-hashing
seriesOrder: 47
locale: fr
tags: ["system-design","learning-series"]
draft: false
---

## Le Problème du Hachage Modulo

Avec hash(key) % N, passer de trois à quatre nœuds déplace beaucoup d’affectations. Avec hashes uniformes et ordre stable, environ trois quarts des clés changent, pas littéralement toutes. La perte de ces caches chauds peut accroître le travail backend selon trafic, TTL et traitement des misses. Le consistent hashing limite les réaffectations lors d’un changement de membres.
## Le Mécanisme du Hachage Cohérent

Le hachage cohérent résout cela en découplant le nombre de nœuds de la logique de mapping. Au lieu d'un tableau linéaire, on traite l'espace de hachage comme un anneau circulaire (le Hash Ring).

1. **L'Anneau** : Imaginez une plage d'entiers de 0 à 2³² − 1. La fin boucle vers le début.
2. **Placement des Nœuds** : Chaque nœud de cache est haché selon son identifiant (ex: adresse IP) et placé à un point spécifique de l'anneau.
3. **Mapping des Clés** : Pour trouver le nœud propriétaire d'une clé, on hache la clé pour obtenir une position sur l'anneau, puis on avance dans le sens des aiguilles d'une montre jusqu'au premier nœud rencontré.

## Gérer les Points Chauds avec les Nœuds Virtuels

Si on ne place qu'un seul point par nœud physique, les segments de l'anneau seront inégaux. Un nœud pourrait se retrouver responsable de 60% des clés, tandis qu'un autre n'en gère que 10%.

Pour corriger cela, on utilise des **Nœuds Virtuels (vnodes)**. Au lieu de placer le `Nœud A` une seule fois, on le place 100 fois avec des graines différentes (ex: `hash("NœudA-1")`, `hash("NœudA-2")`). Cela entremêle les nœuds sur l'anneau, garantissant que si un nœud est ajouté ou supprimé, la charge est redistribuée uniformément entre tous les nœuds restants.

## Exemple Concret : Mise à l'échelle d'un Cache

Considérons un anneau simplifié de 0 à 1000. Nous avons 3 nœuds aux positions suivantes :
- Nœud 1 : 100
- Nœud 2 : 400
- Nœud 3 : 700

**Mapping Initial :**
- Clé A (Hash 50) $ightarrow$ Nœud 1 (Sens horaire depuis 50 est 100)
- Clé B (Hash 200) $ightarrow$ Nœud 2 (Sens horaire depuis 200 est 400)
- Clé C (Hash 500) $ightarrow$ Nœud 3 (Sens horaire depuis 500 est 700)
- Clé D (Hash 800) $ightarrow$ Nœud 1 (Boucle de 800 vers 100)

**Ajout du Nœud 4 à la Position 450 :**
- Clé A (50) $ightarrow$ Toujours Nœud 1
- Clé B (200) $ightarrow$ Toujours Nœud 2
- Clé C (500) $ightarrow$ Toujours Nœud 3
- Clé D (800) $ightarrow$ Toujours Nœud 1

Regardons une clé qui *doit* bouger :
- Clé E (Hash 410) : Auparavant, elle allait vers le Nœud 3 (700). Maintenant, en allant dans le sens horaire depuis 410, on tombe d'abord sur le Nœud 4 (450).

**L'Intervalle Déplacé :**
Seules les clés dans la plage (400, 450] sont affectées. Elles passent du Nœud 3 au Nœud 4. Toutes les autres clés restent sur leurs nœuds d'origine. Avec un système modulo, presque toutes les clés auraient bougé ; ici, seulement 1/(N + 1) des clés sont remappées en moyenne.

## Limitations et Compromis

Le hachage cohérent réduit le mouvement, mais ne l'élimine pas. Si un nœud tombe, toute sa charge bascule sur le nœud suivant. Sans assez de nœuds virtuels, cela peut provoquer une panne en cascade où le voisin est surchargé et crash à son tour.

De plus, le client ou le load balancer doit connaître la topologie de l'anneau. Si différents clients ont des vues légèrement différentes de l'anneau (ex: pendant un déploiement), ils routeront les requêtes vers des nœuds différents, causant des échecs de cache.

## Exercice

**Scénario** : Vous avez un anneau (0-100) avec des nœuds à 20, 50 et 80. Vous ajoutez un nouveau nœud à la position 60.
1. Quel nœud possédait précédemment les clés dans la plage 51-60 ?
2. Quel nœud possède ces clés maintenant ?
3. Si le nœud à 50 est supprimé, quel nœud hérite de ses clés ?

**Réponse** :
1. Nœud 80 (c'était le premier nœud dans le sens horaire depuis 51-60).
2. Nœud 60.
3. Nœud 60 (ou Nœud 80 si 60 n'existait pas).


Avec N nœuds de capacité égale, ajouter un nœud bien réparti déplace environ 1/(N+1) des clés uniformes en moyenne ; notre petit anneau manuel déplace son intervalle particulier. Les virtual nodes améliorent probabilistiquement la répartition sans la rendre parfaite ni résoudre une clé très chaude. Plusieurs positions virtuelles peuvent répartir une panne sur plusieurs successeurs. Réplication et coordination des membres sont distinctes.
