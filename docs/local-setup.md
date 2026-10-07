# Installation locale et démonstration

[Retour au README](../README.md)

## Prérequis et configuration

Pour le développement : Node.js 22 ou 24, pnpm 12.6.0, Git et Docker avec le
plugin Compose. Pour un lancement entièrement conteneurisé : Git et Docker
Compose suffisent. Les commandes suivantes partent de la racine du dépôt.

```bash
git clone git@github.com:johnmabs/it-helpdesk.git
cd it-helpdesk
cp .env.example .env
openssl rand -base64 32
```

Le clonage SSH suppose une clé GitHub ; l'alternative est
`git clone https://github.com/johnmabs/it-helpdesk.git`.
Reporter la valeur générée dans `AUTH_SECRET`, puis renseigner dans `.env` :

```dotenv
SEED_ADMIN_NAME="Demo Admin"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="replace-with-your-local-password"
```

Choisir son propre mot de passe, de huit caractères au minimum. `.env` est
ignoré par Git et ne doit pas être publié.

| Variable | Usage |
| --- | --- |
| `AUTH_SECRET` | Secret de session Auth.js, obligatoire dans Compose |
| `DATABASE_URL` | Connexion Prisma depuis la machine locale, port 5432 par défaut |
| `TEST_DATABASE_URL` | Base jetable d'intégration/E2E, port 5433 ; nom contenant `test` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Configuration du PostgreSQL local et de la connexion interne Compose |
| `APP_PORT` | Port exposé par l'application Docker, 3000 par défaut |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Compte administrateur initial |

Si les variables PostgreSQL changent, adapter aussi `DATABASE_URL` pour les
commandes lancées sur la machine. Compose construit sa propre URL avec l'hôte
`postgres` ; les commandes locales utilisent `localhost`. `APP_PORT` ne change
pas le port de `pnpm dev`.

## Développement local : install → database → migrate → seed → run

```bash
pnpm install --frozen-lockfile
pnpm prisma generate
docker compose up -d --wait postgres
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

La génération Prisma est explicite car le client généré n'est pas versionné.
`db:migrate:deploy` applique les migrations existantes ; il ne crée pas de
nouvelle migration. `db:seed` utilise `prisma7.config.ts` et les variables `.env`.

Ouvrir <http://localhost:3000/login> et se connecter avec les valeurs
`SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD`. Vérifier
<http://localhost:3000/api/health> : la réponse attendue est
`{"status":"ok","checks":{"database":"ok"}}`.

## Lancement entièrement Docker

Après configuration de `.env` :

```bash
docker compose up --build -d
docker compose --profile tools run --rm seed
docker compose ps
```

Compose attend PostgreSQL, exécute les migrations dans le service `migrate`,
puis démarre `app`. Le profil `tools` fournit le seed ponctuel.
L'application est disponible sur <http://localhost:3000>, ou sur le port
choisi dans `APP_PORT`.

```bash
docker compose logs app migrate
docker compose down
```

`down` arrête les services sans supprimer le volume `postgres-data`. Le service
de test utilise au contraire un stockage temporaire `tmpfs`.

## Préparer une démo manuelle de cinq minutes

Le seed principal crée uniquement un administrateur, sans ticket, catégorie
ou technicien. Il normalise l'email, peut promouvoir/réactiver un compte de
même email et met à jour le mot de passe s'il diffère. Une modification
incrémente `sessionVersion` et invalide les anciennes sessions ; une seconde
exécution sans changement ne modifie pas le compte.

1. Se connecter avec l'administrateur et ouvrir **Catégories**.
2. Créer « Matériel », puis éventuellement « Réseau » et « Applications ».
3. Créer « Imprimante indisponible », catégorie Matériel, priorité HIGH.
4. Assigner le ticket à l'administrateur lui-même : un compte ADMIN actif est
   une cible valide, aucun technicien supplémentaire n'est nécessaire.
5. Cliquer **Commencer**, ajouter un commentaire de diagnostic, puis
   **Résoudre** et **Clôturer**.
6. Montrer l'historique, les filtres de la liste et les métriques du dashboard.

Pour montrer les trois rôles, utiliser le jeu E2E dans une base jetable plutôt
que le seed principal : le
[script de captures](screenshots.md#régénérer-les-captures) prépare ce jeu et
réalise déjà le parcours. Après son exécution, relancer un serveur sur cette
base exclusivement locale :

```bash
DATABASE_URL='postgresql://helpdesk:helpdesk@127.0.0.1:5433/it_helpdesk_test?sslmode=disable' \
  AUTH_SECRET='local-demo-only-secret-with-at-least-32-characters' \
  pnpm dev --port 3100
```

Ouvrir <http://localhost:3100/login>. Les emails sont
`e2e.admin@example.com`, `e2e.technician@example.com` et
`e2e.requester@example.com`, avec le mot de passe fictif défini dans
[e2e/fixtures.ts](../e2e/fixtures.ts). Le demandeur n'a aucun ticket dans le
jeu de captures : en créer un avec ce compte pour montrer sa visibilité
personnelle. L'administrateur peut consulter tous les tickets. Une nouvelle
exécution des tests ou captures réinitialise cette base.

## Déploiement conteneurisé

Le dépôt fournit les éléments de préparation au déploiement, sans prouver
qu'une instance publique est actuellement en ligne :

```bash
pnpm build
docker compose build app migrate
```

La cible `runner` du [Dockerfile](../Dockerfile) démarre `node server.js` et
écoute sur `PORT` (3000 par défaut). La cible `migrator` applique les migrations.
Sur une plateforme de conteneurs telle que Railway, la configuration attendue
est un service construit depuis ce Dockerfile et une base PostgreSQL managée :

1. Injecter `DATABASE_URL` fourni par la base, `AUTH_SECRET` et, si le proxy de
   la plateforme est de confiance, `AUTH_TRUST_HOST=true`.
2. Exécuter `pnpm db:migrate:deploy` en pré-déploiement ou dans un job dédié,
   avant d'envoyer du trafic vers l'application.
3. Configurer le healthcheck sur `/api/health`, le port fourni via `PORT` et
   un domaine avec HTTPS.
4. Exécuter `pnpm db:seed` dans un job ponctuel avec les variables `SEED_ADMIN_*`
   si un compte initial est nécessaire, puis retirer ces variables du service.
5. Vérifier connexion, création d'un ticket et santé de la base sur l'instance.

La CI construit l'image sans la publier ni la déployer. Les sauvegardes,
restaurations et procédures de rollback restent à organiser pour une
exploitation réelle. La base Compose utilise des identifiants locaux de démo.

## Dépannage

| Symptôme | Vérification |
| --- | --- |
| `AUTH_SECRET is required` | Renseigner le secret dans `.env`, même pour démarrer uniquement PostgreSQL via Compose |
| Connexion PostgreSQL refusée | `docker compose ps`, disponibilité du port 5432 et cohérence de `DATABASE_URL` |
| Client Prisma introuvable | Relancer `pnpm prisma generate` |
| Connexion administrateur refusée | Vérifier `SEED_ADMIN_*` puis relancer le seed ; email normalisé en minuscules |
| Aucune catégorie dans le formulaire | Créer une catégorie active en administrateur |
| Tests refusés au démarrage | Renseigner `TEST_DATABASE_URL` avec un nom contenant `test` |
| Port 3100 déjà utilisé | Arrêter le serveur de démo avant Playwright, qui lance son propre serveur |

Voir la [stratégie de tests](testing.md) pour les contrôles de qualité.
