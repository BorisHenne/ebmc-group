<p align="center">
  <img src="public/logo.svg" alt="EBMC GROUP" width="200" />
</p>

<h1 align="center">EBMC GROUP</h1>

<p align="center">
  <strong>IT Consulting & Digital Transformation</strong><br>
  <em>Conseil IT & Transformation Digitale</em>
</p>

<p align="center">
  <a href="#features--fonctionnalités">Features</a> •
  <a href="#tech-stack--stack-technique">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#usage--utilisation">Usage</a> •
  <a href="#api-reference">API</a> •
  <a href="#deployment--déploiement">Deployment</a> •
  <a href="#maintenance">Maintenance</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Tests-200+-green?style=flat-square" alt="Tests" />
</p>

---

## Overview | Vue d'ensemble

**EN:** EBMC GROUP is a modern corporate website for an IT consulting company. It features a beautiful glassmorphism design, a complete admin dashboard for content management, job listings connected to a database, consultant profiles, and a contact system with webhooks support.

**FR:** EBMC GROUP est un site web corporate moderne pour une société de conseil IT. Il propose un design glassmorphism élégant, un dashboard administrateur complet pour la gestion du contenu, des offres d'emploi connectées à une base de données, des profils consultants, et un système de contact avec support webhooks.

---

## Features | Fonctionnalités

### Public Website | Site Public

| EN | FR |
|---|---|
| Modern glassmorphism UI design | Design UI glassmorphism moderne |
| Responsive mobile-first layout | Layout responsive mobile-first |
| Mobile hamburger menu with animations | Menu hamburger mobile avec animations |
| Bilingual support (FR/EN) | Support bilingue (FR/EN) |
| Dynamic job listings from database | Offres d'emploi dynamiques depuis la BDD |
| Consultant profiles with availability status | Profils consultants avec statut disponibilité |
| Contact form with email notifications | Formulaire de contact avec notifications email |
| SEO optimized | Optimisé SEO |
| Animated backgrounds with Framer Motion | Fonds animés avec Framer Motion |

### Admin Dashboard | Dashboard Admin

| EN | FR |
|---|---|
| Secure JWT authentication | Authentification JWT sécurisée |
| BoondManager SSO authentication | Authentification SSO BoondManager |
| **Role-based access control (5 roles)** | **Contrôle d'accès par rôles (5 rôles)** |
| Job postings management (CRUD) | Gestion des offres d'emploi (CRUD) |
| Consultant profiles management | Gestion des profils consultants |
| **Commercial assignment for jobs/consultants** | **Affectation commerciaux aux offres/consultants** |
| Messages/applications inbox | Boîte de réception messages/candidatures |
| User management with roles | Gestion utilisateurs avec rôles |
| API tokens management | Gestion des tokens API |
| Webhooks configuration (Make, BoondManager) | Configuration webhooks (Make, BoondManager) |
| Statistics dashboard | Dashboard statistiques |
| API documentation | Documentation API |
| **Dark mode toggle** | **Basculement mode sombre** |

### BoondManager Integration | Intégration BoondManager

| EN | FR |
|---|---|
| BoondManager SSO login | Connexion SSO BoondManager |
| **Dual environment support (Production read-only / Sandbox full CRUD)** | **Support double environnement (Production lecture seule / Sandbox CRUD complet)** |
| Candidates management (CRUD) | Gestion des candidats (CRUD) |
| Resources/Consultants management (CRUD) | Gestion des ressources/consultants (CRUD) |
| **CV/Resume viewing with PDF preview** | **Visualisation CV avec apercu PDF** |
| Opportunities management (CRUD) | Gestion des opportunites (CRUD) |
| Companies management | Gestion des societes |
| Projects management | Gestion des projets |
| **Dictionary API (states, types, activity areas)** | **API Dictionnaire (etats, types, secteurs d'activite)** |
| Real-time sync with BoondManager API | Synchronisation temps reel avec API BoondManager |
| **Feature flags for API permissions (403 handling)** | **Feature flags pour permissions API (gestion 403)** |
| State management (recruitment pipeline) | Gestion des etats (pipeline recrutement) |
| **Data quality analysis and duplicate detection** | **Analyse qualite donnees et detection doublons** |
| **Export to JSON/CSV** | **Export JSON/CSV** |

### Freelance Portal | Portail Freelance

| EN | FR |
|---|---|
| Dedicated freelance dashboard | Dashboard dédié freelance |
| Timesheet management (CRA) | Gestion des CRA |
| Monthly hours entry with calendar | Saisie heures par mois avec calendrier |
| Absence requests (vacation, RTT, sick leave) | Demandes d'absences (congés, RTT, maladie) |
| Balance tracking (used/pending/remaining) | Suivi des soldes (utilisés/en attente/restants) |
| Submit timesheets for validation | Soumission CRA pour validation |

---

## Tech Stack | Stack Technique

```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript 5.6
├── Tailwind CSS 3.4
├── Framer Motion 11
├── Aceternity UI Components
└── next-intl (i18n)

Backend:
├── Next.js API Routes
├── MongoDB 7
├── JWT Authentication
└── bcrypt (password hashing)

Testing:
├── Vitest
├── React Testing Library
└── 200+ unit tests (81 for BoondManager API)

Deployment:
├── Docker & Docker Compose
├── GitHub Actions CI/CD
└── Self-hosted NAS
```

---

## Installation

### Prerequisites | Prérequis

- Node.js 18+ (recommended: 20.9.0+)
- MongoDB 7+
- npm or yarn
- Docker (optional, for deployment)

### Local Development | Développement Local

```bash
# Clone the repository | Cloner le dépôt
git clone https://github.com/BorisHenne/ebmc-group.git
cd ebmc-group

# Install dependencies | Installer les dépendances
npm install

# Copy environment file | Copier le fichier d'environnement
cp .env.example .env.local

# Start MongoDB (if using Docker) | Démarrer MongoDB (si Docker)
docker run -d -p 27017:27017 --name ebmc-mongo mongo:7

# Start development server | Démarrer le serveur de dev
npm run dev

# Seed the database with initial data | Initialiser la BDD avec les données
curl -X POST http://localhost:8889/api/seed \
  -H "Authorization: Bearer ebmc-seed-key-2024"
```

> **Note:** The app runs on **port 8889** (not 3000).
> L'app tourne sur le **port 8889** (pas 3000).

---

## Configuration

### Environment Variables | Variables d'Environnement

Create `.env.local` with:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ebmc

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your-super-secret-key-here

# Seed Key (for database initialization)
SEED_KEY=ebmc-seed-key-2024

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:8889

# Optional: Email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@ebmc-group.com
SMTP_PASS=your-smtp-password
```

---

## Usage | Utilisation

### NPM Scripts | Commandes NPM

```bash
# Development | Développement
npm run dev          # Start dev server on port 8889

# Build | Build
npm run build        # Build for production
npm start            # Start production server

# Testing | Tests
npm test             # Run all 131+ tests
npm run test:watch   # Watch mode

# Linting | Linting
npm run lint         # Check linting
npm run lint:fix     # Auto-fix lint issues
```

### URLs

| URL | Description EN | Description FR |
|-----|----------------|----------------|
| `http://localhost:8889` | Homepage | Page d'accueil |
| `http://localhost:8889/careers` | Job listings | Offres d'emploi |
| `http://localhost:8889/consultants` | Consultant profiles | Profils consultants |
| `http://localhost:8889/login` | Admin login | Connexion admin |
| `http://localhost:8889/admin` | Admin dashboard | Dashboard admin |
| `http://localhost:8889/admin/boondmanager-v2` | BoondManager Data Hub (Production/Sandbox) | Hub donnees BoondManager (Production/Sandbox) |
| `http://localhost:8889/admin/recrutement` | Recruitment kanban | Kanban recrutement |
| `http://localhost:8889/admin/freelance` | Freelance portal | Portail freelance |
| `http://localhost:8889/admin/docs` | Documentation | Documentation |

### Admin Access | Accès Admin

**Standard Login | Connexion Standard:**
1. Navigate to `/login`
2. First-time setup: Use the init endpoint
   ```bash
   curl -X POST http://localhost:8889/api/auth/init
   ```
3. Login with created credentials
4. **Important:** Change password immediately after first login!

**BoondManager Login | Connexion BoondManager:**
1. Navigate to `/login` and select "BoondManager" tab
2. Enter your BoondManager subdomain (e.g., `your-company`)
3. Login with your BoondManager email and password
4. **Note:** Enable REST API in your BoondManager profile settings (Profile > Configuration > Security > "Allow REST API calls from BasicAuth")

### Role System | Système de Rôles

The system uses two main role categories:

**🏢 Bureau (Internal Staff) | Équipe Interne:**

| Role | Access EN | Accès FR |
|------|-----------|----------|
| **admin** | Full access to all features | Accès complet à toutes les fonctionnalités |
| **commercial** | Jobs, consultants, commercial dashboard | Offres, consultants, dashboard commercial |
| **sourceur** | Recruitment, candidates, scraper, sourcing dashboard | Recrutement, candidats, scraper, dashboard sourcing |
| **rh** | Users, contracts, HR dashboard | Utilisateurs, contrats, dashboard RH |

**👷 Terrain (Consultants & Candidates) | Consultants et Candidats:**

| Role | Access EN | Accès FR |
|------|-----------|----------|
| **consultant_cdi** | Consultant portal (timesheets, absences) | Portail consultant (CRA, absences) |
| **freelance** | Freelance portal (timesheets, absences) | Portail freelance (CRA, absences) |
| **candidat** | Minimal access (pending recruitment) | Accès minimal (en cours de recrutement) |

**Candidate → Consultant Flow | Flux Candidat → Consultant:**

```
Candidat → (recruitment process) → Consultant CDI or Freelance
           a_qualifier → qualifie → en_cours → entretien → proposition → embauche
```

When a candidate is hired (status = `embauche`), they become a consultant with:
- `contractType`: `cdi` or `freelance`
- `hireDate`: Date of hiring
- User account with appropriate role (`consultant_cdi` or `freelance`)

### Demo Users | Utilisateurs Démo

After seeding the database, these demo accounts are available:

**Bureau (Internal):**
| Email | Password | Role |
|-------|----------|------|
| `admin@ebmc-group.com` | `admin123` | Admin |
| `sourceur@ebmc-group.com` | `sourceur123` | Sourceur |
| `commercial@ebmc-group.com` | `commercial123` | Commercial |
| `rh@ebmc-group.com` | `rh123` | RH |

**Terrain (Consultants):**
| Email | Password | Role |
|-------|----------|------|
| `consultant@ebmc-group.com` | `consultant123` | Consultant CDI |
| `freelance@ebmc-group.com` | `freelance123` | Freelance |

> **Note:** Change passwords after first login in production!

---

## API Reference

### Public Endpoints | Endpoints Publics

| Method | Endpoint | Description EN | Description FR |
|--------|----------|----------------|----------------|
| GET | `/api/jobs` | List active jobs | Liste des offres actives |
| GET | `/api/jobs/[id]` | Get job details | Détails d'une offre |
| GET | `/api/consultants` | List all consultants | Liste des consultants |
| GET | `/api/consultants?available=true` | Available consultants only | Consultants disponibles |
| POST | `/api/contact` | Submit contact form | Envoyer formulaire contact |
| GET | `/api/health` | Health check | Vérification santé |
| GET | `/api/seed` | Check database status | Vérifier état BDD |
| POST | `/api/seed` | Seed database (auth required) | Initialiser BDD (auth requise) |

### Admin Endpoints (Protected) | Endpoints Admin (Protégés)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/init` | Create first admin |
| POST | `/api/auth/boondmanager` | BoondManager SSO login |
| GET/POST | `/api/admin/jobs` | List/Create jobs |
| PUT/DELETE | `/api/admin/jobs/[id]` | Update/Delete job |
| GET/POST | `/api/admin/consultants` | List/Create consultants |
| PUT/DELETE | `/api/admin/consultants/[id]` | Update/Delete consultant |
| GET/POST | `/api/admin/users` | List/Create users |
| PUT/DELETE | `/api/admin/users/[id]` | Update/Delete user |
| GET | `/api/admin/messages` | List messages |
| DELETE | `/api/admin/messages/[id]` | Delete message |
| GET/POST | `/api/admin/webhooks` | List/Create webhooks |
| GET/POST | `/api/admin/api-tokens` | List/Create API tokens |
| GET/POST | `/api/admin/roles` | List/Create roles |
| GET | `/api/admin/stats` | Dashboard statistics |

### BoondManager API v2 Endpoints (Protected) | Endpoints BoondManager API v2 (Proteges)

> **Note:** All v2 endpoints support `?env=production` (read-only) or `?env=sandbox` (full CRUD)

| Method | Endpoint | Description EN | Description FR |
|--------|----------|----------------|----------------|
| GET | `/api/boondmanager/v2?type=stats` | Dashboard stats with real totals | Statistiques dashboard avec totaux reels |
| GET | `/api/boondmanager/v2/dictionary` | Get application dictionary | Recuperer le dictionnaire |
| GET | `/api/boondmanager/v2/candidates` | List/Search candidates | Lister/Chercher candidats |
| GET | `/api/boondmanager/v2/candidates/[id]` | Get candidate details | Details candidat |
| GET | `/api/boondmanager/v2/candidates/[id]/resumes` | Get candidate CVs/documents | CVs/documents du candidat |
| POST | `/api/boondmanager/v2/candidates` | Create candidate (sandbox) | Creer candidat (sandbox) |
| PATCH | `/api/boondmanager/v2/candidates` | Update candidate (sandbox) | Modifier candidat (sandbox) |
| DELETE | `/api/boondmanager/v2/candidates?id=X` | Delete candidate (sandbox) | Supprimer candidat (sandbox) |
| GET | `/api/boondmanager/v2/resources` | List/Search resources | Lister/Chercher ressources |
| GET | `/api/boondmanager/v2/resources/[id]/resumes` | Get resource CVs/documents | CVs/documents de la ressource |
| POST | `/api/boondmanager/v2/resources` | Create resource (sandbox) | Creer ressource (sandbox) |
| PATCH | `/api/boondmanager/v2/resources` | Update resource (sandbox) | Modifier ressource (sandbox) |
| DELETE | `/api/boondmanager/v2/resources?id=X` | Delete resource (sandbox) | Supprimer ressource (sandbox) |
| GET | `/api/boondmanager/v2/opportunities` | List opportunities | Lister opportunites |
| GET | `/api/boondmanager/v2/companies` | List companies | Lister societes |
| GET | `/api/boondmanager/v2/companies/[id]` | Get company details with contacts | Details societe avec contacts |
| GET | `/api/boondmanager/v2/projects` | List projects | Lister projets |
| GET | `/api/boondmanager/v2/projects/[id]` | Get project details | Details projet |
| GET | `/api/boondmanager/v2/documents/[id]` | Download document (PDF viewer) | Telecharger document (visionneuse PDF) |
| POST | `/api/boondmanager/v2/sync` | Sync Production to Sandbox | Synchroniser Production vers Sandbox |
| GET | `/api/boondmanager/v2/quality` | Data quality analysis | Analyse qualite des donnees |
| GET | `/api/boondmanager/v2/export` | Export data (JSON/CSV) | Exporter donnees (JSON/CSV) |

### Freelance Endpoints (Protected) | Endpoints Freelance (Protégés)

| Method | Endpoint | Description EN | Description FR |
|--------|----------|----------------|----------------|
| GET | `/api/freelance/timesheets?month=YYYY-MM` | Get timesheet for month | Récupérer CRA du mois |
| POST | `/api/freelance/timesheets` | Save timesheet | Enregistrer CRA |
| GET | `/api/freelance/timesheets/summary` | Get summary stats | Récupérer statistiques |
| POST | `/api/freelance/timesheets/submit` | Submit for validation | Soumettre pour validation |
| GET | `/api/freelance/absences` | List absences | Liste des absences |
| POST | `/api/freelance/absences` | Create absence request | Créer demande d'absence |
| DELETE | `/api/freelance/absences/[id]` | Cancel pending absence | Annuler absence en attente |

---

## Project Structure | Structure du Projet

```
ebmc-group/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage | Accueil
│   │   ├── careers/              # Job listings
│   │   │   ├── page.tsx          # Jobs list
│   │   │   └── [id]/page.tsx     # Job detail
│   │   ├── consultants/          # Consultant profiles
│   │   ├── login/                # Login page
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── jobs/             # Jobs management
│   │   │   ├── consultants/      # Consultants management
│   │   │   ├── messages/         # Messages inbox
│   │   │   ├── users/            # User management
│   │   │   ├── webhooks/         # Webhook config
│   │   │   ├── api-tokens/       # API tokens
│   │   │   ├── roles/            # Role management
│   │   │   └── docs/             # API documentation
│   │   └── api/
│   │       ├── auth/             # Authentication routes
│   │       │   ├── login/        # Standard JWT auth
│   │       │   ├── boondmanager/ # BoondManager SSO
│   │       │   └── ...           # logout, me, init
│   │       ├── admin/            # Admin CRUD routes
│   │       ├── jobs/             # Public jobs API
│   │       ├── consultants/      # Public consultants API
│   │       ├── contact/          # Contact form
│   │       ├── health/           # Health check
│   │       └── seed/             # Database seeding
│   ├── components/
│   │   ├── layout/               # Header, Footer, Navigation
│   │   └── ui/                   # Reusable UI components
│   │       ├── aceternity.tsx    # Aceternity UI (TextGradient, ShimmerButton...)
│   │       └── TechBackground.tsx # Animated backgrounds
│   ├── lib/
│   │   ├── auth.ts               # JWT authentication utilities
│   │   ├── mongodb.ts            # MongoDB connection
│   │   └── utils.ts              # Helper functions
│   ├── messages/                 # i18n translations
│   │   ├── fr.json               # French
│   │   └── en.json               # English
│   └── __tests__/                # Unit tests (62+)
│       ├── api.test.ts           # API tests
│       ├── auth.test.ts          # Auth tests
│       ├── components.test.tsx   # Component tests
│       └── utils.test.ts         # Utility tests
├── public/
│   └── logo.svg                  # Company logo
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD GitHub Actions
├── docker-compose.yml
├── Dockerfile
├── vitest.config.ts              # Test configuration
└── package.json
```

---

## Deployment | Déploiement

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    container_name: ebmc-app
    ports:
      - "8889:8889"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/ebmc
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    container_name: ebmc-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

### GitHub Actions CI/CD

Push to `main` triggers automatic deployment:
1. Builds Docker image
2. Connects to NAS via SSH (Cloudflare Tunnel)
3. Pulls latest code and rebuilds containers

Required GitHub Secrets:
- `SSH_PRIVATE_KEY`: SSH key for NAS access
- `SSH_USER`: SSH username
- `DEPLOY_PATH`: Deployment path on NAS

---

## Maintenance

### Database Backup | Sauvegarde BDD

```bash
# Create backup | Créer sauvegarde
docker exec ebmc-mongo mongodump --out /backup/$(date +%Y%m%d)

# Restore backup | Restaurer sauvegarde
docker exec ebmc-mongo mongorestore /backup/20241209
```

### Logs | Journaux

```bash
# App logs | Logs application
docker logs ebmc-app -f --tail 100

# MongoDB logs | Logs MongoDB
docker logs ebmc-mongo -f --tail 50
```

### Update | Mise à jour

```bash
# Pull latest code | Récupérer le code
git pull origin main

# Rebuild containers | Reconstruire les conteneurs
docker-compose down
docker-compose up -d --build

# Verify health | Vérifier la santé
curl http://localhost:8889/api/health
```

### Seed Database | Initialiser la BDD

```bash
# Check if seeding is needed | Vérifier si init nécessaire
curl http://localhost:8889/api/seed

# Seed with default data | Initialiser avec données par défaut
curl -X POST http://localhost:8889/api/seed \
  -H "Authorization: Bearer your-seed-key"
```

### Troubleshooting | Dépannage

| Issue EN | Issue FR | Solution |
|----------|----------|----------|
| Container name conflict | Conflit nom conteneur | `docker stop ebmc-app ebmc-mongo && docker rm ebmc-app ebmc-mongo` |
| MongoDB connection failed | Connexion MongoDB échouée | Verify `MONGODB_URI` environment variable |
| JWT errors | Erreurs JWT | Regenerate `JWT_SECRET` with `openssl rand -hex 32` |
| Build fails | Build échoue | Delete `.next/` folder and rebuild |
| Port already in use | Port déjà utilisé | `lsof -i :8889` then kill the process |

---

## Testing | Tests

```bash
# Run all tests | Lancer tous les tests
npm test

# Run with UI | Avec interface
npm run test:ui

# Run specific file | Fichier spécifique
npm test src/__tests__/api.test.ts

# Watch mode | Mode watch
npm run test:watch
```

### Test Coverage | Couverture

**200+ unit tests** covering:
- API routes validation (jobs, consultants, auth, webhooks, tokens)
- Authentication logic (JWT, passwords, roles, BoondManager SSO)
- **Role-based access control (7 roles in 2 categories: Bureau/Terrain)**
- **Role permissions and category helpers**
- **Candidate/Consultant type system and transitions**
- **Job families and dynamic skills by category**
- **Freelance portal API (timesheets, absences)**
- **Assignment system (commercial to jobs/consultants)**
- **BoondManager API v2 (81 tests)**:
  - Dual environment (Production/Sandbox)
  - Feature flags and 403 error handling
  - CV/Document download and viewing
  - Dictionary API
  - Data normalization and quality analysis
  - Export functions (JSON/CSV)
- Component rendering (UI components, forms)
- Mobile navigation and responsive design
- Utility functions (validation, formatting)
- Data transformations (MongoDB to frontend)

---

## MongoDB Collections

| Collection | Description EN | Description FR |
|------------|----------------|----------------|
| `users` | Admin users | Utilisateurs admin |
| `jobs` | Job postings | Offres d'emploi |
| `consultants` | Consultant profiles | Profils consultants |
| `messages` | Contact messages | Messages contact |
| `webhooks` | Webhook configurations | Configurations webhooks |
| `api-tokens` | API access tokens | Tokens d'accès API |
| `roles` | User roles | Rôles utilisateurs |
| `timesheets` | Freelance timesheets (CRA) | CRA freelances |
| `absences` | Freelance absence requests | Demandes d'absences freelances |

---

## Contributing | Contribuer

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## License | Licence

This project is proprietary software. All rights reserved.
Ce projet est un logiciel propriétaire. Tous droits réservés.

---

<p align="center">
  <strong>EBMC GROUP</strong><br>
  <em>L'union européenne de l'expertise digitale</em><br>
  <em>The European union of digital expertise</em><br><br>
  SAP Silver Partner | ICT | Cybersecurity | Generative AI<br>
  Luxembourg (HQ) | Barcelona (Innovation)
</p>
