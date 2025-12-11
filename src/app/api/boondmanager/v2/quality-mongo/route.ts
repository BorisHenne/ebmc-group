import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import {
  normalizePhone,
  normalizeName,
  normalizeEmail,
} from '@/lib/boondmanager-sync'

interface DataQualityIssue {
  entityType: string
  entityId: string
  field: string
  issue: string
  severity: 'error' | 'warning' | 'info'
  currentValue: unknown
  suggestedValue?: unknown
}

interface DuplicateGroup {
  entityType: string
  field: string
  value: string
  items: Array<{ id: string; name: string; email?: string }>
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone format
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '')
  return /^\+?\d{9,15}$/.test(cleaned)
}

/**
 * Analyze data quality in MongoDB collections:
 * - candidates
 * - consultants
 * - jobs
 */
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const db = await connectToDatabase()
    const allIssues: DataQualityIssue[] = []
    const allDuplicates: DuplicateGroup[] = []

    // ==================== ANALYZE CANDIDATES ====================
    const candidates = await db.collection('candidates').find({}).toArray()

    for (const candidate of candidates) {
      const id = candidate._id.toString()

      // Required fields
      if (!candidate.firstName?.trim()) {
        allIssues.push({
          entityType: 'candidate',
          entityId: id,
          field: 'firstName',
          issue: 'Prénom manquant',
          severity: 'error',
          currentValue: candidate.firstName
        })
      }
      if (!candidate.lastName?.trim()) {
        allIssues.push({
          entityType: 'candidate',
          entityId: id,
          field: 'lastName',
          issue: 'Nom manquant',
          severity: 'error',
          currentValue: candidate.lastName
        })
      }

      // Email validation
      if (candidate.email) {
        if (!isValidEmail(candidate.email)) {
          allIssues.push({
            entityType: 'candidate',
            entityId: id,
            field: 'email',
            issue: 'Format email invalide',
            severity: 'warning',
            currentValue: candidate.email
          })
        }
        const normalized = normalizeEmail(candidate.email)
        if (normalized !== candidate.email) {
          allIssues.push({
            entityType: 'candidate',
            entityId: id,
            field: 'email',
            issue: 'Email non normalisé',
            severity: 'info',
            currentValue: candidate.email,
            suggestedValue: normalized
          })
        }
      }

      // Phone validation
      if (candidate.phone) {
        if (!isValidPhone(candidate.phone)) {
          allIssues.push({
            entityType: 'candidate',
            entityId: id,
            field: 'phone',
            issue: 'Format téléphone invalide',
            severity: 'warning',
            currentValue: candidate.phone
          })
        }
        const normalized = normalizePhone(candidate.phone)
        if (normalized !== candidate.phone) {
          allIssues.push({
            entityType: 'candidate',
            entityId: id,
            field: 'phone',
            issue: 'Téléphone non normalisé',
            severity: 'info',
            currentValue: candidate.phone,
            suggestedValue: normalized
          })
        }
      }

      // Name case validation
      if (candidate.firstName) {
        const normalized = normalizeName(candidate.firstName)
        if (normalized !== candidate.firstName) {
          allIssues.push({
            entityType: 'candidate',
            entityId: id,
            field: 'firstName',
            issue: 'Nom non normalisé (casse)',
            severity: 'info',
            currentValue: candidate.firstName,
            suggestedValue: normalized
          })
        }
      }
      if (candidate.lastName) {
        const normalized = normalizeName(candidate.lastName)
        if (normalized !== candidate.lastName) {
          allIssues.push({
            entityType: 'candidate',
            entityId: id,
            field: 'lastName',
            issue: 'Nom non normalisé (casse)',
            severity: 'info',
            currentValue: candidate.lastName,
            suggestedValue: normalized
          })
        }
      }

      // State validation
      if (candidate.state === undefined || candidate.state === null) {
        allIssues.push({
          entityType: 'candidate',
          entityId: id,
          field: 'state',
          issue: 'État de recrutement manquant',
          severity: 'warning',
          currentValue: candidate.state,
          suggestedValue: 0
        })
      }
    }

    // Find duplicate candidates by email
    const candidatesByEmail = new Map<string, typeof candidates>()
    for (const c of candidates) {
      if (c.email) {
        const email = c.email.toLowerCase().trim()
        if (!candidatesByEmail.has(email)) {
          candidatesByEmail.set(email, [])
        }
        candidatesByEmail.get(email)!.push(c)
      }
    }
    for (const [email, dupes] of candidatesByEmail.entries()) {
      if (dupes.length > 1) {
        allDuplicates.push({
          entityType: 'candidate',
          field: 'email',
          value: email,
          items: dupes.map(c => ({
            id: c._id.toString(),
            name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            email: c.email
          }))
        })
      }
    }

    // ==================== ANALYZE CONSULTANTS ====================
    const consultants = await db.collection('consultants').find({}).toArray()

    for (const consultant of consultants) {
      const id = consultant._id.toString()

      // Required fields
      if (!consultant.name?.trim()) {
        allIssues.push({
          entityType: 'consultant',
          entityId: id,
          field: 'name',
          issue: 'Nom manquant',
          severity: 'error',
          currentValue: consultant.name
        })
      }
      if (!consultant.title?.trim()) {
        allIssues.push({
          entityType: 'consultant',
          entityId: id,
          field: 'title',
          issue: 'Titre/Poste manquant',
          severity: 'warning',
          currentValue: consultant.title
        })
      }

      // Email validation
      if (consultant.email) {
        if (!isValidEmail(consultant.email)) {
          allIssues.push({
            entityType: 'consultant',
            entityId: id,
            field: 'email',
            issue: 'Format email invalide',
            severity: 'warning',
            currentValue: consultant.email
          })
        }
        const normalized = normalizeEmail(consultant.email)
        if (normalized !== consultant.email) {
          allIssues.push({
            entityType: 'consultant',
            entityId: id,
            field: 'email',
            issue: 'Email non normalisé',
            severity: 'info',
            currentValue: consultant.email,
            suggestedValue: normalized
          })
        }
      }

      // Phone validation
      if (consultant.phone) {
        const normalized = normalizePhone(consultant.phone)
        if (normalized !== consultant.phone) {
          allIssues.push({
            entityType: 'consultant',
            entityId: id,
            field: 'phone',
            issue: 'Téléphone non normalisé',
            severity: 'info',
            currentValue: consultant.phone,
            suggestedValue: normalized
          })
        }
      }

      // Published status check
      if (consultant.published === false && consultant.available === true) {
        allIssues.push({
          entityType: 'consultant',
          entityId: id,
          field: 'published',
          issue: 'Consultant disponible mais non publié',
          severity: 'info',
          currentValue: { published: consultant.published, available: consultant.available }
        })
      }
    }

    // Find duplicate consultants by email
    const consultantsByEmail = new Map<string, typeof consultants>()
    for (const c of consultants) {
      if (c.email) {
        const email = c.email.toLowerCase().trim()
        if (!consultantsByEmail.has(email)) {
          consultantsByEmail.set(email, [])
        }
        consultantsByEmail.get(email)!.push(c)
      }
    }
    for (const [email, dupes] of consultantsByEmail.entries()) {
      if (dupes.length > 1) {
        allDuplicates.push({
          entityType: 'consultant',
          field: 'email',
          value: email,
          items: dupes.map(c => ({
            id: c._id.toString(),
            name: c.name || '',
            email: c.email
          }))
        })
      }
    }

    // ==================== ANALYZE JOBS ====================
    const jobs = await db.collection('jobs').find({}).toArray()

    for (const job of jobs) {
      const id = job._id.toString()

      // Required fields
      if (!job.title?.trim()) {
        allIssues.push({
          entityType: 'job',
          entityId: id,
          field: 'title',
          issue: 'Titre manquant',
          severity: 'error',
          currentValue: job.title
        })
      }
      if (!job.location?.trim()) {
        allIssues.push({
          entityType: 'job',
          entityId: id,
          field: 'location',
          issue: 'Localisation manquante',
          severity: 'warning',
          currentValue: job.location
        })
      }
      if (!job.description?.trim() || job.description.length < 50) {
        allIssues.push({
          entityType: 'job',
          entityId: id,
          field: 'description',
          issue: job.description ? 'Description trop courte (min 50 caractères)' : 'Description manquante',
          severity: 'warning',
          currentValue: job.description?.substring(0, 50)
        })
      }

      // Check missions and requirements
      if (!job.missions || job.missions.length === 0) {
        allIssues.push({
          entityType: 'job',
          entityId: id,
          field: 'missions',
          issue: 'Aucune mission définie',
          severity: 'info',
          currentValue: job.missions
        })
      }
      if (!job.requirements || job.requirements.length === 0) {
        allIssues.push({
          entityType: 'job',
          entityId: id,
          field: 'requirements',
          issue: 'Aucun prérequis défini',
          severity: 'info',
          currentValue: job.requirements
        })
      }

      // Published status check
      if (job.published === false && job.active === true) {
        allIssues.push({
          entityType: 'job',
          entityId: id,
          field: 'published',
          issue: 'Offre active mais non publiée',
          severity: 'info',
          currentValue: { published: job.published, active: job.active }
        })
      }
    }

    // Find duplicate jobs by title
    const jobsByTitle = new Map<string, typeof jobs>()
    for (const j of jobs) {
      if (j.title) {
        const title = j.title.toLowerCase().trim()
        if (!jobsByTitle.has(title)) {
          jobsByTitle.set(title, [])
        }
        jobsByTitle.get(title)!.push(j)
      }
    }
    for (const [title, dupes] of jobsByTitle.entries()) {
      if (dupes.length > 1) {
        allDuplicates.push({
          entityType: 'job',
          field: 'title',
          value: title,
          items: dupes.map(j => ({
            id: j._id.toString(),
            name: j.title || ''
          }))
        })
      }
    }

    // ==================== BUILD SUMMARY ====================
    const summary = {
      totalIssues: allIssues.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length,
      duplicateGroups: allDuplicates.length,
      collections: {
        candidates: {
          total: candidates.length,
          issues: allIssues.filter(i => i.entityType === 'candidate').length,
          duplicates: allDuplicates.filter(d => d.entityType === 'candidate').length
        },
        consultants: {
          total: consultants.length,
          issues: allIssues.filter(i => i.entityType === 'consultant').length,
          duplicates: allDuplicates.filter(d => d.entityType === 'consultant').length
        },
        jobs: {
          total: jobs.length,
          issues: allIssues.filter(i => i.entityType === 'job').length,
          duplicates: allDuplicates.filter(d => d.entityType === 'job').length
        }
      }
    }

    return NextResponse.json({
      success: true,
      source: 'mongodb',
      data: {
        issues: allIssues,
        duplicates: allDuplicates,
        summary
      }
    })

  } catch (error) {
    console.error('MongoDB quality analysis error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
