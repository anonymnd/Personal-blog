---
title: "Diagnostiquer les Redémarrages Kubernetes et la Disponibilité du Trafic"
description: "Analyse approfondie des mécanismes de redémarrage du kubelet, des interactions entre sondes et la distinction entre retrait du trafic et recyclage du conteneur."
pubDate: 2026-10-08T23:48:00.000Z
translationKey: 249-what-happens-when-a-kubernetes-container-crashes
seriesOrder: 56
locale: fr
tags: ["deployment-devops","learning-series"]
draft: false
---

## Mécanismes de Récupération : Kubelet vs Contrôleur

Le kubelet est un agent de nœud, pas un controller du control plane. Il redémarre selon restartPolicy après sortie du processus ou seuils d’échec des probes ; Always couvre aussi une sortie réussie. Le restart conserve normalement l’identité du Pod.

Pour Deployment, ReplicaSet crée des remplacements après suppression ou perte de nœud reconnue ; le scheduler choisit un placement éligible. Détection et éviction prennent du temps. Le remplacement a un nouvel UID et potentiellement une autre IP ; StatefulSet peut réutiliser un nom stable. Restart, remplacement et récupération de données perdues sont distincts.
## Dynamique des Sondes : Startup, Readiness et Liveness

Les sondes sont le mécanisme principal d'auto-guérison, mais une mauvaise configuration peut entraîner des "spirales de la mort" où un Pod est tué juste au moment où il allait devenir sain.

1. **Startup Probe** : Elle désactive les vérifications de liveness et de readiness jusqu'à ce que le conteneur ait démarré avec succès. Elle est essentielle pour les applications lourdes ou les processeurs de médias qui effectuent un chargement de cache ou une validation de schéma au démarrage.
2. **Readiness Probe** : Elle détermine si le Pod doit recevoir du trafic via un Service. Si elle échoue, le Pod est retiré de la liste des Endpoints. Le conteneur continue de s'exécuter, mais aucune nouvelle requête ne lui est routée.
3. **Liveness Probe** : Elle détermine si le conteneur est dans un état bloqué (ex: deadlock). Si elle échoue, le kubelet tue le conteneur et le redémarre.

## Scénario : Le Processeur de Médias en Panne

Imaginons un Pod de traitement média qui met 60 secondes à charger des modèles ML en mémoire et perd occasionnellement la connexion avec un bucket de stockage distant.

### La Configuration Dangereuse (La Boucle de Redémarrage)
Si nous utilisons uniquement une sonde de liveness qui vérifie la connexion au bucket de stockage, nous créons une boucle dangereuse :
- Le Pod démarre.
- La sonde de liveness échoue car le bucket est temporairement inaccessible.
- Le kubelet tue le conteneur.
- Le Pod redémarre, passant à nouveau 60 secondes à charger les modèles, pour être tué à nouveau.

### La Configuration Correcte (Isolation du Trafic)
Au lieu de cela, nous séparons la phase de "boot" de la phase de "dépendance".

**Exemple de Configuration Travaillé (Illustratif) :**
```yaml
# Extrait d'une spec de Pod pour un processeur média
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10 # Donne 300s pour démarrer
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  periodSeconds: 20
```

**Analyse du Résultat :**
- **Pendant le Boot** : La `startupProbe` s'exécute. Liveness et Readiness sont ignorées. Le Pod n'est pas tué s'il met 2 minutes à charger les modèles.
- **Perte de Dépendance** : Si le bucket de stockage tombe, le point de terminaison `/health/ready` renvoie une erreur 500. La `readinessProbe` échoue. Kubernetes retire le Pod du Service. Le Pod reste actif, lui permettant de rétablir la connexion sans perdre de temps à recharger les modèles depuis le disque.
- **Deadlock** : Si le processus Java gèle complètement, le point `/health/live` ne répond plus. La `livenessProbe` échoue, et le kubelet redémarre le conteneur pour débloquer la situation.

## Limites d'Échec et Déploiements

Les réglages de rollout limitent l’indisponibilité planifiée sans empêcher toutes les pannes de cluster, mauvaises probes ou dépendances communes. progressDeadlineSeconds signale un blocage sans effectuer lui-même un rollback. Définissez alertes et récupération.

Les probes appartiennent au conteneur dans spec.containers, pas à la racine du Pod spec. Readiness modifie les endpoints après seuil et propagation ; elle n’annule pas immédiatement les connexions existantes et n’arrête pas un worker de queue. Ce worker demande une politique de pause/admission pour les pannes de dépendance.
## Exercice

**Scénario** : Vous avez un Pod qui crash toutes les 10 minutes à cause d'une fuite de mémoire. Vous implémentez une sonde de liveness qui vérifie l'utilisation de la mémoire et redémarre le Pod quand elle dépasse 80%.

1. Est-ce une utilisation correcte de l'auto-guérison ?
2. Qu'arrive-t-il au trafic pendant le redémarrage ?
3. En quoi cela diffère-t-il d'un échec de sonde de Readiness ?

**Réponse** :
1. Non. Les sondes de liveness doivent détecter des états irrécupérables (deadlocks), pas gérer des fuites de ressources. C'est un "pansement" pour un bug, pas une véritable auto-guérison. La solution correcte est d'ajuster les limites de mémoire ou de corriger la fuite.
2. Le trafic est coupé immédiatement car le conteneur est tué, et le Pod devient indisponible jusqu'à ce que le nouveau conteneur passe son test de readiness.
3. Un échec de readiness arrêterait le trafic mais laisserait le processus tourner, vous permettant d'utiliser `exec` dans le Pod pour déboguer la fuite. Un échec de liveness détruit la preuve en redémarrant le processus.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
