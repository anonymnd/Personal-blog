---
title: "What Is Consistent Hashing?"
description: "Une analyse approfondie de la manière dont le hachage cohérent évite les pertes de cache massives lors de la mise à l'échelle."
pubDate: 2026-10-15T16:48:00.000Z
translationKey: 217-what-is-consistent-hashing
locale: fr
tags: ["software-engineering","system-design","learning-series"]
draft: false
---

Imaginez un système d'approvisionnement où les données de requête sont mises en cache sur trois serveurs. Vous utilisez une opération modulo simple (`serveur = hash(clé) % 3`). Tout fonctionne jusqu'à ce que vous ajoutiez un quatrième serveur. Soudain, la formule devient `hash(clé) % 4`. Presque toutes les clés pointent désormais vers un serveur différent, provoquant une tempête de 'cache misses' qui sature votre base de données.

## Le Mécanisme de l'Anneau de Hachage
Le hachage cohérent résout ce problème en plaçant les serveurs et les clés de données sur un cercle conceptuel, ou 'anneau'. Au lieu d'un diviseur fixe, chaque serveur est positionné sur cet anneau via une fonction de hachage. Lorsqu'une requête arrive, le système hache la clé pour trouver sa position et se déplace dans le sens des aiguilles d'une montre jusqu'au premier serveur rencontré.

## Gestion de l'Évolutivité et des Pannes
Lorsqu'un nouveau serveur est ajouté, il est placé à un point précis de l'anneau. Seules les clés qui étaient précédemment affectées au serveur suivant—et qui se retrouvent maintenant avant le nouveau serveur—doivent être déplacées. La majorité des données restent inchangées. De même, si un serveur tombe en panne, sa charge est transférée uniquement au voisin immédiat, évitant un brassage complet du cluster.

## Nœuds Virtuels pour l'Équilibrage
Dans un anneau basique, les serveurs peuvent être mal répartis, créant des 'hotspots'. Pour corriger cela, on utilise des nœuds virtuels. Chaque serveur physique est haché plusieurs fois (ex: `ServeurA_1`, `ServeurA_2`) pour apparaître à plusieurs endroits. Cela garantit une distribution plus uniforme du trafic.

## Exemple Concret : Cache d'Approvisionnement
Supposons deux serveurs (S1, S2) et trois requêtes : `Req_101`, `Req_102`, `Req_103`.
- **Hachage Standard** : `Req_101 % 2 = S1`. Si on ajoute S3, `Req_101 % 3 = S2`. La donnée doit être déplacée.
- **Hachage Cohérent** : `Req_101` est sur l'anneau ; le serveur suivant est S1. Si S3 est ajouté entre le point de `Req_101` et S1, seule `Req_101` migre vers S3. Les autres restent sur leurs serveurs.

## Erreur Courante : Croire que le Remappage est Éliminé
Certains pensent que le hachage cohérent supprime tout déplacement de données. En réalité, il *réduit* le remappage de $O(n)$ à $O(k/n)$. Un certain mouvement est inévitable ; l'objectif est de le minimiser.

## Exercice Pratique
Si vous avez 10 serveurs et que vous en ajoutez un via le hachage cohérent, quel pourcentage approximatif de clés doit être déplacé ?

**Réponse** : Environ 1/11ème (soit ~9%) des clés, au lieu de presque 100%.
