---
title: "Mise en œuvre du Cache-Aside Redis pour les horaires de cinéma"
description: "Analyse approfondie du pattern Cache-Aside pour gérer les données de séances de cinéma tout en évitant les lectures obsolètes et les cache stampedes."
pubDate: 2026-10-08T15:48:00.000Z
translationKey: 218-what-is-a-cache
seriesOrder: 48
locale: fr
tags: ["system-design","learning-series"]
draft: false
---

## Le Mécanisme Cache-Aside

Dans une architecture Cache-Aside (ou Lazy Loading), l'application est responsable de la gestion de la relation entre la base de données (source de vérité) et le cache (couche d'accès rapide). Contrairement au cache write-through, le cache ne se met pas à jour automatiquement lors d'une modification en base de données. L'application suit un flux logique précis : vérifier le cache ; en cas d'absence (miss), récupérer la donnée en DB et remplir le cache ; si présente (hit), retourner la donnée immédiatement.

Bien que cela découple le cache de la base de données, cela introduit un risque de données obsolètes (stale data). Si une séance de cinéma est annulée dans la base de données mais que le cache contient toujours l'ancien horaire, les utilisateurs verront une information erronée.

## Scénario : Gestion des séances de cinéma

Imaginons un système où les utilisateurs consultent les horaires d'un film. Les données sont massivement lues mais occasionnellement mises à jour (ex: annulation d'une séance).

### Trace du flux de travail

1. **Lecture Initiale (Miss) :** L'utilisateur demande `movie_123`. Le cache est vide. L'app interroge la DB → la DB retourne "19:00". L'app stocke "19:00" dans Redis avec un TTL (Time-to-Live) de 3600s. L'utilisateur voit "19:00".
2. **Lecture Suivante (Hit) :** Un autre utilisateur demande `movie_123`. L'app trouve "19:00" dans Redis. L'utilisateur voit "19:00" instantanément.
3. **Mise à jour (Invalidation) :** Un administrateur annule la séance de 19:00. L'app met à jour la DB en "Annulé". Pour éviter les données obsolètes, l'app doit immédiatement envoyer une commande `DEL movie_123` à Redis.
4. **Lecture Post-Mise à jour :** L'utilisateur demande `movie_123`. Le cache est vide (suite à la suppression). L'app interroge la DB → la DB retourne "Annulé". L'app stocke "Annulé" dans Redis. L'utilisateur voit "Annulé".

## Gestion des cas limites et des pannes

Un lecteur peut charger un ancien horaire, attendre puis remplir le cache après commit et invalidation d’une annulation. Invalider après commit évite de vider pour une transaction annulée, sans empêcher seul ce remplissage tardif. Un TTL borne la durée de cette entrée ; écritures répétées, retard de réplica ou resets demandent analyse. Versions, invalidation coordonnée ou politique explicite de fraîcheur sont des choix possibles. L’éligibilité de réservation utilise toujours l’état autoritatif.

Pour une clé chaude absente, regroupez les demandes : un loader recharge, les autres attendent ou utilisent une valeur ancienne autorisée. Un mutex local ne couvre qu’une instance ; un lease distribué exige expiration et gestion sûre de propriété. Le cache négatif stocke un marqueur explicite avec TTL court, pas null confondu avec un miss. Incluez tenant et dimensions de requête pertinentes.
## Exemple concret : Logique d'implémentation

Utilisez une enveloppe typée avec found et value séparés et un serializer configuré. Redis stocke des octets ; null Java n’est pas un marqueur négatif fiable. Voici un pseudocode illustratif :

```text
GET screening:tenant-7:id-123
  MISS → database lookup
  FOUND → SET {found:true,value:...} with positive TTL
  ABSENT → SET {found:false,value:null} with short negative TTL
HIT {found:false,...} → return absent without a DB lookup
UPDATE → commit authoritative change → invalidate key
```

Un hit évite une lecture DB, sans garantir une seule requête par heure : éviction, retries, misses concurrents et invalidations peuvent en ajouter. Si Redis échoue, choisissez fallback borné ou échec ; un fallback illimité peut saturer la base. Observez taux de hits, durée de chargement et incidents de fraîcheur. L’invalidation après commit exige retries ou rapprochement si elle échoue. La trace normale ne promet pas une cohérence stricte face à toutes les courses.
## Exercice

L’expiration d’une seule clé de première peut déclencher beaucoup de misses concurrents : regroupez les demandes de cette clé. Le jitter répartit l’expiration entre différentes clés ou entrées indépendantes, pas les requêtes d’une unique clé Redis. Testez burst à expiration, panne Redis et lecteur suspendu pendant annulation. Vérifiez la politique de fraîcheur et les décisions autoritatives de réservation.
