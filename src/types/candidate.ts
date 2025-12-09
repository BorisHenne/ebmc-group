// Unified Candidate/Consultant type based on BoondManager CV structure
// A consultant is a candidate who has been hired (status = 'embauche')

export type CandidateStatus = 'a_qualifier' | 'qualifie' | 'en_cours' | 'entretien' | 'proposition' | 'embauche'
export type Seniority = 'Junior' | 'Confirmé' | 'Senior' | 'Expert'
export type Mobility = 'Locale' | 'IDF' | 'France' | 'Luxembourg' | 'Nationale' | 'Internationale'

// SAP Modules
export const SAP_MODULES = ['SAP FI', 'SAP CO', 'SAP FI CO', 'SAP SD', 'SAP MM', 'SAP PP', 'SAP PM', 'SAP QM', 'SAP WM', 'SAP HCM', 'SAP BW', 'SAP ABAP', 'SAP Basis', 'SAP S/4HANA'] as const
export const SAP_SUB_MODULES = ['OTC', 'JVA', 'FIORI', 'CDS', 'RAP', 'BTP', 'IDOC', 'EDI', 'GL', 'AP', 'AR', 'AA', 'CO-PA', 'CO-PC', 'ML'] as const

// Job families
export const JOB_FAMILIES = ['AMOA', 'AMOE', 'Chef de projet', 'Team Lead', 'PMO', 'Consultant fonctionnel', 'Consultant technique', 'Développeur', 'Architecte', 'Support'] as const

// Languages
export const LANGUAGES = ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Italien', 'Néerlandais', 'Portugais', 'Arabe', 'Chinois'] as const

export interface Availability {
  availableFrom?: string // ISO date
  availableIn?: string // e.g., "1 mois", "Immédiat"
  isAvailable: boolean
}

export interface Location {
  city: string
  country: string
  postalCode?: string
}

export interface DailyRate {
  min?: number
  max?: number
  target?: number
  currency: 'EUR' | 'USD' | 'CHF' | 'GBP'
}

export interface Experience {
  years: number
  seniority: Seniority
}

export interface Candidate {
  id: string

  // Identity
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  nationality?: string

  // Professional info
  title?: string // Job title
  jobFamily?: typeof JOB_FAMILIES[number]

  // SAP Competences
  modules: (typeof SAP_MODULES[number])[]
  subModules: (typeof SAP_SUB_MODULES[number])[]

  // Experience
  experience: Experience
  certifications: string[]

  // Availability & Mobility
  availability: Availability
  location: Location
  mobility: Mobility[]
  remoteWork: boolean

  // Financial
  dailyRate?: DailyRate

  // Languages
  languages: (typeof LANGUAGES[number])[]

  // Security
  securityClearance?: string // e.g., "Habilitation défense"

  // Recruitment tracking
  status: CandidateStatus
  source?: string // LinkedIn, Indeed, etc.
  sourceurId?: string // ID of the sourceur who found this candidate
  commercialId?: string // ID of the commercial managing this candidate

  // Timestamps
  createdAt: string
  updatedAt?: string
  lastActivity?: string

  // Notes
  notes?: string
  cvUrl?: string
}

// Helper to check if a candidate is now a consultant (hired)
export function isConsultant(candidate: Candidate): boolean {
  return candidate.status === 'embauche'
}

// Helper to get display name
export function getFullName(candidate: Candidate): string {
  return `${candidate.firstName} ${candidate.lastName}`
}

// Helper to get initials
export function getInitials(candidate: Candidate): string {
  return `${candidate.firstName[0]}${candidate.lastName[0]}`
}

// Status labels in French
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  a_qualifier: 'À qualifier',
  qualifie: 'Qualifié',
  en_cours: 'En cours',
  entretien: 'Entretien',
  proposition: 'Proposition',
  embauche: 'Embauché'
}

// Status colors
export const STATUS_COLORS: Record<CandidateStatus, string> = {
  a_qualifier: '#94a3b8',
  qualifie: '#06b6d4',
  en_cours: '#8b5cf6',
  entretien: '#f59e0b',
  proposition: '#3b82f6',
  embauche: '#10b981'
}

// Seeded random for consistent demo data
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Generate demo candidates with BoondManager structure - shared across app
export function generateDemoCandidates(count: number = 24, seed: number = 42): Candidate[] {
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Julie', 'Nicolas', 'Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Alexandre', 'Camille', 'Maxime', 'Sarah', 'Antoine', 'Laura', 'Mathieu', 'Clara']
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard']
  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille', 'Nice', 'Strasbourg', 'Luxembourg']
  const sources = ['LinkedIn', 'Indeed', 'Site Web', 'Cooptation', 'CVthèque', 'JobBoard', 'Réseau', 'Salon']
  const statuses: CandidateStatus[] = ['a_qualifier', 'qualifie', 'en_cours', 'entretien', 'proposition', 'embauche']

  let currentSeed = seed

  return Array.from({ length: count }, (_, i) => {
    const getRandom = () => {
      currentSeed++
      return seededRandom(currentSeed)
    }

    const firstName = firstNames[Math.floor(getRandom() * firstNames.length)]
    const lastName = lastNames[Math.floor(getRandom() * lastNames.length)]
    const status = statuses[Math.floor(getRandom() * statuses.length)]
    const yearsExp = Math.floor(getRandom() * 15) + 2
    const city = cities[Math.floor(getRandom() * cities.length)]

    // Determine seniority based on years
    const seniority: Seniority = yearsExp < 3 ? 'Junior' : yearsExp < 6 ? 'Confirmé' : yearsExp < 10 ? 'Senior' : 'Expert'

    // Random modules (1-3)
    const numModules = Math.floor(getRandom() * 3) + 1
    const shuffledModules = [...SAP_MODULES].sort(() => getRandom() - 0.5)
    const modules = shuffledModules.slice(0, numModules)

    // Random sub-modules (1-4)
    const numSubModules = Math.floor(getRandom() * 4) + 1
    const shuffledSubModules = [...SAP_SUB_MODULES].sort(() => getRandom() - 0.5)
    const subModules = shuffledSubModules.slice(0, numSubModules)

    // TJM based on seniority
    const baseTjm = seniority === 'Junior' ? 400 : seniority === 'Confirmé' ? 550 : seniority === 'Senior' ? 700 : 850
    const tjmVariation = Math.floor(getRandom() * 100)

    return {
      id: `candidate-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+33 6 ${Math.floor(getRandom() * 90 + 10)} ${Math.floor(getRandom() * 90 + 10)} ${Math.floor(getRandom() * 90 + 10)} ${Math.floor(getRandom() * 90 + 10)}`,
      title: JOB_FAMILIES[Math.floor(getRandom() * JOB_FAMILIES.length)],
      jobFamily: JOB_FAMILIES[Math.floor(getRandom() * JOB_FAMILIES.length)],
      modules: modules as Candidate['modules'],
      subModules: subModules as Candidate['subModules'],
      experience: {
        years: yearsExp,
        seniority
      },
      certifications: getRandom() > 0.5 ? ['SAP S/4HANA Finance', 'SAP Activate'].slice(0, Math.floor(getRandom() * 2) + 1) : [],
      availability: {
        isAvailable: getRandom() > 0.3,
        availableIn: ['Immédiat', '1 mois', '2 mois', '3 mois'][Math.floor(getRandom() * 4)]
      },
      location: {
        city,
        country: city === 'Luxembourg' ? 'Luxembourg' : 'France'
      },
      mobility: [['Locale', 'IDF', 'France'][Math.floor(getRandom() * 3)]] as Candidate['mobility'],
      remoteWork: getRandom() > 0.4,
      dailyRate: {
        min: baseTjm,
        max: baseTjm + tjmVariation + 100,
        target: baseTjm + tjmVariation,
        currency: 'EUR'
      },
      languages: ['Français', ...(getRandom() > 0.3 ? ['Anglais'] : [])] as Candidate['languages'],
      status,
      source: sources[Math.floor(getRandom() * sources.length)],
      createdAt: new Date(Date.now() - Math.floor(getRandom() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.floor(getRandom() * 7) * 24 * 60 * 60 * 1000).toISOString(),
    } as Candidate
  })
}

// Get counts by status
export function getCandidateCountsByStatus(candidates: Candidate[]): Record<CandidateStatus, number> {
  const counts: Record<CandidateStatus, number> = {
    a_qualifier: 0,
    qualifie: 0,
    en_cours: 0,
    entretien: 0,
    proposition: 0,
    embauche: 0
  }

  candidates.forEach(c => {
    counts[c.status]++
  })

  return counts
}

// Get average TJM
export function getAverageTJM(candidates: Candidate[]): number {
  const withTjm = candidates.filter(c => c.dailyRate?.target)
  if (withTjm.length === 0) return 0
  const total = withTjm.reduce((sum, c) => sum + (c.dailyRate?.target || 0), 0)
  return Math.round(total / withTjm.length)
}
