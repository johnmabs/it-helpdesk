# Captures de l'application

[Retour au README](../README.md)

Captures réelles du navigateur Chromium, en français, avec un viewport de
1440 × 960 et uniquement les comptes et données fictifs du jeu E2E.
Les pages sont capturées en pleine hauteur ; la timeline est un extrait de
la section Historique. L'indicateur de développement Next.js est masqué dans
les captures des pages.

## Login

Formulaire de connexion et accès au support.

![Formulaire de connexion](screenshots/login.png)

## Dashboard

Synthèse de l'activité, répartition par catégorie et tickets récents, vus par
l'administrateur.

![Dashboard avec des tickets fictifs](screenshots/dashboard.png)

## Ticket list

Filtres, statuts, priorités, assignations et navigation de la liste.

![Liste des tickets et filtres](screenshots/ticket-list.png)

## New ticket

Titre, description, catégorie active et priorité.

![Formulaire de création d'un ticket](screenshots/new-ticket.png)

## Ticket details

Ticket en cours, informations d'assignation, actions et commentaire de diagnostic.

![Détail d'un ticket en cours](screenshots/ticket-details.png)

## History timeline

Création, modification de priorité, assignation, traitement, commentaire,
résolution et clôture, avec acteur et heure.

![Historique complet du traitement](screenshots/history-timeline.png)

## Admin categories

Création, modification et désactivation des catégories.

![Administration des catégories](screenshots/admin-categories.png)

## Régénérer les captures

Depuis la racine du dépôt, après installation des dépendances :

```bash
pnpm prisma generate
pnpm db:test:up
pnpm exec playwright install --with-deps chromium
TEST_DATABASE_URL='postgresql://helpdesk:helpdesk@127.0.0.1:5433/it_helpdesk_test?sslmode=disable' \
  pnpm exec playwright test --config docs/scripts/playwright.config.ts
```

Le script applique les migrations, **efface les données de `it_helpdesk_test`**,
recrée les fixtures E2E, lance Next.js sur le port 3100 puis réalise les captures
dans `docs/screenshots`. Ce port doit être libre. N'exécuter aucune autre suite
d'intégration ou E2E simultanément sur cette base. La configuration refuse un
nom de base différent de `it_helpdesk_test`.

Les identifiants E2E sont définis dans [fixtures.ts](../e2e/fixtures.ts) pour
cette base jetable uniquement ; ils ne sont pas les identifiants d'une démo
publique. Les horodatages varient à chaque exécution.
