---
title: "Évoluer un Schéma de Production avec Flyway plutôt qu'au Hasard"
description: "Maîtrisez les migrations versionnées, le pattern expand-contract pour le zéro-downtime et la récupération après l'échec de scripts DDL."
pubDate: 2026-10-08T02:48:00.000Z
translationKey: 151-why-do-we-need-database-migrations
seriesOrder: 35
locale: fr
tags: ["schema-migrations","learning-series"]
draft: false
---

## Le Danger de la Gestion Automatisée du Schéma

En début de développement, `spring.jpa.hibernate.ddl-auto=update` semble magique. Il modifie les tables pour correspondre aux entités Java automatiquement. Cependant, en production, c'est un risque majeur. Le mode `update` d'Hibernate est une tentative d'approximation ; il ne peut pas gérer les renommages complexes, les migrations de données ou les changements précis de contraintes. S'il échoue, il laisse souvent le schéma dans un état indéterminé sans aucune trace d'audit.

Passer à `ddl-auto=validate` est la première étape vers la stabilité. Dans ce mode, Hibernate ne modifie pas la base de données ; il vérifie simplement que le schéma existant correspond aux mappings des entités. Si une colonne manque ou si un type est incorrect, l'application refuse de démarrer. Cela garantit que l'application ne s'exécute jamais sur une version de base de données incompatible.

## Comment Flyway Garantit la Cohérence

Flyway remplace les suppositions par un historique versionné via une table (`flyway_schema_history`). Au lieu de laisser un framework deviner l'état, vous fournissez des scripts SQL explicites.

### Le Mécanisme de Versionnage
Flyway identifie les migrations via une convention de nommage : `V<Version>__<Description>.sql` (ex: `V1__Create_user_table.sql`).
1. **Exécution** : Flyway scanne le classpath pour trouver les scripts et les compare à la table d'historique.
2. **Checksums** : Lorsqu'un script est appliqué, Flyway stocke un checksum (un hash du contenu du fichier).
3. **Immuabilité** : Une fois que `V1` est appliqué en production, il ne doit plus jamais être modifié. Si vous changez un seul caractère dans `V1__Create_user_table.sql` après son exécution, Flyway détectera un écart de checksum au prochain démarrage et bloquera l'application.

## Scénario : Ajout d'un `displayName` Obligatoire

Ajouter une colonne obligatoire à users échoue si les lignes existantes n’ont pas de valeur. Ajoutez display_name nullable, puis déployez le code qui la renseigne pour chaque nouvelle ligne et accepte les anciennes. Les anciens writers peuvent encore insérer null : un backfill unique ne suffit pas.

Retirez ou adaptez tous les anciens writers avant l’invariant final. Remplissez les lignes existantes avec une valeur approuvée, en contrôlant nullabilité et longueur de username, puis vérifiez l’absence de null. Sur une grande table, utilisez des lots surveillés et reprenables. Imposez enfin NOT NULL lorsque les versions encore actives sont compatibles.

```sql
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
-- Backfill only after writers reliably populate the new field.
UPDATE users SET display_name = username WHERE display_name IS NULL;
-- Later, after compatibility and null checks:
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
```

Ces instructions appartiennent à des étapes de migration et déploiement séparées explicitement ; les séparer ne garantit pas seul la compatibilité. PostgreSQL peut annuler ensemble DDL transactionnel ordinaire et backfill si une migration échoue : les réunir ne crée pas intrinsèquement un état partiel. Les étapes servent à maîtriser compatibilité et exploitation. Certains moteurs et opérations ont d’autres comportements transactionnels.
## Récupération d'Échec et DDL Transactionnel

Lorsqu'une migration échoue, le comportement dépend du moteur de base de données.

- **PostgreSQL** : La plupart du DDL (Data Definition Language) est transactionnel. Si `V3` échoue à mi-chemin, toute la transaction est annulée et la table d'historique reste à `V2`.
- **MySQL/Oracle** : Le DDL provoque souvent un commit implicite. Si un script contient trois instructions `ALTER TABLE` et que la troisième échoue, les deux premières restent appliquées.

### La Limite de `repair`
Quand une migration échoue dans une DB non-transactionnelle, Flyway marque cette version comme `failed`. L'application ne démarrera pas tant que ce n'est pas résolu.

Certains développeurs pensent que `flyway repair` est un bouton "annuler". **`flyway repair` ne revient pas en arrière sur le SQL.** Il nettoie uniquement la table `flyway_schema_history` en supprimant les entrées échouées ou en alignant les checksums. Si votre script a partiellement ajouté une colonne avant d'échouer, vous devez supprimer manuellement cette colonne via SQL avant de lancer `repair` et de redémarrer l'app.

## Exercice

Pour total_amount → grand_total, ajoutez d’abord la colonne nullable. Déployez du code compatible qui synchronise les deux valeurs pendant la coexistence, puis retirez les anciens writers ou fournissez une synchronisation testée. Faites backfill, rapprochement et vérification. Passez les lectures à grand_total et cessez de dépendre de total_amount seulement lorsque tous les writers actifs et versions de rollback sont compatibles. Supprimez l’ancienne colonne dans une migration ultérieure revue.

Un changement de code est une étape de déploiement, pas une migration SQL Update_app. Ne supprimez pas aveuglément une colonne partiellement créée après échec : examinez l’état et choisissez une récupération préservant les données. repair ajuste l’historique, pas la base. ddl-auto=validate ne prouve pas toutes les contraintes, index et règles métier. Gardez les migrations appliquées inchangées et ajoutez une nouvelle migration pour évoluer.

## Pour approfondir

- [Flyway repair](https://documentation.red-gate.com/flyway/reference/commands/repair)
- [Flyway migration transaction handling](https://documentation.red-gate.com/fd/migration-transaction-handling-273973399.html)
