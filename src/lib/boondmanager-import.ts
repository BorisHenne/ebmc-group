/**
 * BoondManager Data Import Service
 *
 * Maps BoondManager entities to site collections:
 * - Resources → Consultants (public profiles) + Users (consultant_cdi/freelance login)
 * - Candidates → Candidates (recruitment pipeline)
 * - Opportunities → Jobs (public job listings)
 */

import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
  BoondResource,
  BoondCandidate,
  BoondOpportunity,
  BoondAction,
} from './boondmanager-client'
import { RoleType } from './roles'
import {
  getCandidateStateLabelSync,
  getAllStates,
  AllStates,
  FALLBACK_CANDIDATE_STATES,
} from './boondmanager-dictionary'

// ==================== TYPES ====================

export interface ImportResult {
  entity: string
  total: number
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export interface ImportSummary {
  startedAt: Date
  completedAt: Date
  results: ImportResult[]
  totalCreated: number
  totalUpdated: number
  totalSkipped: number
  totalErrors: number
}

export interface SiteConsultant {
  _id?: ObjectId
  boondManagerId?: number  // Link to BoondManager
  name: string
  title: string
  titleEn: string
  location: string
  experience: string
  experienceEn: string
  category: string
  available: boolean
  published: boolean  // false = brouillon (pas visible sur le frontoffice)
  skills: string[]
  certifications: string[]
  email?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface SiteUser {
  _id?: ObjectId
  boondManagerId?: number  // Link to BoondManager
  email: string
  password?: string
  name: string
  role: RoleType
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SiteJob {
  _id?: ObjectId
  boondManagerId?: number  // Link to BoondManager (opportunity)
  title: string
  titleEn: string
  location: string
  type: string
  typeEn: string
  category: string
  experience: string
  experienceEn: string
  description: string
  descriptionEn: string
  missions: string[]
  missionsEn: string[]
  requirements: string[]
  requirementsEn: string[]
  active: boolean
  published: boolean  // false = brouillon (pas visible sur le frontoffice)
  createdAt: Date
  updatedAt: Date
}

export interface SiteCandidate {
  _id?: ObjectId
  boondManagerId?: number  // Link to BoondManager
  firstName: string
  lastName: string
  email?: string
  phone?: string
  phone2?: string
  title?: string
  state: number           // État candidat BoondManager (ID from dictionary)
  stateLabel: string      // Label de l'état (from dictionary)
  typeOf?: number         // Étape/Type du candidat
  typeOfLabel?: string    // Label de l'étape
  location?: string
  address?: string
  postcode?: string
  town?: string
  country?: string
  skills: string[]
  experience?: string
  experienceYears?: number
  source?: string
  origin?: string
  notes?: string
  // New fields
  linkedInUrl?: string
  thumbnail?: string
  civility?: number
  nationality?: string
  availabilityDate?: string
  mobilityArea?: string
  minimumSalary?: number
  maximumSalary?: number
  expertise1?: number
  expertise2?: number
  expertise3?: number
  dateOfBirth?: string
  lastActivityDate?: string
  mainManagerId?: number
  agencyId?: number
  createdAt: Date
  updatedAt: Date
}

// ==================== RECRUITMENT STATE FROM ACTIONS ====================

/**
 * Determine recruitment pipeline state from candidate's actions
 *
 * This function analyzes the actions associated with a candidate and determines
 * their position in the recruitment pipeline. It can use either:
 * - Default action type IDs (fallback)
 * - Action type labels from the BoondManager dictionary (more accurate)
 *
 * BoondManager ACTION_TYPES (default mapping):
 * 1: Positionnement
 * 2: Entretien client
 * 3: Entretien interne
 * 4: Proposition
 * 5: Démarrage (hired!)
 * 6: Appel
 * 7: Email
 * 8: Réunion
 * 9: Autre
 *
 * Our RECRUITMENT_STATES:
 * 0: Nouveau
 * 1: A qualifier
 * 2: Qualifié
 * 3: En cours
 * 4: Entretien
 * 5: Proposition
 * 6: Embauché
 * 7: Refusé
 * 8: Archivé
 */
export function determineRecruitmentStateFromActions(
  actions: BoondAction[],
  candidateState?: number,
  actionTypesDict?: Map<number, string>
): { state: number; stateLabel: string; matchedAction?: string } {
  // Default: Nouveau
  if (!actions || actions.length === 0) {
    return { state: 0, stateLabel: 'Nouveau' }
  }

  // Sort by date (most recent first)
  const sortedActions = [...actions].sort((a, b) => {
    const dateA = new Date(a.attributes.startDate || a.attributes.creationDate || '').getTime()
    const dateB = new Date(b.attributes.startDate || b.attributes.creationDate || '').getTime()
    return dateB - dateA
  })

  // Find the most significant action type
  // We check both by ID and by label (if dictionary is provided) for robustness
  const actionTypes = sortedActions.map(a => a.attributes.typeOf)
  const actionLabels = actionTypesDict
    ? sortedActions.map(a => actionTypesDict.get(a.attributes.typeOf)?.toLowerCase() || '')
    : []

  // Helper to check if action type matches by ID or label
  const hasAction = (ids: number[], labelPatterns: string[]): boolean => {
    // Check by ID first
    if (ids.some(id => actionTypes.includes(id))) return true
    // Then check by label pattern (case insensitive)
    if (actionLabels.length > 0) {
      return labelPatterns.some(pattern =>
        actionLabels.some(label => label.includes(pattern.toLowerCase()))
      )
    }
    return false
  }

  // Check for "Démarrage" = Embauché
  if (hasAction([5], ['démarrage', 'demarrage', 'start', 'embauche', 'hired'])) {
    return { state: 6, stateLabel: 'Embauché', matchedAction: 'Démarrage' }
  }

  // Check for "Proposition" = Proposition
  if (hasAction([4], ['proposition', 'offre', 'offer'])) {
    return { state: 5, stateLabel: 'Proposition', matchedAction: 'Proposition' }
  }

  // Check for "Entretien client/interne" = Entretien
  if (hasAction([2, 3], ['entretien', 'interview'])) {
    return { state: 4, stateLabel: 'Entretien', matchedAction: 'Entretien' }
  }

  // Check for "Positionnement" = En cours
  if (hasAction([1], ['positionnement', 'positioning', 'position'])) {
    return { state: 3, stateLabel: 'En cours', matchedAction: 'Positionnement' }
  }

  // Check for "Appel/Email/Réunion" = A qualifier
  if (hasAction([6, 7, 8], ['appel', 'call', 'email', 'mail', 'réunion', 'reunion', 'meeting'])) {
    return { state: 1, stateLabel: 'A qualifier', matchedAction: 'Contact' }
  }

  // Has some actions but nothing specific = Qualifié (at least they're being processed)
  if (sortedActions.length > 0) {
    return { state: 2, stateLabel: 'Qualifié', matchedAction: 'Autre action' }
  }

  // Default
  return { state: 0, stateLabel: 'Nouveau' }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Safely extract a string value from BoondManager field
 * BoondManager sometimes returns objects like {typeOf: 1, detail: "value"} instead of strings
 */
function safeString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'object' && value !== null) {
    // Handle BoondManager complex objects like {typeOf: number, detail: string}
    const obj = value as Record<string, unknown>
    if ('detail' in obj && typeof obj.detail === 'string') {
      return obj.detail
    }
    if ('value' in obj && typeof obj.value === 'string') {
      return obj.value
    }
    if ('label' in obj && typeof obj.label === 'string') {
      return obj.label
    }
    if ('name' in obj && typeof obj.name === 'string') {
      return obj.name
    }
    // Fallback: try to stringify
    try {
      return JSON.stringify(value)
    } catch {
      return undefined
    }
  }
  return String(value)
}

// ==================== MAPPING FUNCTIONS ====================

/**
 * Map BoondManager Resource to Site Consultant
 */
export function mapResourceToConsultant(resource: BoondResource): Partial<SiteConsultant> {
  const attrs = resource.attributes
  const name = `${attrs.firstName || ''} ${attrs.lastName || ''}`.trim()

  // Map state to availability
  // State 1 = Disponible, State 2 = En mission (both are available for display)
  const available = attrs.state === 1 || attrs.state === 2

  // Determine category based on title or default
  const title = safeString(attrs.title) || 'Consultant'
  let category = 'consulting'
  if (title.toLowerCase().includes('sap')) category = 'sap'
  else if (title.toLowerCase().includes('cyber') || title.toLowerCase().includes('security')) category = 'cybersecurity'
  else if (title.toLowerCase().includes('data') || title.toLowerCase().includes('ia') || title.toLowerCase().includes('ai')) category = 'data'
  else if (title.toLowerCase().includes('dev') || title.toLowerCase().includes('full')) category = 'dev'

  // Extract experience from profile or default
  const experienceValue = attrs.experience as string | number | undefined
  const experience = experienceValue ? `${experienceValue} ans` : '3+ ans'

  // Extract skills and certifications from custom fields if available
  const rawSkills = attrs.skills as string[] | string | undefined
  const rawCertifications = attrs.certifications as string[] | string | undefined

  const skills: string[] = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === 'string'
      ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const certifications: string[] = Array.isArray(rawCertifications)
    ? rawCertifications
    : typeof rawCertifications === 'string'
      ? rawCertifications.split(',').map(s => s.trim()).filter(Boolean)
      : []

  return {
    boondManagerId: resource.id,
    name,
    title: title,
    titleEn: title, // Same as FR for now
    location: attrs.town || attrs.country || 'France',
    experience,
    experienceEn: experience,
    category,
    available,
    published: false, // Brouillon par défaut - à publier manuellement
    skills,
    certifications,
    email: attrs.email,
    phone: attrs.phone1,
    updatedAt: new Date(),
  }
}

/**
 * Map BoondManager Resource to Site User
 * Resources are hired consultants who need login access
 */
export function mapResourceToUser(resource: BoondResource): Partial<SiteUser> {
  const attrs = resource.attributes
  const name = `${attrs.firstName || ''} ${attrs.lastName || ''}`.trim()
  const state = attrs.state ?? 0

  // Determine role based on resource type/contract
  // State 1 = Disponible, State 2 = En mission (active consultants)
  // Default to freelance, could be consultant_cdi based on contract type field
  const contractType = (attrs as Record<string, unknown>).typeContract as string | undefined
  let role: RoleType = 'freelance'
  if (contractType?.toLowerCase().includes('cdi')) {
    role = 'consultant_cdi'
  }

  // Active if state is 1 (Disponible) or 2 (En mission)
  const active = state === 1 || state === 2

  return {
    boondManagerId: resource.id,
    email: attrs.email || `resource_${resource.id}@ebmc-import.temp`,
    name,
    role,
    active,
    updatedAt: new Date(),
  }
}

/**
 * Map stateLabel string to state number
 * BoondManager returns both state (number) and stateLabel (string)
 * We need to ensure they match our expected pipeline stages
 */
function mapStateLabelToState(stateLabel: string | undefined, defaultState: number): number {
  if (!stateLabel) return defaultState

  const label = stateLabel.toLowerCase().trim()

  // Map French labels to state numbers (supporting various spellings)
  if (label.includes('nouveau')) return 0
  if (label.includes('a qualifier') || label.includes('à qualifier')) return 1
  if (label.includes('qualifi')) return 2 // qualifié, qualifiée, qualifie
  if (label.includes('en cours')) return 3
  if (label.includes('entretien')) return 4
  if (label.includes('proposition')) return 5
  if (label.includes('embauche') || label.includes('embauché') || label.includes('hire')) return 6
  if (label.includes('refus') || label.includes('refuse')) return 7 // refusé, refus
  if (label.includes('archiv')) return 8 // archivé, archive

  // If no match, return the default state from BoondManager
  return defaultState
}

/**
 * Parse a date from BoondManager format
 * BoondManager returns dates in various formats: ISO string, YYYY-MM-DD, timestamp, etc.
 */
function parseBoondDate(dateValue: unknown): Date | undefined {
  if (!dateValue) return undefined

  // Handle string dates
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }

  // Handle timestamps (number)
  if (typeof dateValue === 'number') {
    // If it's a small number, it might be seconds since epoch
    const timestamp = dateValue > 1e12 ? dateValue : dateValue * 1000
    const parsed = new Date(timestamp)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return undefined
}

/**
 * Map BoondManager Candidate to Site Candidate
 * Simplified version similar to mapResourceToConsultant
 *
 * @param candidate The candidate from BoondManager
 * @param candidateStates Optional map of state ID to label (from dictionary)
 * @param candidateTypes Optional map of typeOf ID to label (from dictionary)
 */
export function mapCandidateToSiteCandidate(
  candidate: BoondCandidate,
  candidateStates?: Map<number, string>,
  candidateTypes?: Map<number, string>
): Partial<SiteCandidate> {
  const attrs = candidate.attributes

  // Extract names directly like mapResourceToConsultant does
  const firstName = attrs.firstName || ''
  const lastName = attrs.lastName || ''

  // Get state directly from BoondManager
  const state = typeof attrs.state === 'number' ? attrs.state : 0
  const stateLabel = attrs.stateLabel
    || (candidateStates ? candidateStates.get(state) : undefined)
    || getCandidateStateLabelSync(state)

  // Get typeOf
  const typeOf = typeof attrs.typeOf === 'number' ? attrs.typeOf : undefined
  const typeOfLabel = typeOf !== undefined && candidateTypes
    ? candidateTypes.get(typeOf)
    : undefined

  // Extract skills
  const rawSkills = (attrs as Record<string, unknown>).skills as string[] | string | undefined
  const skills: string[] = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === 'string'
      ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
      : []

  // Build result object - simple and direct like mapResourceToConsultant
  return {
    boondManagerId: candidate.id,
    firstName,
    lastName,
    email: attrs.email || undefined,
    phone: attrs.phone1 || undefined,
    phone2: attrs.phone2 || undefined,
    title: attrs.title || undefined,
    civility: typeof attrs.civility === 'number' ? attrs.civility : undefined,
    thumbnail: attrs.thumbnail || undefined,
    linkedInUrl: attrs.linkedInUrl || undefined,
    dateOfBirth: attrs.dateOfBirth || undefined,
    nationality: attrs.nationality || undefined,
    state,
    stateLabel,
    typeOf,
    typeOfLabel,
    location: attrs.town || attrs.country || undefined,
    address: attrs.address || undefined,
    postcode: attrs.postcode || undefined,
    town: attrs.town || undefined,
    country: attrs.country || undefined,
    mobilityArea: attrs.mobilityArea || undefined,
    availabilityDate: attrs.availabilityDate || undefined,
    minimumSalary: typeof attrs.minimumSalary === 'number' ? attrs.minimumSalary : undefined,
    maximumSalary: typeof attrs.maximumSalary === 'number' ? attrs.maximumSalary : undefined,
    skills,
    experienceYears: typeof attrs.experienceYears === 'number' ? attrs.experienceYears : undefined,
    experience: attrs.experienceYears ? `${attrs.experienceYears} ans` : undefined,
    expertise1: typeof attrs.expertise1 === 'number' ? attrs.expertise1 : undefined,
    expertise2: typeof attrs.expertise2 === 'number' ? attrs.expertise2 : undefined,
    expertise3: typeof attrs.expertise3 === 'number' ? attrs.expertise3 : undefined,
    source: attrs.source as string || undefined,
    origin: attrs.origin as string || undefined,
    lastActivityDate: attrs.lastActivityDate || undefined,
    updatedAt: new Date(),
  }
}

/**
 * Map BoondManager Opportunity to Site Job
 */
export function mapOpportunityToJob(opportunity: BoondOpportunity): Partial<SiteJob> {
  const attrs = opportunity.attributes

  // State 0 = En cours (active), others are closed
  const active = attrs.state === 0

  // Determine category and type based on title/description
  const title = attrs.title || 'Opportunite'
  let category = 'consulting'
  let type = 'CDI'

  if (title.toLowerCase().includes('sap')) category = 'sap'
  else if (title.toLowerCase().includes('cyber')) category = 'cybersecurity'
  else if (title.toLowerCase().includes('data') || title.toLowerCase().includes('ia')) category = 'data'
  else if (title.toLowerCase().includes('dev')) category = 'dev'

  if (title.toLowerCase().includes('freelance') || title.toLowerCase().includes('mission')) {
    type = 'Freelance'
  }

  // Parse description for missions and requirements
  const description = attrs.description || ''
  const missions: string[] = []
  const requirements: string[] = []

  // Try to extract structured info from description
  const lines = description.split('\n').filter(l => l.trim())
  lines.forEach(line => {
    if (line.startsWith('-') || line.startsWith('*')) {
      if (line.toLowerCase().includes('requis') || line.toLowerCase().includes('experience')) {
        requirements.push(line.replace(/^[-*]\s*/, ''))
      } else {
        missions.push(line.replace(/^[-*]\s*/, ''))
      }
    }
  })

  // Location might be in a custom field or we use a default
  const location = (attrs as Record<string, unknown>).location as string || 'France'

  return {
    boondManagerId: opportunity.id,
    title,
    titleEn: title,
    location,
    type,
    typeEn: type,
    category,
    experience: ((attrs as Record<string, unknown>).experience as string) || '3+ ans',
    experienceEn: ((attrs as Record<string, unknown>).experience as string) || '3+ years',
    description: description.substring(0, 500),
    descriptionEn: description.substring(0, 500),
    missions: missions.length > 0 ? missions : ['A definir'],
    missionsEn: missions.length > 0 ? missions : ['To be defined'],
    requirements: requirements.length > 0 ? requirements : ['Voir description'],
    requirementsEn: requirements.length > 0 ? requirements : ['See description'],
    active,
    published: false, // Brouillon par défaut - à publier manuellement
    updatedAt: new Date(),
  }
}

// ==================== IMPORT SERVICE ====================

export class BoondImportService {
  /**
   * Import Resources to Consultants collection
   */
  async importResources(resources: BoondResource[]): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'resources → consultants',
      total: resources.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    const db = await connectToDatabase()
    const collection = db.collection('consultants')

    for (const resource of resources) {
      try {
        const consultantData = mapResourceToConsultant(resource)

        // Check if already exists by boondManagerId
        const existing = await collection.findOne({ boondManagerId: resource.id })

        if (existing) {
          // Update existing
          await collection.updateOne(
            { _id: existing._id },
            { $set: consultantData }
          )
          result.updated++
        } else {
          // Create new
          await collection.insertOne({
            ...consultantData,
            createdAt: new Date(),
          } as SiteConsultant)
          result.created++
        }
      } catch (error) {
        result.errors.push(`Resource ${resource.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    return result
  }

  /**
   * Import Resources to Users collection
   * Resources are hired consultants who need login access
   */
  async importResourcesAsUsers(resources: BoondResource[]): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'resources → users',
      total: resources.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    const db = await connectToDatabase()
    const collection = db.collection('users')

    for (const resource of resources) {
      try {
        const userData = mapResourceToUser(resource)

        // Skip resources without email (can't create user account)
        if (!userData.email || userData.email.includes('@ebmc-import.temp')) {
          result.skipped++
          continue
        }

        // Check if already exists by boondManagerId or email
        const existing = await collection.findOne({
          $or: [
            { boondManagerId: resource.id },
            { email: userData.email }
          ]
        })

        if (existing) {
          // Update existing (don't overwrite password)
          await collection.updateOne(
            { _id: existing._id },
            { $set: userData }
          )
          result.updated++
        } else {
          // Create new user without password (will need to be set manually or via SSO)
          await collection.insertOne({
            ...userData,
            password: null, // No password - use BoondManager SSO
            createdAt: new Date(),
          } as unknown as SiteUser)
          result.created++
        }
      } catch (error) {
        result.errors.push(`Resource ${resource.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    return result
  }

  /**
   * Import Candidates to Candidates collection
   * Simplified version similar to importResources
   */
  async importCandidates(
    candidates: BoondCandidate[],
    candidateStates?: Map<number, string>,
    candidateTypes?: Map<number, string>
  ): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'candidates → candidates',
      total: candidates.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    const db = await connectToDatabase()
    const collection = db.collection('candidates')

    for (const candidate of candidates) {
      try {
        const candidateData = mapCandidateToSiteCandidate(candidate, candidateStates, candidateTypes)

        // Check if already exists by boondManagerId
        const existing = await collection.findOne({ boondManagerId: candidate.id })

        if (existing) {
          // Update existing
          await collection.updateOne(
            { _id: existing._id },
            { $set: candidateData }
          )
          result.updated++
        } else {
          // Create new - same pattern as importResources
          await collection.insertOne({
            ...candidateData,
            createdAt: new Date(),
          } as SiteCandidate)
          result.created++
        }
      } catch (error) {
        result.errors.push(`Candidate ${candidate.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    return result
  }

  /**
   * Import Opportunities to Jobs collection
   */
  async importOpportunities(opportunities: BoondOpportunity[]): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'opportunities → jobs',
      total: opportunities.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    const db = await connectToDatabase()
    const collection = db.collection('jobs')

    for (const opportunity of opportunities) {
      try {
        const jobData = mapOpportunityToJob(opportunity)

        // Check if already exists by boondManagerId
        const existing = await collection.findOne({ boondManagerId: opportunity.id })

        if (existing) {
          // Update existing
          await collection.updateOne(
            { _id: existing._id },
            { $set: jobData }
          )
          result.updated++
        } else {
          // Create new
          await collection.insertOne({
            ...jobData,
            createdAt: new Date(),
          } as SiteJob)
          result.created++
        }
      } catch (error) {
        result.errors.push(`Opportunity ${opportunity.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    return result
  }

  /**
   * Import all data from BoondManager
   * - Resources → Consultants (public profiles) + Users (login accounts)
   * - Candidates → Candidates (recruitment pipeline)
   * - Opportunities → Jobs (job listings)
   */
  async importAll(
    resources: BoondResource[],
    candidates: BoondCandidate[],
    opportunities: BoondOpportunity[],
    options: {
      createUsersFromResources?: boolean
      candidateStates?: Map<number, string>  // States from dictionary
      candidateTypes?: Map<number, string>   // Types/Étapes from dictionary
    } = {}
  ): Promise<ImportSummary> {
    const startedAt = new Date()
    const results: ImportResult[] = []

    // Import resources to consultants
    if (resources.length > 0) {
      const resourceResult = await this.importResources(resources)
      results.push(resourceResult)

      // Also import resources as users if requested
      if (options.createUsersFromResources !== false) {
        const userResult = await this.importResourcesAsUsers(resources)
        results.push(userResult)
      }
    }

    // Import candidates to candidates collection
    if (candidates.length > 0) {
      const candidateResult = await this.importCandidates(candidates, options.candidateStates, options.candidateTypes)
      results.push(candidateResult)
    }

    // Import opportunities to jobs
    if (opportunities.length > 0) {
      const opportunityResult = await this.importOpportunities(opportunities)
      results.push(opportunityResult)
    }

    const completedAt = new Date()

    return {
      startedAt,
      completedAt,
      results,
      totalCreated: results.reduce((sum, r) => sum + r.created, 0),
      totalUpdated: results.reduce((sum, r) => sum + r.updated, 0),
      totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    }
  }

  /**
   * Preview import without actually importing
   * Returns what would be created/updated
   * - Resources → Consultants + Users
   * - Candidates → Candidates
   * - Opportunities → Jobs
   */
  async previewImport(
    resources: BoondResource[],
    candidates: BoondCandidate[],
    opportunities: BoondOpportunity[]
  ): Promise<{
    consultants: { new: number; existing: number }
    users: { new: number; existing: number; skipped: number }
    candidates: { new: number; existing: number }
    jobs: { new: number; existing: number }
  }> {
    const db = await connectToDatabase()

    // Check resources for consultants
    const existingConsultantIds = new Set(
      (await db.collection('consultants')
        .find({ boondManagerId: { $in: resources.map(r => r.id) } })
        .project({ boondManagerId: 1 })
        .toArray()
      ).map(c => c.boondManagerId)
    )

    // Check resources for users (only those with valid email)
    const resourcesWithEmail = resources.filter(r => r.attributes.email)
    const existingUserIds = new Set(
      (await db.collection('users')
        .find({ boondManagerId: { $in: resources.map(r => r.id) } })
        .project({ boondManagerId: 1 })
        .toArray()
      ).map(u => u.boondManagerId)
    )

    // Check candidates
    const existingCandidateIds = new Set(
      (await db.collection('candidates')
        .find({ boondManagerId: { $in: candidates.map(c => c.id) } })
        .project({ boondManagerId: 1 })
        .toArray()
      ).map(c => c.boondManagerId)
    )

    // Check opportunities
    const existingJobIds = new Set(
      (await db.collection('jobs')
        .find({ boondManagerId: { $in: opportunities.map(o => o.id) } })
        .project({ boondManagerId: 1 })
        .toArray()
      ).map(j => j.boondManagerId)
    )

    return {
      consultants: {
        new: resources.filter(r => !existingConsultantIds.has(r.id)).length,
        existing: resources.filter(r => existingConsultantIds.has(r.id)).length,
      },
      users: {
        new: resourcesWithEmail.filter(r => !existingUserIds.has(r.id)).length,
        existing: resourcesWithEmail.filter(r => existingUserIds.has(r.id)).length,
        skipped: resources.length - resourcesWithEmail.length, // Resources without email
      },
      candidates: {
        new: candidates.filter(c => !existingCandidateIds.has(c.id)).length,
        existing: candidates.filter(c => existingCandidateIds.has(c.id)).length,
      },
      jobs: {
        new: opportunities.filter(o => !existingJobIds.has(o.id)).length,
        existing: opportunities.filter(o => existingJobIds.has(o.id)).length,
      },
    }
  }
}

// Export singleton instance
export const boondImportService = new BoondImportService()
