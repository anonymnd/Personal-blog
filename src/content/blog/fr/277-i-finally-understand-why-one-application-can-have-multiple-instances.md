---
title: "J'ai enfin compris pourquoi une application peut avoir plusieurs instances"
description: "Une exploration conceptuelle de la mise à l'échelle horizontale et de la différence entre un code source et plusieurs processus d'exécution."
pubDate: 2026-10-18T04:48:00.000Z
translationKey: 277-i-finally-understand-why-one-application-can-have-multiple-instances
locale: fr
tags: ["software-engineering","finally-understood","learning-series"]
draft: false
---

Ces exemples illustrent le concept ; la configuration de l’application et les définitions auxiliaires peuvent être omises.

Pendant longtemps, j'ai eu du mal à visualiser comment une seule application pouvait exister en 'plusieurs instances'. Je pensais que si je lançais mon application, c'était simplement *l'application*. Mais on comprend mieux quand on imagine un pic soudain d'utilisateurs : un seul serveur ne peut tout simplement pas gérer 10 000 requêtes simultanées sans planter à cause de la CPU ou de la RAM.

## Le concept de mise à l'échelle horizontale
Exécuter plusieurs instances signifie prendre exactement le même code compilé (l'artéfact) et le lancer comme des processus distincts, soit sur une machine puissante, soit sur plusieurs serveurs différents. C'est ce qu'on appelle le scaling horizontal. Au lieu d'agrandir un seul serveur (scaling vertical), on ajoute des clones identiques. Un Load Balancer se place devant ces instances pour répartir le trafic.

## Scénario hypothétique de procurement
Imaginez une application de gestion des achats où les employés soumettent des demandes. Si une seule instance tourne et que 500 employés envoient des demandes à 9h00, le serveur risque de ralentir.

En lançant trois instances (Instance A, B et C) :
1. La requête 1 va vers l'Instance A.
2. La requête 2 va vers l'Instance B.
3. La requête 3 va vers l'Instance C.

Chaque instance gère une fraction de la charge. Si l'Instance B plante, le Load Balancer redirige simplement le trafic vers A et C, garantissant que le processus d'achat ne s'arrête pas.

## L'exigence d'absence d'état (Stateless)
Pour que cela fonctionne, l'application doit être 'stateless'. Si l'Instance A sauvegarde une session utilisateur dans sa mémoire locale et que la requête suivante arrive sur l'Instance B, l'Instance B ne saura pas qui est l'utilisateur. C'est pourquoi on utilise des stores externes comme Redis pour les sessions.

```java
// Extrait illustratif : Éviter l'état local
public class RequestService {
    // MAUVAIS : private Map<Long, Request> localCache = new HashMap<>();
    // BIEN : Utiliser une base de données partagée
    @Autowired
    private RequestRepository repository;

    public void processRequest(Long id) {
        var request = repository.findById(id).orElseThrow();
        // logique de traitement
    }
}
```

## Erreur courante : Le stockage de fichiers local
Une erreur fréquente est d'enregistrer des factures téléchargées dans un dossier local comme `/uploads/`. Dans une configuration multi-instances, un fichier envoyé à l'Instance A est invisible pour l'Instance B. La solution est d'utiliser un stockage d'objets partagé.

## Exercice pratique
Si vous avez 4 instances d'une application et un Load Balancer utilisant la logique 'Round Robin', quelle instance traitera la 5ème requête ?

**Réponse :** L'Instance 1 (le cycle redémarre après la 4ème instance).
