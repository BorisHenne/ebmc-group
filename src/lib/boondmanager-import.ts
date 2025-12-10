/**
 * BoondManager Data Import Service
 *
 * Maps BoondManager entities to site collections:
 * - Resources → Consultants + Users (consultant_cdi/freelance)
 * - Candidates → Candidates + Users (candidat, or consultant on embauche)
 * - Opportunities → Jobs
 */

import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
  BoondResource,
  BoondCandidate,
  BoondOpportunity,
  BoondCompany,
  RESOURCE_STATES,
  CANDIDATE_STATES,
  OPPORTUNITY_STATES,
} from './boondmanager-client'
import { RoleType } from './roles'

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
  createdAt: Date
  updatedAt: Date
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
  const title = (attrs.title as string) || 'Consultant'
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
    skills,
    certifications,
    email: attrs.email,
    phone: attrs.phone1,
    updatedAt: new Date(),
  }
}

/**
 * Map BoondManager Candidate to Site structure
 * Returns user role based on candidate state
 */
export function mapCandidateToUser(candidate: BoondCandidate): {
  user: Partial<SiteUser>
  isHired: boolean
  candidateState: string
} {
  const attrs = candidate.attributes
  const name = `${attrs.firstName || ''} ${attrs.lastName || ''}`.trim()
  const state = attrs.state ?? 0

  // State 6 = Embauche (Hired)
  const isHired = state === 6

  // Determine role based on state
  let role: RoleType = 'candidat'
  if (isHired) {
    // Default to freelance, could be consultant_cdi based on contract type
    role = 'freelance'
  }

  return {
    user: {
      boondManagerId: candidate.id,
      email: attrs.email || `candidate_${candidate.id}@ebmc-import.temp`,
      name,
      role,
      active: isHired,
      updatedAt: new Date(),
    },
    isHired,
    candidateState: CANDIDATE_STATES[state] || 'Inconnu',
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
   * Import Candidates to Users collection
   * Only imports hired candidates (state = 6) as users
   */
  async importCandidates(candidates: BoondCandidate[], createAllAsUsers = false): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'candidates → users',
      total: candidates.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    const db = await connectToDatabase()
    const collection = db.collection('users')

    for (const candidate of candidates) {
      try {
        const { user, isHired, candidateState } = mapCandidateToUser(candidate)

        // Skip non-hired candidates unless createAllAsUsers is true
        if (!isHired && !createAllAsUsers) {
          result.skipped++
          continue
        }

        // Check if already exists by boondManagerId or email
        const existing = await collection.findOne({
          $or: [
            { boondManagerId: candidate.id },
            { email: user.email }
          ]
        })

        if (existing) {
          // Update existing (don't overwrite password)
          const { ...updateData } = user
          await collection.updateOne(
            { _id: existing._id },
            { $set: updateData }
          )
          result.updated++
        } else {
          // Create new user without password (will need to be set manually or via SSO)
          await collection.insertOne({
            ...user,
            password: null, // No password - use BoondManager SSO
            createdAt: new Date(),
          } as unknown as SiteUser)
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
   */
  async importAll(
    resources: BoondResource[],
    candidates: BoondCandidate[],
    opportunities: BoondOpportunity[],
    options: { createAllCandidatesAsUsers?: boolean } = {}
  ): Promise<ImportSummary> {
    const startedAt = new Date()
    const results: ImportResult[] = []

    // Import resources first
    if (resources.length > 0) {
      const resourceResult = await this.importResources(resources)
      results.push(resourceResult)
    }

    // Import candidates
    if (candidates.length > 0) {
      const candidateResult = await this.importCandidates(
        candidates,
        options.createAllCandidatesAsUsers
      )
      results.push(candidateResult)
    }

    // Import opportunities
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
   */
  async previewImport(
    resources: BoondResource[],
    candidates: BoondCandidate[],
    opportunities: BoondOpportunity[]
  ): Promise<{
    consultants: { new: number; existing: number }
    users: { new: number; existing: number; skipped: number }
    jobs: { new: number; existing: number }
  }> {
    const db = await connectToDatabase()

    // Check resources
    const existingConsultantIds = new Set(
      (await db.collection('consultants')
        .find({ boondManagerId: { $in: resources.map(r => r.id) } })
        .project({ boondManagerId: 1 })
        .toArray()
      ).map(c => c.boondManagerId)
    )

    // Check candidates (only hired ones)
    const hiredCandidates = candidates.filter(c => c.attributes.state === 6)
    const existingUserIds = new Set(
      (await db.collection('users')
        .find({ boondManagerId: { $in: candidates.map(c => c.id) } })
        .project({ boondManagerId: 1 })
        .toArray()
      ).map(u => u.boondManagerId)
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
        new: hiredCandidates.filter(c => !existingUserIds.has(c.id)).length,
        existing: hiredCandidates.filter(c => existingUserIds.has(c.id)).length,
        skipped: candidates.length - hiredCandidates.length,
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
