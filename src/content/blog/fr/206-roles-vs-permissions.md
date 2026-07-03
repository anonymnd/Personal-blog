---
title: "Modéliser les Rôles et Permissions sans Perdre la Propriété des Ressources"
description: "Mise en œuvre d'un modèle hybride RBAC et ABAC pour gérer les accès par rôle et la propriété spécifique des ressources dans un musée."
pubDate: 2026-10-08T11:48:00.000Z
translationKey: 206-roles-vs-permissions
seriesOrder: 44
locale: fr
tags: ["security","learning-series"]
draft: false
---

## L'écart entre Rôles et Propriété

Le contrôle d'accès basé sur les rôles (RBAC) est efficace pour une catégorisation large. Dans un musée, attribuer le rôle `CURATOR` (conservateur) permet d'accéder au tableau de bord de curation. Cependant, le RBAC seul échoue lorsqu'il faut spécifier que le Conservateur A peut modifier l'exposition « La Pierre de Rosette », mais que le Conservateur B ne le peut pas. Si l'on vérifie simplement `hasRole('CURATOR')`, on accorde des permissions de modification globales, violant ainsi le principe du moindre privilège.

Pour résoudre cela, nous combinons le RBAC (ce que vous êtes) avec un contrôle d'accès basé sur les attributs ou des vérifications de propriété (ce que vous possédez/ce qui vous est assigné). Cela évite la « dérive des privilèges » où un rôle `FINANCE` pourrait accidentellement hériter de permissions de modification parce qu'il partage un groupe administratif de haut niveau.

## Conception du Schéma de Permissions

Au lieu de coder les rôles en dur dans la logique métier, nous les découplons en utilisant une approche basée sur les permissions. Les rôles servent de conteneurs pour les permissions, et les assignations de ressources servent de barrière finale.

### Le Modèle de Données

Nous utilisons une relation plusieurs-à-plusieurs entre utilisateurs et rôles, et une table d'assignation spécifique pour la propriété des ressources.

```java
// Modèle de domaine illustratif
public record User(Long id, String username, Set<Role> roles) {}

public record Role(Long id, String name, Set<Permission> permissions) {}

public record Permission(Long id, String code) {}

// Le lien critique pour la propriété des ressources
public record ResourceAssignment(
    Long userId,
    Long resourceId,
    String resourceType,
    String accessLevel // ex: "EDITOR", "VIEWER"
) {}
```

## Exemple concret : Accès aux expositions du musée

**Scénario :**
- **Bénévole (Volunteer) :** Peut consulter les expositions.
- **Conservateur (Curator) :** Peut modifier les expositions, mais seulement celles qui lui sont assignées.
- **Finance :** Peut consulter les rapports financiers des expositions, mais ne peut pas modifier le contenu de l'exposition.

### Logique d'application

Lorsqu'une requête arrive pour modifier une exposition, le système doit passer deux vérifications : le **Contrôle Fonctionnel** (Le rôle permet-il la modification en général ?) et le **Contrôle de Propriété** (Cet utilisateur spécifique est-il autorisé à modifier cette exposition spécifique ?).

```java
public class ExhibitSecurityService {
    private final ResourceAssignmentRepository assignmentRepo;

    public ExhibitSecurityService(ResourceAssignmentRepository repo) {
        this.assignmentRepo = repo;
    }

    public boolean canEditExhibit(User user, Long exhibitId) {
        // 1. Contrôle Fonctionnel : L'utilisateur a-t-il la permission 'EXHIBIT_EDIT' via un rôle ?
        boolean hasPermission = user.roles().stream()
            .flatMap(role -> role.permissions().stream())
            .anyMatch(p -> p.code().equals("EXHIBIT_EDIT"));

        if (!hasPermission) return false;

        // 2. Contrôle de Propriété : L'utilisateur est-il assigné comme EDITOR pour cette exposition ?
        return assignmentRepo.findForResource(user.id(), "EXHIBIT", exhibitId)
            .map(assignment -> "EDITOR".equals(assignment.accessLevel()))
            .orElse(false);
    }
}
```

### Analyse des résultats

1. **Bénévole** tente de modifier l'exposition 101 → Contrôle Fonctionnel échoue (pas de permission `EXHIBIT_EDIT`) → **Refusé**.
2. **Finance** tente de modifier l'exposition 101 → Contrôle Fonctionnel échoue (Finance a `REPORT_VIEW`, pas `EXHIBIT_EDIT`) → **Refusé**.
3. **Conservateur A** (assigné à l'exposition 101) tente de modifier l'exposition 101 → Contrôle Fonctionnel réussi → Contrôle de Propriété réussi → **Autorisé**.
4. **Conservateur A** tente de modifier l'exposition 202 (non assignée) → Contrôle Fonctionnel réussi → Contrôle de Propriété échoue → **Refusé**.

## Cas d'échec et cas limites

Ce modèle accorde l’union des permissions de rôles puis vérifie l’affectation à l’exposition. Incluez le type de ressource : une affectation à un rapport portant le même ID ne doit pas autoriser une exposition. findForResource est une méthode repository personnalisée, pas la signature standard findById.

L’identité vient du principal authentifié, jamais de rôles ou userId fournis sans confiance dans le body. Contrôlez chaque opération et les courses entre changement d’affectation et édition. Une permission de réaffectation peut récupérer une exposition sans propriétaire sans donner un droit global à tous.

Des droits directs peuvent être audités s’ils sont modélisés explicitement ; ce projet choisit les rôles pour simplifier. Le bypass super-curator est un pouvoir explicite à attribuer étroitement et auditer. Il doit encore respecter la frontière du musée ou tenant.
## Exercice

**Tâche :** Modifier la logique pour permettre à un rôle `SUPER_CURATOR` de modifier *n'importe quelle* exposition sans tenir compte de la table `ResourceAssignment`, tout en limitant le `CURATOR` standard à ses expositions assignées.

**Réponse :**
Mettre à jour la méthode `canEditExhibit` pour vérifier le rôle `SUPER_CURATOR` avant le contrôle de propriété :
```java
public boolean canEditExhibit(User user, Long exhibitId) {
    boolean isSuper = user.roles().stream().anyMatch(r -> r.name().equals("SUPER_CURATOR"));
    if (isSuper) return true; // Contourne le contrôle de propriété

    boolean hasPermission = user.roles().stream()
        .flatMap(role -> role.permissions().stream())
        .anyMatch(p -> p.code().equals("EXHIBIT_EDIT"));

    if (!hasPermission) return false;

    return assignmentRepo.findForResource(user.id(), "EXHIBIT", exhibitId)
        .map(assignment -> "EDITOR".equals(assignment.accessLevel()))
        .orElse(false);
}
```

## Pour approfondir

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP JWT guidance](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
