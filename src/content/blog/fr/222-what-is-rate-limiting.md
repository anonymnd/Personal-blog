---
title: "Choisir des Algorithmes de Limitation de Débit pour les Rafales et l'Équité"
description: "Guide technique sur les algorithmes Token Bucket et Leaky Bucket, le calcul des rafales et l'équité par client pour une API de géocodage."
pubDate: 2026-10-08T16:48:00.000Z
translationKey: 222-what-is-rate-limiting
seriesOrder: 49
locale: fr
tags: ["system-design","learning-series"]
draft: false
---

## Objectif de la Limitation de Débit et Choix de la Clé

La limitation de débit (rate limiting) empêche la dégradation du service en contrôlant le flux de requêtes entrantes. L'objectif principal est de protéger les ressources pour qu'elles ne soient pas submergées par un seul client malveillant ou défectueux, garantissant ainsi une haute disponibilité pour les autres.

Le choix de la "clé" du limiteur est crucial. Un limiteur global (une seule limite pour toute l'API) est risqué car un utilisateur agressif peut déclencher une réponse 429 Too Many Requests pour tous les autres utilisateurs. À l'inverse, une limitation par client (via une clé API ou un ID utilisateur) assure l'équité : seul le contrevenant est restreint.

## Token Bucket vs Leaky Bucket

Bien que les deux contrôlent le trafic, ils gèrent les "rafales" (bursts) différemment.

**Token Bucket (Seau à jetons)** : Imaginez un seau qui contient des jetons. Les jetons sont ajoutés à un rythme constant (taux de remplissage). Chaque requête consomme un jeton. Si le seau est plein, les nouveaux jetons sont ignorés. Si le seau est vide, la requête est rejetée. Cela permet une "rafale" de trafic jusqu'à la capacité du seau, à condition que des jetons aient été accumulés.

**Leaky Bucket (Seau percée)** : Imaginez un seau avec un trou au fond. Les requêtes entrent dans le seau et "fuient" vers le moteur de traitement à un rythme fixe et constant. Si le seau déborde, les nouvelles requêtes sont supprimées. Cela lisse complètement le trafic, éliminant les rafales au profit d'un flux régulier.

## Scénario Pratique : API de Géocodage

Considérons une API de géocodage avec la configuration suivante :
- **Taux de remplissage** : 5 requêtes par seconde (rps)
- **Capacité du seau** : 10 jetons

### Calcul de la Rafale
Si l'API est restée inactive pendant plusieurs secondes, le seau est plein (10 jetons).

1. **T=0s** : Un client envoie 12 requêtes instantanément.
   - 10 requêtes sont traitées immédiatement (consommation de la capacité de rafale).
   - 2 requêtes sont rejetées avec un statut 429.
2. **T=1s** : Le seau s'est rempli de 5 jetons.
   - Le client peut maintenant envoyer 5 nouvelles requêtes immédiatement.

### Compromis entre 429 et Retry-After
Lorsqu'une requête est rejetée, le serveur renvoie un code HTTP 429. Pour éviter que le client ne tente de renvoyer la requête immédiatement et ne surcharge le serveur, l'en-tête `Retry-After` doit être inclus.

- **Retry-After court** : Favorise une récupération rapide mais peut entraîner des problèmes de "thundering herd" si de nombreux clients réessaient à la milliseconde près.
- **Retry-After long** : Protège mieux le serveur mais dégrade l'expérience utilisateur.

## Considérations d'Implémentation

Pour une limite agrégée entre instances, coordonnez atomiquement les tokens via Redis, une gateway ou un autre limiter conçu. Redis n’est pas une obligation universelle. Des buckets locaux multiplient le quota sauf répartition délibérée. Choisissez le comportement si le stockage du limiter tombe.

Combinez quotas client et limite globale si nécessaire ; aucun ne garantit seul la disponibilité. Les identités doivent être fiables ; un IP peut regrouper plusieurs utilisateurs derrière NAT. Les calculs supposent absence de requêtes intermédiaires et refill documenté. Le leaky bucket décrit ici est la variante file/shaping ; une variante policing rejette sans mettre en file.
## Exercice

**Scénario** : Un système a un taux de remplissage de 2 jetons/sec et une capacité de 5. Le seau est actuellement vide.
1. Combien de requêtes peuvent être traitées à T=3 secondes ?
2. Si 10 requêtes arrivent à T=3 secondes, combien sont rejetées ?

**Réponse** :
1. À T=3s, le seau s'est rempli de 3 × 2 = 6 jetons, mais il est plafonné à la capacité de 5. Donc, 5 requêtes peuvent être traitées.
2. 10 requêtes arrivent, 5 sont traitées, et 5 sont rejetées.
