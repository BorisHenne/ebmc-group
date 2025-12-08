# EBMC GROUP - Site Web & Plateforme de Recrutement

> **L'union européenne de l'expertise digitale**
> SAP Silver Partner | ICT | Cybersecurity | IA Generative

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## Table des matieres

- [Architecture](#architecture)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Developpement](#developpement)
- [Deploiement](#deploiement)
- [Structure du projet](#structure-du-projet)
- [Backoffice](#backoffice)

## Architecture

```
+-------------------------------------------------------------+
|                      Client (Browser)                        |
+-----------------------------+-------------------------------+
                              |
+-----------------------------v-------------------------------+
|                    Next.js 15 (App Router)                   |
|  +-------------+ +-------------+ +-------------+ +---------+ |
|  |  Frontend   | |   Admin     | |    API      | |  Auth   | |
|  |  (React 19) | |  Backoffice | |   Routes    | | (JWT)   | |
|  +-------------+ +-------------+ +-------------+ +---------+ |
+-----------------------------+-------------------------------+
                              |
          +-------------------+-------------------+
          v                                       v
+-------------------+                   +-------------------+
|     MongoDB       |                   |   Cloudflare      |
|     Database      |                   |     Tunnel        |
+-------------------+                   +-------------------+
```

## Prerequis

- **Node.js** >= 20.9.0
- **npm** >= 10.0
- **MongoDB** >= 7.0
- **Docker** (pour deploiement NAS)

## Installation

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/BorisHenne/ebmc-group.git
cd ebmc-group

# Installer les dependances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs

# Lancer le serveur de developpement
npm run dev
```

### Installation Docker

```bash
docker compose up -d --build
```

## Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb://localhost:27017/ebmc` |
| `JWT_SECRET` | Cle secrete pour JWT | `votre-secret-32-chars` |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | `https://ebmc-group.com` |
| `SMTP_HOST` | Serveur SMTP | `mail.infomaniak.com` |
| `SMTP_PORT` | Port SMTP | `465` |
| `SMTP_USER` | Utilisateur SMTP | `noreply@ebmc-group.com` |
| `SMTP_PASSWORD` | Mot de passe SMTP | `***` |

## Developpement

### Commandes disponibles

```bash
# Developpement (port 8889)
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linting
npm run lint
npm run lint:fix

# Verification TypeScript
npm run typecheck
```

### URLs locales

- **Frontend**: http://localhost:8889
- **Admin Panel**: http://localhost:8889/admin
- **API**: http://localhost:8889/api

## Deploiement

Le deploiement est automatise via GitHub Actions. Un push sur `main` declenche :

1. Build de l'application
2. Connexion SSH via Cloudflare Tunnel
3. Telechargement du code sur le NAS
4. Rebuild des containers Docker

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `SSH_PRIVATE_KEY` | Cle SSH privee pour connexion NAS |
| `SSH_USER` | Utilisateur SSH sur le NAS |
| `DEPLOY_PATH` | Chemin du projet sur le NAS |

## Structure du projet

```
ebmc-group/
├── src/
│   ├── app/
│   │   ├── (frontend)/         # Pages publiques
│   │   │   ├── page.tsx        # Page d'accueil
│   │   │   ├── careers/        # Pages carrieres
│   │   │   └── consultants/    # Page consultants
│   │   ├── admin/              # Backoffice admin
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── jobs/           # Gestion offres
│   │   │   ├── consultants/    # Gestion consultants
│   │   │   ├── messages/       # Messages contact
│   │   │   └── users/          # Gestion utilisateurs
│   │   ├── api/                # Routes API
│   │   │   ├── auth/           # Authentification
│   │   │   ├── admin/          # API admin (CRUD)
│   │   │   └── contact/        # Formulaire contact
│   │   └── login/              # Page connexion
│   ├── components/
│   │   ├── ui/                 # Composants UI (Aceternity)
│   │   ├── layout/             # Header, Footer
│   │   └── careers/            # Composants carrieres
│   ├── lib/
│   │   ├── mongodb.ts          # Connexion MongoDB
│   │   └── auth.ts             # Utilitaires auth
│   └── globals.css             # Styles globaux
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD GitHub Actions
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Backoffice

Le backoffice admin est accessible sur `/admin` apres connexion.

### Fonctionnalites

- **Dashboard** - Vue d'ensemble avec statistiques
- **Offres d'emploi** - CRUD complet, champs bilingues FR/EN
- **Consultants** - Gestion des profils, competences, disponibilites
- **Messages** - Messages du formulaire de contact
- **Utilisateurs** - Gestion des comptes admin

### Collections MongoDB

| Collection | Description |
|------------|-------------|
| `users` | Utilisateurs admin |
| `jobs` | Offres d'emploi |
| `consultants` | Profils consultants |
| `messages` | Messages contact |

---

**EBMC GROUP** - *L'union europeenne de l'expertise digitale*

Luxembourg (Siege) | Barcelone (Innovation)
