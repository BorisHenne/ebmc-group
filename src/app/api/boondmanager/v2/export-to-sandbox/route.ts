import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getExportToSandboxService } from '@/lib/boondmanager-export-to-sandbox'
import { hasPermission } from '@/lib/roles'

/**
 * Export MongoDB data to BoondManager Sandbox
 *
 * GET - Preview what would be exported
 * POST - Execute export to sandbox
 *
 * This endpoint:
 * - Reads data from MongoDB collections (consultants, candidates, jobs)
 * - Creates/updates corresponding entities in BoondManager Sandbox
 * - Maintains relationships using boondManagerId
 */

// GET - Preview export (what would be exported)
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  // Check permission - only admin can export
  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({
      error: 'Permission refusee - Seuls les administrateurs peuvent exporter des donnees'
    }, { status: 403 })
  }

  try {
    const exportService = getExportToSandboxService()

    // Get preview stats from MongoDB
    const preview = await exportService.previewExport()

    // Get current sandbox stats for comparison
    let sandboxStats = { resources: 0, candidates: 0, opportunities: 0 }
    try {
      sandboxStats = await exportService.getSandboxStats()
    } catch (error) {
      console.warn('Could not fetch sandbox stats:', error)
    }

    return NextResponse.json({
      success: true,
      preview: {
        source: 'MongoDB (site EBMC)',
        destination: 'BoondManager Sandbox',
        mongoData: preview,
        sandboxCurrent: sandboxStats,
        estimatedActions: {
          consultantsToCreate: preview.consultants.withoutBoondId,
          consultantsToUpdate: preview.consultants.withBoondId,
          candidatesToCreate: preview.candidates.withoutBoondId,
          candidatesToUpdate: preview.candidates.withBoondId,
          jobsToCreate: preview.jobs.withoutBoondId,
          jobsToUpdate: preview.jobs.withBoondId,
        }
      },
      message: 'Apercu de l\'export. Utilisez POST pour executer l\'export vers le Sandbox.',
    })

  } catch (error) {
    console.error('Export preview error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

// POST - Execute export to sandbox
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  // Check permission - only admin can export
  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({
      error: 'Permission refusee - Seuls les administrateurs peuvent exporter des donnees'
    }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const {
      entities = ['consultants', 'candidates', 'jobs'],
    } = body

    const exportService = getExportToSandboxService()

    // Execute export based on selected entities
    const exportConsultants = entities.includes('consultants')
    const exportCandidates = entities.includes('candidates')
    const exportJobs = entities.includes('jobs')

    const results: Record<string, {
      entity: string
      total: number
      created: number
      updated: number
      skipped: number
      errors: string[]
    }> = {}

    let totalCreated = 0
    let totalUpdated = 0
    let totalErrors = 0

    // Export consultants -> resources
    if (exportConsultants) {
      const consultantsResult = await exportService.exportConsultants()
      results.consultants = {
        entity: consultantsResult.entity,
        total: consultantsResult.total,
        created: consultantsResult.created,
        updated: consultantsResult.updated,
        skipped: consultantsResult.skipped,
        errors: consultantsResult.errors,
      }
      totalCreated += consultantsResult.created
      totalUpdated += consultantsResult.updated
      totalErrors += consultantsResult.errors.length
    }

    // Export candidates -> candidates
    if (exportCandidates) {
      const candidatesResult = await exportService.exportCandidates()
      results.candidates = {
        entity: candidatesResult.entity,
        total: candidatesResult.total,
        created: candidatesResult.created,
        updated: candidatesResult.updated,
        skipped: candidatesResult.skipped,
        errors: candidatesResult.errors,
      }
      totalCreated += candidatesResult.created
      totalUpdated += candidatesResult.updated
      totalErrors += candidatesResult.errors.length
    }

    // Export jobs -> opportunities
    if (exportJobs) {
      const jobsResult = await exportService.exportJobs()
      results.jobs = {
        entity: jobsResult.entity,
        total: jobsResult.total,
        created: jobsResult.created,
        updated: jobsResult.updated,
        skipped: jobsResult.skipped,
        errors: jobsResult.errors,
      }
      totalCreated += jobsResult.created
      totalUpdated += jobsResult.updated
      totalErrors += jobsResult.errors.length
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalCreated,
        totalUpdated,
        totalErrors,
      },
      message: `Export termine: ${totalCreated} crees, ${totalUpdated} mis a jour, ${totalErrors} erreurs`,
    })

  } catch (error) {
    console.error('Export to sandbox error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}
