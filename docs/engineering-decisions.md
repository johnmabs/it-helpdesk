# Décisions d'ingénierie

[Retour au README](../README.md)

Ces décisions décrivent l'implémentation actuelle et ses compromis. Les pistes
d'évolution ne sont pas des garanties déjà livrées.

## 1. Un domaine indépendant de Prisma

Les entités expriment les invariants et les ports de repository décrivent ce
dont les cas d'utilisation ont besoin. Prisma intervient dans les adaptateurs
et mappers : `Ticket` n'importe aucun type généré par Prisma.

Ce choix permet de tester transitions et erreurs avec des repositories en
mémoire et de faire évoluer le stockage sans déplacer les règles métier.
Il impose en contrepartie des mappers et parfois une duplication des enums.
Les [tests d'intégration](../src/shared/tests/prisma-repositories.integration.test.ts)
vérifient que les adaptateurs restituent correctement les états métier.

Preuves : [Ticket](../src/modules/tickets/domain/ticket.ts),
[TicketRepository](../src/modules/tickets/domain/ticket-repository.ts),
[adaptateur Prisma](../src/modules/tickets/infrastructure/persistence/prisma-ticket-repository.ts).

## 2. Les lectures peuvent utiliser Prisma directement

Une liste ou un dashboard n'a pas besoin de reconstituer des agrégats pour
appliquer une mutation. Les read queries sélectionnent, joignent et agrègent
les données utiles, puis retournent des projections d'affichage.

Cette séparation entre commandes et lectures évite de gonfler les repositories
avec des méthodes propres à chaque écran. Elle couple cependant ces requêtes
à Prisma et au schéma. Il n'y a ni base de lecture séparée, ni synchronisation
asynchrone, ni infrastructure CQRS distribuée.

Le filtrage de visibilité doit rester présent dans les lectures :
[listTickets](../src/modules/tickets/application/list-tickets.ts) impose l'auteur
pour le rôle `USER`, même si un filtre de créateur différent est fourni.

## 3. Les permissions sont vérifiées côté serveur

Un client peut modifier les paramètres ou appeler une action sans utiliser les
boutons affichés. Chaque Server Action protégée récupère donc la session et
vérifie les permissions avant d'appeler le workflow. La création utilise l'ID
de la session ; le commentaire vérifie aussi la visibilité dans son cas
d'utilisation. Le détail refuse un ticket étranger avec une 404.

Le proxy protège l'entrée du dashboard, mais l'autorisation reste nécessaire
dans les pages et mutations. Les use cases de workflow supposent un appelant
autorisé : ajouter une nouvelle route exige de reprendre ces gardes.

Preuves : [permissions](../src/modules/auth/domain/permissions.ts),
[Server Actions](../src/app/dashboard/tickets/[id]/actions.ts),
[tests E2E de permissions](../e2e/tickets/permissions.spec.ts).

## 4. Argon2 pour les mots de passe

Un mot de passe doit être vérifiable sans être stocké en clair. Argon2 est un
algorithme de hachage de mots de passe avec coût en temps et en mémoire ; la
bibliothèque génère le sel et encode les paramètres dans le hash.
L'application utilise `argon2.hash` et `argon2.verify`, avec les paramètres
par défaut de la version installée, sans prétendre avoir effectué un calibrage
spécifique à une infrastructure de production.

Le port [PasswordHasher](../src/modules/auth/domain/password-hasher.ts) permet
de remplacer le service dans les tests ; l'implémentation réelle est
[ArgonPasswordHasher](../src/modules/auth/infrastructure/security/argon-password-hasher.ts).
Le coût implique une dépendance native et des ressources serveur. Un futur
déploiement doit mesurer ce coût et limiter les tentatives de connexion ; cette
limitation n'est pas encore implémentée.

## 5. Sessions JWT avec révocation vérifiée en base

Auth.js utilise Credentials et une session JWT avec expiration absolue après
huit heures. Le callback JWT vérifie que le compte est actif et que sa
`sessionVersion` correspond à celle du token. Le seed incrémente cette version
lorsqu'il modifie un administrateur existant.

Cela permet une révocation sans stocker une ligne par session, au prix d'une
lecture en base lors de la validation. Le rôle reste dans le token : un futur
outil de changement de rôle devra incrémenter `sessionVersion` pour invalider
les anciens droits. Modifier seulement le rôle en base ne suffit pas.

Preuve : [configuration Auth.js](../src/auth.ts). Le secret doit rester hors du
dépôt. `next-auth` est ici une version beta, ce qui constitue un risque de
maintenance à suivre lors des mises à jour.

## 6. Un monolithe modulaire

Le produit partage un workflow et une base transactionnelle. Un seul service
Next.js réduit les coûts de livraison, de diagnostic et d'exploitation. Les
modules gardent des responsabilités visibles et les dépendances passent par
des ports pour les mutations métier.

Ce choix signifie un déploiement et une montée en charge communs ; les modules
ne sont pas des services indépendants. Extraire un service ne se justifierait
qu'avec un besoin concret de charge, d'isolation ou d'équipe autonome.

## 7. Historique explicite et limites transactionnelles

Les cas d'utilisation écrivent un événement lisible après la sauvegarde de la
mutation. Cela fournit une chronologie utile sans event sourcing. L'état du
ticket reste la source courante de vérité.

Les deux écritures n'étant pas atomiques, une panne peut laisser une mutation
sans événement. Les repositories ne contrôlent pas non plus de version métier :
des mutations concurrentes peuvent s'écraser. La prochaine évolution est une
unité de travail transactionnelle accompagnée d'un contrôle optimiste et de
tests de panne/concurrence. L'historique contient le texte des commentaires ;
sa rétention devra être traitée si des données sensibles sont ajoutées.

## 8. Déploiement simple, durcissement progressif

Docker utilise une construction en plusieurs étapes, une sortie `standalone`
et un processus non privilégié. Les migrations s'exécutent avant le démarrage
et le healthcheck teste PostgreSQL. La CI construit l'image mais ne déploie pas
l'application et n'exécute pas de smoke test sur le conteneur produit.

Les en-têtes de sécurité sont centralisés dans
[next.config.ts](../next.config.ts). La CSP autorise encore `unsafe-inline`
pour les scripts/styles, et `unsafe-eval` uniquement en développement. Des
nonces, un suivi des erreurs, des sauvegardes vérifiées et des mesures de charge
restent des améliorations à planifier.
