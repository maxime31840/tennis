# Tennis Academy

Application web de gestion des formations tennis realisee avec `Node.js`, `Express`, `EJS`, `Sequelize` et `MySQL`.

Le projet permet de gerer :

- les utilisateurs
- les formateurs
- les formations
- les sessions
- les inscriptions
- les presences
- les avis

L'interface adapte l'acces aux donnees selon le role connecte : `admin`, `formateur` ou `apprenant`.

## Sommaire

- [Presentation](#presentation)
- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Acces a l'application](#acces-a-lapplication)
- [Roles et droits](#roles-et-droits)
- [Base de donnees](#base-de-donnees)
- [Routes principales](#routes-principales)
- [Structure du projet](#structure-du-projet)
- [Depannage](#depannage)
- [Pistes damelioration](#pistes-damelioration)

## Presentation

Ce projet a pour objectif de centraliser la gestion d'un centre de formation specialise dans le tennis. Il remplace une gestion dispersee par une application unique permettant de consulter, creer, modifier et supprimer les donnees metier.

Le back-office s'appuie sur des pages EJS rendues par Express ainsi que sur des routes API REST pour les principales entites.

## Fonctionnalites

- page d'accueil avec statistiques adaptees au role connecte
- page de connexion
- navigation conditionnelle selon le role
- affichage des tables metier avec pagination
- formulaires de creation, modification et suppression
- filtrage automatique des donnees visibles selon le profil
- gestion des relations entre utilisateurs, formateurs, formations, sessions, inscriptions, presences et avis
- gestion des erreurs cote serveur et reponses JSON pour les routes API

## Stack technique

- Backend : `Node.js`, `Express`
- Moteur de vues : `EJS`
- Base de donnees : `MySQL`
- ORM : `Sequelize`
- Middleware : `cookie-parser`, `morgan`
- Outils de dev : `nodemon`
- Frontend : `HTML`, `CSS`

## Architecture du projet

Le projet suit une organisation simple en couches :

- `app.js` : configuration Express et branchement des routes
- `config/` : connexion a la base de donnees
- `models/` : modeles Sequelize et associations
- `routes/` : routes web et API
- `middleware/` : authentification, chargement de l'utilisateur courant, filtrage des acces
- `views/` : pages EJS
- `public/` : feuilles de style et ressources statiques

## Prerequis

Avant de lancer le projet, verifier la presence de :

- `Node.js`
- `npm`
- `MySQL`

## Installation

1. Cloner le depot :

```bash
git clone (https://github.com/maxime31840/tennis)
cd tennis
```

2. Installer les dependances :

```bash
npm install
```

Si PowerShell bloque `npm.ps1`, utiliser :

```powershell
npm.cmd install
```

## Configuration

La connexion MySQL est definie dans `config/database.js`.

Variables d'environnement prises en charge :

- `DB_NAME` : nom de la base
- `DB_USER` : utilisateur MySQL
- `DB_PASSWORD` : mot de passe MySQL
- `DB_HOST` : hote MySQL
- `DB_PORT` : port MySQL
- `PORT` : port HTTP de l'application
- `DB_SYNC` : si la valeur est `true`, Sequelize tente de synchroniser les modeles avec la base

Valeurs par defaut :

- `DB_NAME=tennis`
- `DB_USER=root`
- `DB_PASSWORD=`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `PORT=3000`

Exemple PowerShell :

```powershell
$env:DB_NAME="tennis"
$env:DB_USER="root"
$env:DB_PASSWORD=""
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
```

## Lancement

Mode normal :

```bash
npm start
```

Mode developpement :

```bash
npm run dev
```

Si PowerShell bloque `npm`, utiliser :

```powershell
npm.cmd start
npm.cmd run dev
```

Par defaut, l'application demarre sur :

```text
http://localhost:3000
```

## Acces a l'application

- Accueil : `http://localhost:3000/`
- Connexion : `http://localhost:3000/login`

L'application utilise actuellement un cookie `auth_user_id` pour identifier l'utilisateur connecte.

Important :

- aucun compte de demonstration n'est fourni dans le depot
- les utilisateurs doivent exister dans la base de donnees
- la page `/login` verifie l'email et le mot de passe presents en base

## Roles et droits

### Admin

- acces complet aux pages de gestion
- acces aux routes API `/api/*`
- creation, modification et suppression sur toutes les entites

### Formateur

- acces limite a ses propres sessions
- acces a certaines tables visibles en lecture
- certaines operations sont limitees par le middleware et par les regles dans `routes/adminTables.js`

### Apprenant

- acces a ses inscriptions
- acces a ses presences
- acces a ses avis
- visibilite restreinte aux donnees qui le concernent

## Base de donnees

Le projet repose sur les tables principales suivantes :

### `users`

- `id`
- `nom`
- `prenom`
- `email`
- `password`
- `role` : `admin`, `formateur`, `apprenant`

### `formateurs`

- `id`
- `user_id`
- `specialite`

### `formations`

- `id`
- `titre`
- `description`

### `sessions`

- `id`
- `formation_id`
- `formateur_id`
- `date_debut`
- `date_fin`
- `lieu`

### `inscriptions`

- `id`
- `user_id`
- `session_id`
- `date_inscription`

Contrainte metier :

- unicite sur `user_id + session_id`

### `presences`

- `id`
- `inscription_id`
- `statut` : `present` ou `absent`
- `date`

Contrainte metier :

- unicite sur `inscription_id + date`

### `avis`

- `id`
- `user_id`
- `formation_id`
- `note`
- `commentaire`
- `date`

### Relations principales

- un `user` peut avoir un profil `formateur`
- une `formation` possede plusieurs `sessions`
- un `formateur` anime plusieurs `sessions`
- un `user` peut avoir plusieurs `inscriptions`
- une `session` peut avoir plusieurs `inscriptions`
- une `inscription` peut avoir plusieurs `presences`
- un `user` peut laisser plusieurs `avis`
- une `formation` peut recevoir plusieurs `avis`

## Routes principales

## Routes web

- `GET /` : page d'accueil
- `GET /login` : page de connexion
- `POST /login` : connexion
- `GET /logout` : deconnexion
- `GET /users`
- `GET /formateurs`
- `GET /formations`
- `GET /sessions`
- `GET /inscriptions`
- `GET /presences`
- `GET /avis`

Les pages de tables utilisent aussi des routes POST pour les operations de creation, modification et suppression.

## Routes API

Toutes les routes API sont branchees dans `app.js` sous `/api/*` et protegees par `requireAdmin`.

### Utilisateurs

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Formateurs

- `GET /api/formateurs`
- `GET /api/formateurs/:id`
- `POST /api/formateurs`
- `PUT /api/formateurs/:id`
- `DELETE /api/formateurs/:id`

### Formations

- `GET /api/formations`
- `GET /api/formations/:id`
- `POST /api/formations`
- `PUT /api/formations/:id`
- `DELETE /api/formations/:id`

### Sessions

- `GET /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions`
- `PUT /api/sessions/:id`
- `DELETE /api/sessions/:id`

### Inscriptions

- `GET /api/inscriptions`
- `GET /api/inscriptions/:id`
- `POST /api/inscriptions`
- `PUT /api/inscriptions/:id`
- `DELETE /api/inscriptions/:id`

### Presences

- `GET /api/presences`
- `GET /api/presences/:id`
- `POST /api/presences`
- `PUT /api/presences/:id`
- `DELETE /api/presences/:id`

### Avis

- `GET /api/avis`
- `GET /api/avis/:id`
- `POST /api/avis`
- `PUT /api/avis/:id`
- `DELETE /api/avis/:id`

## Structure du projet

```text
tennis/
|-- app.js
|-- bin/
|   `-- www
|-- config/
|   `-- database.js
|-- middleware/
|   `-- auth.js
|-- models/
|   |-- avis.js
|   |-- formateurs.js
|   |-- formations.js
|   |-- index.js
|   |-- inscriptions.js
|   |-- presences.js
|   |-- sessions.js
|   `-- users.js
|-- public/
|   `-- stylesheets/
|       `-- style.css
|-- routes/
|   |-- adminTables.js
|   |-- avis.js
|   |-- formateurs.js
|   |-- formations.js
|   |-- helpers.js
|   |-- index.js
|   |-- inscriptions.js
|   |-- presences.js
|   |-- sessions.js
|   `-- users.js
`-- views/
    |-- index.ejs
    |-- login.ejs
    |-- table.ejs
    `-- partials/
```

## Depannage

### 1. `npm` ne se lance pas dans PowerShell

Cause possible :

- execution policy PowerShell trop restrictive

Solution rapide :

```powershell
npm.cmd install
npm.cmd start
```

### 2. L'application ne demarre plus apres un `git pull`

Verifier :

- la presence de conflits Git non resolus (`<<<<<<<`, `=======`, `>>>>>>>`)
- les dependances avec `npm install`
- la configuration MySQL

Commande utile :

```bash
git status
```

### 3. Erreur de connexion MySQL

Verifier :

- que MySQL est demarre
- que la base `tennis` existe
- que l'utilisateur et le mot de passe sont corrects
- que `DB_HOST` et `DB_PORT` sont bons

### 4. Les pages s'affichent mais aucune donnee ne remonte

Verifier :

- que les tables existent
- que la base contient des donnees
- que le role de l'utilisateur correspond aux droits attendus

## Pistes damelioration

- mise en place d'un vrai hash de mot de passe avec `bcrypt`
- ajout de tests automatises
- ajout d'un script SQL de creation et de jeu de donnees
- ajout d'un fichier `.env.example`
- durcissement de la gestion de session et de l'authentification
- documentation Swagger ou OpenAPI pour les routes REST

## Auteur

Projet realise dans le cadre du BTS SIO SLAM.
