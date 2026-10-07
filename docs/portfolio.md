# Présentation portfolio

[Retour au README](../README.md)

## Pitch de trente secondes

« IT Helpdesk centralise les demandes de support informatique. J'ai structuré
le projet en modules métier, avec un cycle de vie de ticket explicite, des
permissions côté serveur et un historique des actions. Le domaine est testé
sans base de données, les adaptateurs sont vérifiés sur PostgreSQL et les
parcours utilisateur avec Playwright. Le projet dispose aussi de migrations,
d'une image Docker et d'une CI. »

Adapter ce texte aux contributions que l'on peut personnellement expliquer.
Le dépôt montre une implémentation ; il ne fournit pas de mesures d'impact
client, de charge en production ou de résultats utilisateurs.

## Fil conducteur pour un entretien de sept minutes

| Durée | Sujet | Démonstration ou preuve |
| --- | --- | --- |
| 0:00–0:45 | Problème : demandes dispersées et absence de traçabilité | Connexion et vue d'ensemble du [README](../README.md) |
| 0:45–1:45 | Architecture : frontières métier et dépendances | [Diagramme](architecture.md), un cas d'utilisation et son repository |
| 1:45–3:00 | Règles métier : pas de résolution sans traitement préalable | Création puis assignation → démarrage → résolution → clôture ; [machine d'états](ticket-lifecycle.md) |
| 3:00–4:00 | Sécurité : rôle, identité et visibilité | Session demandeur puis admin, garde d'une Server Action, Argon2 et révocation |
| 4:00–5:00 | Trade-offs : simplicité et garanties manquantes | [Décisions](engineering-decisions.md), lectures Prisma, atomicité et concurrence |
| 5:00–6:00 | Tests : garanties complémentaires | Test de transition, test PostgreSQL, parcours E2E et [CI](testing.md) |
| 6:00–7:00 | Déploiement et prochaine évolution | [Dockerfile](../Dockerfile), migrations, healthcheck et plan transactionnel |

Préparer le serveur et les comptes avec le [guide de démonstration](local-setup.md).
La [galerie](screenshots.md) fournit une alternative visuelle si la démo locale
n'est pas disponible pendant l'entretien.

## Questions techniques à préparer

**Pourquoi ne pas mettre les règles dans Prisma ou dans les pages ?**
Les transitions doivent rester explicites et testables indépendamment du rendu
et de la base. `Ticket.resolve` refuse un état différent de `IN_PROGRESS` ; le
cas d'utilisation orchestre la sauvegarde et l'événement, la Server Action
autorise l'appel.

**Pourquoi les lectures contournent-elles les repositories métier ?**
Une projection de dashboard n'a pas besoin d'une entité mutable. Une requête
Prisma directe évite des interfaces destinées à un seul écran. En contrepartie,
ces lectures dépendent du schéma et doivent imposer les filtres de visibilité.

**Comment empêcher un demandeur de modifier le ticket d'un autre ?**
Le filtre de liste est imposé côté serveur, le détail vérifie `canViewTicket`
et les actions de workflow exigent `TECHNICIAN` ou `ADMIN`. L'auteur d'un
commentaire vient de la session. Montrer les tests d'appels directs et d'accès
à une URL étrangère, pas seulement les boutons masqués.

**Pourquoi Argon2 et comment révoquer une session JWT ?**
Argon2 permet une vérification sans mot de passe en clair et ajoute un coût
en temps/mémoire. Le callback de session vérifie activité et `sessionVersion`
en base, avec une durée absolue de huit heures. Un changement de rôle devra
aussi révoquer les sessions existantes ; la limitation des tentatives est une
amélioration prévue.

**Que se passe-t-il si l'écriture de l'historique échoue ?**
Aujourd'hui, la mutation peut être sauvegardée sans événement, car les deux
écritures sont séparées. Proposer une transaction commune via une unité de
travail, puis tester le rollback sur panne. Pour deux mutations concurrentes,
ajouter une version métier et rejeter une sauvegarde fondée sur un état périmé.

**Pourquoi un monolithe et quels seraient les critères d'extraction ?**
Un service et une base suffisent au produit actuel. Une extraction demanderait
un besoin mesuré de montée en charge, d'isolation ou d'autonomie d'équipe et
introduirait des coûts de coordination, de réseau et de cohérence.

**Le projet est-il prêt pour une exploitation réelle ?**
Il possède des éléments de livraison : image non privilégiée, migrations,
healthcheck et CI. Il reste à vérifier le conteneur en fonctionnement, organiser
sauvegardes/restaurations, observabilité et durcissement de l'authentification.
Ne pas présenter une URL publique ou un niveau de disponibilité sans preuve.

## Texte court pour une fiche projet

> Application de support IT en Next.js, TypeScript et PostgreSQL. Monolithe
> modulaire avec règles de cycle de vie, contrôle des accès par rôle,
> commentaires et historique. Validation par tests unitaires, intégration
> Prisma/PostgreSQL et E2E Playwright ; livraison préparée avec Docker et CI.

Associer ce texte au [dépôt](https://github.com/johnmabs/it-helpdesk), au
[dashboard](screenshots/dashboard.png) et au diagramme d'architecture.
Ajouter une URL de démonstration seulement lorsqu'elle a été déployée et vérifiée.

## Parcours conseillé pour le lecteur du dépôt

1. Lire le README pour comprendre le produit, les rôles et la stack.
2. Regarder la galerie et le diagramme pour relier interface et structure.
3. Lire le cycle de vie pour comprendre les invariants.
4. Examiner les décisions et la stratégie de tests pour évaluer les compromis.
5. Lancer le projet et reproduire le parcours avec le guide local.

Les limites connues sont regroupées dans la roadmap du README et expliquées
dans les décisions ; elles servent de point de départ à une discussion technique.
