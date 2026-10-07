# Tests et qualité

[Retour au README](../README.md)

La stratégie répartit les garanties entre règles métier isolées, adaptateurs
sur PostgreSQL réel et parcours navigateur. Les tests sont déjà dans le dépôt ;
la documentation ne prétend pas à une couverture exhaustive ou à un pourcentage
de couverture mesuré.

## Préparer les outils

```bash
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm lint
pnpm typecheck
pnpm test:unit
```

Les suites utilisant PostgreSQL nécessitent une `.env` configurée selon le
[guide local](local-setup.md), notamment `AUTH_SECRET` requis par Compose.

```bash
pnpm db:test:up
export TEST_DATABASE_URL='postgresql://helpdesk:helpdesk@127.0.0.1:5433/it_helpdesk_test?sslmode=disable'
pnpm test:integration
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

Exécuter les suites d'intégration, E2E et captures successivement : elles
effacent/recréent les données de la base jetable. Les configurations refusent
un nom de base ne contenant pas `test`, mais cette garde ne remplace pas
l'utilisation d'une base exclusivement dédiée aux tests.

## Unit tests — Vitest

`pnpm test:unit` utilise [vitest.config.mjs](../vitest.config.mjs) et exclut
`e2e/` et les fichiers `*.integration.test.ts`.

Les tests colocalisés vérifient notamment : transitions et invariants des
entités, assignation à un utilisateur actif, catégories actives, enregistrement
des événements, permissions, validation Zod, authentification et révocation
des sessions. Les cas d'utilisation reçoivent des repositories en mémoire et
un hasher fictif. Les tests de lecture et de Server Actions remplacent leurs
dépendances pour vérifier filtres, gardes et retours d'erreur.

Exemples : [transitions Ticket](../src/modules/tickets/domain/ticket.test.ts),
[authentification](../src/modules/auth/application/login-user.test.ts),
[filtres de visibilité](../src/modules/tickets/application/list-tickets.test.ts),
[Server Actions](../src/app/dashboard/tickets/[id]/actions.test.ts).

Ces tests sont rapides et ne nécessitent pas PostgreSQL ; les mocks ne prouvent
pas à eux seuls que la requête réelle ou l'intégration navigateur fonctionne.
`pnpm test:watch` facilite l'itération locale.

## Integration tests — Prisma et PostgreSQL

`pnpm test:integration` utilise
[vitest.integration.config.mjs](../vitest.integration.config.mjs), redirige
`DATABASE_URL` vers `TEST_DATABASE_URL`, applique les migrations au démarrage
et exécute les fichiers `*.integration.test.ts` sans parallélisme de fichiers.

Les [cinq scénarios de repositories](../src/shared/tests/prisma-repositories.integration.test.ts)
vérifient la persistance et la lecture des utilisateurs/sessions, catégories,
tickets, commentaires et historique chronologique. Les données sont supprimées
avant la suite et après chaque scénario, dans l'ordre des contraintes de
références.

Ils valident les adaptateurs et mappers avec une base réelle ; ils ne constituent
pas une suite de tests de concurrence, de charge ou de panne transactionnelle.

## E2E tests — Playwright et Chromium

`pnpm test:e2e` utilise [playwright.config.ts](../playwright.config.ts), lance
Next.js en développement sur `http://127.0.0.1:3100` et ne réutilise pas un
serveur existant. Le setup applique les migrations et réinitialise les fixtures
avec trois rôles et des mots de passe réellement hachés par Argon2.

Les parcours couvrent connexion, refus d'accès, création, workflow jusqu'à
clôture, commentaires, séparation des droits, affichage responsive, états UI
et en-têtes de sécurité. Voir [cycle de vie](../e2e/tickets/ticket-lifecycle.spec.ts),
[permissions](../e2e/tickets/permissions.spec.ts),
[responsive](../e2e/responsive-layout.spec.ts) et
[sécurité HTTP](../e2e/security-headers.spec.ts).

Pour diagnostiquer un scénario :

```bash
pnpm test:e2e e2e/tickets/ticket-lifecycle.spec.ts
pnpm exec playwright test --ui
```

La configuration prévoit une trace `on-first-retry`, mais ne configure aucun
retry par défaut. Pour obtenir cette trace lors d'un échec reproductible,
lancer `pnpm test:e2e --retries=1`. Les tests utilisent Chromium uniquement et
un serveur de développement ; ils ne prouvent pas le comportement de tous les
navigateurs ni celui d'un conteneur en production.

Les [captures portfolio](screenshots.md) utilisent une configuration distincte
dans `docs/scripts/` et ne s'ajoutent pas à la suite E2E normale.

## CI — GitHub Actions

Le [workflow](../.github/workflows/ci.yml) s'exécute sur push et pull request,
avec cinq jobs indépendants :

| Job | Contrôles |
| --- | --- |
| `dependency-security` | `pnpm audit:dependencies` avec la politique d'audit du dépôt |
| `quality` | Installation figée, génération Prisma, lint, typecheck, unit tests, build Next.js |
| `integration` | PostgreSQL 18 et suite d'intégration |
| `end-to-end` | PostgreSQL 18, installation Chromium et E2E |
| `container` | Build de la cible Docker `runner`, sans publication d'image |

Les jobs Node utilisent Node.js 24. Les services PostgreSQL des jobs de tests
écoutent sur 5432 dans leurs machines isolées, alors que la base de test locale
utilise 5433. Un rapport Playwright est collecté en cas d'échec si le répertoire
`playwright-report/` existe ; le dépôt ne configure pas explicitement un
reporter HTML, sa disponibilité n'est donc pas garantie.

L'audit est configuré au niveau `high` avec une exclusion explicite dans
[pnpm-workspace.yaml](../pnpm-workspace.yaml). Il ne garantit pas l'absence de
toutes les vulnérabilités. `pnpm test` lance les unit tests puis les E2E ; il
n'inclut ni lint, ni typecheck, ni intégration.

## Contrôles de livraison et pistes d'amélioration

```bash
pnpm build
docker compose build app migrate
```

Le build de l'image est vérifié en CI ; son démarrage et son déploiement ne le
sont pas. Les améliorations prioritaires sont les scénarios de panne entre
mutation et historique, les mises à jour concurrentes, un smoke test du
conteneur, un reporter HTML explicite et des mesures de couverture utiles aux
règles critiques.
