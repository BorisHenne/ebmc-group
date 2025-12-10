/**
 * BoondManager Export to Sandbox Service
 *
 * Exports data from MongoDB collections to BoondManager Sandbox:
 * - Consultants → Resources
 * - Candidates → Candidates
 * - Jobs → Opportunities
 *
 * Maintains relationships between entities using boondManagerId
 */

import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId, WithId, Document } from 'mongodb'
import {
  createBoondClient,
  BoondManagerClient,
  BoondResource,
  BoondCandidate,
  BoondOpportunity,
} from './boondmanager-client'

// ==================== TYPES ====================

export interface ExportProgress {
  entity: string
  total: number
  processed: number
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export interface ExportResult {
  startedAt: Date
  completedAt: Date
  entities: Record<string, ExportProgress>
  totalRecords: number
  createdRecords: number
  updatedRecords: number
  skippedRecords: number
  failedRecords: number
  /** Map of MongoDB _id to BoondManager ID for newly created records */
  idMappings: Record<string, Record<string, number>>
}

export interface MongoConsultant extends Document {
  _id: ObjectId
  boondManagerId?: number
  name: string
  title: string
  titleEn?: string
  location?: string
  experience?: string
  experienceEn?: string
  category?: string
  available?: boolean
  published?: boolean
  skills?: string[]
  certifications?: string[]
  email?: string
  phone?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface MongoCandidate extends Document {
  _id: ObjectId
  boondManagerId?: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  title?: string
  state: number
  stateLabel?: string
  typeOf?: number
  typeOfLabel?: string
  location?: string
  skills?: string[]
  experience?: string
  source?: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface MongoJob extends Document {
  _id: ObjectId
  boondManagerId?: number
  title: string
  titleEn?: string
  location?: string
  type?: string
  typeEn?: string
  category?: string
  experience?: string
  experienceEn?: string
  description?: string
  descriptionEn?: string
  missions?: string[]
  missionsEn?: string[]
  requirements?: string[]
  requirementsEn?: string[]
  active?: boolean
  published?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ==================== MAPPING FUNCTIONS ====================

/**
 * Map MongoDB Consultant to BoondManager Resource data for create/update
 */
function mapConsultantToResourceData(consultant: WithId<MongoConsultant>): {
  firstName: string
  lastName: string
  civility?: number
  email?: string
  phone1?: string
  title?: string
  state?: number
} {
  // Split name into firstName and lastName
  const nameParts = (consultant.name || '').trim().split(' ')
  const firstName = nameParts[0] || 'Consultant'
  const lastName = nameParts.slice(1).join(' ') || 'EBMC'

  // Map availability to state (1 = Disponible, 2 = En mission)
  const state = consultant.available ? 1 : 2

  return {
    firstName,
    lastName,
    civility: 0, // Non defini
    email: consultant.email,
    phone1: consultant.phone,
    title: consultant.title,
    state,
  }
}

/**
 * Map MongoDB Candidate to BoondManager Candidate data for create/update
 */
function mapCandidateToBoondData(candidate: WithId<MongoCandidate>): {
  firstName: string
  lastName: string
  civility?: number
  email?: string
  phone1?: string
  title?: string
  origin?: string
  state?: number
} {
  return {
    firstName: candidate.firstName || 'Candidat',
    lastName: candidate.lastName || 'Inconnu',
    civility: 0,
    email: candidate.email,
    phone1: candidate.phone,
    title: candidate.title,
    origin: candidate.source || 'MongoDB Import',
    state: candidate.state ?? 0,
  }
}

/**
 * Map MongoDB Job to BoondManager Opportunity data for create/update
 */
function mapJobToOpportunityData(job: WithId<MongoJob>): {
  title: string
  mode?: number
  state?: number
  typeOf?: number
  description?: string
  startDate?: string
} {
  // Map active status to opportunity state (0 = En cours, 3 = Abandonnee)
  const state = job.active ? 0 : 3

  return {
    title: job.title || 'Opportunite',
    mode: 1, // Default mode
    state,
    typeOf: 1, // Default type
    description: job.description,
    startDate: job.createdAt?.toISOString().split('T')[0],
  }
}

// ==================== EXPORT SERVICE ====================

export class BoondExportToSandboxService {
  private sandboxClient: BoondManagerClient

  constructor() {
    this.sandboxClient = createBoondClient('sandbox')
  }

  /**
   * Export Consultants to Sandbox Resources
   */
  async exportConsultants(
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ExportProgress & { idMappings: Record<string, number> }> {
    const progress: ExportProgress = {
      entity: 'consultants -> resources',
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }
    const idMappings: Record<string, number> = {}

    const db = await connectToDatabase()
    const collection = db.collection<MongoConsultant>('consultants')
    const consultants = await collection.find({}).toArray()

    progress.total = consultants.length
    onProgress?.(progress)

    for (const consultant of consultants) {
      try {
        const resourceData = mapConsultantToResourceData(consultant)

        if (consultant.boondManagerId) {
          // Update existing resource in sandbox
          try {
            await this.sandboxClient.updateResource(consultant.boondManagerId, resourceData)
            progress.updated++
            idMappings[consultant._id.toString()] = consultant.boondManagerId
          } catch (updateError) {
            // If update fails (resource doesn't exist in sandbox), create new
            const response = await this.sandboxClient.createResource(resourceData)
            const newId = response.data.id
            idMappings[consultant._id.toString()] = newId

            // Update MongoDB with new sandbox ID
            await collection.updateOne(
              { _id: consultant._id },
              { $set: { boondManagerSandboxId: newId } }
            )
            progress.created++
          }
        } else {
          // Create new resource in sandbox
          const response = await this.sandboxClient.createResource(resourceData)
          const newId = response.data.id
          idMappings[consultant._id.toString()] = newId

          // Update MongoDB with boondManagerId for future syncs
          await collection.updateOne(
            { _id: consultant._id },
            { $set: { boondManagerId: newId } }
          )
          progress.created++
        }
      } catch (error) {
        progress.errors.push(
          `Consultant ${consultant._id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        )
      }

      progress.processed++
      onProgress?.(progress)
    }

    return { ...progress, idMappings }
  }

  /**
   * Export Candidates to Sandbox Candidates
   */
  async exportCandidates(
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ExportProgress & { idMappings: Record<string, number> }> {
    const progress: ExportProgress = {
      entity: 'candidates -> candidates',
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }
    const idMappings: Record<string, number> = {}

    const db = await connectToDatabase()
    const collection = db.collection<MongoCandidate>('candidates')
    const candidates = await collection.find({}).toArray()

    progress.total = candidates.length
    onProgress?.(progress)

    for (const candidate of candidates) {
      try {
        const candidateData = mapCandidateToBoondData(candidate)

        if (candidate.boondManagerId) {
          // Update existing candidate in sandbox
          try {
            await this.sandboxClient.updateCandidate(candidate.boondManagerId, candidateData)
            progress.updated++
            idMappings[candidate._id.toString()] = candidate.boondManagerId
          } catch (updateError) {
            // If update fails (candidate doesn't exist in sandbox), create new
            const response = await this.sandboxClient.createCandidate(candidateData)
            const newId = response.data.id
            idMappings[candidate._id.toString()] = newId

            // Update MongoDB with new sandbox ID
            await collection.updateOne(
              { _id: candidate._id },
              { $set: { boondManagerSandboxId: newId } }
            )
            progress.created++
          }
        } else {
          // Create new candidate in sandbox
          const response = await this.sandboxClient.createCandidate(candidateData)
          const newId = response.data.id
          idMappings[candidate._id.toString()] = newId

          // Update MongoDB with boondManagerId for future syncs
          await collection.updateOne(
            { _id: candidate._id },
            { $set: { boondManagerId: newId } }
          )
          progress.created++
        }
      } catch (error) {
        progress.errors.push(
          `Candidate ${candidate._id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        )
      }

      progress.processed++
      onProgress?.(progress)
    }

    return { ...progress, idMappings }
  }

  /**
   * Export Jobs to Sandbox Opportunities
   */
  async exportJobs(
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ExportProgress & { idMappings: Record<string, number> }> {
    const progress: ExportProgress = {
      entity: 'jobs -> opportunities',
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }
    const idMappings: Record<string, number> = {}

    const db = await connectToDatabase()
    const collection = db.collection<MongoJob>('jobs')
    const jobs = await collection.find({}).toArray()

    progress.total = jobs.length
    onProgress?.(progress)

    for (const job of jobs) {
      try {
        const opportunityData = mapJobToOpportunityData(job)

        if (job.boondManagerId) {
          // Update existing opportunity in sandbox
          try {
            await this.sandboxClient.updateOpportunity(job.boondManagerId, opportunityData)
            progress.updated++
            idMappings[job._id.toString()] = job.boondManagerId
          } catch (updateError) {
            // If update fails (opportunity doesn't exist in sandbox), create new
            const response = await this.sandboxClient.createOpportunity(opportunityData)
            const newId = response.data.id
            idMappings[job._id.toString()] = newId

            // Update MongoDB with new sandbox ID
            await collection.updateOne(
              { _id: job._id },
              { $set: { boondManagerSandboxId: newId } }
            )
            progress.created++
          }
        } else {
          // Create new opportunity in sandbox
          const response = await this.sandboxClient.createOpportunity(opportunityData)
          const newId = response.data.id
          idMappings[job._id.toString()] = newId

          // Update MongoDB with boondManagerId for future syncs
          await collection.updateOne(
            { _id: job._id },
            { $set: { boondManagerId: newId } }
          )
          progress.created++
        }
      } catch (error) {
        progress.errors.push(
          `Job ${job._id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        )
      }

      progress.processed++
      onProgress?.(progress)
    }

    return { ...progress, idMappings }
  }

  /**
   * Export all data from MongoDB to BoondManager Sandbox
   * Maintains relationships between entities using boondManagerId
   *
   * Order of export:
   * 1. Consultants -> Resources (independent)
   * 2. Candidates -> Candidates (independent)
   * 3. Jobs -> Opportunities (could reference companies in future)
   */
  async exportAll(
    onProgress?: (entityType: string, progress: ExportProgress) => void
  ): Promise<ExportResult> {
    const startedAt = new Date()
    const entities: Record<string, ExportProgress> = {}
    const idMappings: Record<string, Record<string, number>> = {}

    // 1. Export Consultants -> Resources
    const consultantsResult = await this.exportConsultants((p) =>
      onProgress?.('consultants', p)
    )
    entities.consultants = {
      entity: consultantsResult.entity,
      total: consultantsResult.total,
      processed: consultantsResult.processed,
      created: consultantsResult.created,
      updated: consultantsResult.updated,
      skipped: consultantsResult.skipped,
      errors: consultantsResult.errors,
    }
    idMappings.consultants = consultantsResult.idMappings

    // 2. Export Candidates -> Candidates
    const candidatesResult = await this.exportCandidates((p) =>
      onProgress?.('candidates', p)
    )
    entities.candidates = {
      entity: candidatesResult.entity,
      total: candidatesResult.total,
      processed: candidatesResult.processed,
      created: candidatesResult.created,
      updated: candidatesResult.updated,
      skipped: candidatesResult.skipped,
      errors: candidatesResult.errors,
    }
    idMappings.candidates = candidatesResult.idMappings

    // 3. Export Jobs -> Opportunities
    const jobsResult = await this.exportJobs((p) => onProgress?.('jobs', p))
    entities.jobs = {
      entity: jobsResult.entity,
      total: jobsResult.total,
      processed: jobsResult.processed,
      created: jobsResult.created,
      updated: jobsResult.updated,
      skipped: jobsResult.skipped,
      errors: jobsResult.errors,
    }
    idMappings.jobs = jobsResult.idMappings

    const completedAt = new Date()

    // Calculate totals
    let totalRecords = 0
    let createdRecords = 0
    let updatedRecords = 0
    let skippedRecords = 0
    let failedRecords = 0

    for (const progress of Object.values(entities)) {
      totalRecords += progress.total
      createdRecords += progress.created
      updatedRecords += progress.updated
      skippedRecords += progress.skipped
      failedRecords += progress.errors.length
    }

    return {
      startedAt,
      completedAt,
      entities,
      totalRecords,
      createdRecords,
      updatedRecords,
      skippedRecords,
      failedRecords,
      idMappings,
    }
  }

  /**
   * Preview export without actually exporting
   * Returns counts of what would be created/updated
   */
  async previewExport(): Promise<{
    consultants: { total: number; withBoondId: number; withoutBoondId: number }
    candidates: { total: number; withBoondId: number; withoutBoondId: number }
    jobs: { total: number; withBoondId: number; withoutBoondId: number }
  }> {
    const db = await connectToDatabase()

    // Get consultants stats
    const consultantsCollection = db.collection('consultants')
    const totalConsultants = await consultantsCollection.countDocuments({})
    const consultantsWithId = await consultantsCollection.countDocuments({
      boondManagerId: { $exists: true, $type: 'number' },
    })

    // Get candidates stats
    const candidatesCollection = db.collection('candidates')
    const totalCandidates = await candidatesCollection.countDocuments({})
    const candidatesWithId = await candidatesCollection.countDocuments({
      boondManagerId: { $exists: true, $type: 'number' },
    })

    // Get jobs stats
    const jobsCollection = db.collection('jobs')
    const totalJobs = await jobsCollection.countDocuments({})
    const jobsWithId = await jobsCollection.countDocuments({
      boondManagerId: { $exists: true, $type: 'number' },
    })

    return {
      consultants: {
        total: totalConsultants,
        withBoondId: consultantsWithId,
        withoutBoondId: totalConsultants - consultantsWithId,
      },
      candidates: {
        total: totalCandidates,
        withBoondId: candidatesWithId,
        withoutBoondId: totalCandidates - candidatesWithId,
      },
      jobs: {
        total: totalJobs,
        withBoondId: jobsWithId,
        withoutBoondId: totalJobs - jobsWithId,
      },
    }
  }

  /**
   * Get existing data in sandbox to compare
   */
  async getSandboxStats(): Promise<{
    resources: number
    candidates: number
    opportunities: number
  }> {
    const stats = await this.sandboxClient.getDashboardStats()
    return {
      resources: stats.resources.total,
      candidates: stats.candidates.total,
      opportunities: stats.opportunities.total,
    }
  }
}

// Singleton instance
let exportServiceInstance: BoondExportToSandboxService | null = null

export function getExportToSandboxService(): BoondExportToSandboxService {
  if (!exportServiceInstance) {
    exportServiceInstance = new BoondExportToSandboxService()
  }
  return exportServiceInstance
}
