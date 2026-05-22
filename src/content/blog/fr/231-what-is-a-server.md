---
title: "Déployer une Application d'un Ordinateur vers un Serveur"
description: "Guide technique pour déplacer un service de rendez-vous Java vers un VPS Linux, couvrant la configuration, les proxys inverses et le cycle de vie du service."
pubDate: 2026-10-08T19:48:00.000Z
translationKey: 231-what-is-a-server
seriesOrder: 52
locale: fr
tags: ["deployment-devops","learning-series"]
draft: false
---

## Le Changement de Paradigme : Laptop vs VPS

Développer sur un ordinateur portable offre un environnement contrôlé où le développeur est l'unique utilisateur et la base de données est souvent locale. Le passage à un Serveur Privé Virtuel (VPS) introduit un réseau partagé, des exigences de disponibilité permanente et des frontières de sécurité strictes. Un VPS est essentiellement une tranche d'un serveur physique avec son propre OS, vous permettant de gérer le noyau et les paquets installés, contrairement à un hébergement mutualisé.

## Stratification des Environnements

Pour éviter de déployer du code non testé directement aux utilisateurs, nous catégorisons les environnements selon leur rôle :

*   **Local** : La machine du développeur. Optimisée pour le feedback rapide et le débogage.
*   **Développement/Stage** : Un VPS qui imite la production. C'est ici que les tests d'intégration ont lieu et que le « service de rendez-vous » est vérifié dans un environnement Linux réel.
*   **Production** : Le serveur final. Optimisé pour la stabilité, la sécurité et la performance. L'accès y est strictement limité.

## Gestion de la Configuration et des Secrets

Coder en dur les URL de base de données ou les clés API est une erreur critique. Nous utilisons une configuration externalisée. Pour un service Spring Boot, nous séparons la logique applicative des paramètres d'environnement.

**Matrice de Configuration pour le Service de Rendez-vous :**

| Paramètre | Local | Stage | Production |
| :--- | :--- | :--- | :--- |
| `server.port` | 8080 | 8080 | 8080 |
| `spring.datasource.url` | jdbc:h2:mem:testdb | jdbc:postgresql://stage-db:5432/app | jdbc:postgresql://prod-db:5432/app |
| `logging.level.root` | DEBUG | INFO | WARN |
| `api.key` | dev-key-123 | stage-secret-abc | prod-high-security-xyz |

Les secrets (comme `api.key`) ne doivent jamais être dans Git. Sur le VPS, ils sont injectés via des variables d'environnement ou un fichier `.properties` protégé appartenant à l'utilisateur du service.

## L'Artéfact de Déploiement et Cycle de Vie

On ne déplace pas le code source sur le serveur, mais un artéfact compilé et immuable (ex: un fichier `.jar`).

**Séquence de Déploiement :**
1. **Transfert** : Le JAR est téléchargé sur le VPS via SCP ou SFTP.
2. **Exécution** : L'application est lancée en arrière-plan. L'utilisation de `systemd` garantit que l'app démarre au boot et redémarre en cas de crash.
3. **Proxy Inverse** : L'application tourne sur le port 8080, mais les utilisateurs y accèdent via le port 443 (HTTPS). Un proxy inverse (comme Nginx) se place devant pour gérer le TLS et rediriger les requêtes vers le processus Java.

## Exemple Concret : Plan de Déploiement du Service de Rendez-vous

Supposons le déploiement de `appointment-service-v1.jar` sur un VPS Ubuntu.

**1. Définition du Service Systemd (Illustratif)**
Cette configuration indique à Linux comment gérer le cycle de vie de l'app.

```ini
[Unit]
Description=Appointment Service
After=network.target

[Service]
User=appuser
ExecStart=/usr/bin/java -jar /opt/app/appointment-service-v1.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
Environment=SPRING_PROFILES_ACTIVE=prod
EnvironmentFile=/etc/appointment-service/app.env
Environment=SERVER_ADDRESS=127.0.0.1
Environment=SERVER_PORT=8080

[Install]
WantedBy=multi-user.target
```

**2. Configuration du Proxy Inverse Nginx (Illustratif)**
Ceci mappe le domaine public vers le port interne.

```nginx
server {
    listen 443 ssl;
    server_name appointments.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Analyse de cette installation :**
*   **Isolation** : L'app Java n'est pas exposée directement à Internet ; seul Nginx l'est. Cela empêche les attaquants de sonder directement le serveur d'application.
*   **Résilience** : Si la JVM manque de mémoire et crash, `systemd` détecte la sortie et déclenche un redémarrage après 10 secondes.
*   **Sécurité** : L'utilisateur `appuser` a des permissions limitées, ce qui signifie qu'une vulnérabilité dans l'app ne donne pas d'accès root au VPS.

## Smoke Checks et Rollback

Une fois le service lancé, on effectue un **Smoke Check** : un ensemble minimal de tests pour vérifier que les fonctionnalités de base marchent dans le nouvel environnement. Pour notre service, cela signifie vérifier le point de terminaison `/health` et tenter de récupérer un rendez-vous.

**Scénario d'échec** : Le smoke check échoue car la base de données de production rejette la connexion (mauvais identifiants).

**Prérequis au Rollback** : Pour revenir en arrière, nous devons garder l'artéfact de la version précédente (`appointment-service-v0.jar`) et sa configuration sur le disque. Le rollback consiste à mettre à jour le chemin `ExecStart` de `systemd` vers l'ancien JAR et redémarrer le service. C'est plus rapide que de tout re-télécharger depuis un laptop.

## Exercice

**Scénario** : Vous avez déployé une nouvelle version du service. Les logs Nginx affichent `502 Bad Gateway`, mais le statut `systemd` indique que le service est `active (running)`. 

1. Quelle est la cause la plus probable de cette divergence ?
2. Comment vérifier si l'application accepte réellement les requêtes en interne ?

**Réponse** :
1. Le processus applicatif tourne, mais il n'écoute pas sur le port attendu par Nginx (8080), ou il est bloqué dans une boucle de démarrage/deadlock où le processus existe mais le serveur n'est pas prêt.
2. Exécuter `curl -I http://localhost:8080/health` directement sur le VPS. Si cela échoue, le problème est interne à l'app Java ; si cela réussit, le problème vient de la configuration Nginx.

Créez séparément appuser, runtime Java, chemins et EnvironmentFile protégé. Renseignez les variables Spring réelles dont SPRING_DATASOURCE_PASSWORD ; DB_PASSWORD n’est pas automatiquement liée sans configuration. Restreignez permissions et firewall et écoutez sur loopback avant d’affirmer que seul le proxy est public. Le certificat doit correspondre à appointments.example.com. Rechargez systemd après modification et vérifiez readiness locale et HTTPS public. Un 502 a plusieurs causes ; un HEAD /health réussi n’exclut pas permissions proxy, TLS ou problème de route. Le rollback exige aussi compatibilité schéma/configuration.

## Pour approfondir

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
