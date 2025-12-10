import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBoondClient, BoondResource, BoondCandidate, BoondOpportunity } from '@/lib/boondmanager-client'
import { boondImportService } from '@/lib/boondmanager-import'
import { hasPermission } from '@/lib/roles'
import { connectToDatabase } from '@/lib/mongodb'

const PAGE_SIZE = 500

// Helper to fetch all pages
async function fetchAllFromProd<T>(
  fetchFn: (params: { page: number; maxResults: number }) => Promise<{ data?: T[]; meta?: { totals?: { rows?: number } } }>
): Promise<T[]> {
  const allData: T[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await fetchFn({ page, maxResults: PAGE_SIZE })
    const data = response.data || []
    allData.push(...data)

    const total = response.meta?.totals?.rows || 0
    hasMore = allData.length < total && data.length === PAGE_SIZE
    page++
  }

  return allData
}

// GET - Get workflow status
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  try {
    const db = await connectToDatabase()

    // Get counts from MongoDB
    const [candidatesCount, consultantsCount, jobsCount, usersCount] = await Promise.all([
      db.collection('candidates').countDocuments(),
      db.collection('consultants').countDocuments(),
      db.collection('jobs').countDocuments(),
      db.collection('users').countDocuments({ boondManagerId: { $exists: true } }),
    ])

    // Get last sync info if exists
    const lastSync = await db.collection('sync_logs').findOne(
      {},
      { sort: { completedAt: -1 } }
    )

    return NextResponse.json({
      success: true,
      status: {
        mongodb: {
          candidates: candidatesCount,
          consultants: consultantsCount,
          jobs: jobsCount,
          users: usersCount,
        },
        lastSync: lastSync ? {
          completedAt: lastSync.completedAt,
          step: lastSync.step,
          success: lastSync.success,
          results: lastSync.results,
        } : null,
      },
    })

  } catch (error) {
    console.error('Workflow status error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

// POST - Execute full workflow
// Step 1: Import from BoondManager Production → MongoDB
// Step 2: Transform/validate data in MongoDB
// Step 3: Push to BoondManager Sandbox
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasPermission(session.role, 'boondManagerAdmin')) {
    return NextResponse.json({ error: 'Permission refusee' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { steps = ['import', 'validate', 'export'] } = body

  const results: Array<{
    step: string
    success: boolean
    message: string
    details?: Record<string, unknown>
  }> = []

  try {
    const db = await connectToDatabase()
    const startedAt = new Date()

    // STEP 1: Import from Production
    if (steps.includes('import')) {
      try {
        const prodClient = createBoondClient('production')

        // Fetch all data from production
        const [resources, candidates, opportunities] = await Promise.all([
          fetchAllFromProd<BoondResource>((params) => prodClient.getResources(params)),
          fetchAllFromProd<BoondCandidate>((params) => prodClient.getCandidates(params)),
          fetchAllFromProd<BoondOpportunity>((params) => prodClient.getOpportunities(params)),
        ])

        // Import to MongoDB
        const importResult = await boondImportService.importAll(
          resources,
          candidates,
          opportunities,
          { createUsersFromResources: true }
        )

        results.push({
          step: 'import',
          success: true,
          message: `Import depuis Production: ${importResult.totalCreated} créés, ${importResult.totalUpdated} mis à jour`,
          details: {
            resources: resources.length,
            candidates: candidates.length,
            opportunities: opportunities.length,
            created: importResult.totalCreated,
            updated: importResult.totalUpdated,
            errors: importResult.totalErrors,
          },
        })
      } catch (err) {
        results.push({
          step: 'import',
          success: false,
          message: err instanceof Error ? err.message : 'Erreur import',
        })
      }
    }

    // STEP 2: Validate/Transform data
    if (steps.includes('validate')) {
      try {
        // Get all data from MongoDB
        const [candidatesData, consultantsData, jobsData] = await Promise.all([
          db.collection('candidates').find().toArray(),
          db.collection('consultants').find().toArray(),
          db.collection('jobs').find().toArray(),
        ])

        // Validation checks
        const issues: string[] = []
        let validCount = 0

        // Check candidates
        candidatesData.forEach(c => {
          if (!c.firstName || !c.lastName) {
            issues.push(`Candidat ${c._id}: nom manquant`)
          } else {
            validCount++
          }
        })

        // Check consultants
        consultantsData.forEach(c => {
          if (!c.name) {
            issues.push(`Consultant ${c._id}: nom manquant`)
          } else {
            validCount++
          }
        })

        // Check jobs
        jobsData.forEach(j => {
          if (!j.title) {
            issues.push(`Job ${j._id}: titre manquant`)
          } else {
            validCount++
          }
        })

        results.push({
          step: 'validate',
          success: issues.length === 0,
          message: issues.length === 0
            ? `Validation OK: ${validCount} elements valides`
            : `Validation: ${issues.length} problemes trouves`,
          details: {
            valid: validCount,
            issues: issues.slice(0, 10), // First 10 issues
            totalIssues: issues.length,
          },
        })
      } catch (err) {
        results.push({
          step: 'validate',
          success: false,
          message: err instanceof Error ? err.message : 'Erreur validation',
        })
      }
    }

    // STEP 3: Export to Sandbox
    if (steps.includes('export')) {
      try {
        const sandboxClient = createBoondClient('sandbox')

        // Get data from MongoDB
        const [candidatesData, consultantsData] = await Promise.all([
          db.collection('candidates').find({ boondManagerId: { $exists: true } }).toArray(),
          db.collection('consultants').find({ boondManagerId: { $exists: true } }).toArray(),
        ])

        let exported = 0
        let errors = 0

        // Note: Full sandbox push would require BoondManager API write endpoints
        // For now, we just log what would be exported
        // In a real implementation, you would:
        // 1. Map MongoDB data back to BoondManager format
        // 2. Use sandboxClient.createCandidate/updateCandidate etc.

        results.push({
          step: 'export',
          success: true,
          message: `Export vers Sandbox: ${candidatesData.length} candidats, ${consultantsData.length} consultants prets`,
          details: {
            candidatesReady: candidatesData.length,
            consultantsReady: consultantsData.length,
            exported,
            errors,
            note: 'Export en mode simulation - API write Sandbox requise pour push reel',
          },
        })
      } catch (err) {
        results.push({
          step: 'export',
          success: false,
          message: err instanceof Error ? err.message : 'Erreur export',
        })
      }
    }

    // Log the sync
    const completedAt = new Date()
    await db.collection('sync_logs').insertOne({
      startedAt,
      completedAt,
      step: 'full_workflow',
      success: results.every(r => r.success),
      results,
      userEmail: session.email,
    })

    return NextResponse.json({
      success: true,
      workflow: {
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        duration: completedAt.getTime() - startedAt.getTime(),
        results,
        allSuccessful: results.every(r => r.success),
      },
    })

  } catch (error) {
    console.error('Workflow error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}
