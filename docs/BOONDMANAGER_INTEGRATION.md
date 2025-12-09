# Integration BoondManager - Documentation Technique

## Vue d'ensemble

Cette integration permet de piloter l'API BoondManager avec support de deux environnements:
- **Production (LMGC)**: Lecture seule (GET)
- **Sandbox (LMGC - SANDBOX)**: CRUD complet (GET, POST, PUT, DELETE)

## Architecture

```
src/
├── lib/
│   ├── boondmanager-client.ts   # Client API BoondManager
│   └── boondmanager-sync.ts     # Service de synchronisation et nettoyage
├── app/
│   ├── admin/
│   │   └── boondmanager-v2/     # Interface admin Data Hub
│   └── api/boondmanager/v2/     # Routes API
│       ├── route.ts             # Dashboard stats
│       ├── sync/route.ts        # Synchronisation Prod → Sandbox
│       ├── quality/route.ts     # Analyse qualite donnees
│       ├── export/route.ts      # Export JSON/CSV
│       ├── candidates/          # CRUD Candidats
│       ├── resources/           # CRUD Ressources
│       ├── opportunities/       # CRUD Opportunites
│       ├── companies/           # CRUD Societes
│       ├── contacts/            # CRUD Contacts
│       └── projects/            # GET Projets
└── __tests__/
    └── boondmanager.test.ts     # Tests unitaires
```

## Configuration

### Credentials (dans `boondmanager-client.ts`)

```typescript
BOOND_CREDENTIALS = {
  production: {
    username: 'b.henne@ebmc.eu',
    userToken: '3232322e65626d63',
    clientToken: '65626d63',
    clientKey: '988a5c655f628794b290',
  },
  sandbox: {
    username: 'b.henne@ebmc.eu',
    userToken: '322e65626d635f73616e64626f78',
    clientToken: '65626d635f73616e64626f78',
    clientKey: '76466d84db825e33c801',
  },
}

BOOND_BASE_URL = 'https://ui.boondmanager.com/api'
```

### Permission requise

L'acces au Data Hub necessite la permission `boondManagerAdmin` dans `src/lib/roles.ts`.

## Client API

### Initialisation

```typescript
import { createBoondClient } from '@/lib/boondmanager-client'

// Client sandbox (ecriture autorisee)
const sandboxClient = createBoondClient('sandbox')

// Client production (lecture seule)
const prodClient = createBoondClient('production')
```

### Methodes disponibles

#### Candidats
- `getCandidates(params?)` - Liste paginee
- `getCandidate(id)` - Detail
- `searchCandidates(query)` - Recherche
- `createCandidate(data)` - Creation (sandbox uniquement)
- `updateCandidate(id, data)` - Modification (sandbox uniquement)
- `deleteCandidate(id)` - Suppression (sandbox uniquement)

#### Ressources (Consultants)
- `getResources(params?)` - Liste paginee
- `getResource(id)` - Detail
- `searchResources(query)` - Recherche
- `createResource(data)` - Creation (sandbox uniquement)
- `updateResource(id, data)` - Modification (sandbox uniquement)
- `deleteResource(id)` - Suppression (sandbox uniquement)

#### Opportunites (Offres/Jobs)
- `getOpportunities(params?)` - Liste paginee
- `getOpportunity(id)` - Detail
- `searchOpportunities(query)` - Recherche
- `createOpportunity(data)` - Creation (sandbox uniquement)
- `updateOpportunity(id, data)` - Modification (sandbox uniquement)
- `deleteOpportunity(id)` - Suppression (sandbox uniquement)

#### Societes
- `getCompanies(params?)` - Liste paginee
- `getCompany(id)` - Detail
- `getCompanyContacts(id)` - Contacts d'une societe
- `searchCompanies(query)` - Recherche
- `createCompany(data)` - Creation (sandbox uniquement)
- `updateCompany(id, data)` - Modification (sandbox uniquement)
- `deleteCompany(id)` - Suppression (sandbox uniquement)

#### Contacts
- `getContacts(params?)` - Liste paginee
- `getContact(id)` - Detail
- `searchContacts(query)` - Recherche
- `createContact(data)` - Creation (sandbox uniquement)
- `updateContact(id, data)` - Modification (sandbox uniquement)
- `deleteContact(id)` - Suppression (sandbox uniquement)

#### Projets
- `getProjects(params?)` - Liste paginee
- `getProject(id)` - Detail
- `searchProjects(query)` - Recherche

#### Actions
- `getActions(params?)` - Liste paginee
- `getAction(id)` - Detail
- `createAction(data)` - Creation (sandbox uniquement)

#### Dashboard
- `getDashboardStats()` - Statistiques globales par entite et etat

## Service de Synchronisation

### Initialisation

```typescript
import { getBoondSyncService } from '@/lib/boondmanager-sync'

const syncService = getBoondSyncService()
```

### Fonctionnalites

#### Synchronisation Prod → Sandbox

```typescript
const result = await syncService.syncProdToSandbox()
// {
//   startedAt, completedAt,
//   entities: { candidates: {...}, resources: {...}, ... },
//   totalRecords, successRecords, failedRecords
// }
```

#### Analyse qualite des donnees

```typescript
const analysis = await syncService.analyzeAllDataQuality('sandbox')
// {
//   issues: DataQualityIssue[],
//   duplicates: DuplicateGroup[],
//   summary: { totalIssues, errors, warnings, info, duplicateGroups }
// }
```

#### Nettoyage des donnees

```typescript
const cleanedData = syncService.cleanData(originalData)
// Normalise: noms, emails, telephones
```

#### Export

```typescript
// Export JSON
const json = syncService.exportToJSON(data)

// Export CSV
const csv = syncService.exportToCSV(items, ['firstName', 'lastName', 'email'])
```

## Utilitaires de normalisation

```typescript
import {
  normalizePhone,
  normalizeName,
  normalizeEmail,
  normalizeCompanyName,
  isValidEmail,
  isValidPhone,
  findDuplicates,
  analyzeDataQuality,
} from '@/lib/boondmanager-sync'

// Telephone
normalizePhone('0612345678')  // '+33 6 12 34 56 78'

// Nom
normalizeName('JEAN dupont')  // 'Jean Dupont'

// Email
normalizeEmail('TEST@Example.COM')  // 'test@example.com'

// Societe
normalizeCompanyName('acme sas')  // 'acme SAS'

// Validation
isValidEmail('test@example.com')  // true
isValidPhone('+33612345678')      // true

// Doublons
findDuplicates(items, ['email'])  // DuplicateGroup[]
```

## Mapping des entites

| BoondManager | Site EBMC | Description |
|--------------|-----------|-------------|
| Candidates | Candidats | Candidats en recrutement |
| Resources | Consultants/Users | Collaborateurs internes |
| Opportunities | Jobs/Offres | Opportunites commerciales |
| Companies | Societes | Clients et prospects |
| Contacts | Contacts | Interlocuteurs en societe |
| Projects | Projets | Missions en cours |

## Etats (States)

### Candidats
| Code | Label |
|------|-------|
| 0 | Nouveau |
| 1 | A qualifier |
| 2 | Qualifie |
| 3 | En cours |
| 4 | Entretien |
| 5 | Proposition |
| 6 | Embauche |
| 7 | Refuse |
| 8 | Archive |

### Ressources
| Code | Label |
|------|-------|
| 0 | Non defini |
| 1 | Disponible |
| 2 | En mission |
| 3 | Intercontrat |
| 4 | Indisponible |
| 5 | Sorti |

### Opportunites
| Code | Label |
|------|-------|
| 0 | En cours |
| 1 | Gagnee |
| 2 | Perdue |
| 3 | Abandonnee |

### Societes
| Code | Label |
|------|-------|
| 0 | Prospect |
| 1 | Client |
| 2 | Ancien client |
| 3 | Fournisseur |
| 4 | Archive |

### Projets
| Code | Label |
|------|-------|
| 0 | En preparation |
| 1 | En cours |
| 2 | Termine |
| 3 | Annule |

## Routes API

### Dashboard
```
GET /api/boondmanager/v2?env=sandbox&type=stats
```

### Synchronisation
```
POST /api/boondmanager/v2/sync
```

### Qualite
```
GET /api/boondmanager/v2/quality?env=sandbox
```

### Export
```
GET /api/boondmanager/v2/export?env=sandbox&format=json&clean=true
GET /api/boondmanager/v2/export?env=sandbox&format=csv&entity=candidates&clean=true
```

### CRUD Entites
```
GET    /api/boondmanager/v2/candidates?env=sandbox
POST   /api/boondmanager/v2/candidates?env=sandbox
PATCH  /api/boondmanager/v2/candidates?env=sandbox
DELETE /api/boondmanager/v2/candidates?env=sandbox&id=123
```

## Tests

Executer les tests unitaires:

```bash
npm run test:run -- src/__tests__/boondmanager.test.ts
```

Les tests couvrent:
- Normalisation des donnees (telephone, nom, email)
- Validation des formats
- Detection des doublons
- Protection ecriture en production
- Appels API et gestion erreurs
- Export JSON/CSV
- Mappings des etats

## Workflow de nettoyage des donnees

1. **Synchroniser** les donnees de Production vers Sandbox
2. **Analyser** la qualite des donnees dans Sandbox
3. **Corriger** les problemes identifies via l'interface CRUD
4. **Exporter** les donnees nettoyees en JSON
5. **Importer** manuellement dans BoondManager Production

## Securite

- Les credentials sont stockes cote serveur uniquement
- Les operations d'ecriture sont bloquees en production au niveau du client
- L'acces au Data Hub necessite l'authentification admin
- Toutes les routes API verifient la session utilisateur

## Erreurs courantes

### "Operation non autorisee en production"
Tentative d'ecriture (POST/PUT/DELETE) sur l'environnement Production. Basculer sur Sandbox.

### "401 Unauthorized"
Credentials incorrects ou expires. Verifier la configuration dans `boondmanager-client.ts`.

### "Rate limit exceeded"
Trop de requetes API. Attendre quelques minutes avant de reessayer.
