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
