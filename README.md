# EBMC GROUP - Site Web & Plateforme de Recrutement

> **L'union européenne de l'expertise digitale**  
> SAP Silver Partner | ICT | Cybersécurité | IA Générative

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.0-blue)](https://payloadcms.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

# EBMC GROUP - Site Vitrine & Plateforme RH

> **L'union européenne de l'expertise digitale**
> Votre ESN de référence en Europe, née dans le SAP, enrichie par l'ICT, renforcée par la cybersécurité.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green)

## 📋 Table des matières

- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Structure du projet](#-structure-du-projet)

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Next.js 15 + Payload CMS 3.0                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   Frontend  │ │   Admin     │ │    API      │ │    Auth     ││
│  │   (React)   │ │   Panel     │ │  (REST/GQL) │ │  (Payload)  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   MongoDB     │      │   Make.com    │      │  Boondmanager │
│   Database    │      │   Webhooks    │      │     API       │
└───────────────┘      └───────────────┘      └───────────────┘
```

## 📋 Prérequis

- **Node.js** >= 20.9.0
- **pnpm** >= 8.0 (recommandé)
- **MongoDB** >= 7.0
- **Docker** (optionnel, pour déploiement UGOS)

## 🚀 Installation

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/BorisHenne/ebmc.git
cd ebmc

# Installer les dépendances
pnpm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer les types Payload
pnpm generate:types
pnpm generate:importmap

# Initialiser la base de données avec les données de démonstration
pnpm seed

# Lancer le serveur de développement
pnpm dev
```

### Installation Docker (UGOS NAS)

```bash
# Cloner et installer
./deploy.sh install

# Ou manuellement
docker compose up -d
```

## ⚙ Configuration

### Variables d'environnement principales

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb://localhost:27017/ebmc` |
| `PAYLOAD_SECRET` | Clé secrète Payload CMS | `votre-secret-32-chars` |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | `https://ebmc-group.com` |
| `SMTP_HOST` | Serveur SMTP | `mail.infomaniak.com` |
| `SMTP_PORT` | Port SMTP | `465` |
| `SMTP_USER` | Utilisateur SMTP | `noreply@ebmc-group.com` |
| `SMTP_PASSWORD` | Mot de passe SMTP | `***` |
| `CONTACT_EMAIL` | Email de contact | `contact@ebmcgroup.eu` |

## 💻 Développement

### Commandes disponibles

```bash
# Développement
pnpm dev          # Lance le serveur dev sur http://localhost:3000

# Build
pnpm build        # Build de production
pnpm start        # Lance le serveur de production

# Payload CMS
pnpm generate:types      # Génère les types TypeScript
pnpm generate:importmap  # Génère l'importmap
pnpm payload             # CLI Payload

# Base de données
pnpm seed         # Initialise la BDD avec données de démo

# Qualité
pnpm lint         # Vérification ESLint
```

### URLs

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API REST**: http://localhost:3000/api

### Identifiants admin (après seed)

- **Email**: `admin@ebmcgroup.eu`
- **Password**: `admin123!`

## 🚀 Déploiement

### Déploiement sur UGOS (Docker)

```bash
./deploy.sh install   # Installation complète
./deploy.sh update    # Mise à jour
./deploy.sh start     # Démarrer
./deploy.sh stop      # Arrêter
./deploy.sh logs      # Voir les logs
./deploy.sh backup    # Backup MongoDB
```

## 📁 Structure du projet

```
ebmc/
├── src/
│   ├── app/
│   │   ├── (frontend)/         # Routes frontend publiques
│   │   ├── (payload)/          # Admin Payload CMS
│   │   └── api/                # Routes API custom
│   ├── collections/            # Collections Payload
│   ├── globals/                # Globals Payload
│   ├── blocks/                 # Définitions des blocs
│   ├── components/             # Composants React
│   ├── access/                 # Contrôle d'accès
│   └── payload.config.ts       # Configuration Payload
├── docker-compose.yml
├── Dockerfile
├── deploy.sh
└── package.json
```

## 📦 Collections CMS

- **Users** - Utilisateurs avec rôles
- **Media** - Fichiers uploadés
- **Pages** - Pages dynamiques avec 11 types de blocs
- **Candidates** - Gestion des candidats
- **Offers** - Offres d'emploi
- **Applications** - Candidatures
- **Messages** - Messages contact

## 🔗 Intégrations

- **Make.com** - Webhooks automatiques
- **Boondmanager** - Synchronisation CRM
- **Nodemailer** - Emails SMTP Infomaniak

---

**EBMC GROUP** - *L'union européenne de l'expertise digitale*

🇱🇺 Luxembourg (Siège) | 🇪🇸 Barcelone (Innovation)
