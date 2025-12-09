// Unified Candidate/Consultant type based on BoondManager CV structure
// A consultant is a candidate who has been hired (status = 'embauche')
// Flow: Candidat → (recruitment) → Consultant CDI or Freelance

import { TerrainRole } from '@/lib/roles'

export type CandidateStatus = 'a_qualifier' | 'qualifie' | 'en_cours' | 'entretien' | 'proposition' | 'embauche'
export type ContractType = 'cdi' | 'freelance'
export type Seniority = 'Junior' | 'Confirmé' | 'Senior' | 'Expert'
export type Mobility = 'Locale' | 'IDF' | 'France' | 'Luxembourg' | 'Nationale' | 'Internationale'

// Job family categories
export type JobFamilyCategory = 'SAP' | 'Dev' | 'Data' | 'Cloud' | 'Cyber' | 'Gestion'

// Job families with their category
export const JOB_FAMILIES = [
  // SAP
  { id: 'consultant_sap_fonctionnel', label: 'Consultant SAP Fonctionnel', category: 'SAP' as JobFamilyCategory },
  { id: 'consultant_sap_technique', label: 'Consultant SAP Technique', category: 'SAP' as JobFamilyCategory },
  { id: 'architecte_sap', label: 'Architecte SAP', category: 'SAP' as JobFamilyCategory },
  { id: 'chef_projet_sap', label: 'Chef de projet SAP', category: 'SAP' as JobFamilyCategory },
  // Dev
  { id: 'developpeur_fullstack', label: 'Développeur Fullstack', category: 'Dev' as JobFamilyCategory },
  { id: 'developpeur_frontend', label: 'Développeur Frontend', category: 'Dev' as JobFamilyCategory },
  { id: 'developpeur_backend', label: 'Développeur Backend', category: 'Dev' as JobFamilyCategory },
  { id: 'developpeur_mobile', label: 'Développeur Mobile', category: 'Dev' as JobFamilyCategory },
  { id: 'devops', label: 'DevOps Engineer', category: 'Dev' as JobFamilyCategory },
  // Data
  { id: 'data_engineer', label: 'Data Engineer', category: 'Data' as JobFamilyCategory },
  { id: 'data_analyst', label: 'Data Analyst', category: 'Data' as JobFamilyCategory },
  { id: 'data_scientist', label: 'Data Scientist', category: 'Data' as JobFamilyCategory },
  { id: 'bi_consultant', label: 'Consultant BI', category: 'Data' as JobFamilyCategory },
  // Cloud
  { id: 'cloud_architect', label: 'Architecte Cloud', category: 'Cloud' as JobFamilyCategory },
  { id: 'cloud_engineer', label: 'Cloud Engineer', category: 'Cloud' as JobFamilyCategory },
  { id: 'sre', label: 'Site Reliability Engineer', category: 'Cloud' as JobFamilyCategory },
  // Cyber
  { id: 'security_analyst', label: 'Analyste Cybersécurité', category: 'Cyber' as JobFamilyCategory },
  { id: 'security_engineer', label: 'Ingénieur Sécurité', category: 'Cyber' as JobFamilyCategory },
  { id: 'pentester', label: 'Pentester', category: 'Cyber' as JobFamilyCategory },
  // Gestion
  { id: 'amoa', label: 'AMOA', category: 'Gestion' as JobFamilyCategory },
  { id: 'amoe', label: 'AMOE', category: 'Gestion' as JobFamilyCategory },
  { id: 'chef_projet', label: 'Chef de projet', category: 'Gestion' as JobFamilyCategory },
  { id: 'scrum_master', label: 'Scrum Master', category: 'Gestion' as JobFamilyCategory },
  { id: 'product_owner', label: 'Product Owner', category: 'Gestion' as JobFamilyCategory },
  { id: 'pmo', label: 'PMO', category: 'Gestion' as JobFamilyCategory },
] as const

export type JobFamilyId = typeof JOB_FAMILIES[number]['id']

// Skills by category
export const SKILLS_BY_CATEGORY: Record<JobFamilyCategory, { modules: readonly string[], subModules: readonly string[] }> = {
  SAP: {
    modules: ['SAP FI', 'SAP CO', 'SAP FI CO', 'SAP SD', 'SAP MM', 'SAP PP', 'SAP PM', 'SAP QM', 'SAP WM', 'SAP HCM', 'SAP BW', 'SAP ABAP', 'SAP Basis', 'SAP S/4HANA'],
    subModules: ['OTC', 'JVA', 'FIORI', 'CDS', 'RAP', 'BTP', 'IDOC', 'EDI', 'GL', 'AP', 'AR', 'AA', 'CO-PA', 'CO-PC', 'ML', 'SAC', 'Datasphere']
  },
  Dev: {
    modules: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', '.NET', 'Go', 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift'],
    subModules: ['React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Spring Boot', 'Django', 'FastAPI', 'Express', 'NestJS', 'Flutter', 'React Native', 'GraphQL', 'REST API']
  },
  Data: {
    modules: ['Python', 'SQL', 'Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt', 'Tableau', 'Power BI', 'Looker'],
    subModules: ['Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'MLflow', 'Databricks', 'Snowflake', 'BigQuery', 'Redshift', 'ETL', 'Data Modeling']
  },
  Cloud: {
    modules: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'GitHub Actions'],
    subModules: ['EC2', 'S3', 'Lambda', 'EKS', 'AKS', 'GKE', 'CloudFormation', 'ARM Templates', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'ELK Stack']
  },
  Cyber: {
    modules: ['SIEM', 'SOC', 'Pentest', 'IAM', 'PAM', 'EDR', 'XDR', 'Firewall', 'WAF', 'VPN'],
    subModules: ['Splunk', 'QRadar', 'CrowdStrike', 'Okta', 'CyberArk', 'Nessus', 'Burp Suite', 'Metasploit', 'OWASP', 'ISO 27001', 'NIST', 'RGPD']
  },
  Gestion: {
    modules: ['Agile', 'Scrum', 'SAFe', 'Kanban', 'Prince2', 'PMP', 'ITIL', 'Lean', 'Six Sigma'],
    subModules: ['Jira', 'Confluence', 'Azure DevOps', 'Monday', 'Asana', 'Trello', 'MS Project', 'Notion', 'Miro', 'Business Analysis', 'Change Management']
  }
}

// Get job family category
export function getJobFamilyCategory(jobFamilyId: string): JobFamilyCategory | null {
  const family = JOB_FAMILIES.find(f => f.id === jobFamilyId)
  return family?.category || null
}

// Get skills for a job family
export function getSkillsForJobFamily(jobFamilyId: string) {
  const category = getJobFamilyCategory(jobFamilyId)
  if (!category) return { modules: [], subModules: [] }
  return SKILLS_BY_CATEGORY[category]
}

// SAP Modules (kept for backward compatibility)
export const SAP_MODULES = SKILLS_BY_CATEGORY.SAP.modules
export const SAP_SUB_MODULES = SKILLS_BY_CATEGORY.SAP.subModules

// Phone country codes
export const PHONE_COUNTRY_CODES = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+32', country: 'Belgique', flag: '🇧🇪' },
  { code: '+41', country: 'Suisse', flag: '🇨🇭' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+34', country: 'Espagne', flag: '🇪🇸' },
  { code: '+39', country: 'Italie', flag: '🇮🇹' },
  { code: '+31', country: 'Pays-Bas', flag: '🇳🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+212', country: 'Maroc', flag: '🇲🇦' },
  { code: '+216', country: 'Tunisie', flag: '🇹🇳' },
  { code: '+213', country: 'Algérie', flag: '🇩🇿' },
] as const

// Job family category colors
export const CATEGORY_COLORS: Record<JobFamilyCategory, { bg: string, text: string, gradient: string }> = {
  SAP: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', gradient: 'from-blue-500 to-indigo-500' },
  Dev: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', gradient: 'from-green-500 to-emerald-500' },
  Data: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', gradient: 'from-purple-500 to-violet-500' },
  Cloud: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', gradient: 'from-orange-500 to-amber-500' },
  Cyber: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', gradient: 'from-red-500 to-rose-500' },
  Gestion: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', gradient: 'from-cyan-500 to-teal-500' }
}

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
  phoneCode?: string // e.g., "+33"
  phone?: string // Phone number without country code
  avatar?: string
  nationality?: string

  // Professional info
  title?: string // Job title
  jobFamily?: JobFamilyId

  // Competences (dynamic based on job family)
  modules: string[]
  subModules: string[]

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

  // Contract (set when hired)
  contractType?: ContractType // 'cdi' or 'freelance' - set when status = 'embauche'
  hireDate?: string // Date when the candidate was hired

  // Timestamps
  createdAt: string
  updatedAt?: string
  lastActivity?: string

  // Notes
  notes?: string
  cvUrl?: string

  // User account binding (for hired consultants)
  userId?: string // Links to user account for portal access
}

// Helper to check if a candidate is now a consultant (hired)
export function isConsultant(candidate: Candidate): boolean {
  return candidate.status === 'embauche'
}

// Helper to check if candidate is a CDI consultant
export function isConsultantCDI(candidate: Candidate): boolean {
  return candidate.status === 'embauche' && candidate.contractType === 'cdi'
}

// Helper to check if candidate is a freelance
export function isFreelance(candidate: Candidate): boolean {
  return candidate.status === 'embauche' && candidate.contractType === 'freelance'
}

// Get the terrain role for a candidate
export function getCandidateRole(candidate: Candidate): TerrainRole {
  if (candidate.status !== 'embauche') {
    return 'candidat'
  }
  return candidate.contractType === 'cdi' ? 'consultant_cdi' : 'freelance'
}

// Helper to get display name
export function getFullName(candidate: Candidate): string {
  return `${candidate.firstName} ${candidate.lastName}`
}

// Helper to get initials
export function getInitials(candidate: Candidate): string {
  return `${candidate.firstName[0]}${candidate.lastName[0]}`
}

// Contract type labels
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  cdi: 'CDI',
  freelance: 'Freelance'
}

// Contract type colors
export const CONTRACT_TYPE_COLORS: Record<ContractType, { bg: string; text: string }> = {
  cdi: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  freelance: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' }
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

    // Determine contract type for hired candidates
    const contractType: ContractType | undefined = status === 'embauche'
      ? (getRandom() > 0.6 ? 'cdi' : 'freelance')
      : undefined

    const hireDate = status === 'embauche'
      ? new Date(Date.now() - Math.floor(getRandom() * 365) * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    return {
      id: `candidate-${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phoneCode: '+33',
      phone: `6 ${Math.floor(getRandom() * 90 + 10)} ${Math.floor(getRandom() * 90 + 10)} ${Math.floor(getRandom() * 90 + 10)} ${Math.floor(getRandom() * 90 + 10)}`,
      title: JOB_FAMILIES[Math.floor(getRandom() * JOB_FAMILIES.length)].label,
      jobFamily: JOB_FAMILIES[Math.floor(getRandom() * JOB_FAMILIES.length)].id,
      modules: modules as Candidate['modules'],
      subModules: subModules as Candidate['subModules'],
      experience: {
        years: yearsExp,
        seniority
      },
      certifications: getRandom() > 0.5 ? ['SAP S/4HANA Finance', 'SAP Activate'].slice(0, Math.floor(getRandom() * 2) + 1) : [],
      availability: {
        isAvailable: status !== 'embauche' ? getRandom() > 0.3 : getRandom() > 0.5, // Hired consultants may be on mission
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
      contractType,
      hireDate,
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
