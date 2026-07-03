---
title: "Intégration de Kubernetes dans l'Architecture de Déploiement"
description: "Distinction entre packaging de conteneurs et orchestration, et mise en œuvre d'une API de tuiles de cartes sans état avec des Services."
pubDate: 2026-10-08T22:48:00.000Z
translationKey: 246-where-kubernetes-fits-into-ci-cd
seriesOrder: 55
locale: fr
tags: ["deployment-devops","learning-series"]
draft: false
---

## Orchestration vs Packaging

Une confusion courante dans les pipelines modernes réside dans la distinction entre Docker et Kubernetes. Docker est un outil de packaging ; il crée une image immuable contenant le code de l'application, le runtime et les dépendances. Kubernetes, en revanche, est un orchestrateur. Il ne compile pas votre code et n'exécute pas vos tests — c'est le rôle du pipeline CI. Kubernetes récupère l'image produite par le pipeline et gère son cycle de vie sur un cluster de machines.

Le passage de relais s'effectue lorsque le pipeline CI/CD pousse une configuration déclarative (généralement en YAML) vers l'API Kubernetes. Le pipeline indique à Kubernetes : « Assure-toi que cette version spécifique de l'image est exécutée avec ces limites de ressources ». Kubernetes s'efforce ensuite de réconcilier l'état actuel du cluster avec cet état souhaité.

## Scénario : API de tuiles de cartes sans état

L’API vise trois réplicas. Deployment pilote le rollout via ReplicaSets ; leur controller crée les Pods, le scheduler choisit les nœuds éligibles et les kubelets lancent les conteneurs. Le nombre désiré est une cible, pas trois instances disponibles garanties pendant panne ou manque de capacité.

Un Service ClusterIP normal fournit une découverte stable et route vers les endpoints prêts sélectionnés. Les Pods remplacés peuvent changer d’adresse ; les clients ne doivent pas dépendre de leurs IP. Le Service est interne par défaut, pas une exposition internet à lui seul. Readiness et rollout se configurent séparément. Des tuiles identiques en lecture seule incluses dans chaque image peuvent rester locales ; un état mutable/non répliqué exige un stockage explicite.
## Artefact : Configuration Déclarative

Voici la configuration pour l'API de tuiles de cartes. Ce fichier YAML est ce que le pipeline appliquerait au cluster.

```yaml
# illustrative-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: map-tile-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: map-tiles
  template:
    metadata:
      labels:
        app: map-tiles
    spec:
      containers:
      - name: tile-server
        image: registry.example.com/map-tile-api:v1.2.0
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: map-tile-service
spec:
  selector:
    app: map-tiles
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

### Analyse du résultat
1. **État souhaité :** replicas: 3 demande trois réplicas ; leur disponibilité dépend du placement, démarrage et readiness.
2. **Découplage** : Le Service `map-tile-service` cible tout Pod ayant le label `app: map-tiles`. Si le Deployment remplace un Pod lors d'une mise à jour, le Service met automatiquement à jour sa liste de points de terminaison sans que le client ne remarque le changement d'IP.
3. **Flux de trafic** : Client → `map-tile-service` (Port 80) → Pod aléatoire (Port 8080).

## Cas d'échec et contraintes

- **Échec du téléchargement de l'image** : Si le pipeline pousse une configuration référençant un tag d'image inexistant dans le registre, les Pods passeront en état `ImagePullBackOff`. L'orchestrateur ne peut pas corriger un artefact manquant ; il peut seulement recommencer la tentative.
- **Épuisement des ressources** : Si le cluster manque de CPU/RAM pour héberger trois réplicas, certains Pods resteront en état `Pending`. Le contrôleur de déploiement sait qu'il *devrait* en avoir trois, mais le scheduler ne trouve pas de place pour les installer.
- **État :** un état local mutable n’est pas partagé automatiquement. Des tuiles identiques en lecture seule dans chaque image peuvent être servies localement ; des tuiles mutables exigent synchronisation ou stockage partagé.

## Exercice

Passez spec.replicas à 5 et l’image à la version revue, de préférence son digest. Deployment rapproche cible et rollout. RollingUpdate par défaut ne signifie pas universellement un Pod à la fois ni exactement trois réplicas prêts conservés. maxUnavailable, maxSurge, readiness, capacité et pannes concurrentes influent.

Ajoutez readiness applicative et resource requests avant de compter sur le transfert de trafic. Observez rollout, endpoints prêts et taux d’erreur. Un rollout peut rester bloqué sans rollback automatique ; prévoyez une récupération. Ce YAML est une structure minimale, pas un manifeste de production complet.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
